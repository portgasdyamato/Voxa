import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { 
  BarChart3, Bell, LayoutGrid, Zap, Search, Mic, 
  Settings2, Activity, Layers, Compass, Command 
} from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface NavigationProps {
  activeTab: 'home' | 'stats';
  onTabChange: (tab: 'home' | 'stats') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navigation({ activeTab, onTabChange, searchQuery, onSearchChange }: NavigationProps) {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string, tab: 'home' | 'stats') => {
    setLocation(path);
    onTabChange(tab);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center px-8 lg:px-16 nav-blur border-b border-white/[0.03]">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between gap-12">
          {/* Elite Brand Signature */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavigation('/home', 'home')}
            className="flex items-center gap-4 group cursor-pointer shrink-0"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(var(--primary),0.3)] transition-all duration-500 group-hover:scale-110 group-active:scale-95 group-hover:rotate-6">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tight text-white leading-none">VoXa</h1>
              <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase opacity-40 mt-1 italic">Personal Assistant</p>
            </div>
          </motion.div>

          {/* Precision Command Hub */}
          <div className="flex-1 max-w-2xl relative group hidden md:block group">
            <div className="absolute inset-0 bg-primary/2 blur-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks, categories, or filters..."
              className="h-14 rounded-2xl bg-white/[0.02] border border-white/[0.05] pl-16 pr-24 text-sm font-medium focus:bg-white/[0.04] focus:ring-0 focus:border-white/[0.1] transition-all duration-500 placeholder:text-white/10"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-20 group-focus-within:opacity-40 transition-opacity">
              <kbd className="h-6 px-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-white flex items-center">CTRL</kbd>
              <kbd className="h-6 px-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-white flex items-center">K</kbd>
            </div>
          </div>

          {/* Universal Actions */}
          <div className="flex items-center gap-6 shrink-0 h-12 pl-6 border-l border-white/[0.05]">
            <div className="hidden sm:flex items-center gap-3">
               <ThemeToggle />
               <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl relative border border-transparent hover:border-white/5 hover:bg-white/5 transition-all group">
                 <Bell className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e] group-hover:scale-125 transition-transform" />
               </Button>
            </div>
            <div className="h-4 w-[1px] bg-white/[0.05] hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Global Tab Navigation */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] p-1.5 rounded-[2.5rem] bg-[#050505]/80 frosted-glass shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/[0.05]"
        >
          <div className="flex items-center">
            <TabButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-5 h-5" />}
               label="Workspace"
            />
            <TabButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-5 h-5" />}
               label="Performance"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function TabButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center w-28 h-20 rounded-[2rem] transition-all duration-700 overflow-hidden group",
        isActive ? "text-white" : "text-white/20 hover:text-white/40"
      )}
    >
      <div className="relative z-10 space-y-1.5 flex flex-col items-center">
        <div className={cn("transition-transform duration-700", isActive ? "scale-110" : "scale-100 group-hover:scale-105")}>{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{label}</span>
      </div>
      {isActive && (
        <motion.div 
          layoutId="active-nav-glow"
          className="absolute inset-0 bg-primary/10 rounded-[inherit] z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {isActive && (
        <motion.div 
          layoutId="active-marker"
          className="absolute bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]"
        />
      )}
    </button>
  );
}
