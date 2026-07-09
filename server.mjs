// Local development server — mirrors the Vercel API for localhost OAuth flow
// Run alongside Vite: node server.js (or via npm run dev:server)
// Callback URL to register in Google Cloud Console: http://localhost:5000/auth/google/callback

import express from 'express';
import cors from 'cors';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import {
  pgTable, text, varchar, timestamp, jsonb, index,
  serial, boolean, integer
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import ws from 'ws';
import { Resend } from 'resend';
import * as ics from 'ics';
import Groq from 'groq-sdk';
import webpush from 'web-push';

dotenv.config();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@voxa.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

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

const events = pgTable('events', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  allDay: boolean('all_day').notNull().default(false),
  location: text('location'),
  meetingLink: text('meeting_link'),
  recurringPattern: varchar('recurring_pattern', { enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'] }).default('none'),
  reminders: jsonb('reminders'),
  guests: jsonb('guests'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  parentId: integer("parent_id"),
  color: varchar("color", { length: 7 }).default("#6B7280"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const notes = pgTable("notes", {
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { tasks, categories, users, events, folders, notes } });

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

app.get('/api/users/lookup', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (foundUsers.length > 0) {
    const user = foundUsers[0];
    res.json({ name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email });
  } else {
    res.json({ name: null });
  }
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
// --- Events Routes ---
app.get('/api/events', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const userEvents = await db.select().from(events).where(eq(events.userId, userId)).orderBy(desc(events.startTime));
  res.json(userEvents);
});

app.post('/api/events', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const e = req.body;
  const newEvent = await db.insert(events).values({
    userId, 
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
      status: 'CONFIRMED',
      organizer: { name: 'VoXa Calendar', email: 'onboarding@resend.dev' },
    };
    
    if (e.description) icsEvent.description = e.description;
    if (e.location) icsEvent.location = e.location;
    if (e.meetingLink) icsEvent.url = e.meetingLink;
    
    const { error, value } = ics.createEvent(icsEvent);
    
    if (error) {
      console.error('ICS creation error:', error);
    } else {
      const attachments = [{
        filename: 'invite.ics',
        content: value,
        type: 'text/calendar'
      }];
      
      for (const guest of e.guests) {
        try {
          await resend.emails.send({
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
          console.log(`[VoXa API] Sent calendar invite to ${guest.email}`);
        } catch (err) {
          console.error(`[VoXa API] Failed to send email to ${guest.email}:`, err);
        }
      }
    }
  } else if (e.guests && e.guests.length > 0) {
    console.log('[VoXa API] Guests were invited, but RESEND_API_KEY is not set. Skipping emails.');
  }

  res.status(201).json(newEvent[0]);
});

app.patch('/api/events/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const eventId = parseInt(req.params.id);
  const updates = { ...req.body };
  if (updates.startTime) updates.startTime = new Date(updates.startTime);
  if (updates.endTime) updates.endTime = new Date(updates.endTime);
  updates.updatedAt = new Date();

  const updated = await db.update(events).set(updates)
    .where(and(eq(events.id, eventId), eq(events.userId, userId))).returning();
  if (!updated.length) return res.status(404).json({ error: 'Event not found' });
  res.json(updated[0]);
});

app.delete('/api/events/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const eventId = parseInt(req.params.id);
  const deleted = await db.delete(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId))).returning();
  if (!deleted.length) return res.status(404).json({ error: 'Event not found' });
  res.json({ success: true });
});

// --- Web Push Routes ---
app.post('/api/push/subscribe', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  
  // Delete existing if any (prevent duplicates)
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, subscription.endpoint)));
  
  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
  res.status(201).json({ success: true });
});

