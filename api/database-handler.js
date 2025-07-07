import { Pool } from '@neondatabase/serverless';

// Initialize database connection
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

// Initialize database tables
async function initDatabase() {
  const client = getPool();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(50) DEFAULT 'medium',
        due_date TIMESTAMP,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// User operations
async function createOrGetUser(userData) {
  const client = getPool();
  
  try {
    // Try to find existing user
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [userData.email]
    );

    if (existingUser.rows.length > 0) {
      return existingUser.rows[0];
    }

    // Create new user
    const newUser = await client.query(
      'INSERT INTO users (email, first_name, last_name, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.email, userData.firstName, userData.lastName, userData.googleId]
    );

    // Create default categories for new user
    const defaultCategories = [
      { name: "Work", color: "#3B82F6" },
      { name: "Personal", color: "#10B981" },
      { name: "Shopping", color: "#F59E0B" },
      { name: "Health", color: "#EF4444" },
      { name: "Learning", color: "#8B5CF6" }
    ];

    for (const category of defaultCategories) {
      await client.query(
        'INSERT INTO categories (name, color, user_id) VALUES ($1, $2, $3)',
        [category.name, category.color, newUser.rows[0].id]
      );
    }

    return newUser.rows[0];
  } catch (error) {
    console.error('User operation error:', error);
    throw error;
  }
}

// Task operations
async function getTasks(userId, todayOnly = false) {
  const client = getPool();
  
  try {
    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM tasks t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = $1
    `;
    
    if (todayOnly) {
      query += ` AND DATE(t.created_at) = CURRENT_DATE`;
    }
    
    query += ` ORDER BY t.created_at DESC`;
    
    const result = await client.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Get tasks error:', error);
    throw error;
  }
}

async function createTask(userId, taskData) {
  const client = getPool();
  
  try {
    const result = await client.query(
      `INSERT INTO tasks (title, description, completed, priority, due_date, category_id, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        taskData.title,
        taskData.description || null,
        taskData.completed || false,
        taskData.priority || 'medium',
        taskData.dueDate || null,
        taskData.categoryId || null,
        userId
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
}

async function updateTask(userId, taskId, updates) {
  const client = getPool();
  
  try {
    const result = await client.query(
      `UPDATE tasks SET 
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       completed = COALESCE($3, completed),
       priority = COALESCE($4, priority),
       due_date = COALESCE($5, due_date),
       category_id = COALESCE($6, category_id),
       updated_at = NOW()
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [
        updates.title,
        updates.description,
        updates.completed,
        updates.priority,
        updates.dueDate,
        updates.categoryId,
        taskId,
        userId
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
}

async function deleteTask(userId, taskId) {
  const client = getPool();
  
  try {
    await client.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return true;
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
}

// Category operations
async function getCategories(userId) {
  const client = getPool();
  
  try {
    const result = await client.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
}

async function createCategory(userId, categoryData) {
  const client = getPool();
  
  try {
    const result = await client.query(
      'INSERT INTO categories (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
      [categoryData.name, categoryData.color, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
}

// Stats operations
async function getTaskStats(userId, period = 'week') {
  const client = getPool();
  
  try {
    // Get basic stats
    const statsResult = await client.query(
      `SELECT 
         COUNT(*) as total_tasks,
         COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
         COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks,
         COUNT(CASE WHEN due_date < NOW() AND completed = false THEN 1 END) as overdue_tasks
       FROM tasks WHERE user_id = $1`,
      [userId]
    );

    // Get chart data based on period
    let dateRange;
    switch (period) {
      case 'month':
        dateRange = '30 days';
        break;
      case 'quarter':
        dateRange = '90 days';
        break;
      default:
        dateRange = '7 days';
    }

    const chartResult = await client.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as created,
         COUNT(CASE WHEN completed = true THEN 1 END) as completed
       FROM tasks 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${dateRange}'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const completionRate = stats.total_tasks > 0 
      ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
      : 0;

    return {
      totalTasks: parseInt(stats.total_tasks),
      completedTasks: parseInt(stats.completed_tasks),
      pendingTasks: parseInt(stats.pending_tasks),
      overdueTasks: parseInt(stats.overdue_tasks),
      completionRate,
      period,
      chartData: chartResult.rows
    };
  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Initialize database on first call
    await initDatabase();

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    console.log('Request:', req.method, url.pathname);

    // Mock user for now (in production, get from session/JWT)
    const currentUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Name'
    };

    // Health check
    if (url.pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        database: process.env.DATABASE_URL ? 'connected' : 'not configured',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Tasks endpoints
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        const tasks = await getTasks(currentUser.id);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(tasks));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const taskData = JSON.parse(body);
            const newTask = await createTask(currentUser.id, taskData);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(newTask));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }
    }

    // Today's tasks
    if (url.pathname === '/api/tasks/today') {
      const tasks = await getTasks(currentUser.id, true);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasks));
      return;
    }

    // Categories
    if (url.pathname === '/api/categories') {
      if (req.method === 'GET') {
        const categories = await getCategories(currentUser.id);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(categories));
        return;
      }
    }

    // Stats
    if (url.pathname === '/api/stats') {
      const period = url.searchParams.get('period') || 'week';
      const stats = await getTaskStats(currentUser.id, period);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(stats));
      return;
    }

    // Default 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }));
  }
}
