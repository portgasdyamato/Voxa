import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { VoiceTaskModal } from "@/components/VoiceTaskModal";
import { Mic } from "lucide-react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Stats from "@/pages/stats";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="VoXa Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            <div className="min-h-screen">
              <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              <main>
                {activeTab === 'home' ? <Home /> : <Stats />}
              </main>
              
              {/* Floating Voice Button */}
              <div className="fixed bottom-6 right-6 z-50">
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="w-16 h-16 gradient-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
                >
                  <Mic className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              <VoiceTaskModal
                open={voiceModalOpen}
                onOpenChange={setVoiceModalOpen}
              />
            </div>
          </Route>
        </>
      )}
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
