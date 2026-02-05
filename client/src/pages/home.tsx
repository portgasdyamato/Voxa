import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { CategoryManager } from '@/components/CategoryManager';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Filter, Layers, 
  CalendarDays, Trash2, Bell, Sparkles, AlertCircle, ChevronRight, Activity, Zap
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
  
  // Initialize deadline notifications
  useDeadlineNotifications(tasks || []);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Category filter
      if (selectedCategory !== null && task.categoryId !== selectedCategory) {
        return false;
      }
      
      // Deadline filter
      if (selectedDeadline !== 'all') {
        if (!task.dueDate) return false;
        
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedDeadline === 'today' && diffDays !== 0) return false;
        if (selectedDeadline === 'tomorrow' && diffDays !== 1) return false;
        if (selectedDeadline === 'week' && (diffDays < 0 || diffDays > 7)) return false;
        if (selectedDeadline === 'overdue' && (task.completed || dueDate >= now)) return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return task.title.toLowerCase().includes(query) || 
               (task.description?.toLowerCase().includes(query));
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const pA = priorityOrder[a.priority as keyof typeof priorityOrder];
      const pB = priorityOrder[b.priority as keyof typeof priorityOrder];
      if (pA !== pB) return pA - pB;
      
      // Then by completion status
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, selectedCategory, selectedDeadline, searchQuery]);

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  if (tasksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-8">
           <div className="h-12 bg-muted rounded-2xl w-64" />
           <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
              <div className="h-[600px] bg-muted rounded-[2rem]" />
              <div className="space-y-6">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-12 items-start">
        {/* Control Sidebar */}
        <aside className="w-full lg:sticky lg:top-32 space-y-10">
          {/* Action Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold tracking-tight leading-none">Console</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Systems Active</span>
              </div>
            </div>
            
            <Button 
               onClick={() => setIsModalOpen(true)}
               className="h-14 w-full rounded-xl bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> 
              Add Objective
            </Button>
          </div>

          <div className="space-y-8">
            {/* Search Protocol */}
            <div className="space-y-3">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Quick Search</Label>
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                 <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Filter tasks..."
                   className="h-11 rounded-xl border-border/50 bg-muted/20 pl-11 font-medium focus-visible:ring-primary/20"
                 />
               </div>
            </div>

            {/* Taxonomy Filter */}
            <div className="space-y-3">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Categories</Label>
               <CategoryFilter 
                 selectedCategory={selectedCategory} 
                 onCategoryChange={setSelectedCategory} 
               />
            </div>

            {/* Lifecycle Status */}
            <div className="space-y-3">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Timeline</Label>
               <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'all', label: 'All' },
                   { id: 'today', label: 'Today' },
                   { id: 'tomorrow', label: 'Tomorrow' },
                   { id: 'overdue', label: 'Overdue' },
                 ].map((d) => (
                   <button
                    key={d.id}
                    onClick={() => setSelectedDeadline(d.id)}
                    className={cn(
                      "h-10 rounded-lg font-bold uppercase tracking-wider text-[9px] transition-all border",
                      selectedDeadline === d.id 
                        ? "bg-primary/10 text-primary border-primary/30 shadow-sm" 
                        : "border-border/40 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                    )}
                   >
                    {d.label}
                   </button>
                 ))}
               </div>
            </div>

            {/* Taxonomy Manager */}
            <div className="pt-6 border-t border-border/30">
               <CategoryManager />
            </div>
          </div>
        </aside>

        {/* Task Stream */}
        <main className="w-full space-y-10">
          {/* Notification Toast Replacement */}
          <AnimatePresence>
            {tasks?.some(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-500/[0.03] border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-rose-600">Sync Alerts</h3>
                    <p className="text-xs font-medium text-rose-500/70">You have overdue items requiring attention</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-lg font-bold text-[10px] uppercase tracking-wider h-9 px-4 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20">
                  Reviews
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Flow */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                   <Activity className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold tracking-tight leading-none">Active Objectives</h3>
                   <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">{activeTasks.length} Operations Indexed</span>
                 </div>
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
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center justify-center text-center space-y-5 bg-muted/5 rounded-[3rem] border border-dashed border-border/40"
              >
                <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center opacity-40">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold tracking-tight text-foreground/80">Zero Objectives</h4>
                  <p className="text-muted-foreground/50 font-medium text-xs">All systems are currently idle.</p>
                </div>
                <Button 
                   onClick={() => setIsModalOpen(true)}
                   variant="outline" 
                   className="h-10 rounded-lg px-6 border font-bold uppercase tracking-wider text-[10px]"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" /> Initial Link
                </Button>
              </motion.div>
            )}
          </section>

          {/* Completed Buffer */}
          {completedTasks.length > 0 && (
            <section className="space-y-6 pt-10 border-t border-border/20">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight leading-none text-muted-foreground/60">Archive Buffer</h3>
                      <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{completedTasks.length} Completed Records</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {completedTasks.map((task) => (
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
