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
  ListTodo, History, Mic, Settings2, BarChart3, Clock, Compass
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
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Category Filter
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
      // Status/Deadline Filter
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
  }, [tasks, selectedCategory, selectedDeadline, searchQuery]);

  const activeTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  if (tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/40"
        >
          <div className="w-8 h-8 rounded-full border-2 border-t-primary border-transparent animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-8 lg:px-16 pt-36 pb-32">
      <div className="grid lg:grid-cols-[300px_1fr_300px] gap-12 lg:gap-20 items-start">
        
        {/* Left Wing: Navigation & Categories */}
        <aside className="space-y-12 lg:sticky lg:top-36 hidden lg:block">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 px-4 italic">Sectors</p>
              <nav className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Segments', icon: Layers },
                  { id: 'today', label: 'Real-time Output', icon: Activity },
                  { id: 'overdue', label: 'Focus / Overdue', icon: Zap },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedDeadline(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 group relative overflow-hidden italic",
                      selectedDeadline === filter.id 
                        ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-3xl" 
                        : "text-white/20 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <filter.icon className={cn("w-4 h-4 transition-transform duration-700", selectedDeadline === filter.id && "scale-110 rotate-12")} />
                      <span>{filter.label}</span>
                    </div>
                    {selectedDeadline === filter.id && (
                      <motion.div layoutId="sec-marker" className="w-1 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/[0.03]">
              <div className="flex items-center justify-between px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">Sector Registry</p>
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
                className="h-1.5 bg-primary rounded-full mb-4 shadow-[0_0_30px_rgba(var(--primary),0.5)]"
              />
              <h2 className="text-6xl font-black tracking-[-0.08em] text-white leading-tight">
                Strategic Deck
              </h2>
              <p className="text-white/20 font-black text-sm uppercase tracking-[0.3em] italic">
                Synchronized with {activeTasks.length} active nodes.
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="w-20 h-20 rounded-[2.5rem] bg-primary text-white flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(var(--primary),0.8)] group overflow-hidden relative inner-glow"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Plus className="w-8 h-8 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {activeTasks.length > 0 ? (
                activeTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
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
                  className="py-40 flex flex-col items-center text-center space-y-12 glass rounded-[5rem] border-dashed border-2 border-white/[0.05] relative overflow-hidden group shadow-inner"
                >
                  <div className="mesh-gradient opacity-10 scale-150 absolute pointer-events-none" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-t-2 border-primary/20 flex items-center justify-center opacity-20"
                  >
                     <Compass className="w-12 h-12 text-white/5" />
                  </motion.div>
                  <div className="space-y-4 max-w-sm relative z-10">
                    <h3 className="text-4xl font-black tracking-tight text-white leading-none italic">Clear Vector</h3>
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                      All systems optimal. Your trajectory is stabilized.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <section className="space-y-10 pt-20 border-t border-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <History className="w-5 h-5 text-white/10" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-white/10 italic">Resolved Registry</h3>
                </div>
                <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.4em] italic leading-none">Historical Records</span>
              </div>
              <div className="grid grid-cols-1 gap-4 opacity-40 hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0">
                {completedTasks.slice(0, 10).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Right Wing: Telemetry Hub (Simplified) */}
        <aside className="space-y-12 lg:sticky lg:top-36 hidden xl:block">
           <div className="premium-card p-10 border-white/[0.03] space-y-10 inner-glow">
              <div className="flex items-center gap-6 pb-6 border-b border-white/[0.03]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-black text-[11px] uppercase tracking-[0.4em] italic text-white/60">Telemetry</h4>
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic animate-pulse">Live Signal</p>
                </div>
              </div>
              
              <div className="space-y-10">
                <div className="space-y-4 text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">Target Attainment</p>
                   <div className="text-6xl font-black tracking-[-0.1em] text-white">82%</div>
                   <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/[0.05]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                      />
                   </div>
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
