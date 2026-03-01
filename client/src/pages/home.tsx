import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskCard } from '@/components/TaskCard';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Layers, Activity, Zap, 
  ListTodo, History, Mic, Settings2, BarChart3, Clock, Compass, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HomeProps {
  searchQuery?: string;
}

export default function Home({ searchQuery = '' }: HomeProps) {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Category Filter
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
      // Status/Deadline Filter
      if (selectedFilter !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        if (selectedFilter === 'today') {
          if (taskDate.getTime() !== startOfToday.getTime()) return false;
        } else if (selectedFilter === 'overdue') {
          if (task.completed) return false;
          const isOverdue = dueDate < now;
          return isOverdue || task.priority === 'high';
        }
      }
      
      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          task.title?.toLowerCase().includes(query) || 
          task.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [tasks, selectedCategory, selectedFilter, searchQuery]);

  const activeTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  if (tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-[2.5rem] bg-primary/20 flex items-center justify-center border border-primary/40 shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full border-2 border-t-primary border-transparent animate-spin" />
        </motion.div>
      </div>
    );
  }

  const completionRate = tasks?.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="max-w-[1700px] mx-auto px-8 lg:px-16 pt-36 pb-60">
      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-12 lg:gap-24 items-start">
        
        {/* Workspace Sidebar */}
        <aside className="space-y-12 lg:sticky lg:top-36 hidden lg:block">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 px-4 italic leading-none">Navigation</p>
              <nav className="space-y-2">
                {[
                  { id: 'all', label: 'All Tasks', icon: Layers },
                  { id: 'today', label: 'Due Today', icon: Activity },
                  { id: 'overdue', label: 'Priority / Overdue', icon: Zap },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-700 group relative",
                      selectedFilter === filter.id 
                        ? "text-primary bg-primary/5 shadow-2xl inner-glow" 
                        : "text-white/20 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10 transition-transform duration-700 group-hover:scale-105 italic">
                      <filter.icon className={cn("w-4 h-4 transition-transform duration-700", selectedFilter === filter.id && "scale-110 rotate-6")} />
                      <span>{filter.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/[0.03]">
              <div className="px-4">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 italic leading-none">Category Filter</p>
              </div>
              <CategoryFilter 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
              <div className="px-1 pt-4">
                <CategoryManager />
              </div>
            </div>
          </div>
        </aside>

        {/* Dashboard Core */}
        <main className="space-y-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/[0.03] pb-16">
            <div className="space-y-4">
              <motion.div initial={{ width: 0 }} animate={{ width: 40 }} className="h-1 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
              <h1 className="text-7xl font-black tracking-[-0.08em] text-white leading-none">Workspace</h1>
              <p className="text-white/20 font-black text-sm uppercase tracking-[0.4em] italic mt-2">
                Managing {activeTasks.length} active projects
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 2 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="h-20 px-10 rounded-[2rem] bg-primary text-white flex items-center justify-center gap-4 shadow-[0_20px_50px_-10px_rgba(var(--primary),0.6)] group overflow-hidden relative inner-glow"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              <Plus className="w-8 h-8 relative z-10 group-hover:rotate-90 transition-transform duration-700" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] relative z-10 italic">Create Task</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {activeTasks.length > 0 ? (
                activeTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.04 }}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-48 flex flex-col items-center text-center space-y-12 premium-card border-dashed border-2 bg-transparent shadow-none"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 rounded-full border border-white/[0.05] flex items-center justify-center opacity-20 relative"
                  >
                     <div className="absolute inset-0 rounded-full border-t-2 border-primary/20 animate-pulse" />
                     <Compass className="w-12 h-12 text-white/20" />
                  </motion.div>
                  <div className="space-y-4 max-w-sm relative z-10">
                    <h3 className="text-4xl font-black tracking-tight text-white italic">Shelf is Empty</h3>
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                      Your trajectory is fully aligned. <br/> Create a new project when ready.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <section className="space-y-12 pt-24 mt-24 border-t border-white/[0.05]">
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-2xl">
                    <History className="w-6 h-6 text-white/10" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-white/20 italic">Archived Projects</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 opacity-30 hover:opacity-100 transition-all duration-[1500ms] grayscale hover:grayscale-0">
                {completedTasks.slice(0, 10).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Dynamic Activity Wing */}
        <aside className="space-y-12 lg:sticky lg:top-36 hidden xl:block">
           <div className="premium-card p-12 border-white/[0.03] space-y-12 inner-glow">
              <div className="flex items-center justify-between pb-8 border-b border-white/[0.03]">
                <div className="space-y-1">
                  <h4 className="font-black text-[12px] uppercase tracking-[0.4em] italic text-white">Daily Output</h4>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic transition-all group-hover:tracking-[0.5em] duration-1000">Synchronized</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-6">
                   <div className="flex items-end justify-between gap-4">
                      <div className="text-8xl font-black tracking-[-0.1em] text-white leading-none">{completionRate}%</div>
                      <ArrowUpRight className="w-10 h-10 text-emerald-500/20 group-hover:text-emerald-500 transition-colors duration-1000 mb-2" />
                   </div>
                   <div className="h-2 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/[0.05] p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-primary rounded-full shadow-[0_0_30px_rgba(var(--primary),0.8)]"
                      />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic text-center leading-relaxed">
                      Total completion rate across all workspace sectors.
                   </p>
                </div>

                <div className="pt-8 border-t border-white/[0.03] space-y-4">
                   <button className="w-full h-14 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 flex items-center justify-center gap-3 group">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-colors italic">View Detailed Report</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700" />
                   </button>
                </div>
              </div>
           </div>
        </aside>
      </div>

      <ManualTaskModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}
