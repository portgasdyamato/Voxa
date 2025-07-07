import { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'https://voxa-taupe.vercel.app/auth/google/callback'
          })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          console.error('Token exchange failed:', tokenData);
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
          console.error('User info fetch failed:', userData);
          throw new Error(`User info fetch failed: ${userData.error_description || userData.error}`);
        }

        console.log('OAuth success for user:', userData.email);

        // Redirect to home with success
        res.statusCode = 302;
        res.setHeader('Location', '/?login=success&user=' + encodeURIComponent(userData.name || userData.email));
        res.end();
        return;
        
      } catch (oauthError) {
        console.error('OAuth callback error:', oauthError);
        res.statusCode = 302;
        res.setHeader('Location', '/?error=oauth_callback_failed&message=' + encodeURIComponent(oauthError instanceof Error ? oauthError.message : 'Unknown OAuth error'));
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
        const { Pool } = await import('@neondatabase/serverless');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        
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
        console.error('Database error:', dbError);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Database connection failed',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error'
        }));
        return;
      }
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

    // Default response for unknown endpoints
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${url.pathname} not found`,
      availableEndpoints: ['/api/health', '/api/oauth-debug', '/api/login', '/api/test-db', '/auth/google/callback']
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
