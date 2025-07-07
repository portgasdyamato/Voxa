import { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Set basic headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Simple response for all requests
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Debug handler working',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'unknown',
        VERCEL: !!process.env.VERCEL,
        VERCEL_REGION: process.env.VERCEL_REGION || 'unknown'
      }
    }));

  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}
