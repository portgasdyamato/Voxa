import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { VoiceTaskModal } from "@/components/VoiceTaskModal";
import { useTasks } from "@/hooks/useTasks";
import { useDeadlineNotifications } from "@/hooks/useDeadlineNotifications";
import { Mic, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Stats from "@/pages/stats";

function ProtectedLayout({ children, activeTab, setActiveTab, searchQuery, setSearchQuery, setVoiceModalOpen, voiceModalOpen }: any) {
  const { data: tasks = [] } = useTasks();
  useDeadlineNotifications(tasks);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 overflow-x-hidden">
      <div className="mesh-gradient" />
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="relative z-10 w-full overflow-hidden">
        {children}
      </main>
      
      {/* Floating Elite Assistant Trigger */}
      <div className="fixed bottom-32 right-6 md:bottom-12 md:right-12 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setVoiceModalOpen(true)}
          className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[3rem] bg-primary text-white flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(var(--primary),0.2)] hover:shadow-[0_40px_80px_-20px_rgba(var(--primary),0.3)] transition-all duration-700 group relative overflow-hidden group/btn"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          <Mic className="w-6 h-6 md:w-10 md:h-10 relative z-10 transition-transform duration-700 group-hover/btn:scale-110 drop-shadow-2xl" />
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-white/20"
          />
        </motion.button>
      </div>

      <VoiceTaskModal
        open={voiceModalOpen}
        onOpenChange={setVoiceModalOpen}
      />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update active tab based on current location
  useEffect(() => {
    if (location === '/home' || location === '/' || location.startsWith('/home?')) {
      setActiveTab('home');
    } else if (location === '/stats' || location.startsWith('/stats?')) {
      setActiveTab('stats');
    }
  }, [location]);

  if (isLoading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#050505] selection:bg-primary/20">
         <motion.div 
           animate={{ 
             scale: [1, 1.1, 1],
             rotate: [0, 5, -5, 0],
             opacity: [0.3, 1, 0.3]
           }}
           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
           className="w-24 h-24 rounded-[3rem] bg-primary flex items-center justify-center shadow-3xl inner-glow"
         >
           <Zap className="w-10 h-10 text-white fill-white shadow-2xl" />
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
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            voiceModalOpen={voiceModalOpen} setVoiceModalOpen={setVoiceModalOpen}
          >
            <Home searchQuery={searchQuery} />
          </ProtectedLayout>
        )}
      </Route>
      <Route path="/home">
         <ProtectedLayout 
            activeTab={activeTab} setActiveTab={setActiveTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            voiceModalOpen={voiceModalOpen} setVoiceModalOpen={setVoiceModalOpen}
         >
            <Home searchQuery={searchQuery} />
         </ProtectedLayout>
      </Route>
      <Route path="/stats">
         <ProtectedLayout
            activeTab={activeTab} setActiveTab={setActiveTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            voiceModalOpen={voiceModalOpen} setVoiceModalOpen={setVoiceModalOpen}
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
