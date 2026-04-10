import { useEffect, useState, useRef, useMemo } from 'react';
import { useTaskStats } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { isUnauthorizedError } from '@/lib/authUtils';
import { StatsCharts } from '@/components/StatsCharts';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, CheckCircle, ArrowUpRight,
  Sparkles, Target, Activity, Trophy, Flame,
  Calendar, Layers, BarChart3, Workflow
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Stats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { data: stats, isLoading: statsLoading, error: statsError } = useTaskStats(selectedPeriod);
  const { data: categories } = useCategories();

  // Ref-based sliding pill — measures the active button's position
  const periodRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const periodContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const periods = useMemo(() => [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: '3months', label: '90 Days' },
  ], []);

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      window.location.href = '/api/login';
    }
  }, [statsError]);

  useEffect(() => {
    if (statsLoading) return;
    const activeIndex = periods.findIndex(p => p.key === selectedPeriod);
    const button = periodRefs.current[activeIndex];
    const container = periodContainerRef.current;
    if (button && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setPillStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        opacity: 1,
      });
    }
  }, [selectedPeriod, statsLoading, periods]);

  if (statsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-[2rem] bg-white/[0.05] border border-white/10"
        />
        <p className="text-sm font-medium text-white/20">Analyzing Intelligence...</p>
      </div>
    );
  }

  const completionRate = stats?.completionRate || 0;
  const completedTasks = stats?.completedTasks || 0;
  const pendingTasks = stats?.pendingTasks || 0;
  const overdueTasks = stats?.overdueTasks || 0;
  const totalTasks = stats?.totalTasks || 0;

  const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
  const avgDaily = totalTasks > 0 ? (completedTasks / days).toFixed(1) : '0.0';

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 pt-12 md:pt-20 pb-44">
      
      {/* Header - Massive Typo Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-12 mb-16 md:mb-24"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <Workflow className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white/30">Performance Analytics</span>
          </div>
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-none">Intelligence</h1>
          <p className="text-white/40 text-lg font-light max-w-xl">
            Real-time operational efficiency and system throughput metrics.
          </p>
        </div>

        {/* Period Toggle - Sliding Pill */}
        <div
          ref={periodContainerRef}
          className="relative flex items-center p-2 rounded-full border border-white/[0.12] bg-white/[0.03] backdrop-blur-[40px] self-start lg:self-auto shadow-lg min-w-[320px] overflow-hidden"
        >
          {/* Single pill that slides — never unmounts */}
          <motion.div
            className="absolute top-2 bottom-2 rounded-full bg-white/[0.1] border border-white/[0.2] shadow-inner pointer-events-none"
            animate={{ left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.opacity }}
            transition={{ type: 'spring', stiffness: 450, damping: 40, mass: 0.8 }}
          />
          {periods.map((p, i) => (
            <button
              key={p.key}
              ref={el => { periodRefs.current[i] = el; }}
              onClick={() => setSelectedPeriod(p.key)}
              className={cn(
                'relative flex-1 h-10 px-6 rounded-full text-sm font-medium transition-colors duration-150 z-10',
                selectedPeriod === p.key ? 'text-white' : 'text-white/40 hover:text-white/70'
              )}
            >
              <div className="flex items-center justify-center w-full">
                {p.label}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Row - Bento Standards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24">
        <KpiCard
          delay={0.1}
          label="Completed"
          value={completedTasks}
          icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
          sub={`${avgDaily}/day avg throughput`}
        />
        <KpiCard
          delay={0.2}
          label="Success Rate"
          value={`${completionRate}%`}
          icon={<Target className="w-6 h-6 text-blue-400" />}
          sub="Goal attainment level"
          highlight={completionRate >= 70}
        />
        <KpiCard
          delay={0.3}
          label="In Progress"
          value={pendingTasks}
          icon={<Activity className="w-6 h-6 text-white/20" />}
          sub={`${overdueTasks} nodes waiting`}
        />
        <KpiCard
          delay={0.4}
          label="Total Systems"
          value={totalTasks}
          icon={<Layers className="w-6 h-6 text-white/20" />}
          sub={`Archive: ${selectedPeriod}`}
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
        
        {/* Charts card — takes 2/3 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="xl:col-span-2 rounded-[2.5rem] border border-white/[0.1] bg-white/[0.03] backdrop-blur-[40px] p-10 md:p-14 overflow-hidden relative group"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold text-white">System Throughput</h2>
                <p className="text-sm text-white/30">Analytics Insight</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {stats ? (
              <StatsCharts
                data={stats}
                period={selectedPeriod}
                categories={categories || []}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-white/5 italic font-serif text-2xl">Awaiting synchronization...</div>
            )}
          </div>
        </motion.div>

        {/* Intelligence Sidebar */}
        <div className="flex flex-col gap-8 md:gap-12">
          
          {/* Streak Block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="rounded-[2.5rem] border border-white/[0.1] bg-white/[0.03] backdrop-blur-[40px] p-10 overflow-hidden relative"
          >
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex items-center gap-5 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-semibold text-white">Efficiency</h3>
                <p className="text-sm text-white/30">System Accuracy</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-white/[0.05]" strokeWidth="4"/>
                  <motion.circle
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - completionRate / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    className="opacity-40"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white tracking-tight">{completionRate}%</span>
                </div>
              </div>
              
              <div className="space-y-2 text-center">
                <p className="text-sm font-semibold text-blue-400">
                  {completionRate >= 80 ? 'Peak Intelligence' : completionRate >= 60 ? 'Optimal Flow' : 'Synchronizing'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="rounded-[2.5rem] border border-white/[0.1] bg-white/[0.03] backdrop-blur-[40px] p-10 overflow-hidden relative"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-4 h-4 text-white/20" />
              <h3 className="text-sm font-medium text-white/30">Session Overview</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Active Period', value: selectedPeriod === 'week' ? '07 Days' : selectedPeriod === 'month' ? '30 Days' : '90 Days' },
                { label: 'Nodes Created', value: totalTasks },
                { label: 'Nodes Unified', value: completedTasks },
                { label: 'Average Growth', value: `${((completedTasks / (totalTasks || 1)) * 100).toFixed(0)}%` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                  <span className="text-sm text-white/30">{item.label}</span>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon, sub, delay = 0
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-[2.5rem] border border-white/[0.1] bg-white/[0.03] backdrop-blur-[40px] p-8 md:p-10 overflow-hidden group hover:bg-white/[0.06] transition-colors"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
      
      <div className="flex items-start justify-between mb-10">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-white/30">{label}</p>
        <p className="text-5xl font-bold tracking-tight text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-white/20 pt-2 font-light">{sub}</p>}
      </div>
    </motion.div>
  );
}
