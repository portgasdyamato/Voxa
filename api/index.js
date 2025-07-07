"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/handler.ts
var handler_exports = {};
__export(handler_exports, {
  default: () => handler_default
});
module.exports = __toCommonJS(handler_exports);
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  insertCategorySchema: () => insertCategorySchema,
  insertTaskSchema: () => insertTaskSchema,
  sessions: () => sessions,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  updateCategorySchema: () => updateCategorySchema,
  updateTaskSchema: () => updateTaskSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var import_drizzle_orm = require("drizzle-orm");
var sessions = (0, import_pg_core.pgTable)(
  "sessions",
  {
    sid: (0, import_pg_core.varchar)("sid").primaryKey(),
    sess: (0, import_pg_core.jsonb)("sess").notNull(),
    expire: (0, import_pg_core.timestamp)("expire").notNull()
  },
  (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.varchar)("id").primaryKey().notNull(),
  email: (0, import_pg_core.varchar)("email").unique(),
  firstName: (0, import_pg_core.varchar)("first_name"),
  lastName: (0, import_pg_core.varchar)("last_name"),
  profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var tasks = (0, import_pg_core.pgTable)("tasks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: (0, import_pg_core.integer)("category_id").references(() => categories.id, { onDelete: "set null" }),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  priority: (0, import_pg_core.varchar)("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  completed: (0, import_pg_core.boolean)("completed").notNull().default(false),
  dueDate: (0, import_pg_core.timestamp)("due_date"),
  isRecurring: (0, import_pg_core.boolean)("is_recurring").notNull().default(false),
  recurringPattern: (0, import_pg_core.varchar)("recurring_pattern", { enum: ["daily", "weekly", "monthly"] }),
  // Reminder notification fields
  reminderEnabled: (0, import_pg_core.boolean)("reminder_enabled").notNull().default(true),
  reminderType: (0, import_pg_core.varchar)("reminder_type", { enum: ["manual", "morning", "default"] }).notNull().default("default"),
  reminderTime: (0, import_pg_core.varchar)("reminder_time"),
  // Format: "HH:MM" for manual reminders
  lastNotified: (0, import_pg_core.timestamp)("last_notified"),
  // Track when last notification was sent
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var categories = (0, import_pg_core.pgTable)("categories", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  color: (0, import_pg_core.varchar)("color", { length: 7 }).notNull().default("#3B82F6"),
  // Default blue
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ many }) => ({
  tasks: many(tasks),
  categories: many(categories)
}));
var tasksRelations = (0, import_drizzle_orm.relations)(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id]
  })
}));
var categoriesRelations = (0, import_drizzle_orm.relations)(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  }),
  tasks: many(tasks)
}));
var insertTaskSchema = (0, import_drizzle_zod.createInsertSchema)(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});
var updateTaskSchema = (0, import_drizzle_zod.createInsertSchema)(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial();
var insertCategorySchema = (0, import_drizzle_zod.createInsertSchema)(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});
var updateCategorySchema = (0, import_drizzle_zod.createInsertSchema)(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial();

// server/db.ts
var import_serverless = require("@neondatabase/serverless");
var import_neon_serverless = require("drizzle-orm/neon-serverless");
var import_ws = __toESM(require("ws"), 1);
import_serverless.neonConfig.webSocketConstructor = import_ws.default;
if (!process.env.DATABASE_URL) {
  console.warn(
    "\u26A0\uFE0F  DATABASE_URL is not set. Please set up your database connection."
  );
  console.warn("\u{1F4DD} See setup.md for database setup instructions");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var dbUrl = process.env.DATABASE_URL;
if (dbUrl.includes("localhost") || dbUrl.includes("username:password")) {
  console.warn("\u26A0\uFE0F  You're using a placeholder database URL.");
  console.warn("\u{1F527} Please update your .env file with a real database connection.");
  console.warn("\u{1F4D6} Check setup.md for instructions on setting up a free database.");
  throw new Error(
    "Please update DATABASE_URL in your .env file with a real database connection. See setup.md for instructions."
  );
}
var pool = new import_serverless.Pool({ connectionString: process.env.DATABASE_URL });
var db = (0, import_neon_serverless.drizzle)({ client: pool, schema: schema_exports });

// server/storage.ts
var import_drizzle_orm2 = require("drizzle-orm");
var DatabaseStorage = class {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm2.eq)(users.id, id)).returning();
    return user;
  }
  // Task operations
  async getTasks(userId) {
    return await db.select().from(tasks).where((0, import_drizzle_orm2.eq)(tasks.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(tasks.createdAt));
  }
  async getTasksByDate(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    console.log("Date range query:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      inputDate: date.toISOString()
    });
    const result = await db.select().from(tasks).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(tasks.userId, userId),
        (0, import_drizzle_orm2.gte)(tasks.dueDate, startOfDay),
        (0, import_drizzle_orm2.lte)(tasks.dueDate, endOfDay)
      )
    ).orderBy((0, import_drizzle_orm2.asc)(tasks.completed), (0, import_drizzle_orm2.desc)(tasks.priority));
    console.log("Tasks found in date range:", result.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate })));
    return result;
  }
  async createTask(userId, task) {
    const [newTask] = await db.insert(tasks).values({
      ...task,
      userId
    }).returning();
    return newTask;
  }
  async updateTask(userId, taskId, updates) {
    const [updatedTask] = await db.update(tasks).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(tasks.id, taskId), (0, import_drizzle_orm2.eq)(tasks.userId, userId))).returning();
    if (!updatedTask) {
      throw new Error(`Task with id ${taskId} not found or does not belong to user ${userId}`);
    }
    return updatedTask;
  }
  async deleteTask(userId, taskId) {
    await db.delete(tasks).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(tasks.id, taskId), (0, import_drizzle_orm2.eq)(tasks.userId, userId)));
  }
  async getTaskStats(userId, period = "week") {
    const userTasks = await db.select().from(tasks).where((0, import_drizzle_orm2.eq)(tasks.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(tasks.createdAt));
    const total = userTasks.length;
    const completed = userTasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const highPriority = userTasks.filter((task) => task.priority === "high").length;
    const mediumPriority = userTasks.filter((task) => task.priority === "medium").length;
    const lowPriority = userTasks.filter((task) => task.priority === "low").length;
    const completionRate = total > 0 ? Math.round(completed / total * 100) : 0;
    const { currentStreak, longestStreak } = this.calculateStreaks(userTasks);
    const weeklyData = this.getPeriodCompletionData(userTasks, period);
    const today = /* @__PURE__ */ new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const completedToday = userTasks.filter((task) => {
      if (!task.completed || !task.updatedAt) return false;
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= startOfToday && updatedAt <= endOfToday;
    }).length;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const completedThisWeek = userTasks.filter((task) => {
      if (!task.completed || !task.updatedAt) return false;
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= startOfWeek;
    }).length;
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
      completedThisWeek
    };
  }
  calculateStreaks(tasks2) {
    const completedTasks = tasks2.filter((task) => task.completed);
    if (completedTasks.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    const tasksByDate = /* @__PURE__ */ new Map();
    completedTasks.forEach((task) => {
      if (task.updatedAt) {
        const updatedDate = new Date(task.updatedAt);
        const dateKey = updatedDate.toISOString().split("T")[0];
        tasksByDate.set(dateKey, (tasksByDate.get(dateKey) || 0) + 1);
      }
    });
    const sortedDates = Array.from(tasksByDate.keys()).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let checkDate = new Date(today);
    for (let i = 0; i < sortedDates.length; i++) {
      const dateKey = checkDate.toISOString().split("T")[0];
      if (tasksByDate.has(dateKey)) {
        currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    tempStreak = 0;
    let previousDate = null;
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
  isConsecutiveDay(date1, date2) {
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const dayDiff = Math.ceil(timeDiff / (1e3 * 3600 * 24));
    return dayDiff <= 1;
  }
  getWeeklyCompletionData(tasks2) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = days.map((day) => ({ day, completed: 0, total: 0 }));
    const today = /* @__PURE__ */ new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekTasks = tasks2.filter((task) => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfWeek;
      }
      return false;
    });
    thisWeekTasks.forEach((task) => {
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
  getDateRangeForPeriod(period) {
    const now = /* @__PURE__ */ new Date();
    const end = new Date(now);
    let start = new Date(now);
    switch (period) {
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(now.getMonth() - 3);
        break;
      case "week":
      default:
        start.setDate(now.getDate() - 7);
        break;
    }
    return { start, end };
  }
  getPeriodCompletionData(tasks2, period) {
    if (period === "week") {
      return this.getWeeklyCompletionData(tasks2);
    } else if (period === "month") {
      return this.getMonthlyCompletionData(tasks2);
    } else if (period === "quarter") {
      return this.getQuarterlyCompletionData(tasks2);
    }
    return this.getWeeklyCompletionData(tasks2);
  }
  getMonthlyCompletionData(tasks2) {
    const today = /* @__PURE__ */ new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthlyData = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      monthlyData.push({ day: dayStr, completed: 0, total: 0 });
    }
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thisMonthTasks = tasks2.filter((task) => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfMonth && taskDate <= endOfMonth;
      }
      return false;
    });
    thisMonthTasks.forEach((task) => {
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
  getQuarterlyCompletionData(tasks2) {
    const today = /* @__PURE__ */ new Date();
    const quarterlyData = [];
    for (let i = 12; i >= 1; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7);
      const weekLabel = `W${13 - i}`;
      quarterlyData.push({ day: weekLabel, completed: 0, total: 0 });
    }
    const startOfQuarter = new Date(today);
    startOfQuarter.setMonth(today.getMonth() - 3);
    const quarterTasks = tasks2.filter((task) => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfQuarter;
      }
      return false;
    });
    quarterTasks.forEach((task) => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const weeksDiff = Math.floor((today.getTime() - taskDate.getTime()) / (7 * 24 * 60 * 60 * 1e3));
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
  async getCategories(userId) {
    return await db.select().from(categories).where((0, import_drizzle_orm2.eq)(categories.userId, userId)).orderBy((0, import_drizzle_orm2.asc)(categories.name));
  }
  async createCategory(userId, category) {
    const [newCategory] = await db.insert(categories).values({
      ...category,
      userId
    }).returning();
    return newCategory;
  }
  async updateCategory(userId, categoryId, updates) {
    const [updatedCategory] = await db.update(categories).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.id, categoryId), (0, import_drizzle_orm2.eq)(categories.userId, userId))).returning();
    if (!updatedCategory) {
      throw new Error("Category not found");
    }
    return updatedCategory;
  }
  async deleteCategory(userId, categoryId) {
    await db.update(tasks).set({ categoryId: null }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(tasks.categoryId, categoryId), (0, import_drizzle_orm2.eq)(tasks.userId, userId)));
    await db.delete(categories).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.id, categoryId), (0, import_drizzle_orm2.eq)(categories.userId, userId)));
  }
};
var storage = new DatabaseStorage();

