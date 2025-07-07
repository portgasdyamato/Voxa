# Vercel Environment Variables Setup

## Required Environment Variables

To make the VoXa app work properly in production, you need to set these environment variables in Vercel:

### 1. Go to your Vercel dashboard
- Visit: https://vercel.com/dashboard
- Find your VoXa project

### 2. Add Environment Variables
Go to Project Settings > Environment Variables and add:

**Database Configuration:**
```
DATABASE_URL=postgresql://neondb_owner:npg_vylQ8L5iXCZt@ep-proud-haze-a89aeo5b-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```

**Session Secret:**
```
SESSION_SECRET=voice-task-manager-super-secret-key-change-this-in-production
```

**Google OAuth:**
```
GOOGLE_CLIENT_ID=33589766455-q4l78megmocn1n758mt220lek0vl617a.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://voxa-taupe.vercel.app/auth/google/callback
```

**Node Environment:**
```
NODE_ENV=production
```

### 3. Set Environment for All Environments
Make sure to set these variables for:
- Production
- Preview
- Development

### 4. Redeploy
After adding the environment variables, trigger a new deployment by pushing a commit or manually redeploying from the Vercel dashboard.

## Quick Fix Command
If you have Vercel CLI installed and logged in, you can run:
```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_CALLBACK_URL
vercel env add NODE_ENV
```

## Verify Environment Variables
After setting up, check: https://voxa-taupe.vercel.app/api/health
