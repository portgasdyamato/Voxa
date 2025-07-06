import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

export type DeadlineFilter = 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-deadline';

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
    { value: 'overdue', label: 'Overdue', icon: AlertTriangle, count: counts?.overdue, color: 'text-red-600' },
    { value: 'today', label: 'Due Today', icon: Clock, count: counts?.today, color: 'text-orange-600' },
    { value: 'tomorrow', label: 'Due Tomorrow', icon: Clock, count: counts?.tomorrow, color: 'text-yellow-600' },
    { value: 'this-week', label: 'This Week', icon: Calendar, count: counts?.thisWeek },
    { value: 'no-deadline', label: 'No Deadline', icon: Calendar, count: counts?.noDeadline },
  ];

  const selectedOption = filterOptions.find(opt => opt.value === value);

  return (
    <div className="flex items-center space-x-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center space-x-2">
              {selectedOption?.icon && <selectedOption.icon className="w-4 h-4" />}
              <span>{selectedOption?.label}</span>
              {selectedOption?.count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {selectedOption.count}
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <option.icon className={`w-4 h-4 ${option.color || 'text-gray-500'}`} />
                  <span>{option.label}</span>
                </div>
                {option.count !== undefined && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {option.count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getDeadlineFilteredTasks(tasks: any[], filter: DeadlineFilter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  switch (filter) {
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
