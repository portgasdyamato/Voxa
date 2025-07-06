# VoXa Deployment Guide

## Deploying to Vercel

### Prerequisites
- Vercel account
- PostgreSQL database (Neon, Supabase, or similar)
- Google OAuth credentials

### Step 1: Set up Database
1. Create a PostgreSQL database (recommended: [Neon](https://neon.tech/) or [Supabase](https://supabase.com/))
2. Copy the database connection string

### Step 2: Set up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (for local development)
   - `https://your-app-name.vercel.app/auth/google/callback` (for production)
7. Copy Client ID and Client Secret

### Step 3: Deploy to Vercel

#### Option A: Deploy from GitHub
1. Fork this repository to your GitHub account
2. Connect your GitHub account to Vercel
3. Import the project from GitHub
4. Vercel will auto-detect the framework

#### Option B: Deploy using Vercel CLI
```bash
npm install -g vercel
vercel
```

### Step 4: Configure Environment Variables
In your Vercel dashboard, go to Settings > Environment Variables and add:

```env
DATABASE_URL=postgresql://username:password@host:port/database
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app-name.vercel.app/auth/google/callback
SESSION_SECRET=your_random_long_string_here
NODE_ENV=production
```

### Step 5: Run Database Migrations
After deployment, you need to push your database schema:

```bash
# Install dependencies locally
npm install

# Set your DATABASE_URL in .env file
echo "DATABASE_URL=your_postgresql_url" > .env

# Push database schema
npm run db:push
```

### Step 6: Test Deployment
1. Visit your deployed URL
2. Try logging in with Google
3. Test creating tasks with voice commands
4. Verify stats are working

## Troubleshooting

### Common Issues:

#### 1. "Function Timeout"
- Vercel free tier has 10s timeout limit
- Ensure database queries are optimized
- Consider upgrading to Pro plan for longer timeouts

#### 2. "Module not found" errors
- Ensure all imports use correct file extensions (.js)
- Check that all dependencies are in package.json
- Verify TypeScript is compiled correctly

#### 3. Database Connection Errors
- Verify DATABASE_URL is correctly set in Vercel environment variables
- Ensure database allows connections from 0.0.0.0/0 (all IPs)
- Check if database requires SSL (most hosted databases do)

#### 4. OAuth Redirect Mismatch
- Verify GOOGLE_CALLBACK_URL matches exactly in Google Console
- Ensure redirect URI includes https:// for production
- Check that domain matches your Vercel deployment URL

#### 5. Session Issues
- Generate a strong SESSION_SECRET (at least 32 characters)
- Ensure secure: true is set for production (handled automatically)

### Performance Optimization:

1. **Database Connection Pooling**: Already configured with Neon
2. **Bundle Size**: Consider code splitting for large dependencies
3. **Caching**: Implement Redis for session storage in production
4. **CDN**: Vercel automatically provides CDN for static assets

### Monitoring:

1. **Vercel Analytics**: Enable in dashboard for performance monitoring
2. **Error Tracking**: Consider integrating Sentry for error monitoring
3. **Database Monitoring**: Use your database provider's monitoring tools

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abc123...` |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI | `https://app.vercel.app/auth/google/callback` |
| `SESSION_SECRET` | Session encryption key | `random-32-char-string...` |
| `NODE_ENV` | Environment mode | `production` |

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set correctly
3. Test the same functionality locally first
4. Check database connection and permissions
