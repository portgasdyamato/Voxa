import { useEffect, useState } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, CheckCircle, ArrowUpRight,
  Sparkles, Target, Activity, Trophy, Flame,
  Calendar, Layers, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats(selectedPeriod);
  const { data: categories } = useCategories();

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      window.location.href = '/api/login';
    }
  }, [statsError]);

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary"
          />
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const completionRate = stats?.completionRate || 0;
  const completedTasks = stats?.completedTasks || 0;
  const pendingTasks = stats?.pendingTasks || 0;
  const overdueTasks = stats?.overdueTasks || 0;
  const totalTasks = stats?.totalTasks || 0;

  // Avg per day in the period
  const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
  const avgDaily = totalTasks > 0 ? (completedTasks / days).toFixed(1) : '0.0';

  const periods = [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: '3months', label: '90 Days' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 lg:px-16 pt-12 sm:pt-24 md:pt-28 pb-44">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 mb-8 lg:mb-12"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Analytics</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-[-0.04em] text-foreground leading-none">Performance</h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium mt-1">
            Your productivity at a glance
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] self-start lg:self-auto">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPeriod(p.key)}
              className={cn(
                'h-10 px-6 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-400',
                selectedPeriod === p.key
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(59,130,246,0.4)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <KpiCard
          delay={0.05}
          label="Completed"
          value={completedTasks}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          accent="#10b981"
          sub={`${avgDaily}/day avg`}
        />
        <KpiCard
          delay={0.1}
          label="Success Rate"
          value={`${completionRate}%`}
          icon={<Target className="w-5 h-5 text-primary" />}
          accent="#3b82f6"
          sub="Goal attainment"
          highlight={completionRate >= 70}
        />
        <KpiCard
          delay={0.15}
          label="In Progress"
          value={pendingTasks}
          icon={<Activity className="w-5 h-5 text-violet-400" />}
          accent="#8b5cf6"
          sub={`${overdueTasks} overdue`}
        />
        <KpiCard
          delay={0.2}
          label="Total Tasks"
          value={totalTasks}
          icon={<Layers className="w-5 h-5 text-amber-400" />}
          accent="#f59e0b"
          sub={`${selectedPeriod === 'week' ? 'This week' : selectedPeriod === 'month' ? 'This month' : 'Last 90 days'}`}
        />
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Charts card — takes 2/3 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="xl:col-span-2 bento-card overflow-hidden group hover:border-white/[0.08] transition-all duration-700"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Productivity Trend</h2>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mt-0.5">Tasks over time</p>
              </div>
            </div>
          </div>

          {stats ? (
            <StatsCharts
              data={stats}
              period={selectedPeriod}
              categories={categories || []}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-white/20 text-sm">No data available</div>
          )}
        </motion.div>

        {/* Sidebar cards — takes 1/3 */}
        <div className="flex flex-col gap-6">
          
          {/* Streak / Insight Block */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bento-card bg-gradient-to-br from-primary/10 via-transparent to-transparent border-primary/10 hover:border-primary/20 transition-all duration-700"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Insights</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Performance score</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Score ring */}
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                    <circle
                      cx="50" cy="50" r="38"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - completionRate / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: 'drop-shadow(0 0 6px #3b82f6)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white leading-none">{completionRate}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/25">
                    {completionRate >= 80 ? '🔥 Excellent' : completionRate >= 60 ? '✨ Good' : completionRate >= 40 ? '📈 Growing' : '🎯 Just started'}
                  </p>
                  <p className="text-white/50 text-xs font-medium leading-relaxed">
                    {completionRate >= 80
                      ? 'Outstanding performance this period.'
                      : completionRate >= 60
                      ? 'Solid progress — keep it going!'
                      : completionRate >= 40
                      ? 'Building momentum nicely.'
                      : 'Every task counts — you got this.'}
                  </p>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.05]">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Avg / Day</p>
                  <p className="text-2xl font-black text-white">{avgDaily}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Overdue</p>
                  <p className="text-2xl font-black text-white" style={{ color: overdueTasks > 0 ? '#f43f5e' : undefined }}>
                    {overdueTasks}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Summary List */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bento-card flex-1 hover:border-white/[0.08] transition-all duration-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Summary</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Period', value: selectedPeriod === 'week' ? '7 days' : selectedPeriod === 'month' ? '30 days' : '90 days' },
                { label: 'Created', value: totalTasks },
                { label: 'Finished', value: completedTasks },
                { label: 'Remaining', value: pendingTasks },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/25">{item.label}</span>
                  <span className="text-sm font-black text-white">{item.value}</span>
                </div>
              ))}

              {/* Progress bar */}
              <div className="pt-4 border-t border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Completion</span>
                  <span className="text-[9px] font-black text-white/40">{completionRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 12px rgba(59,130,246,0.5)' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-component: KPI Card ---
function KpiCard({
  label, value, icon, accent, sub, delay = 0, highlight = false
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
  delay?: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={cn(
        'bento-card group relative overflow-hidden p-4 md:p-6 hover:scale-[1.01] hover:border-white/[0.08] transition-all duration-500',
        highlight && 'border-primary/20 hover:border-primary/30'
      )}
      style={highlight ? { boxShadow: `0 0 30px ${accent}15` } : undefined}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.06] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-700"
        style={{ background: `radial-gradient(circle at 100% 0%, ${accent}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110"
          style={{ backgroundColor: `${accent}15`, borderColor: `${accent}25` }}
        >
          {icon}
        </div>
        <ArrowUpRight className="w-4 h-4 text-foreground/5 group-hover:text-foreground/20 transition-colors" />
      </div>

      <div className="space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground truncate">{label}</p>
        <p className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none whitespace-nowrap">{value}</p>
        {sub && <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 pt-1 truncate">{sub}</p>}
      </div>
    </motion.div>
  );
}
