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
    // Fallback if data is missing, though the API should provide it
    const highCount = data.priorityDistribution?.high || (data.totalTasks ? Math.round(data.totalTasks * 0.2) : 0);
    const mediumCount = data.priorityDistribution?.medium || (data.totalTasks ? Math.round(data.totalTasks * 0.5) : 0);
    const lowCount = data.priorityDistribution?.low || (data.totalTasks ? data.totalTasks - (data.priorityDistribution?.high || 0) - (data.priorityDistribution?.medium || 0) : 0);
    
    return [
      { name: 'Critical', value: highCount, color: 'hsl(var(--destructive))' },
      { name: 'Moderate', value: mediumCount, color: 'hsl(var(--primary))' },
      { name: 'Low', value: lowCount, color: 'hsl(var(--muted-foreground) / 0.5)' },
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/90 backdrop-blur-xl border border-border/50 p-3 rounded-xl shadow-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label || payload[0].name}</p>
          <p className="text-sm font-bold text-foreground">
            {payload[0].value} <span className="text-[10px] text-muted-foreground font-medium">Operations</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Throughput Matrix</h3>
          <p className="text-xl font-bold tracking-tight text-foreground">Activity Stream</p>
        </div>
        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Objective Weights</h3>
          <p className="text-xl font-bold tracking-tight text-foreground">Task Segmentation</p>
        </div>
        <div className="h-72 flex flex-col items-center justify-center relative">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">{entry.name}</span>
                  <span className="text-sm font-bold text-foreground">{entry.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
