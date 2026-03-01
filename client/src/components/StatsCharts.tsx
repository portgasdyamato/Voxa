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
      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
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
      { name: 'CRITICAL', value: highCount, color: '#f43f5e' },
      { name: 'STANDARD', value: mediumCount, color: '#3b82f6' },
      { name: 'AUXILIARY', value: lowCount, color: 'rgba(255, 255, 255, 0.1)' },
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2 italic border-b border-white/5 pb-2">
             {label || payload[0].name} TELEMETRY
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-white italic tracking-tighter">
              {payload[0].value}
            </p>
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">UNITS</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div className="space-y-10 relative">
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] italic">Activity Synthesis</h3>
          <p className="text-2xl font-black tracking-tighter text-white italic uppercase">Completion Stream</p>
        </div>
        <div className="h-[400px] w-full relative">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/5 to-transparent rounded-[2rem] pointer-events-none" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em' }} 
                dy={20}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900 }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#3b82f6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                animationDuration={2500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] italic">Priority Distribution</h3>
          <p className="text-2xl font-black tracking-tighter text-white italic uppercase">Intelligence Matrix</p>
        </div>
        <div className="h-[400px] flex flex-col items-center justify-center relative">
          <div className="h-full w-full relative">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1 italic">Total Nodes</p>
                   <p className="text-5xl font-black text-white italic tracking-tighter">
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
                  innerRadius={110}
                  outerRadius={150}
                  paddingAngle={15}
                  dataKey="value"
                  stroke="none"
                  animationDuration={2000}
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:scale-105 transition-all duration-500 cursor-pointer outline-none"
                      style={{ filter: `drop-shadow(0 0 10px ${entry.color}40)` }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-10">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-4 group">
                <div
                  className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-all group-hover:scale-125"
                  style={{ backgroundColor: entry.color, color: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic group-hover:text-white/60 transition-colors leading-none">{entry.name}</span>
                  <span className="text-xl font-black text-white italic tracking-tighter mt-1">{entry.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
