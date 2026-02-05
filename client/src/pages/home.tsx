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
           <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12">
              <div className="h-[600px] bg-muted rounded-[3rem]" />
              <div className="space-y-6">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 pb-32">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[380px_1fr] gap-16 items-start">
        {/* Control Sidebar */}
        <aside className="w-full lg:sticky lg:top-32 space-y-12">
          {/* Action Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-3xl shadow-primary/30">
                <Zap className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-3xl font-black tracking-tighter leading-none">Console</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Status: Systems Nominal</span>
              </div>
            </div>
            
            <Button 
               onClick={() => setIsModalOpen(true)}
               className="h-16 w-full rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" /> 
              Initialize Task
            </Button>
          </div>

          <div className="space-y-10">
            {/* Search Protocol */}
            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Query Interface</Label>
               <div className="relative group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                 <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search parameters..."
                   className="h-14 rounded-2xl border-2 bg-muted/20 border-border/40 pl-14 font-bold focus-visible:ring-0 focus-visible:border-primary transition-all pr-6"
                 />
               </div>
            </div>

            {/* Taxonomy Filter */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                 <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Taxonomy</Label>
                 <Layers className="w-4 h-4 text-muted-foreground/30" />
               </div>
               <CategoryFilter 
                 selectedCategory={selectedCategory} 
                 onCategoryChange={setSelectedCategory} 
               />
            </div>

            {/* Lifecycle Status */}
            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Buffer Window</Label>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { id: 'all', label: 'All Units' },
                   { id: 'today', label: 'Cycle 0' },
                   { id: 'tomorrow', label: 'Cycle 1' },
                   { id: 'overdue', label: 'Stale' },
                 ].map((d) => (
                   <button
                    key={d.id}
                    onClick={() => setSelectedDeadline(d.id)}
                    className={cn(
                      "h-11 rounded-xl font-black uppercase tracking-[0.1em] text-[9px] transition-all border-2",
                      selectedDeadline === d.id 
                        ? "bg-primary/10 text-primary border-primary/20 shadow-inner" 
                        : "border-border/40 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                    )}
                   >
                    {d.label}
                   </button>
                 ))}
               </div>
            </div>

            {/* Taxonomy Manager */}
            <div className="pt-8 border-t-2 border-dashed border-border/40">
               <CategoryManager />
            </div>
          </div>
        </aside>

        {/* Task Stream */}
        <main className="w-full space-y-12">
          {/* Notification Toast Replacement */}
          <AnimatePresence>
            {tasks?.some(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()) && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-rose-500/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 animate-pulse">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight leading-none text-rose-600">Sync Alerts</h3>
                    <p className="text-sm font-bold text-rose-500/80 mt-1 uppercase tracking-widest text-[10px]">Critical items requiring immediate intervention</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 px-6 bg-rose-500/20 text-rose-600 hover:bg-rose-500/30">
                  Audit Backlog
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Flow */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border-2 border-indigo-500/20">
                   <Activity className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-black tracking-tighter leading-none">Active Stream</h3>
                   <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{activeTasks.length} Operations Indexed</span>
                 </div>
               </div>
               <div className="h-0.5 flex-1 bg-gradient-to-r from-muted/50 to-transparent mx-8 opacity-20 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-muted/10 rounded-[4rem] border-2 border-dashed border-border/40"
              >
                <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center opacity-30">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black tracking-tighter">Zero Objectives</h4>
                  <p className="text-muted-foreground/60 font-bold uppercase tracking-widest text-xs">All systems are currently idle.</p>
                </div>
                <Button 
                   onClick={() => setIsModalOpen(true)}
                   variant="outline" 
                   className="h-12 rounded-xl px-8 border-2 font-black uppercase tracking-widest text-[10px]"
                >
                  <Plus className="w-4 h-4 mr-2" /> Initial Link
                </Button>
              </motion.div>
            )}
          </section>

          {/* Completed Buffer */}
          {completedTasks.length > 0 && (
            <section className="space-y-8 pt-12 border-t-2 border-dashed border-border/40">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/20">
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter leading-none text-muted-foreground/60">Archive Buffer</h3>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{completedTasks.length} Completed Records</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-6 opacity-60 grayscale-[0.5] hover:opacity-80 transition-opacity">
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
