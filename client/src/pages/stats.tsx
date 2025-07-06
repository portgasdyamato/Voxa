import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading, error } = useTaskStats(selectedPeriod);
  const { toast } = useToast();

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-effect rounded-xl p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Error Loading Stats</h2>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">No Statistics Available</h2>
          <p className="text-gray-600 dark:text-gray-300">Start creating tasks to see your statistics!</p>
        </div>
      </div>
    );
  }

  const completionRate = stats?.completionRate || 0;
  const avgDaily = stats?.total ? (stats.total / 7).toFixed(1) : '0.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-mobile-nav">


      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Task Analytics</h2>
        <p className="text-gray-600 dark:text-gray-300">Track your productivity and progress</p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <Button 
          onClick={() => setSelectedPeriod('week')}
          className={selectedPeriod === 'week' ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" : ""}
          variant={selectedPeriod === 'week' ? "default" : "outline"}
        >
          This Week
        </Button>
        <Button 
          onClick={() => setSelectedPeriod('month')}
          className={selectedPeriod === 'month' ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" : "border-blue-200 dark:border-purple-300 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-purple-900/20"}
          variant={selectedPeriod === 'month' ? "default" : "outline"}
        >
          This Month
        </Button>
        <Button 
          onClick={() => setSelectedPeriod('quarter')}
          className={selectedPeriod === 'quarter' ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" : "border-blue-200 dark:border-purple-300 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-purple-900/20"}
          variant={selectedPeriod === 'quarter' ? "default" : "outline"}
        >
          Last 3 Months
        </Button>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <StatsCharts stats={stats} />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{avgDaily}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Avg Daily Tasks</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{completionRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">2.4h</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Avg Task Time</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50 dark:border-purple-200/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-400 dark:to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Day Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
