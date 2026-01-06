# OAuth Authentication Setup Guide

Complete guide for setting up social login (Google & Facebook) for TalkTune.

## Quick Start

Your app now supports **three authentication methods**:
1. ✅ **Email/Password** (existing JWT-based auth)
2. ✅ **Google OAuth** (via NextAuth)
3. ✅ **Facebook OAuth** (via NextAuth)

## What's Already Done

### Code Implementation ✅
- NextAuth.js installed and configured
- Google and Facebook providers added
- Login/Register pages updated with functional OAuth buttons
- Middleware supports all authentication methods
- Database schema updated for OAuth

### What You Need To Do

1. **Get OAuth Credentials**
   - [Google OAuth Setup](./GOOGLE_AUTH_SETUP.md) - Get Google Client ID & Secret
   - [Facebook OAuth Setup](./FACEBOOK_AUTH_SETUP.md) - Get Facebook App ID & Secret

2. **Update .env.local**
   - Add your OAuth credentials
   - Generate secure NEXTAUTH_SECRET

3. **Update Database**
   - Run `npx prisma generate`
   - Run `npx prisma db push`

4. **Test**
   - Start dev server: `npm run dev`
   - Visit http://localhost:3000/auth/login
   - Try all three authentication methods!

## Current Environment Variables

Your `.env.local` needs these values:

```env
# NextAuth.js
NEXTAUTH_SECRET="your-secure-random-secret-here"  # Generate this!
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-here"  # Get from Google Cloud Console
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id-here"  # Get from Facebook Developers
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret-here"
```

### Generate NEXTAUTH_SECRET

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or visit: https://generate-secret.vercel.app/32

## Setup Order (Recommended)

### Step 1: Generate NEXTAUTH_SECRET
- Run the command above
- Add to `.env.local`

### Step 2: Update Database
```bash
npx prisma generate
npx prisma db push
```

### Step 3: Test Email/Password Auth
- Make sure existing auth still works
- This verifies the database updates are successful

