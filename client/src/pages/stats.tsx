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
  ArrowRightLeft, TargetIcon, Briefcase, Sparkles
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
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-[2.5rem] bg-primary/20 flex items-center justify-center border border-primary/40 shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full border-2 border-t-primary border-transparent animate-spin" />
        </motion.div>
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-[1700px] mx-auto px-8 lg:px-16 pt-36 pb-60">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20 border-b border-white/[0.03] pb-16"
      >
        <div className="space-y-4 text-left">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            className="h-1 bg-primary rounded-full mb-6 shadow-[0_0_20px_rgba(var(--primary),0.8)]"
          />
          <h1 className="text-7xl font-black tracking-[-0.08em] text-white">
            Performance
          </h1>
          <p className="text-white/20 font-black text-sm uppercase tracking-[0.4em] italic leading-none">
            In-depth analysis of your weekly productivity and accomplishment patterns.
          </p>
        </div>

        <div className="p-2 h-14 rounded-[1.5rem] border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl flex items-center gap-1 shadow-2xl inner-glow">
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
                "h-10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] px-8 transition-all duration-700 italic",
                selectedPeriod === period.value 
                  ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-[1.05]" 
                  : "text-white/20 hover:text-white hover:bg-white/5"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { title: "Total Finished", value: stats?.completedTasks || 0, icon: <CheckCircle />, footer: `Daily Average: ${avgDaily}`, color: "primary", delay: 0.1 },
          { title: "Project Success", value: `${stats?.completionRate || 0}%`, icon: <TargetIcon />, footer: "Overall Completion", color: "emerald", delay: 0.2 },
          { title: "Pending Flow", value: stats?.pendingTasks || 0, icon: <Hexagon />, footer: `${stats?.overdueTasks || 0} Need Attention`, color: "rose", delay: 0.3 },
          { title: "Daily Record", value: todayProgress, icon: <Sparkles />, footer: "Accomplished Today", color: "amber", delay: 0.4 }
        ].map((item, idx) => (
          <StatCard key={idx} {...item} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="premium-card p-16 md:p-24 relative overflow-hidden group shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)] bg-card/60"
      >
        <div className="absolute top-0 right-0 p-24 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-transform duration-[3000ms]">
          <TrendingUp className="w-[600px] h-[600px] text-primary" />
        </div>
        
        <div className="relative z-10 space-y-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-10">
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl inner-glow group-hover:rotate-12 transition-transform duration-1000">
                 <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tight text-white leading-none italic">Growth Synthesis</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 mt-2 italic">Visualizing historical task data through premium analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 px-10 py-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] italic">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 leading-none">Efficiency Matrix</span>
                  <span className="text-xl font-bold text-emerald-500 mt-2">Optimal +12%</span>
               </div>
               <TrendingUp className="w-8 h-8 text-emerald-500/40" />
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
    primary: "text-primary bg-primary/5",
    emerald: "text-emerald-500 bg-emerald-500/5",
    rose: "text-rose-500 bg-rose-500/5",
    amber: "text-amber-500 bg-amber-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className="premium-card p-12 group inner-glow flex flex-col justify-between min-h-[300px]"
    >
      <div className="flex items-center justify-between h-12">
        <div className={cn("p-6 rounded-2xl border border-white/[0.05] transition-all duration-700 group-hover:scale-110 group-active:scale-95 group-hover:rotate-[15deg] shadow-2xl", colorMap[color])}>
          {icon}
        </div>
        <ArrowUpRight className="w-10 h-10 text-white/5 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-x-10 group-hover:translate-x-0 group-hover:text-primary" />
      </div>
      
      <div className="space-y-4">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 italic leading-none">{title}</p>
        <h3 className="text-8xl font-black tracking-[-0.08em] text-white leading-none transition-all duration-1000 group-hover:tracking-normal group-hover:scale-105 origin-left">{value}</h3>
      </div>
      
      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 pt-10 border-t border-white/[0.03] italic flex items-center justify-between">
        <span>{footer}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
      </div>
    </motion.div>
  );
}
