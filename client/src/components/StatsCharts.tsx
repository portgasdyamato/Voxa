import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';
import { TaskStats } from '@/hooks/useTasks';
import { Category } from '@/types/task';

interface StatsChartsProps {
  data: TaskStats;
  period: string;
  categories: Category[];
}

export function StatsCharts({ data, period, categories }: StatsChartsProps) {
  const categoryData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: data.categoryDistribution[cat.id] || 0,
      color: cat.color
    })).filter(d => d.value > 0);
  }, [data, categories]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/[0.1] p-5 rounded-2xl shadow-3xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-white/40 italic mb-2">{label}</p>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             <p className="text-xl font-black text-white">{payload[0].value} <span className="text-[10px] text-white/30 uppercase">Finished</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-12">
      {/* Primary Trend Chart */}
      <div className="h-[400px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 900 }}
              dy={15}
            />
            <YAxis hide={true} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="#3b82f6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/[0.03]">
         <section className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 italic px-4">Workspace Alignment</h4>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#ffffff20', fontSize: 9, fontWeight: 900 }}
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }}
                        itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                     />
                     <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={24}>
                        {categoryData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} opacity={0.6} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </section>

         <section className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 italic px-4">Distribution Balance</h4>
            <div className="h-[250px] w-full relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Tooltip />
                     <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1500}
                     >
                        {categoryData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/10">Ratio</span>
                  <span className="text-2xl font-black text-white">{data.completedTasks}</span>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
}
