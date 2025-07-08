export interface Task {
  id: number;
  userId: string;
  categoryId?: number;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  // Reminder notification fields
  reminderEnabled: boolean;
  reminderType: 'manual' | 'morning' | 'default';
  reminderTime?: string; // Format: "HH:MM" for manual reminders
  lastNotified?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Category fields added by API
  category_name?: string;
  category_color?: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  period: string;
  chartData: Array<{
    date: string;
    completed: number;
    total: number;
    pending: number;
  }>;
  // Legacy properties for backward compatibility
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
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
  categoryId?: number;
  dueDate?: Date | string;
  reminderEnabled?: boolean;
  reminderType?: 'manual' | 'morning' | 'default';
  reminderTime?: string;
}
