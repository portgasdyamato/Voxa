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
import { ManualTaskModal } from '@/components/ManualTaskModal';
import { DeadlineFilter, getDeadlineFilteredTasks, getDeadlineCounts, type DeadlineFilter as DeadlineFilterType } from '@/components/DeadlineFilter';
import { ClipboardList, CheckCircle, Clock, TrendingUp, Search, Settings, Bell, BellOff, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterType>('today');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showManualTaskModal, setShowManualTaskModal] = useState(false);
  
  // Check for login success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const userName = urlParams.get('user');
    
    if (loginSuccess === 'success' && userName) {
      toast({
        title: "Welcome to VoXa! 🎉",
        description: `Hello ${decodeURIComponent(userName)}! You've successfully logged in.`,
        variant: "default"
      });
      // Clear the URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  const { data: todayTasks, isLoading: todayTasksLoading, error: todayTasksError } = useTodayTasks();
  const { data: allTasks, isLoading: allTasksLoading, error: allTasksError } = useTasks();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { createDefaults, isLoading: creatingDefaults } = useCreateDefaultCategories();
  const { toast } = useToast();

  const rawTasksData = showAllTasks ? allTasks : todayTasks;
  const tasksLoading = showAllTasks ? allTasksLoading : todayTasksLoading;
  const tasksError = showAllTasks ? allTasksError : todayTasksError;
  
  const { notifications, notificationPermission, requestPermission, testNotification } = useDeadlineNotifications(rawTasksData || []);

  // Filter tasks based on search query, category, and deadline
  const tasksData = rawTasksData?.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || task.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Apply deadline filtering
  const filteredTasks = getDeadlineFilteredTasks(tasksData, deadlineFilter);
  
  // Get deadline counts for the filter component
  const deadlineCounts = tasksData ? getDeadlineCounts(tasksData) : {
    total: 0,
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    overdue: 0,
    noDeadline: 0
  };

  // Handle unauthorized errors
  useEffect(() => {
    if (tasksError && isUnauthorizedError(tasksError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [tasksError, toast]);

  // Create default categories for new users
  useEffect(() => {
    if (categories && categories.length === 0 && !categoriesLoading && !creatingDefaults) {
      createDefaults();
    }
  }, [categories, categoriesLoading, createDefaults, creatingDefaults]);

  if (userLoading || tasksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-effect rounded-xl p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingTasks = filteredTasks?.filter(task => !task.completed) || [];
  const completedTasks = filteredTasks?.filter(task => task.completed) || [];
  
  // Calculate pending tasks due today (excluding completed tasks)
  const pendingTasksDueToday = pendingTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    return dueDate >= startOfToday && dueDate < endOfToday;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-mobile-nav">


      {/* Welcome Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Good morning, <span className="text-blue-600 dark:text-blue-400">{(user as any)?.firstName || 'User'}</span>!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          You have <span className="font-semibold text-purple-600 dark:text-purple-400">{pendingTasks.length} pending tasks</span> for today
        </p>
        
        {/* Notification Permission Alert */}
        {notificationPermission !== 'granted' && (
          <Alert className="max-w-md mx-auto mt-4 dark:border-gray-600">
            <Bell className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm dark:text-gray-300">Enable notifications for deadline reminders</span>
              <Button
                variant="outline"
                size="sm"
                onClick={requestPermission}
                className="ml-2 h-6 text-xs"
              >
                Enable
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {pendingTasksDueToday.length > 0 && (
          <Alert className="max-w-md mx-auto mt-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              You have {pendingTasksDueToday.length} task{pendingTasksDueToday.length === 1 ? '' : 's'} due today!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Manage Categories
          </Button>
        </div>
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <DeadlineFilter
          value={deadlineFilter}
          onChange={setDeadlineFilter}
          counts={deadlineCounts}
        />
        
        <Collapsible open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <CollapsibleContent className="space-y-4">
            <CategoryManager />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Voice Commands Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <VoiceCommandButton tasks={rawTasksData || []} />
        <Button
          onClick={() => setShowManualTaskModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          <Edit3 className="w-4 h-4" />
          Add Task Manually
        </Button>
      </div>

      {/* Today's Tasks */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {showAllTasks ? 'All Tasks' : 'Today\'s Tasks'}
          </h3>
          <button 
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
          >
            {showAllTasks ? 'Show Today' : 'View All'}
          </button>
        </div>

        {filteredTasks?.length === 0 ? (
          <div className="glass-effect rounded-xl p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              {selectedCategory === null && searchQuery === '' 
                ? (showAllTasks ? 'No tasks yet' : 'No tasks for today')
                : 'No tasks match your filters'
              }
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory === null && searchQuery === '' 
                ? 'Use the microphone button or "Add Task Manually" to create your first task!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show message if no pending tasks but has completed tasks */}
            {pendingTasks.length === 0 && completedTasks.length > 0 && (
              <div className="glass-effect rounded-xl p-6 text-center border-green-100 dark:border-green-800">
                <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
                  All tasks completed!
                </h4>
                <p className="text-green-600 dark:text-green-400">
                  Great job! You've completed all your tasks for this view.
                </p>
              </div>
            )}
            
            {/* Pending Tasks */}
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {/* Completed Tasks - shown below pending tasks */}
            {completedTasks.length > 0 && (
              <>
                <div className="my-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed Tasks ({completedTasks.length})
                  </h4>
                </div>
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                {filteredTasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                {completedTasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                {pendingTasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Task Modal */}
      <ManualTaskModal
        open={showManualTaskModal}
        onOpenChange={setShowManualTaskModal}
      />
    </div>
  );
}
