import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target, CalendarDays, Zap, Trophy, ArrowUpRight, Activity, Layers, BarChart4, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats(selectedPeriod);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = statsLoading || categoriesLoading;
  const error = statsError;

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      window.location.href = "/api/login";
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-10 py-20 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16 pb-40 relative">
      <div className="mesh-gradient opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-16"
      >
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest leading-none">
            <Activity className="w-3.5 h-3.5" />
            Performance Statistics
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Activity Dashboard
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-xl italic leading-relaxed">
            Personalized insights into your daily productivity habits and completion trends.
          </p>
        </div>

        <div className="p-1.5 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
          {[
            { value: 'week', label: 'Last 7 Days' },
            { value: 'month', label: 'Last 30 Days' },
            { value: '3months', label: 'Last 90 Days' }
          ].map((period) => (
            <Button
              key={period.value}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={cn(
                "h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest px-8 transition-all duration-300",
                selectedPeriod === period.value 
                  ? "bg-background text-primary shadow-lg border border-border/50 translate-y-[-1px]" 
                  : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { title: "Total Tasks", value: stats?.totalTasks || 0, icon: <BarChart4 />, footer: `Avg. ${avgDaily} per day`, color: "blue", delay: 0.1 },
          { title: "Completed", value: stats?.completedTasks || 0, icon: <Zap />, footer: `${stats?.completionRate || 0}% Success`, color: "emerald", delay: 0.2 },
          { title: "Pending", value: stats?.pendingTasks || 0, icon: <Clock />, footer: `Including ${stats?.overdueTasks || 0} Overdue`, color: "rose", delay: 0.3 },
          { title: "Today's Progress", value: todayProgress, icon: <Trophy />, footer: "Tasks finished today", color: "amber", delay: 0.4 }
        ].map((item, idx) => (
          <StatCard key={idx} {...item} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="p-10 md:p-16 rounded-[3rem] border border-border bg-card shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none transition-all group-hover:rotate-12">
          <TrendingUp className="w-80 h-80 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
               <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Productivity Trends</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Detailed analysis of your workflow</p>
            </div>
          </div>
          {stats && (
            <StatsCharts 
              data={stats} 
              period={selectedPeriod}
              categories={categories || []}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, footer, color, delay }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="group p-8 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      <div className="flex flex-col h-full justify-between gap-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("p-4 rounded-2xl border transition-all duration-500", colorMap[color])}>
            {icon}
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{title}</p>
          <h3 className="text-5xl font-bold tracking-tight leading-none text-foreground">{value}</h3>
        </div>
        
        <div className="text-[10px] font-bold text-muted-foreground/60 border-t border-border/50 pt-5">
          {footer}
        </div>
      </div>
    </motion.div>
  );
}
