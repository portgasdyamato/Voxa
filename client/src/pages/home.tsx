import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTodayTasks, useTasks } from '@/hooks/useTasks';
import { useCategories, useCreateDefaultCategories } from '@/hooks/useCategories';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { TaskCard } from '@/components/TaskCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { VoiceCommandButton } from '@/components/VoiceCommandButton';
import { DeadlineFilter, getDeadlineFilteredTasks, getDeadlineCounts, type DeadlineFilter as DeadlineFilterType } from '@/components/DeadlineFilter';
import { ClipboardList, CheckCircle, Clock, Search, Settings, Calendar, ListTodo, LayoutDashboard, Sparkles, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ManualTaskModal } from '@/components/ManualTaskModal';

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterType>('today');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  const handleShowAllTasksToggle = () => {
    const newShowAllTasks = !showAllTasks;
    setShowAllTasks(newShowAllTasks);
    if (newShowAllTasks) {
      setDeadlineFilter('all');
    } else {
      setDeadlineFilter('today');
    }
  };
  
  const { data: todayTasks, isLoading: todayTasksLoading, error: todayTasksError } = useTodayTasks();
  const { data: allTasks, isLoading: allTasksLoading, error: allTasksError } = useTasks();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { createDefaults, isLoading: creatingDefaults } = useCreateDefaultCategories();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const userName = urlParams.get('user');
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    
    if (loginSuccess === 'success' && userName) {
      toast({
        title: "Welcome back! ⚡",
        description: `Great to see you, ${decodeURIComponent(userName)}. Let's get things done.`,
      });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast({
        title: "Login Error",
        description: errorMessage ? decodeURIComponent(errorMessage) : 'Authentication failed.',
        variant: "destructive"
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  const rawTasksData = showAllTasks ? allTasks : todayTasks;
  const tasksLoading = showAllTasks ? allTasksLoading : todayTasksLoading;
  const tasksError = showAllTasks ? allTasksError : todayTasksError;
  
  const { notifications, notificationPermission, requestPermission } = useDeadlineNotifications(rawTasksData || []);

  const tasksData = rawTasksData?.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || task.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const filteredTasks = getDeadlineFilteredTasks(tasksData, deadlineFilter);
  const deadlineCounts = tasksData ? getDeadlineCounts(tasksData) : {
    total: 0, today: 0, tomorrow: 0, thisWeek: 0, overdue: 0, noDeadline: 0
  };

  useEffect(() => {
    if (tasksError && isUnauthorizedError(tasksError)) {
      window.location.href = "/api/login";
    }
  }, [tasksError]);

  useEffect(() => {
    if (categories && categories.length === 0 && !categoriesLoading && !creatingDefaults) {
      const storedUser = localStorage.getItem('voxa_user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      if (userData?.email === 'demo@voxa.app') {
        createDefaults();
      }
    }
  }, [categories, categoriesLoading, createDefaults, creatingDefaults]);

  if (userLoading || tasksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 bg-muted rounded-[2rem] w-80"></div>
            <div className="h-4 bg-muted rounded-lg w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             <div className="md:col-span-1 space-y-10">
                <div className="h-10 bg-muted rounded-xl"></div>
                <div className="space-y-4">
                   {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded-2xl"></div>)}
                </div>
             </div>
             <div className="md:col-span-3 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-[2rem]"></div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingTasks = filteredTasks?.filter(task => !task.completed) || [];
  const completedTasks = filteredTasks?.filter(task => task.completed) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      {/* Mesh Background Accent */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/5 rounded-full blur-[120px] animate-mesh" style={{ animationDelay: '2s' }} />
      </div>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16"
      >
        <div className="text-center lg:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" />
            Productivity Suite
          </div>
          <h2 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
            Focus, <span className="text-primary">{(user as any)?.firstName || 'Hero'}</span>
          </h2>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl">
            {pendingTasks.length > 0 
              ? `Strategic objectives: ${pendingTasks.length} pending operations.`
              : "All systems clear. You're completely up to date."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/60 backdrop-blur-3xl p-4 rounded-[2.5rem] border-2 border-border/50 shadow-xl">
           <VoiceCommandButton tasks={rawTasksData || []} />
           <div className="h-px w-full sm:h-12 sm:w-px bg-border/50 sm:mx-2" />
           <Button
            size="lg"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="rounded-[1.5rem] h-20 px-10 text-lg font-black gap-3 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Create
          </Button>
        </div>
      </motion.header>

      <AnimatePresence>
        {notificationPermission !== 'granted' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-12"
          >
            <div className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">
                  <Bell className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-lg font-black tracking-tight">Stay synchronized</h4>
                   <p className="text-muted-foreground font-medium">Enable real-time priority alerts and deadline reminders.</p>
                </div>
              </div>
              <Button onClick={requestPermission} className="rounded-2xl h-14 px-8 font-black text-sm uppercase tracking-widest relative z-10 hover:scale-105 active:scale-95">
                Grant Access
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-1 space-y-12">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-2">Navigation</h3>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Find anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-2 bg-card/40 backdrop-blur-xl border-border/50 focus-visible:ring-0 focus-visible:border-primary transition-all font-bold"
              />
            </div>
            <DeadlineFilter
              value={deadlineFilter}
              onChange={setDeadlineFilter}
              counts={deadlineCounts}
            />
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Entities</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className={cn("h-8 w-8 rounded-lg", showCategoryManager && "bg-primary/10 text-primary")}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </section>
          
          <Collapsible open={showCategoryManager} onOpenChange={setShowCategoryManager}>
            <CollapsibleContent className="pt-6 border-t-2 border-dashed border-border/50">
              <CategoryManager />
            </CollapsibleContent>
          </Collapsible>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border-2 border-primary/10">
                {showAllTasks ? <ListTodo className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight">
                  {showAllTasks ? 'Global Library' : 'Daily Agenda'}
                </h3>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                   {filteredTasks.length} Operations Indexed
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={handleShowAllTasksToggle}
              className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-10 border-2 hover:bg-muted"
            >
              {showAllTasks ? 'Today Only' : 'Everything'}
            </Button>
          </div>

          <div className="space-y-6 min-h-[500px]">
            {filteredTasks?.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-20 rounded-[3rem] bg-muted/20 border-2 border-dashed border-border"
              >
                <div className="w-24 h-24 rounded-3xl bg-muted/40 flex items-center justify-center mb-8">
                  <ClipboardList className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h4 className="text-2xl font-black text-foreground/80 mb-3 text-center">
                  Zero results found.
                </h4>
                <p className="text-muted-foreground text-center font-medium max-w-sm leading-relaxed">
                  Start by using the "Voice" command or clicking "Create" to populate your workspace.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout" initial={false}>
                  {pendingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                  
                  {completedTasks.length > 0 && (
                    <motion.div layout className="pt-12 space-y-6">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 whitespace-nowrap">Archive Buffer</span>
                        <div className="h-px w-full bg-border/50" />
                      </div>
                      {completedTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <TaskCard task={task} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      <ManualTaskModal 
        open={isNewTaskModalOpen}
        onOpenChange={setIsNewTaskModalOpen}
      />
    </div>
  );
}
