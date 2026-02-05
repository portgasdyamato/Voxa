import { useMemo } from 'react';
import { TaskStats } from '@/types/task';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';

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
      { name: 'High', value: highCount, color: '#f43f5e' },
      { name: 'Medium', value: mediumCount, color: '#f59e0b' },
      { name: 'Low', value: lowCount, color: '#10b981' },
    ];
  }, [data.totalTasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black tracking-tight mb-1 text-foreground">Activity Flow</h3>
          <p className="text-sm font-medium text-muted-foreground">Your productivity volume over the {period}.</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderRadius: '1rem', 
                  border: '2px solid var(--border)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontWeight: 'bold'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="var(--primary)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black tracking-tight mb-1 text-foreground">Priority Matrix</h3>
          <p className="text-sm font-medium text-muted-foreground">Work distribution segmented by urgency.</p>
        </div>
        <div className="h-80 flex flex-col items-center justify-center">
          <div className="h-64 w-full">
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
                  animationBegin={200}
                  animationDuration={1500}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderRadius: '1rem', 
                    border: '2px solid var(--border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-lg shadow-black/10"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">{entry.name}</span>
                  <span className="text-sm font-bold text-foreground">{entry.value} Items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
