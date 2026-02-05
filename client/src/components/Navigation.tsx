import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Mic, Home, BarChart3, Search, Bell } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: 'home' | 'stats';
  onTabChange: (tab: 'home' | 'stats') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string, tab: 'home' | 'stats') => {
    setLocation(path);
    onTabChange(tab);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => handleNavigation('/home', 'home')}
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:bg-primary/30 transition-all" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-primary to-accent-500 p-[2px]">
                  <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="VoXa" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">VoXa</h1>
            </motion.div>
            
            {/* Nav side */}
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center bg-muted/50 rounded-2xl p-1.5 border border-border/50">
                <NavButton 
                  isActive={activeTab === 'home'} 
                  onClick={() => handleNavigation('/home', 'home')}
                  icon={<Home className="w-4 h-4" />}
                  label="Dashboard"
                />
                <NavButton 
                  isActive={activeTab === 'stats'} 
                  onClick={() => handleNavigation('/stats', 'stats')}
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Analytics"
                />
              </div>

              <div className="flex items-center gap-2 border-l border-border/80 pl-6">
                <ThemeToggle />
                <div className="relative">
                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                   </Button>
                   <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </div>
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav - Floating Bottom */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
        <div className="bg-background/80 backdrop-blur-2xl border-2 border-border/50 rounded-[2rem] p-2 shadow-2xl flex items-center justify-around overflow-hidden">
          <MobileNavButton 
             isActive={activeTab === 'home'} 
             onClick={() => handleNavigation('/home', 'home')}
             icon={<Home className="w-6 h-6" />}
             label="Home"
          />
          <MobileNavButton 
             isActive={activeTab === 'stats'} 
             onClick={() => handleNavigation('/stats', 'stats')}
             icon={<BarChart3 className="w-6 h-6" />}
             label="Stats"
          />
        </div>
      </div>
    </>
  );
}

function NavButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
        isActive 
          ? "text-primary bg-background shadow-sm" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {icon}
      {label}
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-background rounded-xl -z-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-border" 
        />
      )}
    </button>
  );
}

function MobileNavButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-3 px-8 rounded-2xl transition-all duration-300",
        isActive ? "text-primary bg-primary/5 shadow-inner" : "text-muted-foreground"
      )}
    >
      <div className={cn("transition-transform duration-300", isActive && "scale-110")}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="mobileActiveTab"
          className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.5)]" 
        />
      )}
    </button>
  );
}

import { Button } from './ui/button';
