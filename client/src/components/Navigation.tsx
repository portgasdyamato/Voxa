import { useLocation } from 'wouter';
import { useState } from 'react';
import { 
  BarChart3, Bell, LayoutGrid, Zap, Search, Mic, X, ArrowRight
} from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTasks } from '@/hooks/useTasks';
import { format, isAfter } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavigationProps {
  activeTab: 'home' | 'stats';
  onTabChange: (tab: 'home' | 'stats') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navigation({ activeTab, onTabChange, searchQuery, onSearchChange }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { data: tasks = [] } = useTasks();

  const upcomingTasks = tasks
    .filter(t => !t.completed && t.dueDate && isAfter(new Date(t.dueDate), new Date()))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  const handleNavigation = (path: string, tab: 'home' | 'stats') => {
    setLocation(path);
    onTabChange(tab);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 md:h-24 flex items-center px-6 md:px-12 lg:px-24 pointer-events-none">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between gap-6 md:gap-12">
          
          {/* Standardized VoXa Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavigation('/home', 'home')}
            className="flex items-center gap-3 md:gap-5 group cursor-pointer shrink-0 pointer-events-auto"
          >
            <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-white shadow-[0_0_20px_white]" />
            <span className="text-[18px] md:text-[22px] font-black tracking-[0.2em] text-white/95 uppercase">VoXa</span>
          </motion.div>

          {/* Elite Glass Search Bar */}
          <div className="flex-1 max-w-xl relative group hidden md:block pointer-events-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Knowledge Base..."
              className="h-12 rounded-[1.25rem] bg-white/[0.04] backdrop-blur-[30px] border border-white/[0.1] pl-14 pr-24 text-[13px] font-medium focus:bg-white/[0.08] focus:ring-0 focus:border-white/20 transition-all duration-500 placeholder:text-white/20 text-white"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-20 group-focus-within:opacity-100 transition-opacity">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
               <span className="text-[9px] font-black tracking-[0.2em] text-white/40 group-focus-within:text-white/60">SYSTEM ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 shrink-0 pointer-events-auto">
            {/* Mobile Search Toggle */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5"
              >
                {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative hover:bg-white/5 group transition-all">
                      <Bell className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                      {upcomingTasks.length > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] group-hover:scale-125 transition-transform" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-[#0a0a0c]/95 backdrop-blur-[40px] border-white/[0.1] rounded-[1.5rem] p-2 mt-2">
                    <DropdownMenuLabel className="font-normal px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <h4 className="text-[15px] font-black tracking-tight text-white italic">Intelligent Reminders</h4>
                        <p className="text-[10px] font-bold text-white/20 tracking-[0.1em] uppercase uppercase truncate">Near-term synchronization items</p>
                      </div>
                    </DropdownMenuLabel>
                   <DropdownMenuSeparator className="mx-2 bg-white/5" />
                    <div className="p-1 space-y-1">
                      {upcomingTasks.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[12px] font-medium text-white/20">
                          Neural history is clear.
                        </div>
                      ) : (
                        upcomingTasks.map((task) => (
                          <DropdownMenuItem key={task.id} className="rounded-xl flex-col items-start gap-1 py-4 px-4 bg-white/[0.02] border border-transparent hover:border-white/10 hover:bg-white/[0.04]">
                            <span className="font-bold text-[14px] text-white/80 transition-colors truncate w-full">{task.title}</span>
                            <div className="flex items-center gap-3">
                               <div className="w-1 h-1 rounded-full bg-blue-500" />
                               <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">
                                 {format(new Date(task.dueDate!), 'HH:mm • MMM dd')}
                               </span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
            
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile Search Bar Extension */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-20 left-0 right-0 bg-[#010101]/95 backdrop-blur-[60px] border-b border-white/10 md:hidden px-6 py-6 overflow-hidden pointer-events-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search Systems..."
                  className="h-12 rounded-xl bg-white/5 border-white/10 pl-11 text-sm focus:ring-0 focus:border-white/20 text-white"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Tab Navigation - Precision Pill */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          className="fixed bottom-10 left-1/2 z-[100] p-1.5 rounded-full border border-white/[0.15] bg-white/[0.04] backdrop-blur-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex items-center w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="flex items-center gap-1 w-full relative">
            <TabButton 
               isActive={activeTab === 'home'} 
               onClick={() => handleNavigation('/home', 'home')}
               icon={<LayoutGrid className="w-4 h-4" />}
               label="Workspace"
            />
            <TabButton 
               isActive={activeTab === 'stats'} 
               onClick={() => handleNavigation('/stats', 'stats')}
               icon={<BarChart3 className="w-4 h-4" />}
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
        "relative flex items-center justify-center gap-2 md:gap-3 px-6 md:px-12 h-10 rounded-full transition-colors min-w-0 flex-1 whitespace-nowrap group/tab",
        isActive ? "text-black" : "text-white/40 hover:text-white"
      )}
    >
      <div className="relative z-10 flex items-center gap-2">
        <div className={cn("transition-colors", isActive ? "text-black" : "group-hover/tab:text-white text-white/40")}>{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      
      {/* Slide-up Active Indicator */}
      {isActive && (
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute inset-0 bg-white rounded-full z-0 shadow-sm"
        />
      )}
    </button>
  );
}
