# Google OAuth Login Setup Guide

This guide will help you set up Google OAuth authentication for your TalkTune application.

> **Note:** Facebook OAuth is also available! See [FACEBOOK_AUTH_SETUP.md](./FACEBOOK_AUTH_SETUP.md) for setup instructions.

## What's Been Implemented

✅ NextAuth.js v4 with Google provider
✅ Database schema updated (password field now optional)
✅ Login and Register pages updated with functional Google buttons
✅ Middleware updated to support both JWT and NextAuth sessions
✅ SessionProvider added to root layout
✅ TypeScript types for NextAuth extended

## Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create a New Project (or select existing)
- Click "Select a project" at the top
- Click "NEW PROJECT"
- Name it (e.g., "TalkTune")
- Click "CREATE"

### 1.3 Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API"
- Click on it and click "ENABLE"

### 1.4 Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "CREATE CREDENTIALS" > "OAuth client ID"
- If prompted, configure the OAuth consent screen:
  - Choose "External" (unless you have Google Workspace)
  - Fill in:
    - App name: `TalkTune`
    - User support email: Your email
    - Developer contact: Your email
  - Click "SAVE AND CONTINUE"
  - Skip "Scopes" (click "SAVE AND CONTINUE")
  - Add test users if needed
  - Click "SAVE AND CONTINUE"

- Back to "Create OAuth client ID":
  - Application type: **Web application**
  - Name: `TalkTune Web Client`
  - Authorized JavaScript origins:
    ```
    http://localhost:3000
    ```
  - Authorized redirect URIs:
    ```
    http://localhost:3000/api/auth/callback/google
    ```
  - Click "CREATE"

### 1.5 Copy Your Credentials
- You'll see a popup with your credentials
- Copy the **Client ID** and **Client Secret**
- Keep these safe!

## Step 2: Update Environment Variables

Open your `.env.local` file and update these values:

```env
# Google OAuth - REPLACE WITH YOUR ACTUAL CREDENTIALS
GOOGLE_CLIENT_ID="your-actual-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret-here"

# NextAuth.js - REPLACE WITH A SECURE RANDOM STRING
NEXTAUTH_SECRET="your-secure-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Generate a secure NEXTAUTH_SECRET:
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use: https://generate-secret.vercel.app/32

## Step 3: Update Database Schema

Run these commands to update your database:

```bash
# Stop your dev server first (Ctrl+C)

# Generate Prisma client with updated schema
npx prisma generate

# Push schema changes to database
npx prisma db push
```

If you encounter file permission errors on Windows, close all running processes (dev server, VS Code terminal, etc.) and try again.

## Step 4: Start Your Application

```bash
npm run dev
```

## Step 5: Test Google Login

1. Open http://localhost:3000/auth/login
2. Click the **Google** button
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions
6. You'll be redirected back to your app at `/dashboard`

## How It Works

### Authentication Flow:
1. User clicks "Google" button
2. NextAuth redirects to Google OAuth
3. User authenticates with Google
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth creates:
   - User record (if new user)
   - Account record (links Google to User)
   - Session record
6. User redirected to `/dashboard`

### Dual Authentication Support:
Your app now supports **both**:
- ✅ **Email/Password** (existing JWT-based auth)
- ✅ **Google OAuth** (NextAuth sessions)

The middleware checks for both token types and grants access accordingly.

## Database Changes

### User Model:
- `password` field is now **optional** (Google users don't have passwords)

### New/Updated Models:
- `Account` - Stores OAuth provider data (Google account info)
- `Session` - Stores NextAuth session data
- `VerificationToken` - For email verification tokens

## Production Deployment

When deploying to production:

1. **Update Google OAuth settings:**
   - Add your production domain to "Authorized JavaScript origins"
   - Add your production callback URL to "Authorized redirect URIs"
     - Example: `https://yourdomain.com/api/auth/callback/google`

2. **Update environment variables:**
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. **Set OAuth consent screen to "In Production"** (after testing)

## Troubleshooting

### Error: "Redirect URI mismatch"
- Check that your redirect URI in Google Console matches exactly:
  - `http://localhost:3000/api/auth/callback/google`
- No trailing slash, exact protocol (http vs https)

### Error: "Missing NEXTAUTH_SECRET"
- Make sure you've set a secure random string in `.env.local`

### Error: "Can't find module '@/generated/prisma'"
- Run `npx prisma generate`

### Google login works but user data not showing
- Check that `SessionProvider` is wrapping your app in `layout.tsx`
- Verify middleware is running (check console logs)

### Database errors after schema change
- Run `npx prisma db push` to sync the schema

## File Changes Summary

### New Files:
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/lib/db.ts` - Prisma client export for NextAuth
- `src/lib/auth.ts` - Auth helper functions
- `src/providers/SessionProvider.tsx` - NextAuth session provider
- `src/types/next-auth.d.ts` - TypeScript type extensions

### Modified Files:
- `prisma/schema.prisma` - Made password optional
- `src/app/layout.tsx` - Added SessionProvider
- `src/app/auth/login/page.tsx` - Added Google OAuth button functionality
- `src/app/auth/register/page.tsx` - Added Google OAuth button functionality
- `src/middleware.ts` - Added NextAuth session support
- `.env.local` - Added Google OAuth credentials

## Next Steps

After successful setup, you can:
- Add more OAuth providers (Facebook, Apple, GitHub, etc.)
- Customize the OAuth consent screen
- Add user profile pictures from Google
- Implement account linking (merge Google + email/password accounts)

## Support

If you encounter issues:
1. Check the console logs (browser and terminal)
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Check that Google OAuth credentials are correct
