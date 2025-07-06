import { useMemo } from 'react';
import { TaskStats } from '@/types/task';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatsChartsProps {
  stats: TaskStats;
}

export function StatsCharts({ stats }: StatsChartsProps) {
  const completionData = useMemo(() => {
    return stats.weeklyData || [];
  }, [stats.weeklyData]);

  const priorityData = useMemo(() => [
    { name: 'High', value: stats.highPriority, color: '#EC4899' },
    { name: 'Medium', value: stats.mediumPriority, color: '#A855F7' },
    { name: 'Low', value: stats.lowPriority, color: '#0EA5E9' },
  ], [stats]);

  const COLORS = ['#EC4899', '#A855F7', '#0EA5E9'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-effect rounded-xl shadow-sm p-6 border border-blue-100/50 dark:border-purple-200/30">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Task Completion Rate</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-effect rounded-xl shadow-sm p-6 border border-blue-100/50 dark:border-purple-200/30">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Priority Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-4">
          {priorityData.map((entry, index) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
