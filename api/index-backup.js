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
  // Skip if no database URL
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, skipping database initialization');
    return;
  }

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

// Initialize demo user and data
async function initDemoUser() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const demoUser = await createOrGetUser({
      email: 'demo@voxa.app',
      firstName: 'Demo',
      lastName: 'User',
      googleId: 'demo-user'
    });

    // Create a welcome task if it doesn't exist
    const client = getPool();
    const existingTasks = await client.query(
      'SELECT * FROM tasks WHERE user_id = $1 AND title = $2',
      [demoUser.id, 'Welcome to VoXa!']
    );

    if (existingTasks.rows.length === 0) {
      await client.query(
        `INSERT INTO tasks (title, description, completed, priority, user_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'Welcome to VoXa!',
          'This is your first task. Try creating more tasks using voice commands or the manual task button.',
          false,
          'medium',
          demoUser.id
        ]
      );
    }

    return demoUser;
  } catch (error) {
    console.error('Demo user initialization error:', error);
    return null;
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

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    console.log('Request URL:', url.pathname, 'Method:', req.method);

    // Initialize database on first call
    await initDatabase();

    // Initialize demo user if database is available
    const demoUser = await initDemoUser();
    
    // Mock user for now (in production, get from session/JWT)
    const currentUser = demoUser || {
      id: 1,
      email: 'demo@voxa.app',
      firstName: 'Demo',
      lastName: 'User'
    };

    // Health check endpoint
    if (url.pathname === '/api/health') {
      const envVars = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        SESSION_SECRET: !!process.env.SESSION_SECRET,
        NODE_ENV: process.env.NODE_ENV || 'unknown'
      };
      
      const missingVars = Object.entries(envVars)
        .filter(([key, value]) => key !== 'NODE_ENV' && key !== 'GOOGLE_CALLBACK_URL' && !value)
        .map(([key]) => key);

      // Test database connection if DATABASE_URL is available
      let dbStatus = 'not_configured';
      if (process.env.DATABASE_URL) {
        try {
          const testClient = getPool();
          await testClient.query('SELECT 1');
          dbStatus = 'connected';
        } catch (error) {
          dbStatus = `connection_error: ${error.message}`;
        }
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: missingVars.length === 0 ? 'ok' : 'missing_env_vars',
        timestamp: new Date().toISOString(),
        environment: {
          variables: envVars,
          missing: missingVars,
          vercel: !!process.env.VERCEL,
          region: process.env.VERCEL_REGION || 'unknown'
        },
        database: {
          status: dbStatus,
          url_configured: !!process.env.DATABASE_URL
        },
        message: missingVars.length === 0 
          ? 'All environment variables are set'
          : `Missing environment variables: ${missingVars.join(', ')}`
      }, null, 2));
      return;
    }

    // Test database endpoint
    if (url.pathname === '/api/test-db') {
      if (!process.env.DATABASE_URL) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'no_database_url',
          message: 'DATABASE_URL environment variable not set'
        }));
        return;
      }

      try {
        const client = getPool();
        
        // Test basic connection
        await client.query('SELECT 1');
        
        // Test tables exist
        const tables = await client.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        
        // Test user count
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        
        // Test category count
        const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
        
        // Test task count
        const taskCount = await client.query('SELECT COUNT(*) FROM tasks');
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'success',
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            tables: tables.rows.map(row => row.table_name),
            counts: {
              users: parseInt(userCount.rows[0].count),
              categories: parseInt(categoryCount.rows[0].count),
              tasks: parseInt(taskCount.rows[0].count)
            }
          }
        }, null, 2));
        return;
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
        return;
      }
    }

    // Skip database operations if no DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      // Return mock data for development
      const mockData = {
        tasks: [
          {
            id: 1,
            title: "Welcome to VoXa!",
            description: "This is your first task. Try creating more tasks using voice commands or the manual task button.",
            completed: false,
            priority: "medium",
            category_id: 1,
            category_name: "Work",
            category_color: "#3B82F6",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        categories: [
          { id: 1, name: "Work", color: "#3B82F6", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, name: "Personal", color: "#10B981", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 3, name: "Shopping", color: "#F59E0B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 4, name: "Health", color: "#EF4444", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 5, name: "Learning", color: "#8B5CF6", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]
      };

      if (url.pathname === '/api/tasks') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mockData.tasks));
        return;
      }

      if (url.pathname === '/api/categories') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mockData.categories));
        return;
      }

      if (url.pathname === '/api/stats') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          totalTasks: 1,
          completedTasks: 0,
          pendingTasks: 1,
          overdueTasks: 0,
          completionRate: 0,
          period: 'week',
          chartData: []
        }));
        return;
      }
    }

    // Database operations (when DATABASE_URL is available)
    const client = getPool();

    // Tasks endpoints
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        const todayOnly = url.searchParams.get('today') === 'true';
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
        
        const result = await client.query(query, [currentUser.id]);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.rows));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const taskData = JSON.parse(body);
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
                currentUser.id
              ]
            );
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.rows[0]));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }
    }

    // Task by ID endpoints
    if (url.pathname.startsWith('/api/tasks/') && url.pathname !== '/api/tasks/today') {
      const taskId = url.pathname.split('/')[3];
      
      if (req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const updates = JSON.parse(body);
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
                currentUser.id
              ]
            );
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.rows[0]));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }
      
      if (req.method === 'DELETE') {
        try {
          await client.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, currentUser.id]
          );
          res.statusCode = 204;
          res.end();
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message }));
        }
        return;
      }
    }

    // Categories endpoints
    if (url.pathname === '/api/categories') {
      if (req.method === 'GET') {
        const result = await client.query(
          'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at',
          [currentUser.id]
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.rows));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const categoryData = JSON.parse(body);
            const result = await client.query(
              'INSERT INTO categories (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
              [categoryData.name, categoryData.color, currentUser.id]
            );
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.rows[0]));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }
    }

    // Stats endpoints
    if (url.pathname === '/api/stats') {
      const period = url.searchParams.get('period') || 'week';
      
      // Get basic stats
      const statsResult = await client.query(
        `SELECT 
           COUNT(*) as total_tasks,
           COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
           COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks,
           COUNT(CASE WHEN due_date < NOW() AND completed = false THEN 1 END) as overdue_tasks
         FROM tasks WHERE user_id = $1`,
        [currentUser.id]
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
        [currentUser.id]
      );

      const stats = statsResult.rows[0];
      const completionRate = stats.total_tasks > 0 
        ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
        : 0;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        totalTasks: parseInt(stats.total_tasks),
        completedTasks: parseInt(stats.completed_tasks),
        pendingTasks: parseInt(stats.pending_tasks),
        overdueTasks: parseInt(stats.overdue_tasks),
        completionRate,
        period,
        chartData: chartResult.rows
      }));
      return;
    }

    // OAuth debug endpoint
    if (url.pathname === '/api/oauth-debug') {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'https://voxa-taupe.vercel.app/auth/google/callback';
      
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        new URLSearchParams({
          client_id: googleClientId || 'NOT_SET',
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'profile email',
          access_type: 'offline',
          prompt: 'consent'
        }).toString();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'debug',
        oauth_config: {
          google_client_id: googleClientId ? `${googleClientId.substring(0, 10)}...` : 'NOT_SET',
          google_client_secret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
          redirect_uri: redirectUri,
          google_auth_url: googleAuthUrl
        },
        instructions: 'Check if the Google OAuth URLs are correctly configured'
      }, null, 2));
      return;
    }

    // Login endpoint - redirect to Google OAuth
    if (url.pathname === '/api/login') {
      if (!process.env.GOOGLE_CLIENT_ID) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Google OAuth not configured',
          message: 'GOOGLE_CLIENT_ID environment variable is missing'
        }));
        return;
      }

      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'https://voxa-taupe.vercel.app/auth/google/callback';
      
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'profile email',
          access_type: 'offline',
          prompt: 'consent'
        }).toString();

      console.log('Redirecting to Google OAuth:', googleAuthUrl);
      
      res.statusCode = 302;
      res.setHeader('Location', googleAuthUrl);
      res.end();
      return;
    }

    // Google OAuth callback
    if (url.pathname === '/auth/google/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        res.statusCode = 302;
        res.setHeader('Location', '/?error=oauth_error&message=' + encodeURIComponent(error));
        res.end();
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        res.statusCode = 302;
        res.setHeader('Location', '/?error=no_code&message=' + encodeURIComponent('No authorization code received'));
        res.end();
        return;
      }

      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'https://voxa-taupe.vercel.app/auth/google/callback'
          })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
        }

        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        const userData = await userResponse.json();
        
        if (!userResponse.ok) {
          throw new Error(`User info fetch failed: ${userData.error_description || userData.error}`);
        }

        console.log('OAuth success:', userData);
        
        // For now, just redirect to home with success
        // In full implementation, we'd save user to database and create session
        res.statusCode = 302;
        res.setHeader('Location', '/home?login=success&user=' + encodeURIComponent(userData.name || userData.email));
        res.end();
        return;
        
      } catch (oauthError) {
        console.error('OAuth callback error:', oauthError);
        res.statusCode = 302;
        res.setHeader('Location', '/?error=oauth_failed&message=' + encodeURIComponent(oauthError instanceof Error ? oauthError.message : 'Unknown OAuth error'));
        res.end();
        return;
      }
    }

    // Test database connection
    if (url.pathname === '/api/test-db') {
      if (!process.env.DATABASE_URL) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Database not configured',
          message: 'DATABASE_URL environment variable is missing'
        }));
        return;
      }

      try {
        // Try to import and test database connection
        const { Pool } = await import('@neondatabase/serverless');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        
        // Simple query to test connection
        const result = await pool.query('SELECT NOW() as current_time');
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          message: 'Database connection successful',
          timestamp: result.rows[0]?.current_time
        }));
        return;
      } catch (dbError) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Database connection failed',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error'
        }));
        return;
      }
    }

    // User authentication check endpoint
    if (url.pathname === '/api/auth/user') {
      // For now, we'll assume user is authenticated if they reach this endpoint
      // In a full implementation, this would check a session/JWT token
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        id: 1,
        email: 'demo@voxa.app',
        firstName: 'Demo',
        lastName: 'User',
        isAuthenticated: true
      }));
      return;
    }

    // Logout endpoint
    if (url.pathname === '/api/logout') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        message: 'Logged out successfully'
      }));
      return;
    }

    // Default response for unknown endpoints
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${url.pathname} not found`,
      availableEndpoints: [
        '/api/health', '/api/oauth-debug', '/api/login', '/api/auth/user', 
        '/api/test-db', '/auth/google/callback', '/api/tasks', '/api/tasks/today', 
        '/api/categories', '/api/stats'
      ]
    }));

  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }));
  }
}
