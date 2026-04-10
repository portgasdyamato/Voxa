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
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-[2.5rem] bg-white/[0.05] border border-white/10 shadow-2xl"
        />
        <p className="text-sm font-medium text-white/20">Synchronizing Workspace...</p>
      </div>
    );
  }

  const completionRate = tasks?.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 pt-12 md:pt-20 pb-64">
      <div className="grid lg:grid-cols-[240px_1fr_280px] gap-12 lg:gap-20 items-start w-full">
        
        {/* Elite Sidebar - Bevel Frost Style */}
        <aside className="space-y-12 lg:sticky lg:top-32 hidden lg:block">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-medium text-white/30 px-6">Views</p>
              <nav className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Tasks', icon: Layers },
                  { id: 'today', label: 'Due Today', icon: Activity },
                  { id: 'overdue', label: 'Priority Nodes', icon: Zap },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 h-12 rounded-2xl text-sm font-medium transition-all group relative overflow-hidden",
                      selectedFilter === filter.id 
                        ? "bg-white/[0.1] text-white border border-white/[0.15] shadow-lg" 
                        : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <filter.icon className={cn("w-4 h-4 transition-colors", selectedFilter === filter.id ? "text-blue-400" : "opacity-40 group-hover:opacity-100")} />
                      <span>{filter.label}</span>
                    </div>
                    {selectedFilter === filter.id && (
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/[0.05]">
              <div className="px-6">
                <p className="text-xs font-medium text-white/30">Sectors</p>
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

        <main className="space-y-10 md:space-y-14 w-full min-w-0">
          <header className="relative w-full py-4 md:py-6 border-b border-white/[0.08]">
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-0.5">
                <h1 className="text-3xl md:text-3xl font-semibold tracking-tight text-white">Workspace</h1>
                <p className="text-white/30 text-xs font-medium">
                   {activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'} remaining
                </p>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative h-11 px-8 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] to-white/[0.04] backdrop-blur-[40px] pointer-events-none" />
                <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
                <div className="relative flex items-center justify-center gap-3 text-white z-20">
                   <Plus className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90" />
                   <span className="text-sm font-medium">New Task</span>
                </div>
              </button>
            </motion.div>
          </header>

            {/* Mobile Filter Pill Bar */}
            <div className="flex lg:hidden overflow-x-auto pb-4 gap-2 no-scrollbar px-2">
              {[
                { id: 'all', label: 'All Tasks', icon: Layers },
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
                    "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedFilter === filter.id && selectedCategory === null
                      ? "bg-white text-black shadow-sm" 
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
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
                  className="py-32 flex flex-col items-center text-center space-y-6 bg-[#0a0a0c]/40 rounded-2xl border border-white/[0.05]"
                >
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-xl font-medium text-white tracking-tight">No tasks found</h3>
                    <p className="text-white/40 text-sm">
                      You're all caught up for now.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <section className="space-y-12 md:space-y-16 pt-24 border-t border-white/[0.05]">
              <div className="flex items-center gap-6 px-4">
                 <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                    <History className="w-5 h-5 text-white/20" />
                 </div>
                 <h3 className="text-2xl font-semibold text-white/20 select-none">Archive</h3>
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
        <aside className="space-y-6 lg:sticky lg:top-32 hidden xl:block">
           <div className="relative p-10 rounded-[2.5rem] overflow-hidden border border-white/[0.12] bg-[#080809] backdrop-blur-[60px] shadow-[0_45px_100px_rgba(0,0,0,0.8)] group">
              {/* Bevel Top Highlight */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-10 text-white/40 relative z-10 font-medium">
                <Activity className="w-5 h-5 text-blue-400/60" />
                <h4 className="text-sm tracking-tight text-white/60">Efficiency</h4>
              </div>
              
              <div className="flex flex-col items-center justify-center py-6 relative z-10">
                 <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                       <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/[0.03]" />
                       <motion.circle 
                         cx="80" cy="80" r="70" 
                         stroke="currentColor" strokeWidth="8" fill="transparent" 
                         strokeDasharray="439.82" 
                         initial={{ strokeDashoffset: 439.82 }}
                         animate={{ strokeDashoffset: 439.82 - (439.82 * completionRate) / 100 }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                         className="text-white shadow-[0_0_20px_white/20]" 
                         strokeLinecap="round"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl font-semibold text-white tracking-tight">{completionRate}<span className="text-xl text-white/40 ml-0.5">%</span></span>
                    </div>
                 </div>
                 <p className="text-sm text-white/30 font-medium pt-10">Success Rate</p>
              </div>
           </div>
        </aside>
      </div>

      <ManualTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
