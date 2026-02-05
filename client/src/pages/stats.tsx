import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target, CalendarDays, Zap, Trophy, ArrowUpRight, Activity, Layers, BarChart4 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats(selectedPeriod);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { toast } = useToast();

  const isLoading = statsLoading || categoriesLoading;
  const error = statsError;

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      window.location.href = "/api/login";
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="animate-pulse space-y-16">
          <div className="flex flex-col items-center space-y-4">
             <div className="h-12 bg-muted rounded-xl w-64"></div>
             <div className="h-4 bg-muted rounded-full w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-muted rounded-2xl"></div>
            ))}
          </div>
          <div className="h-[500px] bg-muted rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16"
      >
        <div className="space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" />
            Performance Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-none">
            Analytics <span className="text-primary font-normal text-muted-foreground/40">Studio</span>
          </h1>
          <p className="text-muted-foreground/60 font-medium text-lg max-w-xl">
            Heuristic analysis of your productivity flow and execution velocity.
          </p>
        </div>

        <div className="bg-muted/30 backdrop-blur-md p-1 rounded-xl border border-border/50 flex items-center gap-1 shadow-sm">
          {[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: '3months', label: 'Quarter' }
          ].map((period) => (
            <Button
              key={period.value}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={cn(
                "h-9 rounded-lg font-bold text-[11px] uppercase tracking-widest px-6 transition-all",
                selectedPeriod === period.value 
                  ? "bg-background text-primary shadow-sm border border-border/50" 
                  : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard 
          title="Total Objectives" 
          value={stats.totalTasks} 
          icon={<BarChart4 className="w-5 h-5" />} 
          footer={`${avgDaily} items / day`}
          color="primary"
          delay={0.1}
        />
        <StatCard 
          title="Sync Rate" 
          value={stats.completedTasks} 
          icon={<Zap className="w-5 h-5" />} 
          footer={`${stats.completionRate}% Efficiency`}
          color="indigo"
          delay={0.2}
        />
        <StatCard 
          title="Active Backlog" 
          value={stats.pendingTasks} 
          icon={<Clock className="w-5 h-5" />} 
          footer={`${stats.overdueTasks} Overdue`}
          color="rose"
          isUrgent={stats.overdueTasks > 0}
          delay={0.3}
        />
        <StatCard 
          title="Current Cycle" 
          value={todayProgress} 
          icon={<Trophy className="w-5 h-5" />} 
          footer="Items today"
          color="amber"
          delay={0.4}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-8 md:p-12 rounded-3xl bg-card/60 backdrop-blur-2xl border border-border/40 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Layers className="w-64 h-64" />
        </div>
        <StatsCharts 
          data={stats} 
          period={selectedPeriod}
          categories={categories || []}
        />
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, footer, color, isUrgent, delay }: any) {
  const colorStyles: any = {
    primary: "text-primary bg-primary/10",
    indigo: "text-indigo-500 bg-indigo-500/10",
    rose: "text-rose-500 bg-rose-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="group p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-300 shadow-sm"
    >
      <div className="flex flex-col h-full justify-between gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("p-3 rounded-xl", colorStyles[color])}>
            {icon}
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">{title}</p>
          <h3 className="text-4xl font-extrabold tracking-tight leading-none">{value}</h3>
        </div>
        
        <div className={cn(
          "w-fit px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
          isUrgent 
            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
            : "text-muted-foreground/60 bg-muted/30"
        )}>
          {footer}
        </div>
      </div>
    </motion.div>
  );
}
