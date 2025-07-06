import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize the app
const init = async () => {
  try {
    // Register routes
    await registerRoutes(app);
    
    // Error handling middleware
    app.use((err, _req, res, _next) => {
      console.error('API Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    return app;
  } catch (error) {
    console.error('Failed to initialize API:', error);
    throw error;
  }
};

// Export the initialized app
export default async (req, res) => {
  const app = await init();
  return app(req, res);
};