app.get('/api/cron/alarms', async (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) return res.status(500).json({ error: 'VAPID keys missing' });
  
  try {
    const now = new Date();
    const nowTs = now.getTime();
    
    // Fetch all active subscriptions
    const allSubs = await db.select().from(pushSubscriptions);
    if (!allSubs.length) return res.json({ status: 'no_subscriptions' });
    
    // Fetch all tasks and events
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
      
      // 1. Start of Day (8:00 AM)
      if (now.getHours() === 8 && now.getMinutes() === 0 && targetDate.toDateString() === now.toDateString()) {
        shouldNotify = true;
        title = "🌅 Morning Brief";
        body = `"${item.title}" is scheduled for today.`;
      }
      
      // 2. Intervals
      const intervals = [30, 15, 5];
      const reachedInterval = intervals.find(mins => diffMinutes <= mins && diffMinutes > mins - 1);
      
      if (reachedInterval !== undefined) {
        shouldNotify = true;
        body = `"${item.title}" is coming up in ${reachedInterval} minutes!`;
      }
      
      // 3. Manual Tasks
      if (!isEvent && item.reminderType === 'manual' && item.reminderTime) {
        const [targetH, targetM] = item.reminderTime.split(':').map(Number);
        if (now.getHours() === targetH && now.getMinutes() === targetM && targetDate.toDateString() === now.toDateString()) {
          shouldNotify = true;
          title = "🔔 Scheduled Alert";
          body = `Reminder for "${item.title}"`;
        }
      }
      
      if (shouldNotify) {
        // Find subscriptions for this user
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
});

// --- Notes Routes ---
app.get('/api/notes', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const userNotes = await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(asc(notes.order), desc(notes.updatedAt));
  res.json(userNotes);
});

app.patch('/api/notes/reorder', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const { updates } = req.body; // updates is an array of { id, order }

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Updates must be an array' });
  }

  try {
    for (const update of updates) {
      await db.update(notes)
        .set({ order: update.order, updatedAt: new Date() })
        .where(and(eq(notes.id, update.id), eq(notes.userId, userId)));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const n = req.body;
  const newNote = await db.insert(notes).values({
    userId,
    title: n.title || 'Untitled Note',
    content: n.content || '',
    folderId: n.folderId || null,
    isPinned: n.isPinned || false
  }).returning();
  res.status(201).json(newNote[0]);
});

app.patch('/api/notes/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const noteId = parseInt(req.params.id);
  const updates = { ...req.body, updatedAt: new Date() };

  const updated = await db.update(notes).set(updates)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId))).returning();
  if (!updated.length) return res.status(404).json({ error: 'Note not found' });
  res.json(updated[0]);
});

app.delete('/api/notes/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const noteId = parseInt(req.params.id);
  const deleted = await db.delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId))).returning();
  if (!deleted.length) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
});

// --- AI Endpoint ---
app.post("/api/ai/format", async (req, res) => {
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
    return res.status(200).json({ content: newContent });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let prompt = "";
    let systemPrompt = "You are a helpful AI formatting assistant. You must ONLY output the requested HTML, nothing else. Do not wrap it in markdown code blocks. Just raw HTML.";

    if (action === "summarize") {
      prompt = `Summarize the following text into 3 concise bullet points. Output ONLY a <ul> tag containing the <li> elements.\n\nText: ${rawText}`;
    } else if (action === "polish") {
      prompt = `Fix any grammar errors and polish the vocabulary of the following text to make it sound professional but keep the original meaning. Output ONLY a <p> tag containing the polished text.\n\nText: ${rawText}`;
    } else if (action === "task") {
      prompt = `Extract all actionable tasks from the following text. Output ONLY a <ul data-type="taskList"> containing <li data-type="taskItem" data-checked="false"><p>Task text</p></li> elements.\n\nText: ${rawText}`;
    }
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });
    
    let aiHtml = chatCompletion.choices[0]?.message?.content || "";
    // Clean up markdown formatting if present
    aiHtml = aiHtml.replace(/```html/g, '').replace(/```/g, '').trim();

    if (action === "summarize") {
      newContent = `<div style="background: rgba(59,130,246,0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #3b82f6; margin-bottom: 1rem;"><strong>🤖 AI Summary:</strong><br/>${aiHtml}</div>` + content;
    } else if (action === "polish") {
      newContent = `<p>✨ <em>Polished Note:</em></p>${aiHtml}`;
    } else if (action === "task") {
      newContent = aiHtml + content;
    }
    
    res.status(200).json({ content: newContent });
    } catch (error) {
      console.error("Groq AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI request" });
    }
});

