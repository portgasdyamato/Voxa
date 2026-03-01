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
      <header className="fixed top-0 left-0 right-0 z-50 nav-blur h-24 flex items-center px-8 lg:px-16 border-b border-white/[0.03]">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between gap-12">
          {/* Elite Brand Hub */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavigation('/home', 'home')}
            className="flex items-center gap-5 group cursor-pointer shrink-0"
          >
            <div className="w-11 h-11 rounded-[1.1rem] gradient-primary flex items-center justify-center inner-glow group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-[-0.05em] text-white">VoXa</h1>
              <p className="text-[8px] font-black text-primary tracking-[0.3em] uppercase opacity-40 italic">Intelligence</p>
            </div>
          </motion.div>

          {/* Unified Navigation Core */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] hidden lg:flex">
             <NavButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-4 h-4" />}
               label="Strategic Deck"
             />
             <NavButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-4 h-4" />}
               label="Performance Hub"
             />
          </div>

          {/* Center Search - Raycast Style */}
          <div className="flex-1 max-w-xl relative group hidden md:block">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search nodes or sectoral arrays..."
              className="h-12 rounded-2xl bg-white/[0.02] border-white/[0.05] pl-16 pr-8 text-xs font-bold tracking-tight focus:bg-white/[0.04] focus:border-white/[0.1] transition-all duration-500 placeholder:text-white/5"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1 opacity-20">
              <kbd className="h-5 px-1.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white flex items-center">CTRL</kbd>
              <kbd className="h-5 px-1.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white flex items-center">K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 border-l border-white/5 pl-6">
            <div className="hidden sm:flex items-center gap-4">
               <ThemeToggle />
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative hover:bg-white/5 group border border-transparent hover:border-white/5">
                 <Bell className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                 <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]" />
               </Button>
            </div>
            <div className="h-8 w-[1px] bg-white/[0.05] hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock - Elite Style */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-around h-20">
            <MobileNavButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-5 h-5" />}
               label="Dashboard"
            />
            <MobileNavButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-5 h-5" />}
               label="Analytics"
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
        "relative flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 overflow-hidden group",
        isActive 
          ? "text-primary bg-primary/5" 
          : "text-white/20 hover:text-white hover:bg-white/5"
      )}
    >
      <span className="relative z-10 flex items-center gap-3 italic">
        {icon}
        {label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 border border-primary/20 rounded-[inherit] z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
        "relative flex flex-col items-center gap-1 py-3 px-10 rounded-2xl transition-all duration-500",
        isActive ? "text-primary" : "text-white/10"
      )}
    >
      <div className="relative z-10">{icon}</div>
      <span className="relative z-10 text-[8px] font-black uppercase tracking-[0.2em] italic">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="mobile-nav-marker"
          className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
        />
      )}
    </button>
  );
}
