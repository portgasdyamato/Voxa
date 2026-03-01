import { useMemo } from 'react';
import { TaskStats } from '@/types/task';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsChartsProps {
  data: TaskStats;
  period: string;
  categories: any[];
}

export function StatsCharts({ data, period, categories }: StatsChartsProps) {
  const completionData = useMemo(() => {
    return data.chartData?.map((item: any) => ({
      date: item.date,
      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: item.completed,
      total: item.total,
      pending: item.pending
    })) || [];
  }, [data.chartData]);

  const priorityData = useMemo(() => {
    const highCount = data.highPriority || 0;
    const mediumCount = data.mediumPriority || 0;
    const lowCount = data.lowPriority || 0;
    
    return [
      { name: 'High', value: highCount, color: '#f43f5e' },
      { name: 'Medium', value: mediumCount, color: '#3b82f6' },
      { name: 'Low', value: lowCount, color: '#e2e8f0' },
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-xl border border-border p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pb-1.5 border-b border-border/50">
             {label || payload[0].name}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground tracking-tight">
              {payload[0].value}
            </p>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tasks</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
      <div className="space-y-8 relative">
        <div className="flex flex-col gap-1 px-1">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">Activity Analysis</p>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Daily Activity</h3>
        </div>
        <div className="h-[320px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground) / 0.6)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground) / 0.6)', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'rgba(59, 130, 246, 0.1)', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col gap-1 px-1">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none">Priority Split</p>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Priority Breakdown</h3>
        </div>
        <div className="h-[320px] flex flex-col items-center justify-center relative">
          <div className="h-full w-full relative">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                   <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1 italic">Total Tasks</p>
                   <p className="text-4xl font-bold text-foreground tracking-tight">
                      {data.totalTasks || 0}
                   </p>
                </div>
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-all duration-300 cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3 group">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-all"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">{entry.name} Priority</span>
                  <span className="text-sm font-bold text-foreground tracking-tight mt-1">{entry.value} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
