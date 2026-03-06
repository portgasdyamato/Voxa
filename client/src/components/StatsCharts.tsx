import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { TaskStats } from '@/types/task';
import type { Category } from '@shared/schema';
import { format, parseISO } from 'date-fns';

interface StatsChartsProps {
  data: TaskStats;
  period: string;
  categories: Category[];
}

// Format date for X-axis display
function formatDate(dateStr: string, period: string) {
  try {
    const d = parseISO(dateStr);
    if (period === 'week') return format(d, 'EEE');
    if (period === 'month') return format(d, 'MMM d');
    return format(d, 'MMM d');
  } catch {
    return dateStr;
  }
}

// Custom Tooltip for Line/Area charts
const AreaTooltip = ({ active, payload, label, period }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-3xl border border-border p-4 rounded-2xl shadow-2xl min-w-[140px]">
        <p className="text-[9px] uppercase font-black tracking-[0.3em] text-muted-foreground mb-3">
          {label ? formatDate(label, period) : ''}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
              />
              <span className="text-xs font-black text-foreground">{entry.value}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                {entry.name === 'completed' ? 'done' : entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar chart
const BarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-3xl border border-border p-3 rounded-xl shadow-2xl">
        <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1">{payload[0].payload.name}</p>
        <p className="text-xl font-black text-foreground">{payload[0].value} <span className="text-[9px] text-muted-foreground">tasks</span></p>
      </div>
    );
  }
  return null;
};

// Custom Donut Label
const DonutLabel = ({ cx, cy, total }: { cx: number; cy: number; total: number }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 28, fontWeight: 900 }}>
      {total}
    </text>
    <text x={cx} y={cy + 18} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 900, opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
      TOTAL
    </text>
  </>
);

export function StatsCharts({ data, period, categories }: StatsChartsProps) {
  const categoryData = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories
      .map(cat => ({
        name: cat.name,
        value: (data.categoryDistribution?.[cat.id]) || 0,
        color: cat.color || '#3b82f6'
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data, categories]);

  // Condense chart data for readability when period is long
  const chartData = useMemo(() => {
    if (!data.chartData) return [];
    if (period === '3months') {
      // Group by week for 3-month view
      const weeks: Record<string, { date: string; completed: number; total: number; pending: number }> = {};
      data.chartData.forEach(d => {
        try {
          const date = parseISO(d.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const key = format(weekStart, 'MMM d');
          if (!weeks[key]) weeks[key] = { date: key, completed: 0, total: 0, pending: 0 };
          weeks[key].completed += d.completed;
          weeks[key].total += d.total;
          weeks[key].pending += d.pending;
        } catch {}
      });
      return Object.values(weeks);
    }
    return data.chartData;
  }, [data.chartData, period]);

  const hasData = data.totalTasks > 0;
  const hasCategoryData = categoryData.length > 0;

  return (
    <div className="space-y-0 w-full">
      {/* Primary Trend Chart — Stacked Areas */}
      <div className="h-[280px] md:h-[360px] w-full relative">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30">
            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-black text-white/40">No activity yet — start adding tasks</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="75%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" strokeOpacity={0.2} vertical={false}/>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }}
                tickFormatter={(v) => formatDate(v, period)}
                interval={period === 'week' ? 0 : 'preserveStartEnd'}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 900 }}
                allowDecimals={false}
              />
              <Tooltip content={<AreaTooltip period={period}/>}/>
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                fill="url(#gradTotal)"
                dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#gradCompleted)"
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: 'rgba(59,130,246,0.4)', strokeWidth: 6 }}
                filter="url(#glow)"
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {/* Legend */}
        {hasData && (
          <div className="md:absolute md:top-0 md:right-0 flex flex-wrap items-center gap-4 md:gap-6 pt-6 md:pt-0">
            <div className="flex items-center gap-2">
              <div className="w-5 md:w-6 h-[2px] bg-[#8b5cf6]/60 rounded-full"/>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 md:w-6 h-[3px] bg-[#3b82f6] rounded-full" style={{ boxShadow: '0 0 8px #3b82f6' }}/>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Done</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom section — Category Bar + Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 pt-8 border-t border-border mt-8">
        {/* Bar Chart — Category Breakdown */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">By Category</h4>
          <div className="h-[200px]">
            {!hasCategoryData ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/30">No categories yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.03)" vertical={false}/>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: 900 }}
                  />
                  <YAxis hide allowDecimals={false}/>
                  <Tooltip cursor={{fill: 'transparent'}} content={<BarTooltip/>}/>
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        fillOpacity={0.75}
                        style={{ filter: `drop-shadow(0 4px 12px ${entry.color}60)` }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart with Legend */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Task Split</h4>
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-6">
            <div className="h-[180px] w-[180px] md:h-[200px] md:w-[200px] flex-shrink-0 relative">
              {!hasData ? (
                <div className="h-full flex items-center justify-center opacity-20">
                  <div className="w-28 h-28 rounded-full border-4 border-dashed border-border"/>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High', value: data.highPriority, color: '#f43f5e' },
                          { name: 'Medium', value: data.mediumPriority, color: '#f59e0b' },
                          { name: 'Low', value: data.lowPriority, color: '#3b82f6' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1800}
                        animationEasing="ease-out"
                      >
                        {[
                          { name: 'High', value: data.highPriority, color: '#f43f5e' },
                          { name: 'Medium', value: data.mediumPriority, color: '#f59e0b' },
                          { name: 'Low', value: data.lowPriority, color: '#3b82f6' },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }}/>
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-foreground leading-none">{data.totalTasks}</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">tasks</span>
                  </div>
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-4 flex-1">
              {[
                { label: 'High', value: data.highPriority, color: '#f43f5e' },
                { label: 'Medium', value: data.mediumPriority, color: '#f59e0b' },
                { label: 'Low', value: data.lowPriority, color: '#3b82f6' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate">{item.label}</span>
                      <span className="text-sm font-black text-white flex-shrink-0">{item.value}</span>
                    </div>
                    <div className="mt-1.5 h-[2px] w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 delay-300"
                        style={{
                          width: data.totalTasks > 0 ? `${(item.value / data.totalTasks) * 100}%` : '0%',
                          backgroundColor: item.color,
                          boxShadow: `0 0 8px ${item.color}60`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
