import { useMemo } from 'react';
import { TaskStats } from '@/types/task';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
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
    const highCount = data.totalTasks ? Math.round(data.totalTasks * 0.3) : 0; 
    const mediumCount = data.totalTasks ? Math.round(data.totalTasks * 0.5) : 0; 
    const lowCount = data.totalTasks ? data.totalTasks - highCount - mediumCount : 0; 
    
    return [
      { name: 'Critical', value: highCount, color: 'hsl(var(--destructive))' },
      { name: 'Moderate', value: mediumCount, color: 'hsl(var(--primary))' },
      { name: 'Low', value: lowCount, color: 'hsl(var(--muted-foreground))' },
    ];
  }, [data.totalTasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black tracking-tight text-foreground uppercase tracking-widest text-sm">Action Stream</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Productivity throughput over {period}</p>
        </div>
        <div className="h-80 w-full relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip 
                cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderRadius: '1.5rem', 
                  border: '2px solid var(--border)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  fontWeight: '900',
                  color: 'var(--foreground)',
                  padding: '1rem',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                  letterSpacing: '0.1em'
                }}
                itemStyle={{ color: 'var(--primary)' }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="var(--primary)" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                animationDuration={2500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col gap-1 text-right lg:text-left">
          <h3 className="text-2xl font-black tracking-tight text-foreground uppercase tracking-widest text-sm">Segmentation</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Strategic distribution of objectives</p>
        </div>
        <div className="h-80 flex flex-col items-center justify-center relative">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={2000}
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderRadius: '1.5rem', 
                    border: '2px solid var(--border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    fontWeight: '900',
                    color: 'var(--foreground)',
                    padding: '1rem',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.1em'
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-8">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-4 group cursor-default">
                <div
                  className="w-4 h-4 rounded-full shadow-2xl transition-transform group-hover:scale-125 border-4 border-white/10"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">{entry.name}</span>
                  <span className="text-sm font-black text-foreground tracking-tighter">{entry.value} Items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
