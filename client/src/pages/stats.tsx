import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target, CalendarDays, Zap, Trophy, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-10">
          <div className="flex flex-col items-center space-y-4">
             <div className="h-10 bg-muted rounded-2xl w-64"></div>
             <div className="h-4 bg-muted rounded-lg w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-[2rem]"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
      >
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Performance <span className="text-primary">Metrix</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Analyzing your productivity flow and task lifecycle.
          </p>
        </div>

        <div className="bg-muted/50 p-1.5 rounded-2xl border-2 flex items-center gap-1 backdrop-blur-xl">
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
                "rounded-xl font-black text-xs uppercase tracking-widest px-6 transition-all",
                selectedPeriod === period.value 
                  ? "bg-background text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Gross Tasks" 
          value={stats.totalTasks} 
          icon={<Target className="w-5 h-5" />} 
          footer={`${avgDaily} daily average`}
          color="blue"
        />
        <StatCard 
          title="Throughput" 
          value={stats.completedTasks} 
          icon={<Zap className="w-5 h-5" />} 
          footer={`${stats.completionRate}% Efficiency`}
          color="emerald"
        />
        <StatCard 
          title="Backlog" 
          value={stats.pendingTasks} 
          icon={<Clock className="w-5 h-5" />} 
          footer={`${stats.overdueTasks} Critical Items`}
          color="amber"
          isUrgent={stats.overdueTasks > 0}
        />
        <StatCard 
          title="Today's Velocity" 
          value={todayProgress} 
          icon={<Trophy className="w-5 h-5" />} 
          footer="Tasks completed today"
          color="purple"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-2xl border-2 border-border/50 shadow-2xl"
      >
        <StatsCharts 
          data={stats} 
          period={selectedPeriod}
          categories={categories || []}
        />
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, footer, color, isUrgent }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group p-6 rounded-[2rem] bg-card border-2 border-border/50 hover:border-primary/30 transition-all shadow-sm relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 bg-current opacity-[0.03] group-hover:scale-110 transition-transform ${colors[color].split(' ')[0]}`} />
      
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-3 rounded-2xl", colors[color])}>
            {icon}
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
        
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{title}</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
          </div>
        </div>
        
        <p className={cn(
          "text-[10px] font-black uppercase tracking-tighter mt-4 py-1.5 px-3 rounded-lg w-fit",
          isUrgent ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-muted/50 text-muted-foreground"
        )}>
          {footer}
        </p>
      </div>
    </motion.div>
  );
}
