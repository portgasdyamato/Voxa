import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskCard } from '@/components/TaskCard';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { VoiceTaskModal } from '@/components/VoiceTaskModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Layers, Activity, Zap, 
  ListTodo, History, Mic, Settings2, BarChart3, Clock, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
      if (selectedDeadline !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        if (selectedDeadline === 'today') {
          if (taskDate.getTime() !== startOfToday.getTime()) return false;
        } else if (selectedDeadline === 'overdue') {
          if (task.completed) return false;
          const isOverdue = dueDate < now;
          return isOverdue || task.priority === 'high';
        }
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          task.title?.toLowerCase().includes(query) || 
          task.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [tasks, selectedCategory, selectedDeadline, searchQuery]);

  const activeTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  if (tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_50px_rgba(var(--primary),0.2)]"
        >
          <div className="w-8 h-8 rounded-full border-2 border-t-primary border-transparent animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 overflow-x-hidden">
      <div className="mesh-gradient" />
      
      {/* Precision Navigation Hub */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-blur h-24 flex items-center px-8 lg:px-16 border-b border-white/[0.03]">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-[1.2rem] gradient-primary flex items-center justify-center inner-glow group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.05em] text-white">VoXa</h1>
              <p className="text-[9px] font-bold text-primary tracking-[0.3em] uppercase opacity-60">Intelligence Hub</p>
            </div>
          </motion.div>

          {/* Center Search - Raycast Style */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors duration-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, categories, or commands..."
              className="h-14 rounded-2xl bg-white/[0.03] border-white/[0.05] pl-16 pr-8 text-sm focus:bg-white/[0.06] focus:border-white/[0.1] transition-all duration-500 placeholder:text-white/10"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="h-6 px-1.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-white/30 flex items-center">CTRL</kbd>
              <kbd className="h-6 px-1.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-white/30 flex items-center">K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setIsVoiceModalOpen(true)}
                className="rounded-2xl gap-3 px-8 h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Mic className="w-4 h-4 relative z-10" />
                <span className="text-xs font-bold tracking-tight relative z-10">Voice Protocol</span>
              </Button>
            </motion.div>
            <VoiceTaskModal open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen} />
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-8 lg:px-16 pt-36 pb-32">
        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-12 lg:gap-20 items-start">
          
          {/* Left Wing: Navigation & Categories */}
          <aside className="space-y-12 lg:sticky lg:top-36 hidden lg:block">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-4">Workspace</p>
                <nav className="space-y-1.5">
                  {[
                    { id: 'all', label: 'All Tasks', icon: Layers },
                    { id: 'today', label: 'Today', icon: Activity },
                    { id: 'overdue', label: 'Focus / Overdue', icon: Zap },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedDeadline(filter.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-500 group relative",
                        selectedDeadline === filter.id 
                          ? "bg-primary text-white shadow-[0_10px_30px_-5px_rgba(var(--primary),0.3)]" 
                          : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <filter.icon className={cn("w-4 h-4 transition-transform duration-500", selectedDeadline === filter.id && "scale-110")} />
                        <span>{filter.label}</span>
                      </div>
                      {selectedDeadline === filter.id && (
                        <motion.div layoutId="nav-bg" className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                <div className="flex items-center justify-between px-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Categories</p>
                  <motion.button whileHover={{ rotate: 90 }} transition={{ duration: 0.5 }}>
                    <Settings2 className="w-3 h-3 text-white/10 hover:text-primary transition-colors" />
                  </motion.button>
                </div>
                <CategoryFilter 
                  selectedCategory={selectedCategory} 
                  onCategoryChange={setSelectedCategory} 
                />
                <CategoryManager />
              </div>
            </div>
          </aside>

          {/* Center Deck: The Core Engine */}
          <main className="space-y-16">
            <div className="flex items-end justify-between border-b border-white/[0.03] pb-12">
              <div className="space-y-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  className="h-1.5 bg-primary rounded-full mb-4 shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                />
                <h2 className="text-6xl font-black tracking-[-0.06em] text-white">
                  Dashboard
                </h2>
                <p className="text-white/30 font-medium text-lg italic">
                  Synchronized with {activeTasks.length} active threads.
                </p>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Plus className="w-8 h-8 relative z-10" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {activeTasks.length > 0 ? (
                  activeTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        delay: idx * 0.05 
                      }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-32 flex flex-col items-center text-center space-y-8 glass rounded-[4rem] border-dashed border-2 border-white/[0.05] relative overflow-hidden group shadow-inner"
                  >
                    <div className="mesh-gradient opacity-10 scale-150 absolute pointer-events-none" />
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center"
                    >
                      <Compass className="w-10 h-10 text-white/10 group-hover:text-primary transition-colors duration-500" />
                    </motion.div>
                    <div className="space-y-3 max-w-sm relative z-10">
                      <h3 className="text-3xl font-bold tracking-tight text-white">Clear Horizon</h3>
                      <p className="text-white/20 text-sm font-medium leading-relaxed">
                        Every system is optimal. Your trajectory is clear. <br/> Start a new project to continue.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {completedTasks.length > 0 && (
              <section className="space-y-10 pt-12">
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-8">
                  <div className="flex items-center gap-4 text-white/10">
                    <History className="w-6 h-6" />
                    <h3 className="text-2xl font-bold tracking-tight text-white/20">Archive</h3>
                  </div>
                  <span className="text-[10px] font-bold text-white/5 uppercase tracking-[0.4em]">Historical Log</span>
                </div>
                <div className="grid grid-cols-1 gap-4 opacity-40 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
                  {completedTasks.slice(0, 10).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Right Wing: Telemetry & Activity */}
          <aside className="space-y-12 lg:sticky lg:top-36 hidden xl:block">
             <div className="premium-card p-8 border-white/[0.03] space-y-8 inner-glow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-sm tracking-tight text-white/80">Activity Burst</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                      <span>Completion Rate</span>
                      <span className="text-emerald-500">82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Active</p>
                      <p className="text-2xl font-black text-white">{activeTasks.length}</p>
                    </div>
                    <div className="w-[1px] h-10 bg-white/[0.03]" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Resolved</p>
                      <p className="text-2xl font-black text-white">{completedTasks.length}</p>
                    </div>
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                   <Clock className="w-4 h-4 text-white/10" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Timeline Feed</p>
                </div>
                <div className="space-y-4 px-1">
                   {activeTasks.slice(0, 3).map((t, idx) => (
                     <div key={idx} className="flex gap-4 group">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                        <div className="space-y-1">
                           <p className="text-[11px] font-bold text-white/40 line-clamp-1 group-hover:text-white transition-colors">{t.title}</p>
                           <p className="text-[9px] font-medium text-white/10">{formatRelativeDate(new Date(t.dueDate || Date.now()))}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </div>

      <ManualTaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

function formatRelativeDate(date: Date) {
  const diff = Date.now() - date.getTime();
  if (Math.abs(diff) < 60000) return 'Just now';
  if (Math.abs(diff) < 3600000) return `${Math.floor(Math.abs(diff) / 60000)}m ago`;
  return date.toLocaleDateString();
}
