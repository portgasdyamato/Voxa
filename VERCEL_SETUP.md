# Vercel Environment Variables Setup

## The Issue
Your VoXa app deployed successfully to Vercel, but you're getting a `FUNCTION_INVOCATION_FAILED` error because the environment variables are not configured.

## Required Environment Variables

You need to set up the following environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Find your `voxa` project
3. Click on it
4. Go to **Settings** tab
5. Click on **Environment Variables** in the sidebar

### 2. Add These Environment Variables

#### Database Configuration
```
Variable: DATABASE_URL
Value: postgresql://neondb_owner:npg_vylQ8L5iXCZt@ep-proud-haze-a89aeo5b-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
Environment: Production, Preview, Development
```

#### Google OAuth Configuration
```
Variable: GOOGLE_CLIENT_ID
Value: 33589766455-q4l78megmocn1n758mt220lek0vl617a.apps.googleusercontent.com
Environment: Production, Preview, Development
```

```
Variable: GOOGLE_CLIENT_SECRET
Value: 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
Environment: Production, Preview, Development
```

```
Variable: GOOGLE_CALLBACK_URL
Value: https://voxa-taupe.vercel.app/auth/google/callback
Environment: Production, Preview, Development
```

#### Session Configuration
```
Variable: SESSION_SECRET
Value: voice-task-manager-super-secret-key-change-this-in-production
Environment: Production, Preview, Development
```

#### Node Environment
```
Variable: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

### 3. Google OAuth Setup

You also need to update your Google OAuth settings:

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click to edit it
4. Under "Authorized redirect URIs", add:
   ```
   https://voxa-taupe.vercel.app/auth/google/callback
   ```
5. Save the changes

### 4. Redeploy (Optional)

After adding all environment variables:
1. Go back to your Vercel project
2. Click on **Deployments** tab
3. Find the latest deployment
4. Click the three dots menu
5. Select **Redeploy**

OR just trigger a new deployment by pushing a small change to your GitHub repo.

### 5. Test the Fix

Once the environment variables are set and you've redeployed:
1. Visit your app: https://voxa-taupe.vercel.app
2. Click "Get Started"
3. You should be redirected to Google OAuth instead of seeing the error

### 6. Debug Endpoint

I've added a health check endpoint to help debug issues:
- Visit: https://voxa-taupe.vercel.app/api/health
- This will show you if any environment variables are missing

**If you're still seeing the FUNCTION_INVOCATION_FAILED error on the health endpoint, try these steps:**

#### Step A: Force Redeploy
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your VoXa project and click on it
3. Go to **Deployments** tab
4. Click the three dots (**...**) on the latest deployment
5. Select **Redeploy** 
6. Wait for the deployment to complete (usually 1-2 minutes)

#### Step B: Check Environment Variable Settings
1. In your Vercel dashboard, go to **Settings** → **Environment Variables**
2. Make sure **ALL 6 variables** are set for **ALL environments** (Production, Preview, Development):
   - `DATABASE_URL`
   - `GOOGLE_CLIENT_ID` 
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`
   - `SESSION_SECRET`
   - `NODE_ENV`

#### Step C: Check Function Logs
1. In your Vercel dashboard, go to **Functions** tab
2. Click on any recent function execution
3. Look for error messages in the logs
4. This will show you the exact error that's happening

#### Step D: Try a Test Deployment
If the above doesn't work, let's push a small change to trigger a fresh deployment:
1. In your local project, open `vercel.json`
2. Add a comment line like: `// Updated: [current date]`
3. Commit and push to GitHub
4. This will trigger a new deployment with fresh environment variables

## Common Issues

1. **Make sure all environment variables are set for Production, Preview, AND Development**
2. **Don't forget to update the Google OAuth callback URL**
3. **The DATABASE_URL should be exactly as shown above (your Neon database)**
4. **After adding env vars, you may need to redeploy**

## Need Help?

If you're still having issues after following these steps, check:
1. The health endpoint: https://voxa-taupe.vercel.app/api/health
2. Vercel function logs in your dashboard under "Functions" tab
3. Make sure your Neon database is still active and accessible
