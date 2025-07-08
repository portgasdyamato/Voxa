import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc } from 'drizzle-orm';

// Simple schema inline for quick testing
import { pgTable, text, varchar, timestamp, serial, boolean, integer } from 'drizzle-orm/pg-core';

const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id"),
  title: text("title").notNull(),
  description: text("description"),
  priority: varchar("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: varchar("recurring_pattern", { enum: ["daily", "weekly", "monthly"] }),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  reminderType: varchar("reminder_type", { enum: ["manual", "morning", "default"] }).notNull().default("default"),
  reminderTime: varchar("reminder_time"),
  lastNotified: timestamp("last_notified"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#3B82F6"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { tasks, categories, users } });

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Simple public endpoint for testing
    if (req.url === '/api/public-tasks') {
      const mockUserId = 'user_1';
      
      // Ensure user exists
      try {
        await db.insert(users).values({
          id: mockUserId,
          email: 'demo@voxa.app',
          firstName: 'Demo',
          lastName: 'User'
        }).onConflictDoNothing();
      } catch (error) {
        console.log('User might already exist:', error.message);
      }

      if (req.method === 'GET') {
        const userTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.userId, mockUserId))
          .orderBy(desc(tasks.createdAt));
        
        res.status(200).json(userTasks);
        return;
      }

      if (req.method === 'POST') {
        const taskData = req.body;
        
        const newTask = await db.insert(tasks).values({
          userId: mockUserId,
          title: taskData.title,
          description: taskData.description || null,
          completed: taskData.completed || false,
          priority: taskData.priority || 'medium',
          categoryId: taskData.categoryId || null,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          isRecurring: taskData.isRecurring || false,
          recurringPattern: taskData.recurringPattern || null,
          reminderEnabled: taskData.reminderEnabled ?? true,
          reminderType: taskData.reminderType || 'default',
          reminderTime: taskData.reminderTime || null
        }).returning();
        
        res.status(201).json(newTask[0]);
        return;
      }
    }

    // Default response
    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Public API error:', error);
    res.status(500).json({ error: error.message });
  }
}
