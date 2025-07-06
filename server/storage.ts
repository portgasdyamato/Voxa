import {
  users,
  tasks,
  categories,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type UpdateTask,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTasksByDate(userId: string, date: Date): Promise<Task[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(userId: string, taskId: number, updates: UpdateTask): Promise<Task>;
  deleteTask(userId: string, taskId: number): Promise<void>;
  getTaskStats(userId: string, period?: string): Promise<{
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
  }>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, category: InsertCategory): Promise<Category>;
  updateCategory(userId: string, categoryId: number, updates: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(userId: string, categoryId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByDate(userId: string, date: Date): Promise<Task[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Date range query:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      inputDate: date.toISOString()
    });

    const result = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.dueDate, startOfDay),
          lte(tasks.dueDate, endOfDay)
        )
      )
      .orderBy(asc(tasks.completed), desc(tasks.priority));

    console.log("Tasks found in date range:", result.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })));
    
    return result;
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        userId,
      })
      .returning();
    return newTask;
  }

  async updateTask(userId: string, taskId: number, updates: UpdateTask): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    if (!updatedTask) {
      throw new Error(`Task with id ${taskId} not found or does not belong to user ${userId}`);
    }
    
    return updatedTask;
  }

  async deleteTask(userId: string, taskId: number): Promise<void> {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  }

  async getTaskStats(userId: string, period: string = 'week'): Promise<{
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
  }> {
    // Get all user tasks for comprehensive analysis
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    const total = userTasks.length;
    const completed = userTasks.filter(task => task.completed).length;
    const pending = total - completed;
    const highPriority = userTasks.filter(task => task.priority === "high").length;
    const mediumPriority = userTasks.filter(task => task.priority === "medium").length;
    const lowPriority = userTasks.filter(task => task.priority === "low").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate streak
    const { currentStreak, longestStreak } = this.calculateStreaks(userTasks);

    // Calculate period data (based on selected period)
    const weeklyData = this.getPeriodCompletionData(userTasks, period);

    // Today's completed tasks
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const completedToday = userTasks.filter(task => 
      task.completed && task.updatedAt && task.updatedAt >= startOfToday && task.updatedAt <= endOfToday
    ).length;

    // This week's completed tasks
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const completedThisWeek = userTasks.filter(task => 
      task.completed && task.updatedAt && task.updatedAt >= startOfWeek
    ).length;

    return {
      total,
      completed,
      pending,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
      currentStreak,
      longestStreak,
      weeklyData,
      completedToday,
      completedThisWeek,
    };
  }

  private calculateStreaks(tasks: Task[]): { currentStreak: number; longestStreak: number } {
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Group tasks by date
    const tasksByDate = new Map<string, number>();
    
    completedTasks.forEach(task => {
      if (task.updatedAt) {
        const dateKey = task.updatedAt.toISOString().split('T')[0];
        tasksByDate.set(dateKey, (tasksByDate.get(dateKey) || 0) + 1);
      }
    });

    const sortedDates = Array.from(tasksByDate.keys()).sort().reverse();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    
    // Calculate current streak
    for (let i = 0; i < sortedDates.length; i++) {
      const dateKey = checkDate.toISOString().split('T')[0];
      
      if (tasksByDate.has(dateKey)) {
        currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) {
          // If no tasks today, current streak is 0
          currentStreak = 0;
        }
        tempStreak = 0;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Calculate longest streak by going through all dates
    tempStreak = 0;
    let previousDate: Date | null = null;
    
    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      
      if (previousDate === null || this.isConsecutiveDay(previousDate, currentDate)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    }

    return { currentStreak, longestStreak };
  }

  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff <= 1;
  }

  private getWeeklyCompletionData(tasks: Task[]): Array<{ day: string; completed: number; total: number }> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map(day => ({ day, completed: 0, total: 0 }));
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Filter tasks from this week
    const thisWeekTasks = tasks.filter(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfWeek;
      }
      return false;
    });

    thisWeekTasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const dayIndex = taskDate.getDay();
        
        weeklyData[dayIndex].total++;
        if (task.completed) {
          weeklyData[dayIndex].completed++;
        }
      }
    });

    return weeklyData;
  }

  private getDateRangeForPeriod(period: string): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (period) {
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'week':
      default:
        start.setDate(now.getDate() - 7);
        break;
    }

    return { start, end };
  }

  private getPeriodCompletionData(tasks: Task[], period: string): Array<{ day: string; completed: number; total: number }> {
    if (period === 'week') {
      return this.getWeeklyCompletionData(tasks);
    } else if (period === 'month') {
      return this.getMonthlyCompletionData(tasks);
    } else if (period === 'quarter') {
      return this.getQuarterlyCompletionData(tasks);
    }
    return this.getWeeklyCompletionData(tasks);
  }

  private getMonthlyCompletionData(tasks: Task[]): Array<{ day: string; completed: number; total: number }> {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthlyData: Array<{ day: string; completed: number; total: number }> = [];

    // Create data for each day in the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      monthlyData.push({ day: dayStr, completed: 0, total: 0 });
    }

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Filter tasks from this month
    const thisMonthTasks = tasks.filter(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfMonth && taskDate <= endOfMonth;
      }
      return false;
    });

    thisMonthTasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const dayIndex = taskDate.getDate() - 1;
        
        if (dayIndex >= 0 && dayIndex < monthlyData.length) {
          monthlyData[dayIndex].total++;
          if (task.completed) {
            monthlyData[dayIndex].completed++;
          }
        }
      }
    });

    return monthlyData;
  }

  private getQuarterlyCompletionData(tasks: Task[]): Array<{ day: string; completed: number; total: number }> {
    const today = new Date();
    const quarterlyData: Array<{ day: string; completed: number; total: number }> = [];

    // Create data for each week in the last 3 months (12 weeks)
    for (let i = 12; i >= 1; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      const weekLabel = `W${13 - i}`;
      quarterlyData.push({ day: weekLabel, completed: 0, total: 0 });
    }

    const startOfQuarter = new Date(today);
    startOfQuarter.setMonth(today.getMonth() - 3);

    // Filter tasks from last 3 months
    const quarterTasks = tasks.filter(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfQuarter;
      }
      return false;
    });

    quarterTasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const weeksDiff = Math.floor((today.getTime() - taskDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const weekIndex = 11 - Math.min(weeksDiff, 11);
        
        if (weekIndex >= 0 && weekIndex < quarterlyData.length) {
          quarterlyData[weekIndex].total++;
          if (task.completed) {
            quarterlyData[weekIndex].completed++;
          }
        }
      }
    });

    return quarterlyData;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));
  }

  async createCategory(userId: string, category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({
        ...category,
        userId,
      })
      .returning();
    return newCategory;
  }

  async updateCategory(userId: string, categoryId: number, updates: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();
    if (!updatedCategory) {
      throw new Error("Category not found");
    }
    return updatedCategory;
  }

  async deleteCategory(userId: string, categoryId: number): Promise<void> {
    // First, set tasks' categoryId to null for tasks in this category
    await db
      .update(tasks)
      .set({ categoryId: null })
      .where(and(eq(tasks.categoryId, categoryId), eq(tasks.userId, userId)));
    
    // Then delete the category
    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
