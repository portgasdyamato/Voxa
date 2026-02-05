import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Home, BarChart3, Bell, LayoutGrid, Zap } from 'lucide-react';
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
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string, tab: 'home' | 'stats') => {
    setLocation(path);
    onTabChange(tab);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-2xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 group cursor-pointer"
              onClick={() => handleNavigation('/home', 'home')}
            >
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all duration-500" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-accent-500 p-[2px] shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="VoXa" className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none">VoXa</h1>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">Intelligence</span>
              </div>
            </motion.div>
            
            {/* Nav side */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center bg-muted/30 rounded-2xl p-1.5 border border-border/50 backdrop-blur-md">
                <NavButton 
                  isActive={activeTab === 'home'} 
                  onClick={() => handleNavigation('/home', 'home')}
                  icon={<LayoutGrid className="w-4.5 h-4.5" />}
                  label="Console"
                />
                <NavButton 
                  isActive={activeTab === 'stats'} 
                  onClick={() => handleNavigation('/stats', 'stats')}
                  icon={<BarChart3 className="w-4.5 h-4.5" />}
                  label="Analytics"
                />
              </div>

              <div className="flex items-center gap-4 border-l border-border/50 pl-8">
                <ThemeToggle />
                <div className="relative">
                   <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all group">
                    <Bell className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                   </Button>
                   <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-4 border-background animate-pulse" />
                </div>
                <div className="h-10 w-px bg-border/50 mx-2" />
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav - Floating Bottom */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="bg-background/80 backdrop-blur-2xl border-2 border-border/40 rounded-[2.5rem] p-3 shadow-3xl flex items-center justify-around overflow-hidden">
            <MobileNavButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-7 h-7" />}
               label="Home"
            />
            <MobileNavButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-7 h-7" />}
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
        "relative flex items-center gap-3 px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-500",
        isActive 
          ? "text-primary shadow-2xl" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {icon}
      {label}
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-background rounded-xl -z-10 shadow-xl border border-border/50" 
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
        "relative flex flex-col items-center gap-1.5 py-4 px-10 rounded-[1.5rem] transition-all duration-500",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className={cn("transition-all duration-500", isActive && "scale-125 -translate-y-1 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]")}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="mobileActiveTab"
          className="absolute bottom-1 w-12 h-1 bg-primary rounded-full shadow-[0_-4px_12px_rgba(var(--primary),0.5)]" 
        />
      )}
    </button>
  );
}
