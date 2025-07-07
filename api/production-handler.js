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

    // Initialize database connection
    let db;
    if (process.env.DATABASE_URL) {
      try {
        const { Pool } = await import('@neondatabase/serverless');
        db = new Pool({ connectionString: process.env.DATABASE_URL });
        
        // Initialize tables if they don't exist
        await initializeTables(db);
      } catch (error) {
        console.error('Database connection error:', error);
        // Fall back to in-memory storage if DB fails
        db = null;
      }
    }

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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: missingVars.length === 0 ? 'ok' : 'missing_env_vars',
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'fallback_mode',
        environment: {
          variables: envVars,
          missing: missingVars,
          vercel: !!process.env.VERCEL,
          region: process.env.VERCEL_REGION || 'unknown'
        },
        message: missingVars.length === 0 
          ? 'All environment variables are set'
          : `Missing environment variables: ${missingVars.join(', ')}`
      }, null, 2));
      return;
    }

    // Tasks endpoints
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        let tasks;
        if (db) {
          try {
            const result = await db.query(`
              SELECT t.*, c.name as category_name, c.color as category_color 
              FROM tasks t 
              LEFT JOIN categories c ON t.category_id = c.id 
              WHERE t.user_id = 1 
              ORDER BY t.created_at DESC
            `);
            tasks = result.rows.map(row => ({
              id: row.id,
              title: row.title,
              description: row.description,
              completed: row.completed,
              priority: row.priority,
              categoryId: row.category_id,
              userId: row.user_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              dueDate: row.due_date,
              category: row.category_name ? {
                name: row.category_name,
                color: row.category_color
              } : null
            }));
          } catch (error) {
            console.error('Database query error:', error);
            tasks = getDefaultTasks();
          }
        } else {
          tasks = getDefaultTasks();
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(tasks));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
          try {
            const taskData = JSON.parse(body);
            const newTask = {
              id: Date.now(),
              title: taskData.title || 'New Task',
              description: taskData.description || '',
              completed: false,
              priority: taskData.priority || 'medium',
              categoryId: taskData.categoryId || 1,
              userId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              dueDate: taskData.dueDate || null
            };

            if (db) {
              try {
                await db.query(`
                  INSERT INTO tasks (id, title, description, completed, priority, category_id, user_id, created_at, updated_at, due_date)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [
                  newTask.id, newTask.title, newTask.description, newTask.completed,
                  newTask.priority, newTask.categoryId, newTask.userId,
                  newTask.createdAt, newTask.updatedAt, newTask.dueDate
                ]);
              } catch (error) {
                console.error('Database insert error:', error);
              }
            }

            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(newTask));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
          }
        });
        return;
      }
    }

    // Today's tasks endpoint
    if (url.pathname === '/api/tasks/today') {
      let tasks;
      if (db) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const result = await db.query(`
            SELECT t.*, c.name as category_name, c.color as category_color 
            FROM tasks t 
            LEFT JOIN categories c ON t.category_id = c.id 
            WHERE t.user_id = 1 AND (
              DATE(t.due_date) = $1 OR 
              DATE(t.created_at) = $1
            )
            ORDER BY t.created_at DESC
          `, [today]);
          tasks = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            completed: row.completed,
            priority: row.priority,
            categoryId: row.category_id,
            userId: row.user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            dueDate: row.due_date
          }));
        } catch (error) {
          console.error('Database query error:', error);
          tasks = getDefaultTasks();
        }
      } else {
        tasks = getDefaultTasks();
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasks));
      return;
    }

    // Categories endpoint
    if (url.pathname === '/api/categories') {
      if (req.method === 'GET') {
        let categories;
        if (db) {
          try {
            const result = await db.query('SELECT * FROM categories WHERE user_id = 1 ORDER BY created_at ASC');
            categories = result.rows;
          } catch (error) {
            console.error('Database query error:', error);
            categories = getDefaultCategories();
          }
        } else {
          categories = getDefaultCategories();
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(categories));
        return;
      }
    }

    // Stats endpoint
    if (url.pathname === '/api/stats') {
      let stats;
      if (db) {
        try {
          const result = await db.query(`
            SELECT 
              COUNT(*) as total_tasks,
              COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
              COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks
            FROM tasks WHERE user_id = 1
          `);
          const row = result.rows[0];
          stats = {
            totalTasks: parseInt(row.total_tasks),
            completedTasks: parseInt(row.completed_tasks),
            pendingTasks: parseInt(row.pending_tasks),
            overdueTasks: 0,
            completionRate: row.total_tasks > 0 ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0,
            period: url.searchParams.get('period') || 'week',
            chartData: generateChartData()
          };
        } catch (error) {
          console.error('Database query error:', error);
          stats = getDefaultStats();
        }
      } else {
        stats = getDefaultStats();
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(stats));
      return;
    }

    // OAuth and Auth endpoints (keeping existing logic)
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
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });

        const userData = await userResponse.json();
        
        if (!userResponse.ok) {
          throw new Error(`User info fetch failed: ${userData.error_description || userData.error}`);
        }

        console.log('OAuth success:', userData);
        
        res.statusCode = 302;
        res.setHeader('Location', '/home?login=success&user=' + encodeURIComponent(userData.name || userData.email));
        res.end();
        return;
        
      } catch (oauthError) {
        console.error('OAuth callback error:', oauthError);
        res.statusCode = 302;
        res.setHeader('Location', '/?error=oauth_failed&message=' + encodeURIComponent(oauthError.message));
        res.end();
        return;
      }
    }

    if (url.pathname === '/api/auth/user') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        id: 1,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        isAuthenticated: true
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
        '/api/health', '/api/login', '/api/auth/user', 
        '/api/tasks', '/api/tasks/today', '/api/categories', '/api/stats',
        '/auth/google/callback'
      ]
    }));

  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }));
  }
}

async function initializeTables(db) {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create tasks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGINT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) DEFAULT 'medium',
        category_id INTEGER REFERENCES categories(id),
        user_id INTEGER REFERENCES users(id),
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default user if not exists
    await db.query(`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES (1, 'user@example.com', 'User', 'Name')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert default categories if not exists
    const categories = [
      { id: 1, name: 'Work', color: '#3B82F6' },
      { id: 2, name: 'Personal', color: '#10B981' },
      { id: 3, name: 'Shopping', color: '#F59E0B' },
      { id: 4, name: 'Health', color: '#EF4444' },
      { id: 5, name: 'Learning', color: '#8B5CF6' }
    ];

    for (const cat of categories) {
      await db.query(`
        INSERT INTO categories (id, name, color, user_id)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (id) DO NOTHING
      `, [cat.id, cat.name, cat.color]);
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

function getDefaultTasks() {
  return [
    {
      id: 1,
      title: "Welcome to VoXa!",
      description: "This is your first task. Try creating more tasks using voice commands or the manual task button.",
      completed: false,
      priority: "medium",
      categoryId: 1,
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function getDefaultCategories() {
  return [
    { id: 1, name: "Work", color: "#3B82F6", userId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, name: "Personal", color: "#10B981", userId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 3, name: "Shopping", color: "#F59E0B", userId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 4, name: "Health", color: "#EF4444", userId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 5, name: "Learning", color: "#8B5CF6", userId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
}

function getDefaultStats() {
  return {
    totalTasks: 1,
    completedTasks: 0,
    pendingTasks: 1,
    overdueTasks: 0,
    completionRate: 0,
    period: 'week',
    chartData: generateChartData()
  };
}

function generateChartData() {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 5),
      created: Math.floor(Math.random() * 8)
    });
  }
  return data;
}
