// Local development server — mirrors the Vercel API for localhost OAuth flow
// Run alongside Vite: node server.js (or via npm run dev:server)
// Callback URL to register in Google Cloud Console: http://localhost:5000/auth/google/callback

import express from 'express';
import cors from 'cors';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, desc } from 'drizzle-orm';
import {
  pgTable, text, varchar, timestamp, jsonb, index,
  serial, boolean, integer
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ws from 'ws';

dotenv.config();

// ─── Schema (same as api/index.js) ──────────────────────────────────────────
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;

const sessions = pgTable('sessions', {
  sid: varchar('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire').notNull(),
}, (t) => [index('IDX_session_expire').on(t.expire)]);

const users = pgTable('users', {
  id: varchar('id').primaryKey().notNull(),
  email: varchar('email').unique(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: varchar('priority', { enum: ['high', 'medium', 'low'] }).notNull().default('medium'),
  completed: boolean('completed').notNull().default(false),
  dueDate: timestamp('due_date'),
  isRecurring: boolean('is_recurring').notNull().default(false),
  recurringPattern: varchar('recurring_pattern', { enum: ['daily', 'weekly', 'monthly'] }),
  reminderEnabled: boolean('reminder_enabled').notNull().default(true),
  reminderType: varchar('reminder_type', { enum: ['manual', 'morning', 'default'] }).notNull().default('default'),
  reminderTime: varchar('reminder_time'),
  lastNotified: timestamp('last_notified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { tasks, categories, users } });

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
// For local dev, use localhost callback
const LOCAL_CALLBACK = `http://localhost:${PORT}/auth/google/callback`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function ensureMockUser(db, users, categories) {
  const allUsers = await db.select().from(users).orderBy(desc(users.updatedAt));
  const realUsers = allUsers.filter(u => u.email !== 'demo@voxa.app');
  if (realUsers.length > 0) return realUsers[0].id;

  const mock = allUsers.find(u => u.id === 'user_1');
  if (mock) return 'user_1';

  await db.insert(users).values({ id: 'user_1', email: 'demo@voxa.app', firstName: 'Demo', lastName: 'User' });
  const defaults = [
    { name: 'Work', color: '#3B82F6' }, { name: 'Personal', color: '#10B981' },
    { name: 'Shopping', color: '#F59E0B' }, { name: 'Health', color: '#EF4444' },
    { name: 'Learning', color: '#8B5CF6' },
  ];
  for (const c of defaults) {
    try { await db.insert(categories).values({ userId: 'user_1', ...c }); } catch {}
  }
  return 'user_1';
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.get('/api/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: LOCAL_CALLBACK,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect(`http://localhost:5173/?error=oauth_error&message=${encodeURIComponent('OAuth failed')}`);
  }
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: LOCAL_CALLBACK,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access_token');

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    await db.insert(users).values({
      id: userData.id, email: userData.email,
      firstName: userData.given_name, lastName: userData.family_name,
      profileImageUrl: userData.picture,
    }).onConflictDoUpdate({
      target: users.id,
      set: { email: userData.email, firstName: userData.given_name, lastName: userData.family_name, profileImageUrl: userData.picture, updatedAt: new Date() },
    });

    const existing = await db.select().from(categories).where(eq(categories.userId, userData.id));
    if (existing.length === 0) {
      const defaults = [
        { name: 'Work', color: '#3B82F6' }, { name: 'Personal', color: '#10B981' },
        { name: 'Shopping', color: '#F59E0B' }, { name: 'Health', color: '#EF4444' },
        { name: 'Learning', color: '#8B5CF6' },
      ];
      for (const c of defaults) {
        try { await db.insert(categories).values({ userId: userData.id, ...c }); } catch {}
      }
    }

    // Redirect back to the Vite dev server with login params
    res.redirect(`http://localhost:5173/home?login=success&user=${encodeURIComponent(userData.name || userData.email)}&email=${encodeURIComponent(userData.email)}`);
  } catch (err) {
    console.error('OAuth error:', err);
    res.redirect(`http://localhost:5173/?error=oauth_failed&message=${encodeURIComponent(err.message)}`);
  }
});

// ─── API Routes (proxied from Vite) ──────────────────────────────────────────
app.get('/api/profile', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const profile = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!profile.length) return res.status(404).json({ error: 'Not found' });
  res.json(profile[0]);
});

app.patch('/api/profile', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const { firstName, lastName, profileImageUrl } = req.body;
  const updated = await db.update(users).set({ firstName, lastName, profileImageUrl, updatedAt: new Date() })
  .where(eq(users.id, userId)).returning();
  res.json(updated[0]);
});

app.get('/api/tasks', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  res.json(userTasks);
});

app.post('/api/tasks', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const t = req.body;
  const newTask = await db.insert(tasks).values({
    userId, title: t.title, description: t.description || null,
    completed: t.completed || false, priority: t.priority || 'medium',
    categoryId: t.categoryId || null, dueDate: t.dueDate ? new Date(t.dueDate) : null,
    isRecurring: t.isRecurring || false, recurringPattern: t.recurringPattern || null,
    reminderEnabled: t.reminderEnabled ?? true, reminderType: t.reminderType || 'default',
    reminderTime: t.reminderTime || null,
  }).returning();
  res.status(201).json(newTask[0]);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const id = parseInt(req.params.id);
  const updates = { ...req.body };
  if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
  const updated = await db.update(tasks).set({ ...updates, updatedAt: new Date() })
  .where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();
  if (!updated.length) return res.status(404).json({ error: 'Not found' });
  res.json(updated[0]);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const id = parseInt(req.params.id);
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  res.json({ success: true });
});

app.get('/api/categories', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const cats = await db.select().from(categories).where(eq(categories.userId, userId)).orderBy(desc(categories.createdAt));
  res.json(cats);
});

app.post('/api/categories', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const { name, color } = req.body;
  const newCat = await db.insert(categories).values({ userId, name, color }).returning();
  res.status(201).json(newCat[0]);
});

app.patch('/api/categories/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const id = parseInt(req.params.id);
  const updated = await db.update(categories).set({ ...req.body, updatedAt: new Date() })
  .where(and(eq(categories.id, id), eq(categories.userId, userId))).returning();
  res.json(updated[0]);
});

app.delete('/api/categories/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const id = parseInt(req.params.id);
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
  res.json({ success: true });
});

app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', env: 'local-dev' });
});

app.listen(PORT, () => {
  console.log(`\n✅ VoXa Local API Server running on http://localhost:${PORT}`);
  console.log(`   Google OAuth callback: ${LOCAL_CALLBACK}`);
  console.log(`   👉 Register this in Google Cloud Console → Credentials → OAuth 2.0 → Authorized redirect URIs\n`);
});
