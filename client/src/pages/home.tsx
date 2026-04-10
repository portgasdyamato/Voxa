import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskCard } from '@/components/TaskCard';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { 
  Plus, History, Activity, Zap, Layers, Compass, BarChart3, ArrowUpRight, Workflow, Sparkles
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-[2rem] bg-white/[0.05] border border-white/10"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">Synchronizing Workspace...</p>
      </div>
    );
  }

  const completionRate = tasks?.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 pt-12 md:pt-20 pb-64">
      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-12 lg:gap-24 items-start w-full">
        
        {/* Elite Sidebar - Bevel Frost Style */}
        <aside className="space-y-12 lg:sticky lg:top-32 hidden lg:block">
          <div className="space-y-12">
            <div className="space-y-6">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/15 px-6 italic">Perspective</p>
              <nav className="space-y-3">
                {[
                  { id: 'all', label: 'All Tasks', icon: Layers },
                  { id: 'today', label: 'Due Today', icon: Activity },
                  { id: 'overdue', label: 'Priority', icon: Zap },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-8 py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] group relative transition-all duration-700 overflow-hidden",
                      selectedFilter === filter.id 
                        ? "bg-white/[0.08] text-white border border-white/[0.22] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" 
                        : "text-white/20 hover:text-white/60 hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-5 relative z-10 italic">
                      <filter.icon className={cn("w-4 h-4 transition-all duration-700", selectedFilter === filter.id ? "text-blue-400 scale-110" : "opacity-20 group-hover:opacity-100")} />
                      <span>{filter.label}</span>
                    </div>
                    {selectedFilter === filter.id && (
                       <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-8 pt-12 border-t border-white/[0.05]">
              <div className="px-6">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/15 italic">Folders</p>
              </div>
              <CategoryFilter 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
              <div className="px-2 pt-6">
                <CategoryManager />
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-16 md:space-y-24 w-full min-w-0">
          <header className="relative w-full py-8 md:py-10 border-b border-white/[0.05]">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">System Live</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white select-none">Workspace</h1>
                <p className="text-white/20 text-xs tracking-tight">
                   {activeTasks.length} active nodes synchronized.
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-8 rounded-xl border border-white/[0.15] bg-white/[0.04] backdrop-blur-3xl text-white flex items-center justify-center gap-3 shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Task</span>
              </motion.button>
            </motion.div>
          </header>

            {/* Mobile Filter Pill Bar - Premium Refinement */}
            <div className="flex lg:hidden overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth w-full px-2">
              {[
                { id: 'all', label: 'All', icon: Layers },
                { id: 'today', label: 'Today', icon: Activity },
                { id: 'overdue', label: 'Priority', icon: Zap },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedFilter(filter.id);
                    setSelectedCategory(null);
                  }}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-3 px-6 h-12 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-700 border",
                    selectedFilter === filter.id && selectedCategory === null
                      ? "bg-white/[0.1] text-white border-white/[0.2] shadow-xl" 
                      : "bg-white/[0.02] text-white/30 border-white/5"
                  )}
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {activeTasks.length > 0 ? (
                activeTasks.map((task, idx) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-48 flex flex-col items-center text-center space-y-12 frosted-layer border-dashed bg-transparent shadow-none"
                >
                  <Compass className="w-20 h-20 text-white/[0.02] animate-pulse" />
                  <div className="space-y-6 max-w-md relative z-10">
                    <h3 className="text-4xl font-black text-white italic tracking-tight">Sync Complete</h3>
                    <p className="text-white/10 text-[11px] font-black uppercase tracking-[0.5em] italic leading-loose">
                      All systems operating at absolute peak efficiency.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <section className="space-y-16 md:space-y-20 pt-24 border-t border-white/[0.05]">
              <div className="flex items-center gap-8 px-8">
                 <History className="w-8 h-8 text-white/10" />
                 <h3 className="text-4xl font-black tracking-tight text-white/20 italic select-none">Archived Protocol</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 opacity-40 hover:opacity-100 transition-all duration-[1000ms] grayscale hover:grayscale-0">
                {completedTasks.slice(0, 5).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Dynamic Activity Wing - Bento Box Refinement */}
        <aside className="space-y-8 lg:sticky lg:top-32 hidden xl:block">
           <div className="frosted-layer p-8 space-y-6 border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <h4 className="font-bold text-[9px] uppercase tracking-[0.3em] text-white/20">Efficiency</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-center py-2">
                    <div className="text-5xl font-bold tracking-tight text-white">{completionRate}<span className="text-xl text-white/20">%</span></div>
                 </div>
                 <div className="h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-blue-500/60 shadow-[0_0_10px_#3b82f640]"
                    />
                 </div>
                 <p className="text-[9px] text-white/10 text-center uppercase tracking-widest font-medium">Sync Rating</p>
              </div>
           </div>
        </aside>
      </div>

      <ManualTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
