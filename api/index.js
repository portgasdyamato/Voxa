import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes.js";

// Initialize the app once
let app;
let initialized = false;

const initializeApp = async () => {
  if (initialized && app) {
    return app;
  }

  try {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Register routes
    await registerRoutes(app);
    
    // Error handling middleware
    app.use((err, _req, res, _next) => {
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

// Export the handler for Vercel
export default async (req, res) => {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