// server/googleAuth.ts
var import_passport = __toESM(require("passport"), 1);
var import_passport_google_oauth20 = require("passport-google-oauth20");
var import_express_session = __toESM(require("express-session"), 1);
var import_connect_pg_simple = __toESM(require("connect-pg-simple"), 1);
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback";
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("\u26A0\uFE0F  Google OAuth credentials not found!");
  console.error("Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file");
  console.error("Visit https://console.cloud.google.com/apis/credentials to create OAuth credentials");
}
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = (0, import_connect_pg_simple.default)(import_express_session.default);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return (0, import_express_session.default)({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function setupGoogleAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(import_passport.default.initialize());
  app2.use(import_passport.default.session());
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    import_passport.default.use(new import_passport_google_oauth20.Strategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const googleUser = {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profileImageUrl: profile.photos?.[0]?.value || null
        };
        await storage.upsertUser(googleUser);
        const user = {
          id: profile.id,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          profileImageUrl: googleUser.profileImageUrl,
          claims: {
            sub: profile.id,
            email: googleUser.email,
            name: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
            picture: googleUser.profileImageUrl
          }
        };
        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        return done(error, false);
      }
    }));
  }
  import_passport.default.serializeUser((user, done) => {
    done(null, user.id);
  });
  import_passport.default.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        const sessionUser = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          claims: {
            sub: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            picture: user.profileImageUrl
          }
        };
        done(null, sessionUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, false);
    }
  });
  app2.get("/api/login", (req, res, next) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: "Google OAuth not configured. Please check your environment variables."
      });
    }
    import_passport.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });
  app2.get(
    "/auth/google/callback",
    import_passport.default.authenticate("google", { failureRedirect: "/login-failed" }),
    (req, res) => {
      res.redirect("/");
    }
  );
  app2.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });
  app2.get("/login-failed", (req, res) => {
    res.send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Login Failed</h2>
        <p>There was an error signing in with Google. Please try again.</p>
        <a href="/" style="color: #4285f4; text-decoration: none;">\u2190 Back to Home</a>
      </div>
    `);
  });
}
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// server/routes.ts
var import_zod = require("zod");
async function registerRoutes(app2) {
  await setupGoogleAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, profileImageUrl } = req.body;
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        profileImageUrl
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories2 = await storage.getCategories(userId);
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, color } = req.body;
      const category = await storage.createCategory(userId, { name, color });
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.patch("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = parseInt(req.params.id);
      const updates = req.body;
      const category = await storage.updateCategory(userId, categoryId, updates);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(userId, categoryId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks2 = await storage.getTasks(userId);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/tasks/today", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = /* @__PURE__ */ new Date();
      console.log("Today's date for query:", today);
      const tasks2 = await storage.getTasksByDate(userId, today);
      console.log("Today's tasks found:", tasks2.length);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ message: "Failed to fetch today's tasks" });
    }
  });
  app2.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Creating task with data:", req.body);
      if (req.body.dueDate) {
        req.body.dueDate = new Date(req.body.dueDate);
      }
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        console.error("Validation errors:", error.errors);
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });
  app2.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      const updates = updateTaskSchema.parse(req.body);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.updateTask(userId, taskId, updates);
      res.json(task);
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Task not found" });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });
  app2.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(userId, taskId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const period = req.query.period || "week";
      const stats = await storage.getTaskStats(userId, period);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  return app2;
}

// api/handler.ts
var app = (0, import_express.default)();
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: false }));
var initialized = false;
var initializeApp = async () => {
  if (initialized) {
    return app;
  }
  try {
    await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      console.error("API Error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    initialized = true;
    return app;
  } catch (error) {
    console.error("Failed to initialize API:", error);
    throw error;
  }
};
async function handler(req, res) {
  try {
    const app2 = await initializeApp();
    return app2(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error"
    }));
  }
}
var handler_default = handler;

module.exports = handler;
module.exports.default = handler;
