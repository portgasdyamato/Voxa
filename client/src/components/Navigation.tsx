import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { BarChart3, Bell, LayoutGrid, Zap } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface NavigationProps {
  activeTab: 'home' | 'stats';
  onTabChange: (tab: 'home' | 'stats') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string, tab: 'home' | 'stats') => {
    setLocation(path);
    onTabChange(tab);
  };

  return (
    <>
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavigation('/home', 'home')}
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-gradient">VoXa</h1>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50">
                <NavButton 
                  isActive={activeTab === 'home'} 
                  onClick={() => handleNavigation('/home', 'home')}
                  icon={<LayoutGrid className="w-4 h-4" />}
                  label="Mission Control"
                />
                <NavButton 
                  isActive={activeTab === 'stats'} 
                  onClick={() => handleNavigation('/stats', 'stats')}
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Analytics"
                />
              </div>

              <div className="flex items-center gap-4 pl-6 border-l border-border/30">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative hover:bg-primary/5">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background" />
                </Button>
                <div className="h-10 w-[1px] bg-border/30" />
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 shadow-2xl flex items-center justify-around">
            <MobileNavButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-5 h-5" />}
               label="Tasks"
            />
            <MobileNavButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-5 h-5" />}
               label="Stats"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function NavButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-background shadow-sm border border-border/50 rounded-[inherit] z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2 italic">
        {icon}
        {label}
      </span>
    </button>
  );
}

function MobileNavButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 py-3 px-8 rounded-2xl transition-all",
        isActive ? "text-primary" : "text-muted-foreground/40"
      )}
    >
      {isActive && (
        <motion.div 
          layoutId="mobile-nav-pill"
          className="absolute inset-0 bg-primary/10 rounded-[inherit] z-0"
        />
      )}
      <div className="relative z-10">{icon}</div>
      <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

