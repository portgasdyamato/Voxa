// api/index.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import { Resend } from "resend";
import * as ics from "ics";

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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull().default("Untitled Note"),
  content: jsonb("content"),
  isPinned: boolean("is_pinned").notNull().default(false),
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

      // Dispatch emails via Resend
      if (e.guests && e.guests.length > 0 && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const start = new Date(e.startTime);
        const end = new Date(e.endTime);
        
        const icsEvent = {
          start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
          end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
          title: e.title,
          description: e.description || '',
          location: e.location || '',
          url: e.meetingLink || '',
          status: 'CONFIRMED',
          organizer: { name: 'VoXa Calendar', email: 'onboarding@resend.dev' },
        };
        
        ics.createEvent(icsEvent, async (error, value) => {
          if (error) {
            console.error('ICS creation error:', error);
          } else {
            const attachments = [{
              filename: 'invite.ics',
              content: Buffer.from(value).toString('base64'),
              type: 'text/calendar'
            }];
            
            for (const guest of e.guests) {
              try {
                await resend.emails.send({
                  from: 'VoXa Calendar <onboarding@resend.dev>',
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
                console.log(`[VoXa API] Sent calendar invite to ${guest.email}`);
              } catch (err) {
                console.error(`[VoXa API] Failed to send email to ${guest.email}:`, err);
              }
            }
          }
        });
      } else if (e.guests && e.guests.length > 0) {
        console.log('[VoXa API] Guests were invited, but RESEND_API_KEY is not set. Skipping emails.');
      }

      res.status(201).json(newEvent[0]);
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

    // --- Folders Routes ---
    if (url.pathname === "/api/folders" && req.method === "GET") {
      const userFolders = await db.select().from(folders).where(eq(folders.userId, currentUserId)).orderBy(desc(folders.createdAt));
      res.status(200).json(userFolders);
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
    if (url.pathname.startsWith("/api/notes/") && req.method === "DELETE") {
      const noteId = parseInt(url.pathname.split("/")[3]);
      const deleted = await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, currentUserId))).returning();
      if (!deleted.length) return res.status(404).json({ error: 'Note not found' });
      res.status(200).json({ success: true });
      return;
    }

    // --- AI Mock Endpoint ---
    if (url.pathname === "/api/ai/format" && req.method === "POST") {
      const { content, action } = req.body;
      let newContent = content;
      
      const groqKey = process.env.GROQ_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      
      if (!groqKey && !openaiKey) {
        newContent = `
          <div style="background: rgba(239,68,68,0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #ef4444; margin: 1rem 0;">
            <strong>⚠️ AI Not Configured</strong><br/>
            <p>To enable real AI summarizing, polishing, and task extraction, please add your <code>GROQ_API_KEY</code> or <code>OPENAI_API_KEY</code> to your environment variables.</p>
          </div>
        ` + content;
        return res.status(200).json({ content: newContent });
      }

      // Extract raw text for the AI prompt
      const rawText = (content || '').replace(/<[^>]*>?/gm, '\n').replace(/\n+/g, '\n').trim();
      
      let systemPrompt = "You are a helpful assistant.";
      if (action === "summarize") {
        systemPrompt = "You are an AI assistant. Summarize the user's text into 3 concise bullet points. Output ONLY HTML: an <ul> with <li> elements.";
      } else if (action === "polish") {
        systemPrompt = "You are an AI assistant. Polish the user's text to fix grammar, improve flow, and make it sound professional. Output ONLY HTML: wrapping paragraphs in <p> tags. Do not output anything else.";
      } else if (action === "task") {
        systemPrompt = "You are an AI assistant. Extract actionable tasks from the user's text. Output ONLY HTML: an <ul data-type=\"taskList\"> with <li data-type=\"taskItem\" data-checked=\"false\"><p>task</p></li> elements.";
      }

      try {
        const apiUrl = groqKey ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
        const apiKey = groqKey || openaiKey;
        const apiModel = groqKey ? "llama3-8b-8192" : "gpt-4o-mini";

        const aiResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: apiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: rawText || "No text provided." }
            ],
            temperature: 0.5
          })
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(`API error: ${errorText}`);
        }

        const data = await aiResponse.json();
        const aiHtml = data.choices[0]?.message?.content || "";

        if (action === "summarize") {
          newContent = `<h2>🤖 AI Summary</h2>${aiHtml}<hr>` + content;
        } else if (action === "polish") {
          newContent = `<h2>✨ Polished Note</h2>${aiHtml}<hr>`;
        } else if (action === "task") {
          newContent = `<h2>📋 Extracted Tasks</h2>${aiHtml}<hr>` + content;
        }

        res.status(200).json({ content: newContent });
      } catch (e) {
        console.error("AI API Error:", e);
        newContent = `
          <div style="background: rgba(239,68,68,0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #ef4444; margin: 1rem 0;">
            <strong>⚠️ AI Error</strong><br/>
            <p>Failed to process AI request. Please check your API key and quota.</p>
          </div>
        ` + content;
        res.status(200).json({ content: newContent });
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
