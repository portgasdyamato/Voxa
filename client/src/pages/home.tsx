import { useState, useMemo, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { CategoryManager } from '@/components/CategoryManager';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Layers, Activity, Zap, History, Command, SlidersHorizontal, LayoutGrid, ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  
  useDeadlineNotifications(tasks || []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
      if (selectedDeadline !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfToday.getDate() + 1);
        const startOfDayAfterTomorrow = new Date(startOfTomorrow);
        startOfDayAfterTomorrow.setDate(startOfTomorrow.getDate() + 1);

        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        if (selectedDeadline === 'today') {
          if (taskDate.getTime() !== startOfToday.getTime()) return false;
        } else if (selectedDeadline === 'tomorrow') {
          if (taskDate.getTime() !== startOfTomorrow.getTime()) return false;
        } else if (selectedDeadline === 'overdue') {
          if (task.completed) return false;
          const isOverdue = dueDate < now;
          const isHighPriority = task.priority === 'high';
          if (!isHighPriority && !isOverdue) return false;
        }
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return task.title.toLowerCase().includes(query) || (task.description?.toLowerCase().includes(query));
      }
      return true;
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const pA = priorityOrder[a.priority as keyof typeof priorityOrder];
      const pB = priorityOrder[b.priority as keyof typeof priorityOrder];
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, selectedCategory, selectedDeadline, searchQuery]);

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  if (tasksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-10 py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full shadow-2xl shadow-primary/20"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="mesh-gradient opacity-40 dark:opacity-20" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-20 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-12 lg:gap-20 items-start">
          
          {/* Floating Protocol Side Panel */}
          <aside className="w-full lg:sticky lg:top-10 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-[3rem] p-10 border-white/5 shadow-2xl space-y-12"
            >
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 px-2 italic">Operation</p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-16 rounded-[1.5rem] gradient-primary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-500 italic"
                >
                  <Plus className="w-5 h-5 mr-3" /> Initiate Mission
                </Button>
              </div>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Global Search</p>
                    <Command className="w-3 h-3 text-muted-foreground/20" />
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-500" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SCANNING OBJECTS..."
                      className="h-14 rounded-2xl border-white/5 bg-white/5 pl-14 focus-visible:ring-primary/40 border-2 font-black uppercase tracking-widest text-[10px] italic placeholder:text-muted-foreground/20"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Temporal Filters</p>
                    <SlidersHorizontal className="w-3 h-3 text-muted-foreground/20" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'ALL SECTORS', icon: Layers },
                      { id: 'today', label: "TODAY'S ORBIT", icon: Activity },
                      { id: 'overdue', label: 'CRITICAL OPS', icon: Zap },
                    ].map((d) => (
                      <motion.button
                        key={d.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDeadline(d.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden",
                          selectedDeadline === d.id 
                            ? "bg-primary text-white shadow-xl shadow-primary/20" 
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/5"
                        )}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <d.icon className={cn("w-4 h-4 transition-all duration-500", selectedDeadline === d.id ? "scale-110" : "opacity-30 group-hover:opacity-100")} />
                          <span className="italic">{d.label}</span>
                        </div>
                        {selectedDeadline === d.id && (
                          <motion.div 
                            layoutId="activeFilter"
                            className="absolute inset-0 bg-primary/20 blur-xl"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Node Categories</p>
                    <LayoutGrid className="w-3 h-3 text-muted-foreground/20" />
                  </div>
                  <CategoryFilter 
                    selectedCategory={selectedCategory} 
                    onCategoryChange={setSelectedCategory} 
                  />
                  <div className="pt-6 border-t border-white/5">
                    <CategoryManager />
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Intelligence Display */}
          <main className="w-full space-y-16">
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    className="h-1 bg-primary rounded-full"
                  />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic">Primary Registry</p>
                  <h2 className="text-5xl font-black tracking-tighter italic uppercase text-gradient">Status Stack</h2>
                </div>
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 group transition-all hover:bg-white/10">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors group-hover:text-emerald-500">
                    {activeTasks.length} SYSTEMS ONLINE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout" initial={false}>
                  {activeTasks.length > 0 ? (
                    activeTasks.map((task, idx) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <TaskCard task={task} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-40 flex flex-col items-center justify-center text-center space-y-10 glass rounded-[4rem] border-dashed border-2 border-white/10 relative overflow-hidden group shadow-inner"
                    >
                      <div className="mesh-gradient opacity-5 scale-150 absolute pointer-events-none" />
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-28 h-28 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.05)]"
                      >
                        <ListTodo className="w-12 h-12 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                      </motion.div>
                      <div className="space-y-4 max-w-sm relative z-10">
                        <h3 className="text-3xl font-black tracking-tighter italic uppercase">Registry Empty</h3>
                        <p className="text-muted-foreground/40 text-xs font-black uppercase tracking-widest leading-relaxed">
                          Synchronizing with your intent... <br/> initiate your first mission protocol.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] italic border-2 border-primary/20 hover:bg-primary hover:text-white transition-all duration-500 bg-transparent text-primary" 
                      >
                        Start Deployment
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {completedTasks.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-10 pt-10"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4 text-muted-foreground/20">
                    <History className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tighter uppercase tracking-[0.4em] italic">Archive Log</h2>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/10 italic">Last 10 Records</span>
                </div>
                <div className="grid grid-cols-1 gap-4 opacity-40 hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0">
                  {completedTasks.slice(0, 10).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </motion.section>
            )}
          </main>
        </div>
      </div>

      <ManualTaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
