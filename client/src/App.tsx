import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { CinematicBackground } from "@/components/CinematicBackground";
import { useTasks } from "@/hooks/useTasks";
import { useAlarms } from "@/hooks/useAlarms";
import { useQuery } from "@tanstack/react-query";
import { Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import { WakeWordWidget } from "@/components/WakeWordWidget";
import { AlarmModal } from "@/components/AlarmModal";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Home from "@/pages/home";
import Stats from "@/pages/stats";

function ProtectedLayout({ children, activeTab, setActiveTab, activeWorkspaceTab, setActiveWorkspaceTab, searchQuery, setSearchQuery }: any) {
  const { data: tasks = [] } = useTasks();
  const { data: events = [] } = useQuery<any[]>({ queryKey: ['/api/events'] });
  
  useAlarms(tasks, events);

  return (
    <div className="relative min-h-screen bg-[#010101] text-[#f1f1f1] selection:bg-white/20 overflow-x-hidden">
      <CinematicBackground />
      
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        activeWorkspaceTab={activeWorkspaceTab}
        setActiveWorkspaceTab={setActiveWorkspaceTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="relative z-10 w-full pt-20">
        {children}
      </main>
      
      {/* One shared voice assistant handles every voice command across the platform. */}
      <WakeWordWidget />
      <AlarmModal />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'tasks' | 'calendar' | 'notes'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');

  // Update active tab based on current location
  useEffect(() => {
    if (location === '/home' || location === '/' || location.startsWith('/home?')) {
      setActiveTab('home');
    } else if (location === '/stats' || location.startsWith('/stats?')) {
      setActiveTab('stats');
    }
  }, [location]);

  // Global voice command event listeners
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      if (e.detail) {
        if (['tasks', 'calendar', 'notes'].includes(e.detail)) {
          setActiveWorkspaceTab(e.detail as any);
          if (location !== '/home' && location !== '/') {
            setLocation('/home');
          }
        } else {
          setLocation(e.detail);
        }
      }
    };
    
    const handleSearch = (e: CustomEvent) => {
      if (e.detail) {
        setSearchQuery(e.detail);
        if (location !== '/home' && location !== '/') {
          setLocation('/home');
        }
      }
    };

    window.addEventListener('voxa-navigate', handleNavigate as EventListener);
    window.addEventListener('voxa-search', handleSearch as EventListener);
    
    return () => {
      window.removeEventListener('voxa-navigate', handleNavigate as EventListener);
      window.removeEventListener('voxa-search', handleSearch as EventListener);
    };
  }, [location, setLocation]);

  if (isLoading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#010101]">
         <motion.div 
           animate={{ 
             scale: [1, 1.05, 1],
             opacity: [0.3, 0.8, 0.3]
           }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="w-20 h-20 rounded-[2.5rem] bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-2xl"
         >
           <Zap className="w-8 h-8 text-white fill-white shadow-2xl" />
         </motion.div>
       </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {!isAuthenticated ? (
          <Landing />
        ) : (
          <ProtectedLayout 
            activeTab={activeTab} setActiveTab={setActiveTab}
            activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          >
            <Home searchQuery={searchQuery} activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab} />
          </ProtectedLayout>
        )}
      </Route>
      <Route path="/login">
        {isAuthenticated ? (
          <ProtectedLayout 
            activeTab={activeTab} setActiveTab={setActiveTab}
            activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          >
            <Home searchQuery={searchQuery} activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab} />
          </ProtectedLayout>
        ) : (
          <Login />
        )}
      </Route>
      <Route path="/home">
         <ProtectedLayout 
            activeTab={activeTab} setActiveTab={setActiveTab}
            activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
         >
            <Home searchQuery={searchQuery} activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab} />
         </ProtectedLayout>
      </Route>
      <Route path="/stats">
         <ProtectedLayout
            activeTab={activeTab} setActiveTab={setActiveTab}
            activeWorkspaceTab={activeWorkspaceTab} setActiveWorkspaceTab={setActiveWorkspaceTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
         >
            <Stats />
         </ProtectedLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