### Step 4: Set Up Google OAuth
- Follow [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
- Takes ~10 minutes
- Test Google login

### Step 5: Set Up Facebook OAuth
- Follow [FACEBOOK_AUTH_SETUP.md](./FACEBOOK_AUTH_SETUP.md)
- Takes ~10 minutes
- Test Facebook login

## How OAuth Works in Your App

### User Login Flow

```
User clicks "Google" or "Facebook" button
         ↓
NextAuth redirects to provider (Google/Facebook)
         ↓
User authenticates with provider
         ↓
Provider redirects back to your app
         ↓
NextAuth checks if user exists
         ↓
   ┌────────┴────────┐
   │                 │
Existing User    New User
   │                 │
   ├─ Link OAuth    ├─ Create new user
   │  account       │  with OAuth data
   │                 │
   └────────┬────────┘
            ↓
   Create session in database
            ↓
   Redirect to /dashboard
```

### Account Linking

If a user signs up with email/password and later logs in with Google using the **same email**:
- The OAuth account is linked to their existing user account
- Both authentication methods work
- User data remains consistent

### Data Storage

When a user logs in with OAuth:

**User Table:**
```typescript
{
  email: "user@gmail.com",
  name: "John Doe",
  password: null,  // No password for OAuth users
  isVerified: true,  // Auto-verified via OAuth
}
```

**Account Table:**
```typescript
{
  userId: 123,
  provider: "google",  // or "facebook"
  providerAccountId: "123456789",
  access_token: "encrypted_token",
  refresh_token: "encrypted_token",
  expires_at: 1234567890,
}
```

**Session Table:**
```typescript
{
  userId: 123,
  sessionToken: "random_token",
  expires: "2025-01-27T00:00:00Z",
}
```

## OAuth vs Email/Password Comparison

| Feature | Email/Password | Google OAuth | Facebook OAuth |
|---------|---------------|--------------|----------------|
| Setup Time | None (already works) | 10 minutes | 10 minutes |
| User Verification | Email OTP required | Auto-verified | Auto-verified |
| Password Required | Yes | No | No |
| Password Reset | Available | N/A | N/A |
| Account Recovery | Email reset | Via Google/Facebook | Via Google/Facebook |
| Session Type | JWT (7 days) | Database (30 days) | Database (30 days) |
| Token Storage | Cookie | Database | Database |

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth config with both providers
│   └── auth/
│       ├── login/page.tsx            # Login page (all 3 methods)
│       └── register/page.tsx         # Register page (all 3 methods)
├── lib/
│   ├── auth.ts                       # Auth helper functions
│   ├── db.ts                         # Prisma client
│   └── prisma.ts                     # Prisma singleton
├── providers/
│   └── SessionProvider.tsx           # NextAuth session provider
└── types/
    └── next-auth.d.ts                # TypeScript types

prisma/
└── schema.prisma                     # Database schema

.env.local                            # Environment variables

Documentation:
├── OAUTH_SETUP.md                    # This file
├── GOOGLE_AUTH_SETUP.md              # Google setup guide
└── FACEBOOK_AUTH_SETUP.md            # Facebook setup guide
```

## Middleware Behavior

Your middleware (`src/middleware.ts`) now handles all three auth methods:

```typescript
// Check order:
1. NextAuth session token (Google/Facebook)
2. Custom JWT token (Email/Password)
3. No auth → redirect to login (if protected route)
```

This means:
- OAuth users are authenticated via NextAuth session
- Email/Password users are authenticated via JWT
- Both can access protected routes
- Auth routes redirect to /dashboard if already authenticated

## Protected Routes

These routes require authentication (any method works):
- `/dashboard`
- `/admin`
- `/settings`
- `/profile`
- `/api/user/*`
- `/api/scripts/*`
- `/api/flutterwave/payment`

## Testing Checklist

After setup, test these scenarios:

### Email/Password (Existing Auth)
- [ ] Register new user with email/password
- [ ] Login with email/password
- [ ] Logout
- [ ] Forgot password flow
- [ ] Email verification

### Google OAuth
- [ ] Login with Google (new user)
- [ ] Login with Google (existing user with same email)
- [ ] Logout and login again
- [ ] Check user data in database

### Facebook OAuth
- [ ] Login with Facebook (new user)
- [ ] Login with Facebook (existing user with same email)
- [ ] Logout and login again
- [ ] Check user data in database

### Cross-Authentication
- [ ] Create account with email/password
- [ ] Login with Google using same email
- [ ] Verify account is linked (check Account table)
- [ ] Can login with either method

### Protected Routes
- [ ] Access /dashboard without auth → redirected to login
- [ ] Login with any method → can access /dashboard
- [ ] Logout → cannot access /dashboard

## Troubleshooting

### Issue: "prisma generate" fails with file lock error
**Solution:** Stop your dev server, close VS Code terminal, then run the command

### Issue: OAuth login redirects to login page
**Solution:**
- Check `.env.local` has correct credentials
- Verify callback URLs in Google/Facebook console
- Check browser console for errors
- Verify NEXTAUTH_SECRET is set

### Issue: User created but no email in database
**Solution:**
- Google: User might not have verified email
- Facebook: Email permission might not be granted
- Handle null emails in your code

### Issue: "Invalid credentials" error
**Solution:**
- Double-check Client ID and Secret in `.env.local`
- Ensure no extra spaces or quotes
- Restart dev server after changing .env

### Issue: Existing users can't login with OAuth
**Solution:** This is expected! Account linking only works if:
- Same email address
- User logs in with OAuth after email/password signup
- The code automatically links the accounts

## Production Checklist

Before deploying to production:

### Google OAuth
- [ ] Add production domain to Authorized JavaScript origins
- [ ] Add production callback URL to Authorized redirect URIs
- [ ] Update NEXTAUTH_URL in production env
- [ ] Set OAuth consent screen to "In Production" (if needed)

### Facebook OAuth
- [ ] Add production domain to App Domains
- [ ] Add production callback URL to Valid OAuth Redirect URIs
- [ ] Switch app from "Development" to "Live" mode
- [ ] Complete App Review if using extended permissions
- [ ] Add valid Privacy Policy URL

### Environment Variables
- [ ] Set NEXTAUTH_SECRET to a secure random value
- [ ] Set NEXTAUTH_URL to production domain
- [ ] Verify all OAuth credentials are for production apps

### Database
- [ ] Run migrations on production database
- [ ] Verify Account, Session, VerificationToken tables exist
- [ ] Test OAuth login on production

## Security Notes

### Best Practices
✅ **Never commit** `.env.local` to git
✅ **Use different** OAuth apps for dev/staging/production
✅ **Rotate secrets** periodically
✅ **Keep dependencies** updated
✅ **Monitor** OAuth token usage

### Data Privacy
- User data from OAuth providers is stored in your database
- Follow GDPR/CCPA requirements for data handling
- Implement data deletion on user request
- Have a clear Privacy Policy
- Only request permissions you actually use

## Next Steps

After OAuth setup is complete:

### Enhancements
1. **Add profile pictures** from OAuth providers
2. **Account management page** - Link/unlink OAuth accounts
3. **Remember OAuth preference** for returning users
4. **Add more providers** - GitHub, Twitter, Apple, etc.
5. **Email notifications** - Notify users when new OAuth account linked

### Optional Customization
- Customize OAuth button designs
- Add loading states during OAuth flow
- Show different UI for OAuth vs email/password users
- Implement "Continue as [User]" for returning users

## Support

Need help?
- Check the provider-specific guides (GOOGLE_AUTH_SETUP.md, FACEBOOK_AUTH_SETUP.md)
- Review NextAuth.js docs: https://next-auth.js.org
- Check database schema: `npx prisma studio`
- Review middleware logs in terminal

---

**Ready to start?** Follow the setup order above and you'll have OAuth working in ~30 minutes! 🚀
