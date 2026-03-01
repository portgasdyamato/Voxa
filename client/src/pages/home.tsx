import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskCard } from '@/components/TaskCard';
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { VoiceTaskModal } from '@/components/VoiceTaskModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Layers, Activity, Zap, 
  ListTodo, History, Mic, Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (selectedCategory !== null && task.categoryId !== selectedCategory) return false;
      
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
          const isHighPriority = task.priority === 'high';
          if (!isHighPriority && !isOverdue) return false;
        }
      }
      
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <div className="mesh-gradient opacity-20 pointer-events-none" />
      
      {/* Search & Navigation Bar */}
      <header className="nav-blur h-20 flex items-center px-6 lg:px-10 border-b border-border shadow-sm bg-background/80 relative z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-foreground">VoXa</h1>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Control Center</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions..."
              className="h-11 rounded-full bg-muted/30 border-transparent pl-12 focus:bg-background focus:border-border transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              size="sm"
              onClick={() => setIsVoiceModalOpen(true)}
              className="rounded-full gap-2 px-6 h-11 bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 shadow-none transition-all"
            >
              <Mic className="w-4 h-4" />
              <span className="text-xs font-semibold">Speak</span>
            </Button>
            <VoiceTaskModal open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] gap-12 lg:gap-16 items-start">
          
          {/* Sidebar */}
          <aside className="w-full space-y-10 lg:sticky lg:top-32">
            <div className="space-y-4">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full h-12 rounded-xl bg-foreground text-background hover:opacity-90 font-semibold shadow-lg shadow-foreground/5 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            </div>

            <nav className="space-y-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-3">Filters</p>
                {[
                  { id: 'all', label: 'All Tasks', icon: Layers },
                  { id: 'today', label: 'Due Today', icon: Activity },
                  { id: 'overdue', label: 'Important', icon: Zap },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedDeadline(filter.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      selectedDeadline === filter.id 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <filter.icon className="w-4 h-4" />
                      <span>{filter.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Categories</p>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full opacity-40 hover:opacity-100">
                    <Settings2 className="w-3 h-3" />
                  </Button>
                </div>
                <CategoryFilter 
                  selectedCategory={selectedCategory} 
                  onCategoryChange={setSelectedCategory} 
                />
                <div className="pt-4 mt-2 border-t border-border/40">
                  <CategoryManager />
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Dashboard */}
          <main className="w-full space-y-12">
            <div className="md:hidden mb-8">
               <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="h-11 rounded-xl bg-muted/30"
              />
            </div>

            <section className="space-y-8">
              <div className="flex items-end justify-between border-b border-border pb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    Manage your daily schedule and goals.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-primary px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                   {activeTasks.length} Active
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {activeTasks.length > 0 ? (
                    activeTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TaskCard task={task} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      className="py-24 flex flex-col items-center text-center space-y-6 bg-muted/10 rounded-[2.5rem] border border-border/50"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm">
                        <ListTodo className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">Everything clear</h3>
                        <p className="text-sm text-muted-foreground max-w-[280px] font-medium">
                          You've completed all tasks in this view.
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl px-10 border-border hover:bg-background h-12 shadow-sm"
                      >
                        Create new task
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {completedTasks.length > 0 && (
              <section className="space-y-6 pt-10 border-t border-border">
                <div className="flex items-center gap-3 text-muted-foreground/40">
                  <History className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Completed</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 opacity-50 hover:opacity-100 transition-all duration-300">
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </section>
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
