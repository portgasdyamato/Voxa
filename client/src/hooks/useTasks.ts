import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Task, TaskStats, CreateTaskData } from '@/types/task';

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tasks');
      return response.json();
    },
  });
}

export function useTodayTasks() {
  return useQuery<Task[]>({
    queryKey: ['/api/tasks', 'today'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tasks?today=true');
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
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}
