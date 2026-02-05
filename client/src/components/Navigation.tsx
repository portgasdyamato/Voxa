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
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => handleNavigation('/home', 'home')}
            >
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/40 transition-all duration-500" />
                <div className="relative w-full h-full rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">VoXa</h1>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Intelligence</span>
              </div>
            </motion.div>
            
            {/* Nav side */}
            <div className="flex items-center gap-10">
              <div className="hidden lg:flex items-center bg-muted/20 rounded-xl p-1 border border-border/20">
                <NavButton 
                  isActive={activeTab === 'home'} 
                  onClick={() => handleNavigation('/home', 'home')}
                  icon={<LayoutGrid className="w-4 h-4" />}
                  label="Console"
                />
                <NavButton 
                  isActive={activeTab === 'stats'} 
                  onClick={() => handleNavigation('/stats', 'stats')}
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Analytics"
                />
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="relative">
                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted/50 border border-transparent transition-all group">
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                   </Button>
                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-background" />
                </div>
                <div className="h-8 w-px bg-border/40 mx-1" />
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
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
        >
          <div className="bg-background/90 backdrop-blur-2xl border border-border/40 rounded-3xl p-2 shadow-2xl flex items-center justify-around overflow-hidden">
            <MobileNavButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-6 h-6" />}
               label="Home"
            />
            <MobileNavButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-6 h-6" />}
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
        "relative flex items-center gap-2.5 px-6 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all duration-300",
        isActive 
          ? "text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      )}
    >
      <span className="relative z-10 flex items-center gap-2.5">
        {icon}
        {label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-primary rounded-lg shadow-md" 
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
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
        "relative flex flex-col items-center gap-1 py-3 px-8 rounded-2xl transition-all duration-300",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className={cn("transition-transform duration-300", isActive && "scale-110 -translate-y-0.5")}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="mobileActiveTab"
          className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full shadow-[0_-2px_8px_rgba(var(--primary),0.5)]" 
        />
      )}
    </button>
  );
}
