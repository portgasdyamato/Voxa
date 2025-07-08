import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats(selectedPeriod);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { toast } = useToast();

  const isLoading = statsLoading || categoriesLoading;
  const error = statsError;

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
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
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-effect rounded-xl p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Stats
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load statistics'}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Statistics Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create some tasks to see your statistics.
          </p>
        </div>
      </div>
    );
  }

  // Calculate averages and additional metrics
  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Task Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your productivity and progress over time
        </p>
      </div>

      {/* Period Selection */}
      <div className="flex justify-center mb-8">
        <div className="glass-effect rounded-lg p-1 flex space-x-1">
          {[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: '3months', label: 'Last 3 Months' }
          ].map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={selectedPeriod === period.value ? "bg-primary text-primary-foreground" : ""}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</h3>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {avgDaily} avg per day
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</h3>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.completionRate}% completion rate
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</h3>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.overdueTasks} overdue
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Progress</h3>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayProgress}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            tasks completed today
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        <StatsCharts 
          data={stats} 
          period={selectedPeriod}
          categories={categories || []}
        />
      </div>
    </div>
  );
}
