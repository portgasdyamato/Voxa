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
  Layout, BarChart3, PieChart as PieIcon, Hexagon
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
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_50px_rgba(var(--primary),0.2)]"
        >
          <div className="w-8 h-8 rounded-full border-2 border-t-primary border-transparent animate-spin" />
        </motion.div>
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 overflow-x-hidden relative">
      <div className="mesh-gradient" />
      
      <div className="max-w-[1800px] mx-auto px-8 lg:px-16 pt-36 pb-40">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20 border-b border-white/[0.03] pb-16"
        >
          <div className="space-y-4 text-left">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              className="h-1.5 bg-primary rounded-full mb-6 shadow-[0_0_20px_rgba(var(--primary),0.5)]"
            />
            <h1 className="text-6xl font-black tracking-[-0.06em] text-white">
              Telemetry Core
            </h1>
            <p className="text-white/30 font-medium text-lg italic max-w-xl">
              Precision analysis of intentional output and workspace trajectory.
            </p>
          </div>

          <div className="p-2 rounded-[2rem] border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl flex items-center gap-2 shadow-3xl">
            {[
              { value: 'week', label: '7D Cycle' },
              { value: 'month', label: '30D Orbit' },
              { value: '3months', label: '90D Sector' }
            ].map((period) => (
              <Button
                key={period.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  "h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] px-10 transition-all duration-500 italic",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            { title: "Total Nodes", value: stats?.totalTasks || 0, icon: <BarChart4 />, footer: `Cycle Avg: ${avgDaily}`, color: "primary", delay: 0.1 },
            { title: "Resolution Rate", value: `${stats?.completionRate || 0}%`, icon: <Zap />, footer: "Target Attainment", color: "emerald", delay: 0.2 },
            { title: "Active Threads", value: stats?.pendingTasks || 0, icon: <Hexagon />, footer: `${stats?.overdueTasks || 0} Critical Drifts`, color: "rose", delay: 0.3 },
            { title: "Today's Output", value: todayProgress, icon: <Trophy />, footer: "Real-time Delta", color: "amber", delay: 0.4 }
          ].map((item, idx) => (
            <StatCard key={idx} {...item} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="premium-card p-16 md:p-24 relative overflow-hidden group shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 p-24 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-[2000ms]">
            <TrendingUp className="w-[500px] h-[500px] text-primary" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-8 mb-20">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl inner-glow">
                 <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-[-0.03em] text-white">Trend Synthesis</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 mt-1 italic">Vocalizing workspace dynamics</p>
              </div>
            </div>
            
            {stats && (
              <div className="min-h-[400px]">
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
    </div>
  );
}

function StatCard({ title, value, icon, footer, color, delay }: any) {
  const colorMap: any = {
    primary: "text-primary border-primary/20 bg-primary/5",
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
    rose: "text-rose-500 border-rose-500/20 bg-rose-500/5",
    amber: "text-amber-500 border-amber-500/20 bg-amber-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 30 }}
      className="premium-card p-10 group inner-glow"
    >
      <div className="flex flex-col h-full justify-between gap-12 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("p-5 rounded-2xl border transition-all duration-700 group-hover:scale-110", colorMap[color])}>
            {icon}
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0" />
        </div>
        
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">{title}</p>
          <h3 className="text-6xl font-black tracking-[-0.06em] text-white leading-none">{value}</h3>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 pt-8 border-t border-white/[0.03] italic">
          {footer}
        </div>
      </div>
    </motion.div>
  );
}
