import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle, Clock, Target, CalendarDays, Zap, Trophy, ArrowUpRight, Activity, Layers, BarChart4, Cpu, Database, Network } from 'lucide-react';
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
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360,
            borderRadius: ["20%", "50%", "20%"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary shadow-[0_0_40px_rgba(var(--primary),0.2)]"
        />
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-10 py-16 pb-40 relative">
      {/* Background Architecture */}
      <div className="mesh-gradient opacity-30 dark:opacity-20 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-grid-white opacity-[0.03] dark:opacity-[0.05]" />

      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-24"
      >
        <div className="space-y-8 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            VITAL TELEMETRY MODULE
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-gradient italic">
            INSIGHTS <span className="text-white/20 not-italic font-light">HUB.</span>
          </h1>
          <p className="text-muted-foreground/40 font-black uppercase tracking-[0.2em] text-[11px] max-w-xl italic leading-relaxed">
            Real-time biometric data analysis of objective completion velocity and strategic throughput.
          </p>
        </div>

        <div className="glass p-2 rounded-[2rem] border-white/5 flex items-center gap-2 shadow-2xl backdrop-blur-3xl overflow-hidden relative group">
          <motion.div 
            animate={{ x: [-200, 400] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12"
          />
          {[
            { value: 'week', label: 'WEEKLY CYCLE' },
            { value: 'month', label: 'MONTHLY SYNC' },
            { value: '3months', label: 'QUARTERLY INDEX' }
          ].map((period) => (
            <Button
              key={period.value}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={cn(
                "h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] px-10 transition-all duration-500 italic relative z-10",
                selectedPeriod === period.value 
                  ? "bg-white text-black shadow-2xl scale-[1.05]" 
                  : "text-muted-foreground/40 hover:text-white hover:bg-white/5"
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { title: "Strategic Volume", value: stats?.totalTasks || 0, icon: <BarChart4 />, footer: `${avgDaily} UNITS / CYCLE`, color: "blue", delay: 0.1 },
          { title: "Success Velocity", value: stats?.completedTasks || 0, icon: <Zap />, footer: `${stats?.completionRate || 0}% RATIO`, color: "emerald", delay: 0.2 },
          { title: "Pending Nodes", value: stats?.pendingTasks || 0, icon: <Clock />, footer: `${stats?.overdueTasks || 0} CRITICAL`, color: "rose", urgent: (stats?.overdueTasks || 0) > 0, delay: 0.3 },
          { title: "Diurnal Output", value: todayProgress, icon: <Trophy />, footer: "NODES COMPLETED", color: "amber", delay: 0.4 }
        ].map((item, idx) => (
          <StatCard key={idx} {...item} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="p-12 md:p-24 rounded-[4rem] glass border-2 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.3)] relative overflow-hidden group"
      >
        <div className="absolute -top-20 -right-20 p-20 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-all duration-1000 rotate-12">
          <Database className="w-[400px] h-[400px]" />
        </div>
        <div className="absolute -bottom-20 -left-20 p-20 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-all duration-1000 -rotate-12">
          <Network className="w-[400px] h-[400px]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20">
               <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">Temporal Analytics</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Deep Data Visualization v.2.0</p>
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

function StatCard({ title, value, icon, footer, color, urgent, delay }: any) {
  const colorMap: any = {
    blue: "from-blue-600/20 to-blue-600/5 text-blue-400 border-blue-500/20",
    emerald: "from-emerald-600/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    rose: "from-rose-600/20 to-rose-600/5 text-rose-400 border-rose-500/20",
    amber: "from-amber-600/20 to-amber-600/5 text-amber-400 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        "group p-10 rounded-[2.5rem] bg-gradient-to-br border-2 backdrop-blur-3xl transition-all duration-500 shadow-2xl relative overflow-hidden",
        colorMap[color]
      )}
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
        {icon}
      </div>
      
      <div className="flex flex-col h-full justify-between gap-10 relative z-10">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            {icon}
          </div>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>
        
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic">{title}</p>
          <h3 className="text-5xl font-black tracking-tighter italic text-white leading-none">{value}</h3>
        </div>
        
        <div className={cn(
          "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] italic border",
          urgent 
            ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse" 
            : "text-white/60 bg-white/5 border-white/5"
        )}>
          {footer}
        </div>
      </div>
    </motion.div>
  );
}
