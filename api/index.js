// api/index.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, and, desc, asc, inArray, lt } from "drizzle-orm";
import { Resend } from "resend";
import * as ics from "ics";
import Groq from "groq-sdk";
import webpush from "web-push";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@voxa.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

let cachedGroqModel = null;
let lastModelCheckTime = 0;

function getGroqClient() {
  const rawKey = process.env.GROQ_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
  return new Groq({ apiKey });
}

async function getBestGroqModel(groq) {
  const now = Date.now();
  if (cachedGroqModel && now - lastModelCheckTime < 10 * 60 * 1000) {
    return cachedGroqModel;
  }

  if (process.env.GROQ_MODEL) {
    cachedGroqModel = process.env.GROQ_MODEL.trim();
    return cachedGroqModel;
  }

  try {
    const listRes = await groq.models.list();
    const rawList = listRes.data || [];
    
    // Explicit decommissioned models to permanently reject
    const decommissioned = new Set([
      'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 
      'gemma-7b-it', 'gemma2-9b-it', 'groq/compound', 'groq/compound-mini'
    ]);

    const activeModels = rawList
      .filter(m => m.active !== false)
      .map(m => m.id)
      .filter(id => {
        if (decommissioned.has(id)) return false;
        const lower = id.toLowerCase();
        if (lower.includes('whisper')) return false; // audio only
        if (lower.includes('guard')) return false;   // safety moderation only
        if (lower.includes('gemma')) return false;   // older decommissioned gemma
        if (lower.includes('vision') && !lower.includes('chat')) return false;
        return true;
      });

    console.log("Available active text models for this API key:", JSON.stringify(activeModels));

    const priorityChecks = [
      (id) => id.includes('llama-3.3-70b'),
      (id) => id.includes('gpt-oss-120b'),
      (id) => id.includes('gpt-oss-20b'),
      (id) => id.includes('llama-3.1-70b'),
      (id) => id.includes('llama-3.1-8b'),
      (id) => id.includes('llama-3.2') && !id.includes('vision'),
      (id) => id.includes('qwen'),
      (id) => id.includes('deepseek'),
      (id) => id.includes('llama')
    ];

    for (const check of priorityChecks) {
      const match = activeModels.find(check);
      if (match) {
        cachedGroqModel = match;
        lastModelCheckTime = now;
        console.log(`Auto-selected active Groq model: ${match}`);
        return match;
      }
    }

    if (activeModels.length > 0) {
      cachedGroqModel = activeModels[0];
      lastModelCheckTime = now;
      console.log(`Fallback to first active Groq model: ${cachedGroqModel}`);
      return cachedGroqModel;
    }
  } catch (err) {
    console.warn("Could not query Groq models list dynamically:", err.message);
  }

  return "llama-3.3-70b-versatile";
}

async function createGroqChatCompletion(groq, params) {
  const bestModel = await getBestGroqModel(groq);
  const candidateModels = [
    bestModel,
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant"
  ];
  const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

  let lastError = null;
  for (const model of uniqueModels) {
    try {
      console.log(`Executing Groq completion with model: ${model}`);
      return await groq.chat.completions.create({
        ...params,
        model,
      });
    } catch (err) {
      lastError = err;
      const isRecoverable = 
        err?.status === 404 || 
        err?.status === 400 ||
        err?.error?.code === 'model_not_found' || 
        err?.error?.code === 'model_decommissioned' ||
        err?.message?.includes('does not exist') ||
        err?.message?.includes('decommissioned') ||
        err?.message?.includes('do not have access') ||
        err?.message?.includes('not supported');

      if (!isRecoverable) {
        throw err;
      }
      console.warn(`Groq model '${model}' not usable (${err.message}), trying fallback candidate...`);
      cachedGroqModel = null;
    }
  }
  throw lastError;
}

// shared/schema.ts
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: varchar("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: varchar("recurring_pattern", { enum: ["daily", "weekly", "monthly"] }),
  // Reminder notification fields
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  reminderType: varchar("reminder_type", { enum: ["manual", "morning", "default"] }).notNull().default("default"),
  reminderTime: varchar("reminder_time"),
  // Format: "HH:MM" for manual reminders
  lastNotified: timestamp("last_notified"),
  // Track when last notification was sent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#3B82F6"),
  // Default blue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  allDay: boolean("all_day").notNull().default(false),
  location: text("location"),
  meetingLink: text("meeting_link"),
  recurringPattern: varchar("recurring_pattern", { enum: ["none", "daily", "weekly", "monthly", "yearly"] }).default("none"),
  reminders: jsonb("reminders"),
  guests: jsonb("guests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  parentId: integer("parent_id"),
  color: varchar("color", { length: 7 }).default("#6B7280"),
  color: varchar("color", { length: 7 }).default("#6B7280"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
var notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull().default("Untitled Note"),
  content: jsonb("content"),
  isPinned: boolean("is_pinned").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  categories: many(categories),
  events: many(events),
  folders: many(folders),
  notes: many(notes)
}));
var tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id]
  })
}));
var categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  }),
  tasks: many(tasks)
}));
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});
var updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial();
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});
var updateCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial();

