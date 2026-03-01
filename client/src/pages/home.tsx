import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskCard } from '@/components/TaskCard';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { 
  Plus, History, Activity, Zap, Layers, Compass, BarChart3, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HomeProps {
  searchQuery?: string;
}

export default function Home({ searchQuery = '' }: HomeProps) {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
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
          return dueDate < now || task.priority === 'high';
        }
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return task.title?.toLowerCase().includes(query);
      }
      
      return true;
    });
  }, [tasks, selectedCategory, selectedFilter, searchQuery]);

  const activeTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  if (tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030305]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  const completionRate = tasks?.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="max-w-[1700px] mx-auto px-8 lg:px-16 pt-24 pb-64">
      <div className="grid lg:grid-cols-[260px_1fr_300px] gap-12 lg:gap-20 items-start">
        
        {/* Workspace Sidebar */}
        <aside className="space-y-12 lg:sticky lg:top-28 hidden lg:block">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 px-4 italic leading-none">Perspective</p>
              <nav className="space-y-2">
                {[
                  { id: 'all', label: 'All Tasks', icon: Layers },
                  { id: 'today', label: 'Due Today', icon: Activity },
                  { id: 'overdue', label: 'Priority', icon: Zap },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative",
                      selectedFilter === filter.id 
                        ? "text-primary bg-primary/5 border border-primary/20" 
                        : "text-white/20 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10 italic">
                      <filter.icon className={cn("w-4 h-4 transition-transform", selectedFilter === filter.id && "scale-110 rotate-6")} />
                      <span>{filter.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/[0.03]">
              <div className="px-4">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 italic leading-none">Folders</p>
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
        <main className="space-y-16">
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/[0.03] pb-12">
            <div className="space-y-4">
              <h1 className="text-7xl font-black tracking-[-0.05em] text-white leading-none">Workspace</h1>
              <p className="text-white/20 font-black text-sm uppercase tracking-[0.4em] italic mt-2">
                Optimizing {activeTasks.length} active tasks
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="h-16 px-10 rounded-2xl bg-primary text-white flex items-center gap-4 shadow-2xl glass-shadow group relative overflow-hidden active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-6 h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] relative z-10 italic">New Task</span>
            </motion.button>
          </header>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {activeTasks.length > 0 ? (
                activeTasks.map((task, idx) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-40 flex flex-col items-center text-center space-y-10 frosted-layer border-dashed bg-transparent shadow-none"
                >
                  <Compass className="w-16 h-16 text-white/10 animate-pulse" />
                  <div className="space-y-4 max-w-sm relative z-10">
                    <h3 className="text-3xl font-black text-white italic">Workspace Clear</h3>
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                      All systems optimal. Create a new task to resume.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <section className="space-y-10 pt-20 border-t border-white/[0.05]">
              <div className="flex items-center gap-6 px-6">
                 <History className="w-6 h-6 text-white/10" />
                 <h3 className="text-3xl font-black tracking-tight text-white/20 italic">Archived</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 opacity-40 hover:opacity-100 transition-all duration-[1000ms] grayscale hover:grayscale-0">
                {completedTasks.slice(0, 10).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Dynamic Activity Wing */}
        <aside className="space-y-12 lg:sticky lg:top-28 hidden xl:block">
           <div className="frosted-layer p-10 space-y-10">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.03]">
                <div className="space-y-1">
                  <h4 className="font-black text-[11px] uppercase tracking-[0.4em] text-white leading-none">Efficiency</h4>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic leading-none">Synchronized</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-6">
                   <div className="flex items-end justify-between">
                      <div className="text-7xl font-black tracking-[-0.1em] text-white leading-none">{completionRate}%</div>
                      <ArrowUpRight className="w-8 h-8 text-emerald-500/20" />
                   </div>
                   <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      />
                   </div>
                </div>
              </div>
           </div>
        </aside>
      </div>

      <ManualTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
