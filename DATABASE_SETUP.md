# Database Setup for VoXa

## Quick Setup with Neon Database

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Choose your region
5. Copy the connection string

### 2. Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```bash
DATABASE_URL=your_neon_connection_string_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-vercel-app.vercel.app/auth/google/callback
SESSION_SECRET=your_random_session_secret
NODE_ENV=production
```

### 3. Database Schema

The database will auto-initialize with these tables:
- `users` - User accounts
- `categories` - Task categories
- `tasks` - User tasks

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add callback URL: `https://your-app.vercel.app/auth/google/callback`

### 5. Test the Setup

After deployment, visit:
- `/api/health` - Check environment variables
- `/api/test-db` - Test database connection
- `/api/oauth-debug` - Test OAuth configuration

## Development Mode

Without a database URL, the API will use mock data for development. This is perfect for testing the UI without setting up a database.

## Production Features

With database configured:
- ✅ Persistent task storage
- ✅ User authentication
- ✅ Category management
- ✅ Real-time stats
- ✅ Multi-user support

## Troubleshooting

### Database Connection Issues
- Verify the DATABASE_URL is correct
- Check network connectivity
- Ensure the database is running

### OAuth Issues
- Verify all OAuth credentials are set
- Check callback URL matches exactly
- Ensure Google+ API is enabled

### Environment Variables
- All variables must be set in Vercel dashboard
- Redeploy after adding variables
- Check `/api/health` for missing variables