// api/index.ts
neonConfig.fetchConnectionCache = true;
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: { tasks, categories, users, events, folders, notes } });
async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    console.log(`[VoXa API] ${req.method} ${url.pathname}`);
    // Get the most recently authenticated user or fall back to mock user
    let currentUserId = "user_1"; // default mock user
    
    // Check if we have any real authenticated users in the database
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.updatedAt));
      
      // First try to find real users (non-demo emails)
      const realUsers = allUsers.filter(user => user.email !== "demo@voxa.app");
      
      if (realUsers.length > 0) {
        // Use the most recently updated real user
        currentUserId = realUsers[0].id;
        console.log("Using real authenticated user:", currentUserId, realUsers[0].email);
      } else {
        // No real users, check if mock user exists
        const mockUser = allUsers.find(user => user.id === "user_1");
        if (mockUser) {
          console.log("Using existing mock user:", currentUserId);
        } else {
          // Create mock user if it doesn't exist
          console.log("Creating new mock user:", currentUserId);
          await db.insert(users).values({
            id: currentUserId,
            email: "demo@voxa.app",
            firstName: "Demo",
            lastName: "User"
          });
          
          // Create default categories for new mock user
          const defaultCategories = [
            { name: "Work", color: "#3B82F6" },
            { name: "Personal", color: "#10B981" },
            { name: "Shopping", color: "#F59E0B" },
            { name: "Health", color: "#EF4444" },
            { name: "Learning", color: "#8B5CF6" }
          ];
          
          for (const category of defaultCategories) {
            try {
              await db.insert(categories).values({
                userId: currentUserId,
                name: category.name,
                color: category.color
              });
            } catch (error) {
              console.log("Error creating default category:", category.name, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error in user detection, using mock user:", error.message);
      currentUserId = "user_1";
    }
    if (url.pathname === "/api/users/lookup" && req.method === "GET") {
      const email = url.searchParams.get("email");
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      
      const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (foundUsers.length > 0) {
        const user = foundUsers[0];
        res.status(200).json({ name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email });
      } else {
        res.status(200).json({ name: null });
      }
      return;
    }
    if (url.pathname === "/api/login") {
      const clientId = process.env.GOOGLE_CLIENT_ID || "33589766455-q4l78megmocn1n758mt220lek0vl617a.apps.googleusercontent.com";
      const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || "https://voxa-taupe.vercel.app/auth/google/callback");
      const scope = encodeURIComponent("openid email profile");
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      res.redirect(googleAuthUrl);
      return;
    }
    if (url.pathname === "/auth/google/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      if (error) {
        res.redirect(`/?error=oauth_error&message=${encodeURIComponent("OAuth authentication failed")}`);
        return;
      }
      if (!code) {
        res.redirect("/?error=no_code&message=No authorization code received");
        return;
      }
      try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || "33589766455-q4l78megmocn1n758mt220lek0vl617a.apps.googleusercontent.com",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || "https://voxa-taupe.vercel.app/auth/google/callback"
          })
        });
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
          throw new Error("No access token received");
        }
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResponse.json();
        await db.insert(users).values({
          id: userData.id,
          email: userData.email,
          firstName: userData.given_name,
          lastName: userData.family_name,
          profileImageUrl: userData.picture
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            email: userData.email,
            firstName: userData.given_name,
            lastName: userData.family_name,
            profileImageUrl: userData.picture,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        const defaultCategories = [
          { name: "Work", color: "#3B82F6" },
          { name: "Personal", color: "#10B981" },
          { name: "Shopping", color: "#F59E0B" },
          { name: "Health", color: "#EF4444" },
          { name: "Learning", color: "#8B5CF6" }
        ];
        
        // Create default categories only if they don't already exist for this user
        const existingCategories = await db.select().from(categories).where(eq(categories.userId, userData.id));
        
        if (existingCategories.length === 0) {
          for (const category of defaultCategories) {
            try {
              await db.insert(categories).values({
                userId: userData.id,
                name: category.name,
                color: category.color
              });
            } catch (error) {
              console.log("Category might already exist:", category.name, error.message);
            }
          }
        }
        res.redirect(`/home?login=success&user=${encodeURIComponent(userData.name || userData.email)}&email=${encodeURIComponent(userData.email)}`);
        return;
      } catch (error2) {
        console.error("OAuth error:", error2);
        res.redirect(`/?error=oauth_failed&message=${encodeURIComponent("Authentication failed: " + error2.message)}`);
        return;
      }
    }
    if (url.pathname === "/api/health") {
      const userTasks = await db.select().from(tasks).where(eq(tasks.userId, currentUserId));
      const userCategories = await db.select().from(categories).where(eq(categories.userId, currentUserId));
      res.status(200).json({
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        storage: "postgresql_neon",
        taskCount: userTasks.length,
        categoryCount: userCategories.length,
        database: "connected"
      });
      return;
    }
    if (url.pathname === "/api/tasks" && req.method === "GET") {
      const todayOnly = url.searchParams.get("today") === "true";
      let userTasks = await db.select().from(tasks).where(eq(tasks.userId, currentUserId)).orderBy(desc(tasks.createdAt));
      if (todayOnly) {
        // Filter by dueDate instead of createdAt for "today" tasks
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        
        userTasks = userTasks.filter((task) => {
          if (!task.dueDate) return false; // Tasks without due date are not "today" tasks
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= startOfToday && taskDueDate < endOfToday;
        });
      }
      const tasksWithCategories = await Promise.all(
        userTasks.map(async (task) => {
          if (task.categoryId) {
            const category = await db.select().from(categories).where(eq(categories.id, task.categoryId)).limit(1);
            return {
              ...task,
              category_name: category[0]?.name || null,
              category_color: category[0]?.color || null
            };
          }
          return {
            ...task,
            category_name: null,
            category_color: null
          };
        })
      );
      console.log("Returning tasks:", tasksWithCategories.length);
      res.status(200).json(tasksWithCategories);
      return;
    }
    if (url.pathname === "/api/tasks" && req.method === "POST") {
      const taskData = req.body;
      console.log("Creating task:", taskData);
      const newTask = await db.insert(tasks).values({
        userId: currentUserId,
        title: taskData.title,
        description: taskData.description || null,
        completed: taskData.completed || false,
        priority: taskData.priority || "medium",
        categoryId: taskData.categoryId || null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        isRecurring: taskData.isRecurring || false,
        recurringPattern: taskData.recurringPattern || null,
        reminderEnabled: taskData.reminderEnabled ?? true,
        reminderType: taskData.reminderType || "default",
        reminderTime: taskData.reminderTime || null
      }).returning();
      let category = null;
      if (newTask[0].categoryId) {
        const categoryResult = await db.select().from(categories).where(eq(categories.id, newTask[0].categoryId)).limit(1);
        category = categoryResult[0] || null;
      }
      const taskWithCategory = {
        ...newTask[0],
        category_name: category?.name || null,
        category_color: category?.color || null
      };
      console.log("Task created:", taskWithCategory);
      res.status(201).json(taskWithCategory);
      return;
    }
    if (url.pathname.startsWith("/api/tasks/") && (req.method === "PATCH" || req.method === "PUT")) {
      const taskId = parseInt(url.pathname.split("/")[3]);
      
      // Ensure body is parsed
      let updates = req.body;
      if (typeof updates === 'string') {
        try {
          updates = JSON.parse(updates);
        } catch (e) {
          console.error("Failed to parse body string:", e);
        }
      }
      
      console.log("Updating task:", taskId, updates);
      
      if (!updates || typeof updates !== 'object') {
        res.status(400).json({ error: "Invalid request body" });
        return;
      }

      // Convert date strings to Date objects for Drizzle
      const processedUpdates = { ...updates };
      if (processedUpdates.dueDate) {
        processedUpdates.dueDate = new Date(processedUpdates.dueDate);
      }
      
      const updatedTask = await db.update(tasks).set({
        ...processedUpdates,
        updatedAt: new Date()
      }).where(and(eq(tasks.id, taskId), eq(tasks.userId, currentUserId))).returning();

      if (updatedTask.length === 0) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      let category = null;
      if (updatedTask[0].categoryId) {
        const categoryResult = await db.select().from(categories).where(eq(categories.id, updatedTask[0].categoryId)).limit(1);
        category = categoryResult[0] || null;
      }
      const taskWithCategory = {
        ...updatedTask[0],
        category_name: category?.name || null,
        category_color: category?.color || null
      };
      console.log("Task updated:", taskWithCategory);
      res.status(200).json(taskWithCategory);
      return;
    }
    if (url.pathname.startsWith("/api/tasks/") && req.method === "DELETE") {
      const taskId = parseInt(url.pathname.split("/")[3]);
      console.log("Deleting task:", taskId);
      const deletedTask = await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, currentUserId))).returning();
      if (deletedTask.length === 0) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      console.log("Task deleted:", taskId);
      res.status(200).json({ success: true });
      return;
    }
    if (url.pathname === "/api/categories" && req.method === "GET") {
      const userCategories = await db.select().from(categories).where(eq(categories.userId, currentUserId)).orderBy(desc(categories.createdAt));
      
      // Deduplicate categories by name (keep the most recent one)
      const uniqueCategories = userCategories.filter((category, index, self) => 
        index === self.findIndex(c => c.name === category.name)
      );
      
      console.log("Returning categories:", userCategories.length, "unique:", uniqueCategories.length);
      res.status(200).json(uniqueCategories);
      return;
    }
    if (url.pathname === "/api/categories" && req.method === "POST") {
      const categoryData = req.body;
      console.log("Creating category:", categoryData);
      
      const existingCategory = await db.select().from(categories)
        .where(and(eq(categories.userId, currentUserId), eq(categories.name, categoryData.name)))
        .limit(1);
      
      if (existingCategory.length > 0) {
        res.status(409).json({ error: "Category already exists" });
        return;
      }
      
      const newCategory = await db.insert(categories).values({
        userId: currentUserId,
        name: categoryData.name,
        color: categoryData.color
      }).returning();
      res.status(201).json(newCategory[0]);
      return;
    }
    if (url.pathname.startsWith("/api/categories/") && req.method === "PATCH") {
      const catId = parseInt(url.pathname.split("/")[3]);
      const updates = req.body;
      const updatedCat = await db.update(categories).set({
        ...updates,
        updatedAt: new Date()
      }).where(and(eq(categories.id, catId), eq(categories.userId, currentUserId))).returning();
      
      if (updatedCat.length === 0) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.status(200).json(updatedCat[0]);
      return;
    }
    if (url.pathname.startsWith("/api/categories/") && req.method === "DELETE") {
      const catId = parseInt(url.pathname.split("/")[3]);
      const deletedCat = await db.delete(categories).where(and(eq(categories.id, catId), eq(categories.userId, currentUserId))).returning();
      if (deletedCat.length === 0) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.status(200).json({ success: true });
      return;
    }
    if (url.pathname === "/api/stats" && req.method === "GET") {
      const period = url.searchParams.get("period") || "week";
      const now = new Date();
      let startDate;
      
      // Calculate start date based on period
      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "3months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      const allTasks = await db.select().from(tasks).where(eq(tasks.userId, currentUserId));
      
      // Filter tasks by the specified period
      const periodTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate;
      });
      
      const totalTasks = periodTasks.length;
      const completedTasks = periodTasks.filter((task) => task.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      const overdueTasks = periodTasks.filter(
        (task) => !task.completed && task.dueDate && new Date(task.dueDate) < now
      ).length;
      const completionRate = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
      
      // Generate chart data for the period
      const chartData = [];
      const days = period === "week" ? 7 : period === "month" ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTasks = periodTasks.filter(task => 
          task.createdAt && task.createdAt.toISOString().split('T')[0] === dateStr
        );
        const dayCompleted = dayTasks.filter(task => task.completed).length;
        const dayTotal = dayTasks.length;
        
        chartData.push({
          date: dateStr,
          completed: dayCompleted,
          total: dayTotal,
          pending: dayTotal - dayCompleted
        });
      }
      
      const categoryDistribution = {};
      periodTasks.forEach(task => {
        if (task.categoryId) {
          categoryDistribution[task.categoryId] = (categoryDistribution[task.categoryId] || 0) + 1;
        }
      });
      
      const highPriority = periodTasks.filter((task) => task.priority === 'high').length;
      const mediumPriority = periodTasks.filter((task) => task.priority === 'medium').length;
      const lowPriority = periodTasks.filter((task) => task.priority === 'low').length;

      const stats = {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        period,
        chartData,
        categoryDistribution,
        highPriority,
        mediumPriority,
        lowPriority
      };
      console.log(`Returning stats for ${period}:`, stats);
      res.status(200).json(stats);
      return;
    }
    if (url.pathname === "/api/profile" && req.method === "PATCH") {
      const profileData = req.body;
      console.log("Updating profile:", profileData);
      
      // Check if user exists, create if not
      let userExists = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
      
      if (userExists.length === 0) {
        // Only create user if it's the demo user, real users should already exist from OAuth
        if (currentUserId === "user_1") {
          await db.insert(users).values({
            id: currentUserId,
            email: "demo@voxa.app", // Use demo email only for demo user
            firstName: profileData.firstName || "Demo",
            lastName: profileData.lastName || "User",
            profileImageUrl: profileData.profileImageUrl || null
          });
        } else {
          // Real user doesn't exist, something went wrong
          res.status(404).json({ error: "User not found and cannot create real user via profile update" });
          return;
        }
      }
      
      // Update user profile in database (exclude email from updates)
      const updateData = {
        firstName: profileData.firstName || null,
        lastName: profileData.lastName || null,
        profileImageUrl: profileData.profileImageUrl || null,
        updatedAt: new Date()
      };
      
      // Don't allow email updates through profile update
      // Email should only be set during OAuth authentication
      
      const updatedUser = await db.update(users).set(updateData).where(eq(users.id, currentUserId)).returning();
      
      if (updatedUser.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      console.log("Profile updated:", updatedUser[0]);
      res.status(200).json(updatedUser[0]);
      return;
    }
    if (url.pathname === "/api/profile" && req.method === "GET") {
      // Get user profile (user should already exist from initial setup)
      const userProfile = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
      
      if (userProfile.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      console.log("Returning user profile:", userProfile[0]);
      res.status(200).json(userProfile[0]);
      return;
    }
    
    // --- Events Routes ---
    if (url.pathname === "/api/events" && req.method === "GET") {
      const userEvents = await db.select().from(events).where(eq(events.userId, currentUserId)).orderBy(desc(events.startTime));
      res.status(200).json(userEvents);
      return;
    }

    if (url.pathname === "/api/events" && req.method === "POST") {
      const e = req.body;
      const newEvent = await db.insert(events).values({
        userId: currentUserId, 
        title: e.title, 
        description: e.description || null,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime),
        allDay: e.allDay || false,
        categoryId: e.categoryId || null,
        location: e.location || null,
        meetingLink: e.meetingLink || null,
        recurringPattern: e.recurringPattern || 'none',
        reminders: e.reminders || null,
        guests: e.guests || null,
      }).returning();

      let emailLogs = [];

      // Dispatch emails via Resend
      if (e.guests && e.guests.length > 0 && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const start = new Date(e.startTime);
        const end = new Date(e.endTime);
        
        const icsEvent = {
          start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
          end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
          title: e.title,
          status: 'CONFIRMED',
          organizer: { name: 'VoXa Calendar', email: 'onboarding@resend.dev' },
        };
        
        if (e.description) icsEvent.description = e.description;
        if (e.location) icsEvent.location = e.location;
        if (e.meetingLink) icsEvent.url = e.meetingLink;
        
        const { error, value } = ics.createEvent(icsEvent);
        
        if (error) {
          emailLogs.push({ error: 'ICS creation error', details: error });
        } else {
          const attachments = [{
            filename: 'invite.ics',
            content: value,
            type: 'text/calendar'
          }];
          
          for (const guest of e.guests) {
            try {
              const resData = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: guest.email,
                subject: `Invitation: ${e.title}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c0c0e; color: #fff; padding: 2rem; border-radius: 1rem; border: 1px solid #333;">
                    <h1 style="color: #fff; margin-top: 0;">You're invited!</h1>
                    <p style="color: #ccc; font-size: 16px;">You have been invited to <strong>${e.title}</strong>.</p>
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.5rem; margin: 1.5rem 0;">
                      <p style="margin: 0 0 0.5rem 0; color: #fff;"><strong>When:</strong> ${start.toLocaleString()}</p>
                      ${e.location ? `<p style="margin: 0 0 0.5rem 0; color: #fff;"><strong>Where:</strong> ${e.location}</p>` : ''}
                      ${e.meetingLink ? `<p style="margin: 0; color: #fff;"><strong>Link:</strong> <a href="${e.meetingLink}" style="color: #3b82f6;">${e.meetingLink}</a></p>` : ''}
                    </div>
                    ${e.description ? `<p style="color: #ccc; line-height: 1.5;">${e.description}</p>` : ''}
                    <p style="color: #666; font-size: 12px; margin-top: 2rem; border-top: 1px solid #333; padding-top: 1rem;">Sent via VoXa</p>
                  </div>
                `,
                attachments
              });
              emailLogs.push({ email: guest.email, success: true, resData });
            } catch (err) {
              emailLogs.push({ email: guest.email, success: false, error: err.message });
            }
          }
        }
      } else if (e.guests && e.guests.length > 0) {
        emailLogs.push({ error: 'RESEND_API_KEY is not set. Skipping emails.' });
      }

      res.status(201).json({ ...newEvent[0], _emailLogs: emailLogs });
      return;
    }

    if (url.pathname === "/api/test-email" && req.method === "GET") {
      const email = url.searchParams.get("email");
      const resendKey = process.env.RESEND_API_KEY;
      
      if (!resendKey) {
        res.status(200).json({ success: false, error: "RESEND_API_KEY is totally missing in Vercel. Did you redeploy after adding it?" });
        return;
      }
      
      if (!email) {
        res.status(200).json({ success: false, error: "Please provide an email query param, e.g. /api/test-email?email=you@example.com" });
        return;
      }

      try {
        const resend = new Resend(resendKey);
        const data = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Vercel Resend Debug Test',
          html: '<p>If you see this, Resend is working perfectly on Vercel!</p>'
        });
        res.status(200).json({ success: true, data });
      } catch (err) {
        res.status(200).json({ success: false, error: err.message, name: err.name, fullError: err });
      }
      return;
    }

    if (url.pathname.startsWith("/api/events/") && (req.method === "PATCH" || req.method === "PUT")) {
      const eventId = parseInt(url.pathname.split("/")[3]);
      let updates = req.body;
      if (typeof updates === 'string') updates = JSON.parse(updates);
      if (updates.startTime) updates.startTime = new Date(updates.startTime);
      if (updates.endTime) updates.endTime = new Date(updates.endTime);
      updates.updatedAt = new Date();

      const updated = await db.update(events).set(updates)
        .where(and(eq(events.id, eventId), eq(events.userId, currentUserId))).returning();
      if (!updated.length) return res.status(404).json({ error: 'Event not found' });
      res.status(200).json(updated[0]);
      return;
    }

    if (url.pathname.startsWith("/api/events/") && req.method === "DELETE") {
      const eventId = parseInt(url.pathname.split("/")[3]);
      const deleted = await db.delete(events)
        .where(and(eq(events.id, eventId), eq(events.userId, currentUserId))).returning();
      if (!deleted.length) return res.status(404).json({ error: 'Event not found' });
      res.status(200).json({ success: true });
      return;
    }

    // --- Web Push Routes ---
    if (url.pathname === "/api/push/subscribe" && req.method === "POST") {
      const subscription = req.body;
      if (!subscription || !subscription.endpoint) {
        res.status(400).json({ error: 'Invalid subscription' });
        return;
      }
      
      await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, currentUserId), eq(pushSubscriptions.endpoint, subscription.endpoint)));
      
      await db.insert(pushSubscriptions).values({
        userId: currentUserId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });
      res.status(201).json({ success: true });
      return;
    }

    if (url.pathname === "/api/cron/alarms" && req.method === "GET") {
      if (!process.env.VAPID_PUBLIC_KEY) {
        res.status(500).json({ error: 'VAPID keys missing' });
        return;
      }
      try {
        const now = new Date();
        const nowTs = now.getTime();
        const allSubs = await db.select().from(pushSubscriptions);
        if (!allSubs.length) {
          res.json({ status: 'no_subscriptions' });
          return;
        }
        
        const allTasks = await db.select().from(tasks).where(eq(tasks.completed, false));
        const allEvents = await db.select().from(events);
        const pushes = [];
        
        const checkItem = (item, isEvent) => {
          const targetDate = isEvent ? new Date(item.startTime) : (item.dueDate ? new Date(item.dueDate) : null);
          if (!targetDate || isNaN(targetDate.getTime())) return;
          if (!isEvent && item.reminderEnabled === false) return;
          
          const targetTs = targetDate.getTime();
          const diffMinutes = (targetTs - nowTs) / (1000 * 60);
          
          let shouldNotify = false;
          let title = isEvent ? "📅 Event Reminder" : "⏰ Task Reminder";
          let body = "";
          
          if (now.getHours() === 8 && now.getMinutes() === 0 && targetDate.toDateString() === now.toDateString()) {
            shouldNotify = true;
            title = "🌅 Morning Brief";
            body = `"${item.title}" is scheduled for today.`;
          }
          
          let intervals = [30, 15, 5];
          if (!isEvent && item.reminderType === 'default' && item.reminderTime) {
            intervals = item.reminderTime.split(',').map(Number).filter(n => !isNaN(n));
          } else if (isEvent && Array.isArray(item.reminders)) {
            intervals = item.reminders.map(Number).filter(n => !isNaN(n));
          }
          
          const reachedInterval = intervals.find(mins => diffMinutes <= mins && diffMinutes > mins - 1);
          
          if (reachedInterval !== undefined) {
            shouldNotify = true;
            body = `"${item.title}" is coming up in ${reachedInterval} minutes!`;
          }
          
          if (!isEvent && item.reminderType === 'manual' && item.reminderTime) {
            const [targetH, targetM] = item.reminderTime.split(':').map(Number);
            if (now.getHours() === targetH && now.getMinutes() === targetM && targetDate.toDateString() === now.toDateString()) {
              shouldNotify = true;
              title = "🔔 Scheduled Alert";
              body = `Reminder for "${item.title}"`;
            }
          }
          
          if (shouldNotify) {
            const userSubs = allSubs.filter(sub => sub.userId === item.userId);
            for (const sub of userSubs) {
              const pushPayload = JSON.stringify({ title, body, isEvent, id: item.id });
              const subObject = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              };
              pushes.push(
                webpush.sendNotification(subObject, pushPayload).catch(async err => {
                   if (err.statusCode === 410 || err.statusCode === 404) {
                     await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                   }
                })
              );
            }
          }
        };
        
        allTasks.forEach(t => checkItem(t, false));
        allEvents.forEach(e => checkItem(e, true));
        
        await Promise.all(pushes);
        res.json({ success: true, pushed: pushes.length });
      } catch (error) {
        console.error('Cron error:', error);
        res.status(500).json({ error: error.message });
      }
      return;
    }

    // --- Folders Routes ---
    if (url.pathname === "/api/folders" && req.method === "GET") {
      const userFolders = await db.select().from(folders).where(eq(folders.userId, currentUserId)).orderBy(desc(folders.createdAt));
      res.status(200).json(userFolders);
      return;
    }

    if (url.pathname === "/api/ai/dictate" && req.method === "POST") {
      try {
        const { rawText } = req.body;
        if (!process.env.GROQ_API_KEY) {
          return res.status(500).json({ error: "GROQ_API_KEY is not configured." });
        }

        const systemPrompt = `You are a Smart Dictation formatter. 
The user has spoken some raw text using speech-to-text. Your job is to format it beautifully into clean HTML suitable for a rich text editor.
RULES:
1. Fix all speech-to-text typos, missing capitalization, and punctuation.
2. If they rattle off a list of items, format it as an HTML <ul> or <ol> with <li>.
3. If they emphasize something or it sounds like a heading, use <h3> or <strong>.
4. Output ONLY the raw HTML string. Do NOT wrap it in markdown code blocks (\`\`\`html). Do NOT include <head> or <body> tags. Just the content.`;

        const groq = getGroqClient();
        const chatCompletion = await createGroqChatCompletion(groq, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawText }
          ],
          temperature: 0.2,
        });
        
        let htmlOutput = chatCompletion.choices[0]?.message?.content || "";
        // Clean up if it hallucinated markdown blocks
        htmlOutput = htmlOutput.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();
        
        res.status(200).json({ html: htmlOutput });
      } catch (error) {
        console.error("Groq AI Dictate Error:", error);
        res.status(500).json({ error: error.message || "Failed to process dictation" });
      }
      return;
    }

    if (url.pathname === "/api/folders" && req.method === "POST") {
      const f = req.body;
      const newFolder = await db.insert(folders).values({
        userId: currentUserId,
        name: f.name,
        parentId: f.parentId || null,
        color: f.color || '#6B7280'
      }).returning();
      res.status(201).json(newFolder[0]);
      return;
    }
    if (url.pathname.startsWith("/api/folders/") && (req.method === "PATCH" || req.method === "PUT")) {
      const folderId = parseInt(url.pathname.split("/")[3]);
      const updates = { ...req.body, updatedAt: new Date() };
      const updated = await db.update(folders).set(updates).where(and(eq(folders.id, folderId), eq(folders.userId, currentUserId))).returning();
      if (!updated.length) return res.status(404).json({ error: 'Folder not found' });
      res.status(200).json(updated[0]);
      return;
    }
    if (url.pathname.startsWith("/api/folders/") && req.method === "DELETE") {
      const folderId = parseInt(url.pathname.split("/")[3]);
      const deleted = await db.delete(folders).where(and(eq(folders.id, folderId), eq(folders.userId, currentUserId))).returning();
      if (!deleted.length) return res.status(404).json({ error: 'Folder not found' });
      res.status(200).json({ success: true });
      return;
    }

    // --- Notes Routes ---
    if (url.pathname === "/api/notes" && req.method === "GET") {
      // 24 hour trash cleanup
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      try {
        await db.delete(notes).where(
          and(
            eq(notes.userId, currentUserId),
            eq(notes.isArchived, true),
            lt(notes.updatedAt, oneDayAgo)
          )
        );
      } catch (e) {
        console.error("Failed to clean up trash", e);
      }
      const userNotes = await db.select().from(notes).where(eq(notes.userId, currentUserId)).orderBy(asc(notes.order), desc(notes.updatedAt));
      res.status(200).json(userNotes);
      return;
    }
    if (url.pathname === "/api/notes/reorder" && (req.method === "PATCH" || req.method === "PUT")) {
      const { updates } = req.body;
      if (!Array.isArray(updates)) {
        res.status(400).json({ error: 'Updates must be an array' });
        return;
      }
      try {
        for (const update of updates) {
          await db.update(notes)
            .set({ order: update.order, updatedAt: new Date() })
            .where(and(eq(notes.id, update.id), eq(notes.userId, currentUserId)));
        }
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to reorder notes' });
      }
      return;
    }
    if (url.pathname === "/api/notes" && req.method === "POST") {
      const n = req.body;
      const newNote = await db.insert(notes).values({
        userId: currentUserId,
        title: n.title || 'Untitled Note',
        content: n.content || '',
        folderId: n.folderId || null,
        isPinned: n.isPinned || false
      }).returning();
      res.status(201).json(newNote[0]);
      return;
    }
    if (url.pathname.startsWith("/api/notes/") && (req.method === "PATCH" || req.method === "PUT")) {
      const noteId = parseInt(url.pathname.split("/")[3]);
      const updates = { ...req.body, updatedAt: new Date() };
      const updated = await db.update(notes).set(updates).where(and(eq(notes.id, noteId), eq(notes.userId, currentUserId))).returning();
      if (!updated.length) return res.status(404).json({ error: 'Note not found' });
      res.status(200).json(updated[0]);
      return;
    }
    if (url.pathname === "/api/notes/trash" && req.method === "DELETE") {
      await db.delete(notes).where(and(eq(notes.userId, currentUserId), eq(notes.isArchived, true)));
      res.status(200).json({ success: true });
      return;
    }
    if (url.pathname.startsWith("/api/notes/") && req.method === "DELETE") {
      const noteId = parseInt(url.pathname.split("/")[3]);
      const deleted = await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, currentUserId))).returning();
      if (!deleted.length) return res.status(404).json({ error: 'Note not found' });
      res.status(200).json({ success: true });
      return;
    }

    // --- AI Endpoint ---
    if (url.pathname === "/api/ai/format" && req.method === "POST") {
      const { content, action } = req.body;
      let newContent = content;
      
      const rawText = (content || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

      if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY not set. Using fallback mock.");
        const sentences = rawText.match(/[^.!?]+[.!?]+/g) || (rawText ? [rawText] : ["No text provided"]);
        if (action === "summarize") {
          const summaryPoints = sentences.slice(0, 3).map(s => `<li>${s.trim()}</li>`).join('');
          newContent = `<div style="background: rgba(59,130,246,0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #3b82f6; margin-bottom: 1rem;"><strong>🤖 AI Summary:</strong><br/><ul>${summaryPoints}</ul></div>` + content;
        } else if (action === "polish") {
          const polished = sentences.map(s => {
            let t = s.trim();
            return t.charAt(0).toUpperCase() + t.slice(1) + (t.match(/[.!?]$/) ? '' : '.');
          }).join(' ');
          newContent = `<p>✨ <em>Polished Note:</em></p><p>${polished}</p>`;
        } else if (action === "task") {
          const tasks = sentences.slice(0, 4).map(s => `<li data-type="taskItem" data-checked="false"><p>${s.trim()}</p></li>`).join('');
          newContent = `
            <ul data-type="taskList">
              ${tasks}
            </ul>
          ` + content;
        }
        res.status(200).json({ content: newContent });
        return;
      }

      try {
        const groq = getGroqClient();
        let prompt = "";
        let systemPrompt = "You are a helpful AI formatting assistant. You must ONLY output the requested HTML, nothing else. Do not wrap it in markdown code blocks. Just raw HTML.";

        if (action === "summarize") {
          prompt = `Summarize the following text into 3 concise bullet points. Output ONLY a <ul> tag containing the <li> elements.\n\nText: ${rawText}`;
        } else if (action === "polish") {
          prompt = `Fix any grammar errors and polish the vocabulary of the following HTML text to make it sound professional but keep the original meaning. CRITICAL: You MUST preserve all original HTML formatting exactly as it is (including <ul>, <li>, <p>, <h1>, <strong>, etc.). Do not collapse the text into a single paragraph. Output ONLY the polished HTML.\n\nText: ${content}`;
        } else if (action === "task") {
          prompt = `Extract all actionable tasks from the following text. Output ONLY a <ul data-type="taskList"> containing <li data-type="taskItem" data-checked="false"><p>Task text</p></li> elements.\n\nText: ${rawText}`;
        }
        
        const chatCompletion = await createGroqChatCompletion(groq, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
        });
        
        let aiHtml = chatCompletion.choices[0]?.message?.content || "";
        // Clean up markdown formatting if present
        aiHtml = aiHtml.replace(/```html/g, '').replace(/```/g, '').trim();

        if (action === "summarize") {
          newContent = `<div style="background: rgba(59,130,246,0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #3b82f6; margin-bottom: 1rem;"><strong>🤖 AI Summary:</strong><br/>${aiHtml}</div>` + content;
        } else if (action === "polish") {
          newContent = aiHtml;
        } else if (action === "task") {
          newContent = aiHtml + content;
        }
        
        res.status(200).json({ content: newContent });
      } catch (error) {
        console.error("Groq AI Error:", error);
        res.status(500).json({ error: error.message || "Failed to process AI request" });
      }
      return;
    }

    if (url.pathname === "/api/ai/command" && req.method === "POST") {
      const { transcript, context, localTime, conversationHistory = [] } = req.body;
      
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY is not configured." });
      }

      // Fetch real-time web & news search if relevant
      let liveWebInfo = null;
      try {
        if (transcript && typeof transcript === 'string') {
          const clean = transcript.toLowerCase();
          const isNews = /\b(news|headline|headlines|breaking|latest updates?|current events?|what's new|whats new)\b/i.test(clean);
          const isWebSearch = isNews || /\b(who is|what is|where is|when was|why is|how does|search for|look up|tell me about|what are|explain|current|today|recent|price of|score of|ceo|founder|net worth|weather|stock|release date)\b/i.test(clean) || clean.endsWith('?');

          if (isWebSearch) {
            let searchResults = [];
            let topic = transcript
              .replace(/^(can you|please|could you)?\s*(tell me|give me|what is|what's|whats|search for|look up|find|show me)\s*(the|about)?/i, '')
              .replace(/\b(current news in|latest news about|news about|news in|news on|updates on)\b/i, '')
              .trim();
            if (!topic || topic.length < 2) topic = transcript;

            // 1. Google News RSS for live news
            if (isNews || /\b(happening|news|today|latest)\b/i.test(clean)) {
              try {
                const newsQuery = encodeURIComponent(topic);
                const newsUrl = topic && topic !== 'news' 
                  ? `https://news.google.com/rss/search?q=${newsQuery}&hl=en-US&gl=US&ceid=US:en`
                  : `https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en`;
                
                const newsRes = await fetch(newsUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                });
                if (newsRes.ok) {
                  const xml = await newsRes.text();
                  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
                  for (const item of items.slice(0, 4)) {
                    const title = (item.match(/<title>(.*?)<\/title>/)?.[1] || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
                    const source = (item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
                    const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
                    if (title) {
                      searchResults.push(`[News] ${title} (${source ? source + ', ' : ''}${date})`);
                    }
                  }
                }
              } catch (e) {
                console.warn("Live news fetch error:", e.message);
              }
            }

            // 2. DuckDuckGo HTML search for general web info
            try {
              const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(topic)}`;
              const ddgRes = await fetch(ddgUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.5'
                }
              });
              if (ddgRes.ok) {
                const html = await ddgRes.text();
                const blocks = html.split('<div class="result results_links');
                for (let i = 1; i < Math.min(blocks.length, 4); i++) {
                  const b = blocks[i];
                  const title = (b.match(/<h2 class="result__title">([\s\S]*?)<\/h2>/)?.[1] || '').replace(/<[^>]+>/g, '').trim();
                  const snippetMatch = b.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
                  const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
                  if (title || snippet) {
                    searchResults.push(`[Web] ${title}: ${snippet}`);
                  }
                }
              }
            } catch (e) {
              console.warn("Live DDG search error:", e.message);
            }

            // 3. Fallback to Wikipedia summary if needed
            if (searchResults.length === 0) {
              try {
                const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&namespace=0&format=json`;
                const wikiRes = await fetch(wikiSearchUrl, { headers: { 'User-Agent': 'VoXaAssistant/1.0' } });
                if (wikiRes.ok) {
                  const wikiData = await wikiRes.json();
                  const matchedTitle = wikiData[1]?.[0];
                  if (matchedTitle) {
                    const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(matchedTitle)}`, {
                      headers: { 'User-Agent': 'VoXaAssistant/1.0' }
                    });
                    if (sumRes.ok) {
                      const sumData = await sumRes.json();
                      if (sumData.extract) {
                        searchResults.push(`[Wikipedia] ${sumData.title}: ${sumData.extract}`);
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn("Live Wikipedia search error:", e.message);
              }
            }

            if (searchResults.length > 0) {
              liveWebInfo = searchResults.join('\n');
            }
          }
        }
      } catch (err) {
        console.warn("Web search pipeline error:", err.message);
      }

      const systemPrompt = `You are the VoXa Full Voice Mode AI Assistant with FULL EMPOWERED CONTROL over the entire application and REAL-TIME INTERNET ACCESS.
Understand the user's intent deeply, resolve references to existing items, translate instructions into actions, and provide a concise, friendly spoken response.
The user's current local date and time is: ${localTime || new Date().toString()}. Use this as the reference point for relative dates like "tomorrow", "this Friday at 3pm", etc.
Speak naturally and briefly.

You have access to the following actions:
TASKS:
- { "action": "CREATE_TASK", "title": string, "priority": "low"|"medium"|"high", "deadline": string (ISO), "categoryId": number (optional), "description": string (optional) }
- { "action": "UPDATE_TASK", "id": number, "updates": { "title": string, "priority": "low"|"medium"|"high", "deadline": string (ISO), "completed": boolean, "description": string, "categoryId": number } }
- { "action": "DELETE_TASK", "id": number }
- { "action": "COMPLETE_ALL_TASKS" }
- { "action": "DELETE_COMPLETED_TASKS" }

NOTES:
- { "action": "CREATE_NOTE", "title": string, "content": string, "isPinned": boolean }
- { "action": "UPDATE_NOTE", "id": number, "title": string (optional), "content": string (optional) }
- { "action": "APPEND_NOTE", "id": number, "content": string }
- { "action": "POLISH_NOTE", "id": number } (Rewrites and elevates note grammar, tone, and vocabulary while keeping rich HTML)
- { "action": "SUMMARIZE_NOTE", "id": number } (Generates concise 3-bullet summary)
- { "action": "EXTRACT_TASKS_FROM_NOTE", "id": number } (Extracts actionable tasks from note directly into the user's Task list)
- { "action": "PIN_NOTE", "id": number }
- { "action": "UNPIN_NOTE", "id": number }
- { "action": "DELETE_NOTE", "id": number } (Soft-deletes note to trash)
- { "action": "RESTORE_NOTE", "id": number } (Restores note from trash)
- { "action": "EMPTY_TRASH" } (Permanently empties trash)

CALENDAR & EVENTS:
- { "action": "CREATE_EVENT", "title": string, "startTime": string (ISO), "endTime": string (ISO), "allDay": boolean, "description": string (optional), "location": string (optional), "meetingLink": string (optional), "guests": [ { "name": string, "email": string } ] (optional) }
- { "action": "UPDATE_EVENT", "id": number, "updates": { "title": string, "startTime": string (ISO), "endTime": string (ISO), "allDay": boolean, "description": string, "location": string, "meetingLink": string, "guests": [ { "name": string, "email": string } ] } }
- { "action": "ADD_EVENT_GUEST", "id": number, "guest": { "name": string, "email": string } } (Adds a guest with name and email to an existing event)
- { "action": "REMOVE_EVENT_GUEST", "id": number, "email": string } (Removes a guest by email from an existing event)
- { "action": "DELETE_EVENT", "id": number }
- { "action": "CHANGE_CALENDAR_VIEW", "view": "month"|"week"|"day" }

NAVIGATION & APP CONTROL:
- { "action": "SEARCH", "query": string, "target": "tasks"|"notes"|"calendar" }
- { "action": "NAVIGATE", "destination": "/home"|"/tasks"|"/calendar"|"/notes"|"/stats" }
- { "action": "OPEN_MODAL", "modalName": "new_task"|"settings"|"notifications"|"trash" }
- { "action": "UPDATE_PROFILE", "firstName": string, "lastName": string }
- { "action": "TOGGLE_SETTING", "setting": "alarm_sound", "value": boolean }

RULES:
1. Context resolution: Match descriptions like "my dentist appointment", "the note about budget", "the grocery task" to actual IDs in context (tasks, notes, events, categories).
2. Event guests & descriptions: If the user says "add Alex to my meeting" or "set description for tomorrow's standup to 'Sprint planning'", emit ADD_EVENT_GUEST or UPDATE_EVENT.
3. Exclusions: If the user says "except", "excluding", or "don't touch", NEVER execute actions on those items.
4. Speech correction: Clean up speech-to-text phonetics ("meat in" -> "meeting", "right a note" -> "write a note").
5. Timezone: Output ISO timestamps as YYYY-MM-DDTHH:mm:ss WITHOUT 'Z' so they parse in the user's local timezone.
6. Live Web & Real-Time News: You have active internet access! If the user asks for news, current affairs, facts, websites, or general information (e.g. "What's the current news in AI?", "Tell me about...", "Who is..."), synthesize the provided real-time search results into an accurate, engaging, natural spoken answer in "response" (1-3 sentences). Only emit workspace actions if they explicitly asked to create/modify a task, note, or event.
7. Return format: Output ONLY a JSON object with keys "actions" (array) and "response" (natural spoken confirmation).`;

      let userPrompt = `Context: ${JSON.stringify(context)}
      
User Command/Question: "${transcript}"`;

      if (liveWebInfo) {
        userPrompt += `\n\nREAL-TIME LIVE WEB & NEWS SEARCH RESULTS (Retrieved from the internet right now):
${liveWebInfo}

Use these real-time web results to provide an accurate, up-to-date, friendly spoken answer in "response". If no application actions (creating tasks/events/notes) are needed, return "actions": [].`;
      }

      try {
        const groq = getGroqClient();
        const messages = [
          { role: "system", content: systemPrompt },
          ...conversationHistory.slice(-10), // keep last 10 messages for context
          { role: "user", content: userPrompt }
        ];
        
        const chatCompletion = await createGroqChatCompletion(groq, {
          messages,
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        
        const aiOutput = chatCompletion.choices[0]?.message?.content || '{"actions":[]}';
        const parsed = JSON.parse(aiOutput);
        res.status(200).json(parsed);
      } catch (error) {
        console.error("Groq AI Command Error:", error);
        res.status(200).json({
          actions: [],
          response: "AI voice engine is currently adjusting model capacity. Please try your command again in a moment."
        });
      }
      return;
    }

    res.status(404).json({ error: `Endpoint not found: ${req.method} ${url.pathname}` });
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: error.message });
  }
}
export {
  handler as default
};
