import { useEffect } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';

export default function Stats() {
  const { data: stats, isLoading, error } = useTaskStats();
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
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-effect rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Stats</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Statistics Available</h2>
          <p className="text-gray-600">Start creating tasks to see your statistics!</p>
        </div>
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const avgDaily = stats.total > 0 ? (stats.total / 7).toFixed(1) : '0.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-mobile-nav">


      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Task Analytics</h2>
        <p className="text-gray-600">Track your productivity and progress</p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          This Week
        </Button>
        <Button variant="outline" className="border-blue-200 text-gray-700 hover:bg-blue-50">
          This Month
        </Button>
        <Button variant="outline" className="border-blue-200 text-gray-700 hover:bg-blue-50">
          Last 3 Months
        </Button>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <StatsCharts stats={stats} />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{avgDaily}</p>
            <p className="text-sm text-gray-600">Avg Daily Tasks</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{completionRate}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">2.4h</p>
            <p className="text-sm text-gray-600">Avg Task Time</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl shadow-sm p-4 border border-blue-100/50">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">12</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
