"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/minimal-handler.ts
var minimal_handler_exports = {};
__export(minimal_handler_exports, {
  default: () => handler
});
module.exports = __toCommonJS(minimal_handler_exports);
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname === "/api/health") {
      const envVars = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        SESSION_SECRET: !!process.env.SESSION_SECRET,
        NODE_ENV: process.env.NODE_ENV || "unknown"
      };
      const missingVars = Object.entries(envVars).filter(([key, value]) => key !== "NODE_ENV" && !value).map(([key]) => key);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        status: missingVars.length === 0 ? "ok" : "missing_env_vars",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: {
          variables: envVars,
          missing: missingVars,
          vercel: !!process.env.VERCEL,
          region: process.env.VERCEL_REGION || "unknown"
        },
        message: missingVars.length === 0 ? "All environment variables are set" : `Missing environment variables: ${missingVars.join(", ")}`
      }, null, 2));
      return;
    }
    if (url.pathname === "/api/login") {
      if (!process.env.GOOGLE_CLIENT_ID) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          error: "Google OAuth not configured",
          message: "GOOGLE_CLIENT_ID environment variable is missing"
        }));
        return;
      }
      const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || "https://voxa-taupe.vercel.app/auth/google/callback")}&response_type=code&scope=profile email`;
      res.statusCode = 302;
      res.setHeader("Location", redirectUrl);
      res.end();
      return;
    }
    if (url.pathname === "/api/test-db") {
      if (!process.env.DATABASE_URL) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          error: "Database not configured",
          message: "DATABASE_URL environment variable is missing"
        }));
        return;
      }
      try {
        const { Pool } = await import("@neondatabase/serverless");
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const result = await pool.query("SELECT NOW() as current_time");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          status: "ok",
          message: "Database connection successful",
          timestamp: result.rows[0]?.current_time
        }));
        return;
      } catch (dbError) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          error: "Database connection failed",
          message: dbError instanceof Error ? dbError.message : "Unknown database error"
        }));
        return;
      }
    }
    if (url.pathname === "/auth/google/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          error: "Missing authorization code",
          message: "Google OAuth callback requires authorization code"
        }));
        return;
      }
      try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || "https://voxa-taupe.vercel.app/auth/google/callback"
          })
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
        }
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`
          }
        });
        const userData = await userResponse.json();
        if (!userResponse.ok) {
          throw new Error(`User info fetch failed: ${userData.error_description || userData.error}`);
        }
        res.statusCode = 302;
        res.setHeader("Location", "/?login=success&user=" + encodeURIComponent(userData.name || userData.email));
        res.end();
        return;
      } catch (oauthError) {
        console.error("OAuth callback error:", oauthError);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          error: "OAuth callback failed",
          message: oauthError instanceof Error ? oauthError.message : "Unknown OAuth error"
        }));
        return;
      }
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Not Found",
      message: `Endpoint ${url.pathname} not found`,
      availableEndpoints: ["/api/health", "/api/login", "/api/test-db", "/auth/google/callback"]
    }));
  } catch (error) {
    console.error("Handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : void 0 : void 0
    }));
  }
}

module.exports = handler;
module.exports.default = handler;
