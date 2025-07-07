import { IncomingMessage, ServerResponse } from 'http';

// Minimal health check handler that always works
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    
    // Health check endpoint
    if (url.pathname === '/api/health') {
      const envVars = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        SESSION_SECRET: !!process.env.SESSION_SECRET,
        NODE_ENV: process.env.NODE_ENV || 'unknown'
      };
      
      const missingVars = Object.entries(envVars)
        .filter(([key, value]) => key !== 'NODE_ENV' && !value)
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

    // Login endpoint - simple redirect
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

      const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'https://voxa-taupe.vercel.app/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=profile email`;

      res.statusCode = 302;
      res.setHeader('Location', redirectUrl);
      res.end();
      return;
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

    // Default response for unknown endpoints
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${url.pathname} not found`,
      availableEndpoints: ['/api/health', '/api/login', '/api/test-db']
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
