import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Task, TaskStats, CreateTaskData } from '@/types/task';

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
}

export function useTodayTasks() {
  return useQuery<Task[]>({
    queryKey: ['/api/tasks', 'today'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?today=true');
      if (!response.ok) throw new Error('Failed to fetch today tasks');
      return response.json();
    },
  });
}

export function useTaskStats(period: string = 'week') {
  return useQuery<TaskStats>({
    queryKey: ['/api/stats', period],
    queryFn: async () => {
      const response = await fetch(`/api/stats?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const response = await apiRequest('POST', '/api/tasks', taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', 'today'] });
      // Invalidate all stats queries for all periods
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'month'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'quarter'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === '/api/stats' });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest('PATCH', `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', 'today'] });
      // Invalidate all stats queries for all periods
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'month'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'quarter'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === '/api/stats' });
      
      // Update the task in the cache immediately for better UX
      queryClient.setQueryData<Task[]>(['/api/tasks'], (oldTasks) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task => 
          task.id === variables.id ? { ...task, ...variables.updates } : task
        );
      });
      
      queryClient.setQueryData<Task[]>(['/api/tasks', 'today'], (oldTasks) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task => 
          task.id === variables.id ? { ...task, ...variables.updates } : task
        );
      });
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', 'today'] });
      // Invalidate all stats queries for all periods
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'month'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats', 'quarter'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === '/api/stats' });
    },
  });
}
