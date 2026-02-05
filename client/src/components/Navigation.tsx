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
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleNavigation('/home', 'home')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">VoXa</h1>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-1">
                <NavButton 
                  isActive={activeTab === 'home'} 
                  onClick={() => handleNavigation('/home', 'home')}
                  icon={<LayoutGrid className="w-4 h-4" />}
                  label="Tasks"
                />
                <NavButton 
                  isActive={activeTab === 'stats'} 
                  onClick={() => handleNavigation('/stats', 'stats')}
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Analytics"
                />
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative">
                  <Bell className="w-4.5 h-4.5 text-muted-foreground" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                </Button>
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
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 shadow-xl flex items-center justify-around">
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
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-all",
        isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
