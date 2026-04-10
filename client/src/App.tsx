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
import { CinematicBackground } from "@/components/CinematicBackground";
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
    <div className="relative min-h-screen bg-[#010101] text-[#f1f1f1] selection:bg-white/20 overflow-x-hidden">
      <CinematicBackground />
      
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="relative z-10 w-full pt-20">
        {children}
      </main>
      
      {/* Floating Elite Assistant Trigger - Redesigned for Bevel Frost */}
      <div className="fixed bottom-32 right-6 md:bottom-12 md:right-12 z-[100]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVoiceModalOpen(true)}
          className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem] md:rounded-[3rem] border border-white/[0.22] bg-white/[0.08] backdrop-blur-[40px] text-white flex items-center justify-center shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group relative overflow-hidden group/btn"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
          <Mic className="w-6 h-6 md:w-10 md:h-10 relative z-10 transition-all duration-700 group-hover/btn:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-white/10"
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
