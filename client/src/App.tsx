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
import { Mic, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Stats from "@/pages/stats";

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
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-[2rem] gradient-primary flex items-center justify-center shadow-3xl inner-glow"
        >
          <Zap className="w-10 h-10 text-white fill-white" />
        </motion.div>
      </div>
    );
  }

  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#020202] selection:bg-primary/30">
      <div className="mesh-gradient" />
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Floating Elite Voice Trigger */}
      <div className="fixed bottom-10 right-10 z-50">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVoiceModalOpen(true)}
          className="w-20 h-20 gradient-primary text-white rounded-[1.8rem] shadow-[0_20px_50px_-10px_rgba(var(--primary),0.6)] flex items-center justify-center group relative overflow-hidden inner-glow"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Mic className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-2xl" />
        </motion.button>
      </div>

      <VoiceTaskModal
        open={voiceModalOpen}
        onOpenChange={setVoiceModalOpen}
      />
    </div>
  );

  return (
    <Switch>
      <Route path="/">
        {!isAuthenticated ? (
          <Landing />
        ) : (
          <ProtectedLayout>
            <Home searchQuery={searchQuery} />
          </ProtectedLayout>
        )}
      </Route>
      <Route path="/home">
         <ProtectedLayout>
            <Home searchQuery={searchQuery} />
         </ProtectedLayout>
      </Route>
      <Route path="/stats">
         <ProtectedLayout>
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
