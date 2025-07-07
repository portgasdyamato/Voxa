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
    console.log('Request:', req.method, url.pathname);

    // Health check endpoint
    if (url.pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'API is working'
      }));
      return;
    }

    // Auth endpoints
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

      res.statusCode = 302;
      res.setHeader('Location', googleAuthUrl);
      res.end();
      return;
    }

    // OAuth callback
    if (url.pathname === '/auth/google/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        res.statusCode = 302;
        res.setHeader('Location', '/?error=oauth_error&message=' + encodeURIComponent(error));
        res.end();
        return;
      }

      if (!code) {
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

    // Simple working tasks endpoint
    if (url.pathname === '/api/tasks') {
      if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
          {
            id: 1,
            title: "Welcome to VoXa!",
            description: "This is your first task. Create more tasks using voice commands!",
            completed: false,
            priority: "medium",
            categoryId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ]));
        return;
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const taskData = JSON.parse(body);
            console.log('Creating task:', taskData);
            
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              id: Date.now(),
              title: taskData.title || "New Task",
              description: taskData.description || "",
              completed: false,
              priority: taskData.priority || "medium",
              categoryId: taskData.categoryId || 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              dueDate: taskData.dueDate || null
            }));
          } catch (error) {
            console.error('Task creation error:', error);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid task data' }));
          }
        });
        return;
      }
    }

    // Today's tasks
    if (url.pathname === '/api/tasks/today') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        {
          id: 1,
          title: "Welcome to VoXa!",
          description: "This is your first task. Create more tasks using voice commands!",
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
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        totalTasks: 5,
        completedTasks: 2,
        pendingTasks: 3,
        overdueTasks: 0,
        completionRate: 40,
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

    // Default 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${url.pathname} not found`
    }));

  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }));
  }
}
