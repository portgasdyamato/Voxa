import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, CheckCircle, Clock, Target, CalendarDays, 
  Zap, Trophy, ArrowUpRight, Activity, Layers, BarChart4, 
  Layout, BarChart3, PieChart as PieIcon, Hexagon,
  ArrowRightLeft, TargetIcon, Briefcase, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats(selectedPeriod);
  const { data: categories } = useCategories();

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      window.location.href = "/api/login";
    }
  }, [statsError]);

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020204]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin"
        />
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-[1700px] mx-auto px-8 lg:px-16 pt-24 pb-48">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20 border-b border-white/[0.03] pb-12"
      >
        <div className="space-y-4 text-left">
          <h1 className="text-7xl font-black tracking-[-0.08em] text-white">Performance</h1>
          <p className="text-white/20 font-black text-sm uppercase tracking-[0.4em] italic leading-none">
            In-depth analysis of your work trajectory and accomplishment patterns.
          </p>
        </div>

        <div className="p-1.5 h-12 rounded-[1.2rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl flex items-center gap-1">
          {[
            { value: 'week', label: '7 Days' },
            { value: 'month', label: '30 Days' },
            { value: '3months', label: '90 Days' }
          ].map((period) => (
            <Button
              key={period.value}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={cn(
                "h-9 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] px-8 transition-all duration-700 italic",
                selectedPeriod === period.value 
                  ? "bg-primary text-white shadow-2xl shadow-primary/30" 
                  : "text-white/20 hover:text-white"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { title: "Accomplished", value: stats?.completedTasks || 0, icon: <CheckCircle className="w-5 h-5" />, footer: `Daily Average: ${avgDaily}`, color: "primary", delay: 0.1 },
          { title: "Resolution Rate", value: `${stats?.completionRate || 0}%`, icon: <Zap className="w-5 h-5" />, footer: "Overall Target Attainment", color: "emerald", delay: 0.2 },
          { title: "Active Threads", value: stats?.pendingTasks || 0, icon: <Hexagon className="w-5 h-5" />, footer: `${stats?.overdueTasks || 0} Critical Drifts`, color: "rose", delay: 0.3 },
          { title: "Daily Delta", value: todayProgress, icon: <Sparkles className="w-5 h-5" />, footer: "Real-time accomplished today", color: "amber", delay: 0.4 }
        ].map((item, idx) => (
          <StatCard key={idx} {...item} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="premium-card p-16 md:p-20 relative overflow-hidden group shadow-3xl bg-white/[0.02] border-white/[0.05]"
      >
        <div className="absolute top-0 right-0 p-24 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-transform duration-[3000ms]">
          <TrendingUp className="w-[600px] h-[600px] text-primary" />
        </div>
        
        <div className="relative z-10 space-y-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl inner-glow group-hover:rotate-12 transition-transform duration-1000">
                 <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tight text-white leading-none italic">Task Dynamics</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/5 mt-2 italic">Visualizing historical task data through high-end analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] italic">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 leading-none">Efficiency Rank</span>
                  <span className="text-xl font-bold text-emerald-500 mt-2">Elite +14%</span>
               </div>
               <TrendingUp className="w-8 h-8 text-emerald-500/30" />
            </div>
          </div>
          
          {stats && (
            <div className="min-h-[500px]">
              <StatsCharts 
                data={stats} 
                period={selectedPeriod}
                categories={categories || []}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, footer, color, delay }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/5 border-primary/20",
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20",
    rose: "text-rose-500 bg-rose-500/5 border-rose-500/20",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className="premium-card p-10 group inner-glow flex flex-col justify-between min-h-[280px]"
    >
      <div className="flex items-center justify-between">
        <div className={cn("p-5 rounded-2xl border transition-all duration-700 group-hover:rotate-12 shadow-3xl", colorMap[color])}>
          {icon}
        </div>
        <ArrowUpRight className="w-8 h-8 text-white/5 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-x-10 group-hover:translate-x-0" />
      </div>
      
      <div className="space-y-4">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 italic leading-none">{title}</p>
        <h3 className="text-8xl font-black tracking-[-0.08em] text-white leading-none transition-all duration-1000 group-hover:tracking-normal group-hover:scale-105 origin-left">{value}</h3>
      </div>
      
      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 pt-8 border-t border-white/[0.03] italic leading-none">
        {footer}
      </div>
    </motion.div>
  );
}
