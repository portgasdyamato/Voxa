# Google OAuth Setup Guide

## Step-by-Step Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name: "Voice Task Manager"
5. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API" and then "Enable"

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Voice Task Manager"
     - User support email: your email
     - Developer contact information: your email
   - Click "Save and Continue"
   - Skip "Scopes" and "Test users" for now
4. Back to creating OAuth client ID:
   - Application type: "Web application"
   - Name: "Voice Task Manager"
   - Authorized redirect URIs: Add `http://localhost:5000/auth/google/callback`
   - Click "Create"

### 4. Copy Credentials

1. After creating, you'll see a popup with your Client ID and Client Secret
2. Copy both values
3. Update your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```

### 5. Test Authentication

1. Save your `.env` file
2. Restart the development server: `npm run dev`
3. Go to `http://localhost:5000`
4. Click "Get Started" - it should redirect to Google login
5. Sign in with your Google account
6. You should be redirected back to the app and logged in

## Important Notes

- Keep your Client Secret secure and never commit it to version control
- The callback URL must exactly match what you set in Google Cloud Console
- You can add multiple redirect URIs if needed (e.g., for production)
- The app requires email and profile permissions from Google

## Troubleshooting

### Common Issues:

1. **"OAuth Error: redirect_uri_mismatch"**
   - Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:5000/auth/google/callback`

2. **"Client ID not found"**
   - Double-check your GOOGLE_CLIENT_ID in the `.env` file
   - Ensure there are no extra spaces or quotes

3. **"Access blocked"**
   - Make sure you've configured the OAuth consent screen
   - Add your email as a test user if needed

4. **"Invalid client secret"**
   - Verify your GOOGLE_CLIENT_SECRET is correct
   - Generate a new client secret if needed

## Production Setup

For production deployment, you'll need to:

1. Add your production domain to authorized redirect URIs
2. Update the GOOGLE_CALLBACK_URL environment variable
3. Configure proper OAuth consent screen for public use
4. Use environment variables for sensitive data
