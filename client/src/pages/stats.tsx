import { useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      window.location.href = '/api/login';
    }
  }, [statsError]);

  if (statsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-[2rem] bg-white/[0.05] border border-white/10"
        />
        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/10 italic">Synchronizing Analytics...</p>
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

  const periods = [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: '3months', label: '90 Days' },
  ];

  // Ref-based sliding pill — measures the active button's position
  const periodRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const periodContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
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
  }, [selectedPeriod]);

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 pt-12 md:pt-20 pb-44">
      
      {/* Header - Massive Typo Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-12 mb-16 md:mb-24"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Workflow className="w-5 h-5 text-white/[0.1]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Performance Protocol</span>
          </div>
          <h1 className="text-[3rem] md:text-[5rem] xl:text-[6.5rem] font-black tracking-tight text-white leading-[0.9] select-none">Performance</h1>
          <p className="text-white/30 font-serif italic text-sm md:text-xl tracking-tight pl-2 mt-4 max-w-xl">
            Absolute throughput and operational efficiency metrics.
          </p>
        </div>

        {/* Period Toggle - Sliding Pill */}
        <div
          ref={periodContainerRef}
          className="relative flex items-center p-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] backdrop-blur-[40px] self-start lg:self-auto shadow-lg"
        >
          {/* Single pill that slides — never unmounts */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-full bg-white/[0.1] border border-white/[0.2] shadow-inner pointer-events-none"
            animate={{ left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.opacity }}
            transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
          />
          {periods.map((p, i) => (
            <button
              key={p.key}
              ref={el => { periodRefs.current[i] = el; }}
              onClick={() => setSelectedPeriod(p.key)}
              className={cn(
                'relative h-10 px-6 rounded-full text-sm font-medium transition-colors duration-150 z-10',
                selectedPeriod === p.key ? 'text-white' : 'text-white/40 hover:text-white/70'
              )}
            >
              {p.label}
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
          className="xl:col-span-2 frosted-layer p-10 md:p-14 group"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
                <TrendingUp className="w-6 h-6 text-blue-400 shadow-[0_0_15px_#3b82f6]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">System Throughput</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/10 font-black">Neural trend analysis</p>
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
            className="frosted-layer p-10 md:p-12 border-blue-500/[0.05]"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="w-14 h-14 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                <Trophy className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">Efficiency Score</h3>
                <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.4em]">Protocol accuracy</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-white/[0.04]" strokeWidth="4"/>
                    <motion.circle
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - completionRate / 100) }}
                      transition={{ duration: 2, ease: "circOut" }}
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
                    <span className="text-5xl font-black text-white leading-none tracking-tight">{completionRate}%</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400 italic">
                    {completionRate >= 80 ? 'Exceptional' : completionRate >= 60 ? 'Optimal' : completionRate >= 40 ? 'Synchronizing' : 'Initiating'}
                  </p>
                  <p className="text-white/20 text-[12px] font-serif italic italic leading-relaxed px-4">
                    {completionRate >= 80
                      ? 'The protocol is operating at peak intelligence levels.'
                      : completionRate >= 60
                      ? 'Solid throughput — keep the neural flow active.'
                      : completionRate >= 40
                      ? 'Synchronization is building momentum.'
                      : 'Systems ready for first high-fidelity operation.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Summary Bento Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="frosted-layer p-10 md:p-12 flex-1"
          >
            <div className="flex items-center gap-4 mb-10">
              <Sparkles className="w-4 h-4 text-white/10" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Metadata Archive</h3>
            </div>
            <div className="space-y-8">
              {[
                { label: 'Active Period', value: selectedPeriod === 'week' ? '07 DAYS' : selectedPeriod === 'month' ? '30 DAYS' : '90 DAYS' },
                { label: 'Nodes Created', value: totalTasks },
                { label: 'Nodes Unified', value: completedTasks },
                { label: 'Remaining Input', value: pendingTasks },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10">{item.label}</span>
                  <span className="text-[15px] font-black text-white italic tracking-tight">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-component: KPI Card ---
function KpiCard({
  label, value, icon, sub, delay = 0, highlight = false
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  delay?: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: "circOut" }}
      className={cn(
        'frosted-layer group relative overflow-hidden p-8 md:p-10 hover:scale-[1.02] hover:bg-white/[0.12]',
        highlight && 'border-white/40'
      )}
    >
      {/* Subtle Light Reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
      
      <div className="flex items-start justify-between mb-8">
        <div className="w-14 h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:bg-white/5">
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-white/5 group-hover:text-white/20 transition-all duration-700" />
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 truncate">{label}</p>
        <p className="text-4xl md:text-5xl font-black tracking-[-0.04em] text-white leading-none whitespace-nowrap">{value}</p>
        {sub && <p className="text-[10px] font-black uppercase tracking-widest text-white/10 pt-2 truncate italic">{sub}</p>}
      </div>
    </motion.div>
  );
}
