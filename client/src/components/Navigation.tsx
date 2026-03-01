import { useLocation } from 'wouter';
import { 
  BarChart3, Bell, LayoutGrid, Zap, Search, Mic 
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
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-8 lg:px-16 nav-blur">
        <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between gap-12">
          {/* Elite Signature */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleNavigation('/home', 'home')}
            className="flex items-center gap-4 group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl glass-shadow group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-white leading-none">VoXa</h1>
              <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase opacity-40 mt-1 italic leading-none">Intelligence</p>
            </div>
          </motion.div>

          {/* Elite Command Bar */}
          <div className="flex-1 max-w-xl relative group hidden md:block group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Workspace..."
              className="h-11 rounded-2xl bg-white/[0.03] border border-white/[0.05] pl-14 pr-24 text-[13px] font-medium focus:bg-white/[0.05] focus:ring-0 focus:border-white/10 transition-all duration-500 placeholder:text-white/10"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-20 pointer-events-none group-focus-within:opacity-40 transition-opacity">
              <kbd className="h-5 px-1.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-white flex items-center">CTRL</kbd>
              <kbd className="h-5 px-1.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-white flex items-center">K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 h-10 pl-6 border-l border-white/[0.05]">
            <div className="hidden sm:flex items-center gap-2">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative hover:bg-white/5 group transition-all">
                     <Bell className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                     {upcomingTasks.length > 0 && (
                       <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] group-hover:scale-125 transition-transform" />
                     )}
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-72">
                   <DropdownMenuLabel className="font-normal px-3 py-3">
                     <div className="flex flex-col gap-1">
                       <h4 className="text-sm font-bold text-white">Upcoming Reminders</h4>
                       <p className="text-[11px] text-white/30 truncate">Top 3 scheduled tasks</p>
                     </div>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator className="mx-2 opacity-5" />
                   <div className="p-1">
                     {upcomingTasks.length === 0 ? (
                       <div className="px-3 py-4 text-center text-[12px] font-medium text-white/20">
                         No upcoming reminders
                       </div>
                     ) : (
                       upcomingTasks.map((task) => (
                         <DropdownMenuItem key={task.id} className="rounded-xl flex-col items-start gap-1 py-3 px-3">
                           <span className="font-bold text-sm text-white truncate w-full">{task.title}</span>
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
                           className="rounded-xl justify-center text-xs font-bold text-white/40 hover:text-white py-2"
                         >
                           View all tasks
                         </DropdownMenuItem>
                       </div>
                     </>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
            <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Fluid Tab Navigation - Width & Cutoff Fix */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[100] p-1 rounded-full bg-black/80 backdrop-blur-3xl border border-white/[0.08] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div className="flex items-center gap-1 min-w-[320px]">
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
        "relative flex items-center justify-center gap-3 px-8 h-12 rounded-full transition-all duration-500 min-w-0 flex-1 whitespace-nowrap",
        isActive ? "text-white" : "text-white/20 hover:text-white/40 hover:bg-white/[0.03]"
      )}
    >
      <div className="relative z-10 flex items-center gap-2.5">
        <div className={cn("transition-transform duration-700", isActive ? "scale-110" : "scale-100")}>{icon}</div>
        <span className="text-[11px] font-black uppercase tracking-[0.1em] mt-0.5">{label}</span>
      </div>
      {isActive && (
        <motion.div 
          layoutId="tab-pill"
          className="absolute inset-0 bg-white/[0.08] border border-white/[0.05] rounded-full z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}
