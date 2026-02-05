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
          <div className="flex flex-col items-center space-y-6">
             <div className="h-16 bg-muted rounded-[2rem] w-96"></div>
             <div className="h-4 bg-muted rounded-full w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-[2.5rem]"></div>
            ))}
          </div>
          <div className="h-[600px] bg-muted rounded-[3rem]"></div>
        </div>
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 pb-32">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20"
      >
        <div className="text-center lg:text-left space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <Activity className="w-3.5 h-3.5" />
            System Analytics
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">
            Performance <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-muted-foreground/80 font-bold text-xl max-w-2xl">
            Real-time telemetry and heuristic analysis of your execution flow.
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-3xl p-2 rounded-[2rem] border-2 border-border/50 flex items-center gap-2 shadow-xl">
          {[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: '3months', label: 'Quarter' }
          ].map((period) => (
            <Button
              key={period.value}
              variant="ghost"
              onClick={() => setSelectedPeriod(period.value)}
              className={cn(
                "h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] px-8 transition-all duration-300",
                selectedPeriod === period.value 
                  ? "bg-background text-primary shadow-lg ring-1 ring-border/50" 
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <StatCard 
          title="Gross Objectives" 
          value={stats.totalTasks} 
          icon={<BarChart4 className="w-6 h-6" />} 
          footer={`${avgDaily} items / day`}
          color="primary"
          delay={0.1}
        />
        <StatCard 
          title="Sync Completion" 
          value={stats.completedTasks} 
          icon={<Zap className="w-6 h-6" />} 
          footer={`${stats.completionRate}% throughput`}
          color="indigo"
          delay={0.2}
        />
        <StatCard 
          title="Pending Latency" 
          value={stats.pendingTasks} 
          icon={<Clock className="w-6 h-6" />} 
          footer={`${stats.overdueTasks} critical items`}
          color="rose"
          isUrgent={stats.overdueTasks > 0}
          delay={0.3}
        />
        <StatCard 
          title="Current Velocity" 
          value={todayProgress} 
          icon={<Trophy className="w-6 h-6" />} 
          footer="Active cycle progress"
          color="amber"
          delay={0.4}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', damping: 25 }}
        className="p-12 md:p-16 rounded-[4rem] bg-card/40 backdrop-blur-3xl border-2 border-border/50 shadow-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
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
    primary: "text-primary bg-primary/10 border-primary/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border-2 border-border/40 hover:border-primary/40 transition-all duration-300 shadow-xl relative overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col h-full justify-between gap-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("p-4 rounded-2xl shadow-inner", colorStyles[color])}>
            {icon}
          </div>
          <motion.div 
            whileHover={{ rotate: 45 }}
            className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{title}</p>
          <h3 className="text-5xl font-black tracking-tighter leading-none">{value}</h3>
        </div>
        
        <div className={cn(
          "w-fit px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
          isUrgent 
            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse" 
            : "bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
        )}>
          {footer}
        </div>
      </div>
    </motion.div>
  );
}
