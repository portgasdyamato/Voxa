import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, Infinity, Sun, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type DeadlineFilter = 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-deadline';

interface DeadlineFilterProps {
  value: DeadlineFilter;
  onChange: (filter: DeadlineFilter) => void;
  counts?: {
    total: number;
    today: number;
    tomorrow: number;
    thisWeek: number;
    overdue: number;
    noDeadline: number;
  };
}

export function DeadlineFilter({ value, onChange, counts }: DeadlineFilterProps) {
  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Calendar, count: counts?.total },
    { value: 'overdue', label: 'Overdue', icon: AlertTriangle, count: counts?.overdue, color: 'text-rose-500' },
    { value: 'today', label: 'Due Today', icon: Sun, count: counts?.today, color: 'text-amber-500' },
    { value: 'tomorrow', label: 'Due Tomorrow', icon: Clock, count: counts?.tomorrow, color: 'text-blue-500' },
    { value: 'this-week', label: 'Next 7 Days', icon: Calendar, count: counts?.thisWeek, color: 'text-emerald-500' },
    { value: 'no-deadline', label: 'Sometime', icon: Infinity, count: counts?.noDeadline, color: 'text-muted-foreground' },
  ];

  return (
    <div className="flex flex-col gap-1">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value as DeadlineFilter)}
          className={cn(
            "group relative flex items-center justify-between w-full p-3 rounded-2xl transition-all duration-300 font-bold text-sm text-left",
            value === option.value 
              ? "bg-primary/10 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
               "w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
               value === option.value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              <option.icon className="w-4 h-4" />
            </div>
            <span>{option.label}</span>
          </div>
          
          {option.count !== undefined && (
            <Badge 
              variant="secondary" 
              className={cn(
                "rounded-lg px-2 py-0.5 text-[10px] font-black transition-all",
                value === option.value ? "bg-primary/20 text-primary" : "bg-muted group-hover:bg-muted-foreground/10"
              )}
            >
              {option.count}
            </Badge>
          )}

          {value === option.value && (
            <motion.div 
               layoutId="deadlineActive"
               className="absolute inset-0 border-2 border-primary/20 rounded-2xl pointer-events-none"
            />
          )}
        </button>
      ))}
    </div>
  );
}

export function getDeadlineFilteredTasks(tasks: any[], filter: DeadlineFilter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  switch (filter) {
    case 'all':
      return tasks;
    case 'overdue':
      return tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < today && !task.completed
      );
    case 'today':
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
    case 'tomorrow':
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
      });
    case 'this-week':
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < endOfWeek;
      });
    case 'no-deadline':
      return tasks.filter(task => !task.dueDate);
    default:
      return tasks;
  }
}

export function getDeadlineCounts(tasks: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    total: tasks.length,
    overdue: tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < today && !task.completed
    ).length,
    today: tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    }).length,
    tomorrow: tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
    }).length,
    thisWeek: tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < endOfWeek;
    }).length,
    noDeadline: tasks.filter(task => !task.dueDate).length,
  };
}
