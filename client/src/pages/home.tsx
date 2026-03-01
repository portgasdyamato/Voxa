import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { CategoryManager } from '@/components/CategoryManager';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Layers, Activity, Zap, Calendar, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  
  useDeadlineNotifications(tasks || []);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
      if (selectedDeadline !== 'all') {
        const now = new Date();
        const isHighPriority = task.priority === 'high';
        
        let isOverdue = false;
        let diffDays = -999;

        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          const diffTime = taskDate.getTime() - today.getTime();
          diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          isOverdue = !task.completed && dueDate < now;
        }

        if (selectedDeadline === 'today') {
          if (!task.dueDate || diffDays !== 0) return false;
        } else if (selectedDeadline === 'tomorrow') {
          if (!task.dueDate || diffDays !== 1) return false;
        } else if (selectedDeadline === 'overdue') {
          // Show if it's high priority OR overdue (and not completed)
          if (task.completed) return false;
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-8">
           <div className="h-10 bg-muted rounded-lg w-48" />
           <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
              <div className="h-96 bg-muted rounded-xl" />
              <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 relative">
      {/* Page Background Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03] dark:opacity-[0.05]" />
      
      <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-16 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:sticky lg:top-32 space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-1">Actions</p>
               <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-14 rounded-2xl gradient-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all font-black uppercase tracking-widest text-sm"
               >
                 <Plus className="w-5 h-5 mr-3" /> New Task
               </Button>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all tasks..."
                className="h-12 rounded-2xl border-border/10 bg-muted/20 pl-12 focus-visible:ring-primary/20 focus-visible:border-primary/30 font-medium"
              />
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-1">Schedule Index</Label>
               <div className="space-y-1">
                 {[
                   { id: 'all', label: 'All Activities', icon: Layers },
                   { id: 'today', label: "Today's Focus", icon: Activity },
                   { id: 'overdue', label: 'Critical / Overdue', icon: Zap },
                 ].map((d) => (
                   <button
                    key={d.id}
                    onClick={() => setSelectedDeadline(d.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all group",
                      selectedDeadline === d.id 
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5" 
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                    )}
                   >
                    <div className="flex items-center gap-3">
                       <d.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", selectedDeadline === d.id ? "text-primary" : "text-muted-foreground/30")} />
                       <span className="italic">{d.label}</span>
                    </div>
                    {selectedDeadline === d.id && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-1">Task Categories</Label>
               <CategoryFilter 
                 selectedCategory={selectedCategory} 
                 onCategoryChange={setSelectedCategory} 
               />
            </div>

            <div className="pt-8 border-t border-border/10">
               <CategoryManager />
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="w-full space-y-12">
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b border-border/10 pb-4">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-1">Priority Queue</p>
                 <h2 className="text-3xl font-black tracking-tighter italic">Current Stack</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border/10">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{activeTasks.length} TASKS ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>

            {activeTasks.length === 0 && !tasksLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 flex flex-col items-center justify-center text-center space-y-8 glass rounded-[3rem] border-dashed border-2 border-border/20"
              >
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                   <Zap className="w-10 h-10 text-primary/20" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black tracking-tight italic">All Clear</h3>
                   <p className="text-muted-foreground/60 text-sm font-medium">No active tasks found in your current view.</p>
                </div>
                <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs border-2" onClick={() => setIsModalOpen(true)}>Create Task</Button>
              </motion.div>
            )}
          </section>

          {completedTasks.length > 0 && (
            <section className="space-y-8 pt-12 border-t border-border/20">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-muted-foreground/40">
                    <History className="w-5 h-5" />
                    <h2 className="text-xl font-black tracking-tighter uppercase tracking-[0.2em] italic">Completed</h2>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">Recent History</span>
               </div>
               <div className="grid grid-cols-1 gap-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
                  {completedTasks.slice(0, 5).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
               </div>
            </section>
          )}
        </main>
      </div>

      <ManualTaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
