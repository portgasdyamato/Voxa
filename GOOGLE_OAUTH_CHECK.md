# Google OAuth Configuration Check

## Current Configuration

### OAuth 2.0 Client ID
- **Client ID**: `33589766455-q4l78megmocn1n758mt220lek0vl617a.apps.googleusercontent.com`
- **Client Secret**: `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`

### Redirect URIs That Should Be Configured
In Google Cloud Console, make sure these redirect URIs are added:

1. **Production**: `https://voxa-taupe.vercel.app/auth/google/callback`
2. **Local Development**: `http://localhost:5173/auth/google/callback` (if testing locally)

## Steps to Verify/Fix Google OAuth Setup

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/apis/credentials
- Find your OAuth 2.0 Client ID: `33589766455-q4l78megmocn1n758mt220lek0vl617a`

### 2. Check Authorized Redirect URIs
Make sure these URIs are listed:
- `https://voxa-taupe.vercel.app/auth/google/callback`

### 3. Verify OAuth Consent Screen
- Go to "OAuth consent screen" tab
- Make sure your app is properly configured
- Add test users if app is in "Testing" mode

## Testing URLs

After deployment, test these URLs:

1. **Health Check**: https://voxa-taupe.vercel.app/api/health
2. **Login**: https://voxa-taupe.vercel.app/api/login
3. **Home**: https://voxa-taupe.vercel.app/

## Common Issues

1. **Redirect URI Mismatch**: Google returns error if the redirect URI doesn't match exactly
2. **OAuth Consent Screen**: If not configured properly, users might see warnings
3. **Test Users**: If app is in testing mode, only added test users can log in

## Environment Variables to Set in Vercel

```
GOOGLE_CLIENT_ID=33589766455-q4l78megmocn1n758mt220lek0vl617a.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://voxa-taupe.vercel.app/auth/google/callback
```
