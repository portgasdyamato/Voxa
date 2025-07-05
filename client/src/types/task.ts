export interface Task {
  id: number;
  userId: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  weeklyData: Array<{ day: string; completed: number; total: number }>;
  completedToday: number;
  completedThisWeek: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date | string;
}
