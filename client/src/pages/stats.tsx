import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, CheckCircle, Zap, ArrowUpRight, BarChart3, 
  Hexagon, Sparkles, Target, Activity, Trophy, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center bg-[#030305]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  const avgDaily = stats?.chartData ? (stats.chartData.reduce((sum, day) => sum + day.completed, 0) / stats.chartData.length).toFixed(1) : '0.0';
  const todayProgress = stats?.chartData?.slice(-1)[0]?.completed || 0;

  return (
    <div className="max-w-[1700px] mx-auto px-8 lg:px-16 pt-24 pb-48">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-white/[0.03] pb-12">
        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-[-0.05em] text-white">Performance</h1>
          <p className="text-white/20 font-black text-sm uppercase tracking-[0.4em] italic">Visualizing your productivity trajectory</p>
        </div>

        <div className="p-1 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl flex items-center gap-1">
          {['week', 'month', '3months'].map((period) => (
            <Button
              key={period}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "h-10 rounded-xl font-black text-[11px] uppercase tracking-widest px-8 transition-all duration-500",
                selectedPeriod === period ? "bg-primary text-white shadow-2xl" : "text-white/20 hover:text-white"
              )}
            >
              {period === 'week' ? '7 Days' : period === 'month' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {/* Key Metrics - Bento Style */}
         <BentoStat 
            title="Tasks Finished" 
            value={stats?.completedTasks || 0} 
            icon={<CheckCircle className="w-6 h-6 text-emerald-400" />} 
            description={`Cycle average: ${avgDaily}`}
            color="emerald"
            delay={0.1}
         />
         <BentoStat 
            title="Success Rate" 
            value={`${stats?.completionRate || 0}%`} 
            icon={<Target className="w-6 h-6 text-primary" />} 
            description="Overall Target Attainment"
            color="primary"
            delay={0.2}
         />
         <BentoStat 
            title="Active Projects" 
            value={stats?.pendingTasks || 0} 
            icon={<Activity className="w-6 h-6 text-rose-400" />} 
            description={`${stats?.overdueTasks || 0} require focus`}
            color="rose"
            delay={0.3}
         />
         <BentoStat 
            title="Daily Output" 
            value={todayProgress} 
            icon={<Sparkles className="w-6 h-6 text-amber-400" />} 
            description="Accomplished today"
            color="amber"
            delay={0.4}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bento-card relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                   <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic">Productivity Trend</h2>
                  <p className="text-[10px] uppercase font-black tracking-widest text-white/10 mt-1">Vocalizing your workspace flow</p>
                </div>
             </div>
             <ArrowUpRight className="w-8 h-8 text-white/5 group-hover:text-primary transition-colors" />
          </div>
          
          <div className="h-[400px] chart-glow">
            {stats && (
              <StatsCharts 
                data={stats} 
                period={selectedPeriod}
                categories={categories || []}
              />
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bento-card bg-gradient-to-br from-primary/10 to-transparent border-primary/10 space-y-12"
        >
           <div className="flex items-center gap-4">
              <Trophy className="w-10 h-10 text-primary" />
              <h3 className="text-2xl font-black italic">Efficiency Insight</h3>
           </div>
           
           <div className="space-y-8">
              <div className="space-y-4">
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Today's Peak Output</p>
                 <div className="text-6xl font-black">{Math.round(todayProgress * 1.5)}% <span className="text-lg text-emerald-400 font-bold ml-2">+12%</span></div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className="h-full bg-primary" />
                 </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-white/[0.05]">
                 <p className="text-[10px] uppercase font-black tracking-widest text-white/30 leading-relaxed italic">
                    You are performing at an elite level. Your trajectory is optimal for meeting all quarterly goals.
                 </p>
                 <button className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest italic group overflow-hidden relative">
                    <span className="relative z-10 transition-transform group-hover:translate-x-2 flex items-center justify-center gap-3">
                       Detailed Breakdown <ArrowUpRight className="w-4 h-4" />
                    </span>
                 </button>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

function BentoStat({ title, value, icon, description, color, delay }: any) {
  const colors = {
    emerald: "border-emerald-500/20 group-hover:border-emerald-500/40",
    primary: "border-primary/20 group-hover:border-primary/40",
    rose: "border-rose-500/20 group-hover:border-rose-500/40",
    amber: "border-amber-500/20 group-hover:border-amber-500/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn("bento-card !p-8 group relative overflow-hidden", colors[color as keyof typeof colors])}
    >
      <div className="flex flex-col h-full justify-between gap-8">
        <div className="flex items-center justify-between">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 group-hover:rotate-6 transition-all">
            {icon}
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/5 group-hover:text-white transition-opacity" />
        </div>
        <div className="space-y-2">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 italic leading-none">{title}</h4>
          <div className="text-6xl font-black tracking-tighter transition-all group-hover:tracking-normal group-hover:translate-x-1 origin-left">{value}</div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/10 pt-6 border-t border-white/[0.03] italic">
          {description}
        </div>
      </div>
    </motion.div>
  );
}
