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
    // Register all routes
    await registerRoutes(app);
    
    // Error handling middleware
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('API Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    initialized = true;
    return app;
  } catch (error) {
    console.error('Failed to initialize API:', error);
    throw error;
  }
};

// Vercel handler function
export default async (req: any, res: any) => {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
