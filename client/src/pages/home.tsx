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
        if (!task.dueDate) return false;
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedDeadline === 'today' && diffDays !== 0) return false;
        if (selectedDeadline === 'tomorrow' && diffDays !== 1) return false;
        if (selectedDeadline === 'overdue' && (task.completed || dueDate >= now)) return false;
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
    <div className="max-w-6xl mx-auto px-6 py-10 pb-32">
      <div className="flex flex-col md:grid md:grid-cols-[260px_1fr] gap-12 items-start">
        {/* Sidebar */}
        <aside className="w-full md:sticky md:top-28 space-y-8">
          <div className="space-y-4">
            <Button 
               onClick={() => setIsModalOpen(true)}
               className="w-full h-11 rounded-xl bg-primary shadow-sm hover:shadow-md transition-all font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-10 rounded-xl border-border/50 bg-muted/20 pl-10 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
               <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Timeline</Label>
               <div className="space-y-1">
                 {[
                   { id: 'all', label: 'All Tasks', icon: Layers },
                   { id: 'today', label: 'Today', icon: Activity },
                   { id: 'overdue', label: 'Overdue', icon: Zap },
                 ].map((d) => (
                   <button
                    key={d.id}
                    onClick={() => setSelectedDeadline(d.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      selectedDeadline === d.id 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                   >
                    <d.icon className="w-4 h-4" />
                    {d.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-3">
               <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Contexts</Label>
               <CategoryFilter 
                 selectedCategory={selectedCategory} 
                 onCategoryChange={setSelectedCategory} 
               />
            </div>

            <div className="pt-4 border-t border-border/40">
               <CategoryManager />
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="w-full space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Focus</h2>
              <span className="text-xs font-medium text-muted-foreground">{activeTasks.length} active</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>

            {activeTasks.length === 0 && !tasksLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 rounded-2xl border border-dashed border-border/40">
                <p className="text-muted-foreground text-sm">Clear skies. No active tasks.</p>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>Create Objective</Button>
              </div>
            )}
          </section>

          {completedTasks.length > 0 && (
            <section className="space-y-6 pt-10 border-t border-border/20">
               <div className="flex items-center gap-2 text-muted-foreground/60">
                 <History className="w-4 h-4" />
                 <h2 className="text-lg font-semibold">Recently Completed</h2>
               </div>
               <div className="grid grid-cols-1 gap-3">
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
