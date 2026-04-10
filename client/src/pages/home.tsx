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
          <header className="relative w-full py-16 md:py-24 border-b border-white/[0.05] overflow-hidden">
            {/* Ambient Background Aura specifically for the Header */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/[0.03] blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center text-center gap-10"
            >
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
                   <span className="text-[10px] font-black tracking-[0.6em] text-white/20 uppercase italic">Neural Command Center</span>
                </div>
                
                <h1 className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-bold tracking-tight text-white leading-[0.88] select-none">
                   Work<span className="font-serif italic font-light text-white/40">space</span>
                </h1>
                
                <p className="text-white/30 font-serif italic text-sm md:text-lg tracking-tight px-4 md:px-0">
                   {activeTasks.length} operational nodes currently synchronized for absolute throughput.
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="group relative h-16 md:h-20 px-12 md:px-16 rounded-[2.5rem] border border-white/[0.22] bg-white/[0.08] backdrop-blur-[40px] text-white flex items-center justify-center gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden transition-all duration-700 hover:bg-white/[0.12]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="w-5 h-5 text-white/50 group-hover:text-white transition-all duration-700" />
                <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-all duration-700">Commit Task Node</span>
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
        <aside className="space-y-12 lg:sticky lg:top-32 hidden xl:block">
           <div className="frosted-layer p-10 space-y-10 border-white/[0.15]">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.05]">
                <div className="space-y-1.5">
                  <h4 className="font-black text-[11px] uppercase tracking-[0.4em] text-white/20 leading-none">Intelligence</h4>
                  <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1 italic leading-none">Sync Latency: 0ms</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-blue-500/10 transition-all duration-700">
                  <Activity className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-all" />
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-8 text-center">
                   <div className="relative inline-flex items-center justify-center">
                      <div className="text-[5.5rem] font-bold tracking-tight text-white leading-none select-none">{completionRate}%</div>
                      <div className="absolute -top-4 -right-8">
                         <Sparkles className="w-5 h-5 text-blue-400/40 animate-pulse" />
                      </div>
                   </div>
                   <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-white/40 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      />
                   </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] italic">Absolute Optimization</p>
                   <p className="text-[8px] font-serif italic text-white/30 leading-relaxed text-center opacity-60 px-4">"The standard of excellence is synchronized throughput."</p>
                </div>
              </div>
           </div>
        </aside>
      </div>

      <ManualTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
