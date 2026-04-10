import { useLocation } from 'wouter';
import { useState, useRef, useEffect } from 'react';
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

  // Ref-based sliding pill for bottom nav
  const tabs = [
    { id: 'home' as const, path: '/home', label: 'Workspace', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'stats' as const, path: '/stats', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const navButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [navPillStyle, setNavPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const button = navButtonRefs.current[activeIndex];
    const container = navContainerRef.current;
    if (button && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setNavPillStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        opacity: 1,
      });
    }
  }, [activeTab]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 md:h-24 flex items-center px-6 md:px-12 lg:px-24 pointer-events-none">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between gap-6 md:gap-12">
          
          {/* Standardized VoXa Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavigation('/home', 'home')}
            className="flex items-center gap-4 group cursor-pointer shrink-0 pointer-events-auto"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_white]" />
            <span className="text-xl font-bold tracking-tight text-white/90">VoXa</span>
          </motion.div>

          {/* Elite Glass Search Bar */}
          <div className="flex-1 max-w-xl relative group hidden md:block pointer-events-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/40 transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search workspaces..."
              className="h-11 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] pl-14 pr-10 text-sm font-medium focus:bg-white/[0.06] focus:ring-0 focus:border-white/10 transition-all duration-500 placeholder:text-white/10 text-white"
            />
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
                  <DropdownMenuContent align="end" className="w-72 bg-[#0c0c0e]/98 backdrop-blur-3xl border-white/[0.08] rounded-3xl p-2 mt-4 shadow-2xl">
                    <DropdownMenuLabel className="font-normal px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-semibold text-white">Notifications</h4>
                        <p className="text-xs text-white/20">Upcoming task reminders</p>
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

      {/* Floating Tab Navigation */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[100] p-1.5 rounded-full border border-white/[0.15] bg-white/[0.04] backdrop-blur-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex items-center w-[calc(100%-2rem)] max-w-sm"
        >
          <div ref={navContainerRef} className="flex items-center w-full relative">
            {/* Single pill that slides — never unmounts */}
            <motion.div
              className="absolute top-0 bottom-0 rounded-full bg-white/[0.1] border border-white/[0.2] shadow-inner pointer-events-none"
              animate={{ left: navPillStyle.left, width: navPillStyle.width, opacity: navPillStyle.opacity }}
              transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
            </motion.div>
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                ref={el => { navButtonRefs.current[i] = el; }}
                onClick={() => handleNavigation(tab.path, tab.id)}
                className={cn(
                  "relative flex items-center justify-center gap-2 px-6 md:px-10 h-11 rounded-full flex-1 whitespace-nowrap transition-colors duration-150 z-10",
                  activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                <div className={cn("transition-transform duration-200", activeTab === tab.id ? "scale-110" : "scale-100")}>
                  {tab.icon}
                </div>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
