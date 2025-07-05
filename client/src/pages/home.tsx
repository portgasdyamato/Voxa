import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTodayTasks, useTaskStats, useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { TaskCard } from '@/components/TaskCard';
import { ClipboardList, CheckCircle, Clock, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: todayTasks, isLoading: todayTasksLoading, error: todayTasksError } = useTodayTasks();
  const { data: allTasks, isLoading: allTasksLoading, error: allTasksError } = useTasks();
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats();
  const { toast } = useToast();

  const rawTasksData = showAllTasks ? allTasks : todayTasks;
  const tasksLoading = showAllTasks ? allTasksLoading : todayTasksLoading;
  const tasksError = showAllTasks ? allTasksError : todayTasksError;

  // Filter tasks based on search query
  const tasksData = rawTasksData?.filter(task => 
    searchQuery === '' || 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
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
  }, [statsError, toast]);

  if (userLoading || tasksLoading || statsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-effect rounded-xl p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingTasks = tasksData?.filter(task => !task.completed) || [];
  const completedTasks = tasksData?.filter(task => task.completed) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-mobile-nav">


      {/* Welcome Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Good morning, <span className="text-blue-600">{(user as any)?.firstName || 'User'}</span>!
        </h2>
        <p className="text-gray-600">
          You have <span className="font-semibold text-purple-600">{pendingTasks.length} pending tasks</span> for today
        </p>
      </div>

      {/* Today's Tasks */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {showAllTasks ? 'All Tasks' : 'Today\'s Tasks'}
          </h3>
          <button 
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            {showAllTasks ? 'Show Today' : 'View All'}
          </button>
        </div>

        {tasksData?.length === 0 ? (
          <div className="glass-effect rounded-xl p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              {showAllTasks ? 'No tasks yet' : 'No tasks for today'}
            </h4>
            <p className="text-gray-500">Use the microphone button to add your first task!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats?.completed || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
