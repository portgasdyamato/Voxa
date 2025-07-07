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
    console.log('Request URL:', url.pathname);

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
      // For now, we'll check if there's a login success parameter
      // In a full implementation, this would check a session/JWT token
      const urlParams = new URLSearchParams(url.search);
      const loginSuccess = urlParams.get('login');
      
      if (loginSuccess === 'success') {
        // Mock user data for now
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
      
      // No authentication found
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Not authenticated',
        message: 'User is not logged in'
      }));
      return;
    }

    // Tasks endpoints
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        // Mock tasks data for now
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
          {
            id: 1,
            title: "Welcome to VoXa!",
            description: "This is your first task. Try creating more tasks using voice commands or the manual task button.",
            completed: false,
            priority: "medium",
            categoryId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
          }
        ]));
        return;
      }
      
      if (req.method === 'POST') {
        // Mock task creation
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: Date.now(),
          title: "New Task",
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        return;
      }
    }

    // Today's tasks endpoint
    if (url.pathname === '/api/tasks/today') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        {
          id: 1,
          title: "Welcome to VoXa!",
          description: "This is your first task. Try creating more tasks using voice commands or the manual task button.",
          completed: false,
          priority: "medium",
          categoryId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: new Date().toISOString()
        }
      ]));
      return;
    }

    // Categories endpoint
    if (url.pathname === '/api/categories') {
      if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
          { id: 1, name: "Work", color: "#3B82F6", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 2, name: "Personal", color: "#10B981", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 3, name: "Shopping", color: "#F59E0B", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 4, name: "Health", color: "#EF4444", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 5, name: "Learning", color: "#8B5CF6", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]));
        return;
      }
      
      if (req.method === 'POST') {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: Date.now(),
          name: "New Category",
          color: "#3B82F6",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        return;
      }
    }

    // Stats endpoint
    if (url.pathname === '/api/stats') {
      const period = url.searchParams.get('period') || 'week';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        totalTasks: 5,
        completedTasks: 2,
        pendingTasks: 3,
        overdueTasks: 0,
        completionRate: 40,
        period: period,
        chartData: [
          { date: '2025-01-01', completed: 2, created: 3 },
          { date: '2025-01-02', completed: 1, created: 2 },
          { date: '2025-01-03', completed: 0, created: 1 },
          { date: '2025-01-04', completed: 1, created: 1 },
          { date: '2025-01-05', completed: 3, created: 2 },
          { date: '2025-01-06', completed: 2, created: 4 },
          { date: '2025-01-07', completed: 1, created: 1 }
        ]
      }));
      return;
    }

    // Handle task updates and deletes
    if (url.pathname.startsWith('/api/tasks/') && url.pathname !== '/api/tasks/today') {
      const taskId = url.pathname.split('/')[3];
      
      if (req.method === 'PUT') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: parseInt(taskId),
          title: "Updated Task",
          completed: true,
          updatedAt: new Date().toISOString()
        }));
        return;
      }
      
      if (req.method === 'DELETE') {
        res.statusCode = 204;
        res.end();
        return;
      }
    }

    // Handle category updates and deletes
    if (url.pathname.startsWith('/api/categories/')) {
      const categoryId = url.pathname.split('/')[3];
      
      if (req.method === 'PUT') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: parseInt(categoryId),
          name: "Updated Category",
          color: "#3B82F6",
          updatedAt: new Date().toISOString()
        }));
        return;
      }
      
      if (req.method === 'DELETE') {
        res.statusCode = 204;
        res.end();
        return;
      }
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
