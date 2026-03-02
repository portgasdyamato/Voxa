import { useLocation } from 'wouter';
import { useState } from 'react';
import { 
  BarChart3, Bell, LayoutGrid, Zap, Search, Mic, X 
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
      <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center px-4 md:px-8 lg:px-16 nav-blur overflow-hidden md:overflow-visible transition-all duration-300">
        <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between gap-4 md:gap-12">
          {/* Elite Signature */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavigation('/home', 'home')}
            className="flex items-center gap-4 group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 fill-primary-foreground text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-foreground leading-none">VoXa</h1>
              <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase opacity-60 mt-1 italic leading-none">Intelligence</p>
            </div>
          </motion.div>

          {/* Mobile Search Toggle */}
          <div className="md:hidden flex-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="rounded-xl text-muted-foreground hover:text-foreground"
            >
              {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>

          {/* Elite Command Bar */}
          <div className="flex-1 max-w-xl relative group hidden md:block group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Workspace..."
              className="h-11 rounded-2xl bg-muted/30 border border-border/50 pl-14 pr-24 text-[13px] font-medium focus:bg-muted/50 focus:ring-0 focus:border-border transition-all duration-500 placeholder:text-muted-foreground/40"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-40 pointer-events-none group-focus-within:opacity-100 transition-opacity">
              <kbd className="h-5 px-1.5 rounded bg-muted border border-border text-[9px] font-black text-foreground flex items-center">CTRL</kbd>
              <kbd className="h-5 px-1.5 rounded bg-muted border border-border text-[9px] font-black text-foreground flex items-center">K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 h-10 pl-6 border-l border-border/50">
            <div className="hidden sm:flex items-center gap-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative hover:bg-muted group transition-all">
                      <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      {upcomingTasks.length > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] group-hover:scale-125 transition-transform" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel className="font-normal px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-foreground">Upcoming Reminders</h4>
                        <p className="text-[11px] text-muted-foreground/60 truncate">Top 3 scheduled tasks</p>
                      </div>
                    </DropdownMenuLabel>
                   <DropdownMenuSeparator className="mx-2 opacity-5" />
                    <div className="p-1">
                      {upcomingTasks.length === 0 ? (
                        <div className="px-3 py-4 text-center text-[12px] font-medium text-muted-foreground/40">
                          No upcoming reminders
                        </div>
                      ) : (
                        upcomingTasks.map((task) => (
                          <DropdownMenuItem key={task.id} className="rounded-xl flex-col items-start gap-1 py-3 px-3">
                            <span className="font-bold text-sm text-foreground truncate w-full">{task.title}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                              {format(new Date(task.dueDate!), 'MMM d, h:mm a')}
                            </span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                    {upcomingTasks.length > 0 && (
                      <>
                        <DropdownMenuSeparator className="mx-2 opacity-5" />
                        <div className="p-1">
                          <DropdownMenuItem 
                            onClick={() => handleNavigation('/home', 'home')}
                            className="rounded-xl justify-center text-xs font-bold text-muted-foreground/40 hover:text-foreground py-2"
                          >
                            View all tasks
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-20 left-0 right-0 bg-background/95 backdrop-blur-3xl border-b border-border md:hidden px-8 py-4 overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search Workspace..."
                  className="h-12 rounded-xl bg-muted border-border pl-11 text-sm focus:ring-0 focus:border-primary/50"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Fluid Tab Navigation - Width & Cutoff Fix */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[100] p-1.5 rounded-full bg-background/80 backdrop-blur-3xl border border-border shadow-2xl overflow-hidden w-[calc(100%-1.5rem)] xs:w-[calc(100%-2rem)] max-w-sm md:w-auto"
        >
          <div className="flex items-center gap-1 w-full md:min-w-[320px]">
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
        "relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 h-12 rounded-full transition-all duration-500 min-w-0 flex-1 whitespace-nowrap",
        isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <div className="relative z-10 flex items-center gap-2.5">
        <div className={cn("transition-transform duration-700", isActive ? "scale-110" : "scale-100")}>{icon}</div>
        <span className="text-[11px] font-black uppercase tracking-[0.1em] mt-0.5">{label}</span>
      </div>
      {isActive && (
        <motion.div 
          layoutId="tab-pill"
          className="absolute inset-0 bg-primary border border-primary/10 rounded-full z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}
