import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("⚠️  Google OAuth credentials not found!");
  console.error("Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file");
  console.error("Visit https://console.cloud.google.com/apis/credentials to create OAuth credentials");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupGoogleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user information from Google profile
        const googleUser = {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profileImageUrl: profile.photos?.[0]?.value || null,
        };

        // Create or update user in database
        await storage.upsertUser(googleUser);

        // Create user object for session
        const user = {
          id: profile.id,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          profileImageUrl: googleUser.profileImageUrl,
          claims: {
            sub: profile.id,
            email: googleUser.email,
            name: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
            picture: googleUser.profileImageUrl
          }
        };

        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        return done(error, false);
      }
    }));
  }

  // Serialize and deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        const sessionUser = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          claims: {
            sub: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            picture: user.profileImageUrl
          }
        };
        done(null, sessionUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, false);
    }
  });

  // Authentication routes
  app.get("/api/login", (req, res, next) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ 
        message: "Google OAuth not configured. Please check your environment variables." 
      });
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login-failed" }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect("/");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });

  // Login failed route
  app.get("/login-failed", (req, res) => {
    res.send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Login Failed</h2>
        <p>There was an error signing in with Google. Please try again.</p>
        <a href="/" style="color: #4285f4; text-decoration: none;">← Back to Home</a>
      </div>
    `);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};