app.post("/api/ai/command", async (req, res) => {
  const { transcript, context } = req.body;
  
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured." });
  }

  const systemPrompt = `You are the VoXa Full Voice Mode AI Assistant. Your job is to translate a user's voice command into a structured JSON array of actions.
You have access to the following actions:
- { "action": "CREATE_TASK", "title": string, "priority": "low"|"medium"|"high", "deadline": string (ISO), "categoryId": number (optional) }
- { "action": "UPDATE_TASK", "id": number, "updates": { "title": string, "priority": "low"|"medium"|"high", "deadline": string (ISO), "completed": boolean } }
- { "action": "DELETE_TASK", "id": number }
- { "action": "CREATE_NOTE", "title": string, "content": string }
- { "action": "UPDATE_NOTE", "id": number, "updates": { "title": string, "content": string } }
- { "action": "DELETE_NOTE", "id": number }
- { "action": "PIN_NOTE", "id": number }
- { "action": "SUMMARIZE_NOTE", "id": number }
- { "action": "POLISH_NOTE", "id": number }
- { "action": "CREATE_EVENT", "title": string, "startTime": string (ISO), "endTime": string (ISO), "allDay": boolean }
- { "action": "DELETE_EVENT", "id": number }
- { "action": "NAVIGATE", "destination": "/home"|"/tasks"|"/calendar"|"/notes"|"/stats" }
- { "action": "OPEN_MODAL", "modalName": "new_task"|"settings"|"notifications" }
- { "action": "UPDATE_PROFILE", "firstName": string, "lastName": string }
- { "action": "TOGGLE_SETTING", "setting": "alarm_sound", "value": boolean }

Use the provided context (tasks, notes, events, categories) to resolve references (e.g., 'the last task', 'my meeting note') to their actual IDs.
Important: The user's command is transcribed from speech and may contain phonetic misspellings or homophones (e.g., "right a note" instead of "write a note", or "cancel meat in" instead of "cancel meeting"). Infer the most logical intent based on the context.
Output ONLY a JSON object with a single key "actions" containing an array of action objects. Do not add any markdown formatting.`;

  const userPrompt = `Context: ${JSON.stringify(context)}
  
User Command: "${transcript}"`;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    const aiOutput = chatCompletion.choices[0]?.message?.content || '{"actions":[]}';
    const parsed = JSON.parse(aiOutput);
    res.status(200).json(parsed);
  } catch (error) {
    console.error("Groq AI Command Error:", error);
    res.status(500).json({ error: error.message || "Failed to process AI command" });
  }
});

// --- Folders Routes ---
app.get('/api/folders', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const userFolders = await db.select().from(folders).where(eq(folders.userId, userId)).orderBy(desc(folders.createdAt));
  res.json(userFolders);
});

app.post('/api/folders', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const f = req.body;
  const newFolder = await db.insert(folders).values({
    userId,
    name: f.name,
    parentId: f.parentId || null,
    color: f.color || '#6B7280'
  }).returning();
  res.status(201).json(newFolder[0]);
});

app.patch('/api/folders/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const folderId = parseInt(req.params.id);
  const updates = { ...req.body, updatedAt: new Date() };

  const updated = await db.update(folders).set(updates)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId))).returning();
  if (!updated.length) return res.status(404).json({ error: 'Folder not found' });
  res.json(updated[0]);
});

app.delete('/api/folders/:id', async (req, res) => {
  const userId = await ensureMockUser(db, users, categories);
  const folderId = parseInt(req.params.id);
  const deleted = await db.delete(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId))).returning();
  if (!deleted.length) return res.status(404).json({ error: 'Folder not found' });
  res.json({ success: true });
});
