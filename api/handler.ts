import { IncomingMessage, ServerResponse } from 'http';
import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";

// Create the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let initialized = false;

const initializeApp = async () => {
  if (initialized) {
    return app;
  }

  try {
    // Check for required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      
      // Add a health check route that shows env var status
      app.get('/api/health', (req, res) => {
        res.json({
          status: 'error',
          message: 'Missing required environment variables',
          missingEnvVars,
          timestamp: new Date().toISOString()
        });
      });
      
      // Still try to register routes but with error handling
      try {
        await registerRoutes(app);
      } catch (routeError) {
        console.error('Route registration failed due to missing env vars:', routeError);
        app.use('/api/*', (req, res) => {
          res.status(500).json({
            error: 'Configuration Error',
            message: 'Server is misconfigured. Missing environment variables.',
            missingEnvVars,
            details: routeError instanceof Error ? routeError.message : 'Unknown error'
          });
        });
      }
    } else {
      // All env vars present, register routes normally
      await registerRoutes(app);
    }
    
    // Error handling middleware
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('API Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ 
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });
    
    initialized = true;
    return app;
  } catch (error) {
    console.error('Failed to initialize API:', error);
    throw error;
  }
};

// Vercel handler function
async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}

// Export the handler function for Vercel
export default handler;
