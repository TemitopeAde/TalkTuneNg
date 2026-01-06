# Facebook OAuth Login Setup Guide

This guide will help you set up Facebook OAuth authentication for your TalkTune application.

## What's Been Implemented

✅ NextAuth.js configured with Facebook provider
✅ Login and Register pages updated with functional Facebook buttons
✅ Environment variables added for Facebook credentials
✅ Middleware already supports Facebook OAuth (via NextAuth)

## Step 1: Create a Facebook App

### 1.1 Go to Facebook Developers
Visit: https://developers.facebook.com/

### 1.2 Create a New App
- Click "My Apps" in the top right
- Click "Create App"
- Choose use case: **"Authenticate and request data from users with Facebook Login"**
- Click "Next"

### 1.3 App Details
- App Name: `TalkTune`
- App Contact Email: Your email
- (Optional) Business account: Skip or select if you have one
- Click "Create App"

### 1.4 Verify Your Account
- You may need to verify your account via email or phone
- Complete the verification if prompted

## Step 2: Set Up Facebook Login

### 2.1 Add Facebook Login Product
- On your app dashboard, find **"Facebook Login"** in the products list
- Click "Set Up" on Facebook Login
- Choose **"Web"** as the platform

### 2.2 Configure Site URL
- Enter your site URL: `http://localhost:3000`
- Click "Save"
- Click "Continue"

### 2.3 Configure OAuth Settings
- In the left sidebar, click "Facebook Login" > "Settings"
- In "Valid OAuth Redirect URIs", add:
  ```
  http://localhost:3000/api/auth/callback/facebook
  ```
- Scroll down and click "Save Changes"

## Step 3: Get Your App Credentials

### 3.1 Go to App Settings
- In the left sidebar, click "Settings" > "Basic"

### 3.2 Copy Your Credentials
You'll see:
- **App ID** - This is your `FACEBOOK_CLIENT_ID`
- **App Secret** - Click "Show" to reveal, this is your `FACEBOOK_CLIENT_SECRET`

⚠️ **Important:** Keep your App Secret confidential!

## Step 4: Update Environment Variables

Open your `.env.local` file and update:

```env
# Facebook OAuth - REPLACE WITH YOUR ACTUAL CREDENTIALS
FACEBOOK_CLIENT_ID="your-facebook-app-id-here"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret-here"
```

## Step 5: Configure App Settings (Important!)

### 5.1 Set App Domain
- Still in "Settings" > "Basic"
- Scroll to "App Domains"
- Add: `localhost`
- Click "Save Changes"

### 5.2 Add Privacy Policy URL (Required for Public Apps)
For development, you can use a placeholder:
- Privacy Policy URL: `http://localhost:3000/privacy-policy`
- Terms of Service URL: `http://localhost:3000/terms` (optional)

### 5.3 Set App Mode
- At the top of the page, you'll see the app mode toggle
- For development: Keep it in **"Development"** mode
- Development mode allows you to test with test users

## Step 6: Add Test Users (Development Mode Only)

While in development mode, only test users can log in:

### Option A: Add Yourself as Admin/Developer
- Go to "Roles" > "Roles" in the left sidebar
- Add yourself as an Admin or Developer
- You'll be able to log in with your Facebook account

### Option B: Create Test Users
- Go to "Roles" > "Test Users"
- Click "Add Test Users"
- Create test accounts for testing

## Step 7: Test Facebook Login

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/auth/login
3. Click the **Facebook** button
4. You'll be redirected to Facebook's login page
5. Sign in with your Facebook account (must be admin/developer/test user in dev mode)
6. Grant permissions
7. You'll be redirected back to your app at `/dashboard`

## Step 8: Request Permissions (Optional)

By default, Facebook Login only requests:
- `email`
- `public_profile`

To request additional permissions (like profile picture), update the NextAuth configuration in `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
FacebookProvider({
  clientId: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'email public_profile user_birthday user_location'
    }
  }
}),
```

Common scopes:
- `email` - User's email address
- `public_profile` - Name, profile picture, age range, gender
- `user_birthday` - User's birthday
- `user_location` - User's hometown and current city
- `user_friends` - List of friends

⚠️ **Note:** Extended permissions require Facebook App Review for production.

## Production Deployment

When deploying to production:

### 1. Update Facebook App Settings
- Add production domain to "App Domains"
- Add production callback URL to "Valid OAuth Redirect URIs":
  - `https://yourdomain.com/api/auth/callback/facebook`
- Update Site URL to: `https://yourdomain.com`

### 2. Switch to Live Mode
- Go to "Settings" > "Basic"
- Toggle the app mode from "Development" to "Live"
- ⚠️ **Before going live, you MUST:**
  - Have a valid Privacy Policy URL
  - Complete App Review if using extended permissions
  - Add a valid Category for your app
  - Provide all required information

### 3. Update Environment Variables
```env
NEXTAUTH_URL="https://yourdomain.com"
```

### 4. App Review (If Needed)
If you're requesting permissions beyond `email` and `public_profile`:
- Go to "App Review" > "Permissions and Features"
- Request the permissions you need
- Provide detailed use cases and screencasts
- Wait for Facebook approval (can take several days)

## How It Works

### Authentication Flow:
1. User clicks "Facebook" button
2. NextAuth redirects to Facebook OAuth
3. User authenticates with Facebook
4. Facebook redirects back to `/api/auth/callback/facebook`
5. NextAuth creates:
   - User record (if new user)
   - Account record (links Facebook to User)
   - Session record
6. User redirected to `/dashboard`

### Data Stored:
- **User table:** email, name (from Facebook profile)
- **Account table:** Facebook user ID, access tokens, provider info
- **Session table:** Active session data

## Troubleshooting

### Error: "URL Blocked: This redirect failed"
- Check "Valid OAuth Redirect URIs" in Facebook Login settings
- Ensure it matches exactly: `http://localhost:3000/api/auth/callback/facebook`
- No trailing slash

### Error: "App Not Set Up: This app is still in development mode"
- Add yourself as an Admin/Developer/Tester in "Roles"
- Or create test users in "Roles" > "Test Users"

### Error: "Can't Load URL: The domain of this URL isn't included in the app's domains"
- Add `localhost` to "App Domains" in Settings > Basic
- Make sure Site URL is set to `http://localhost:3000`

### Facebook login works but email is null
- Some Facebook users don't have verified emails
- Check your app's permissions in Facebook Login settings
- Ensure `email` scope is requested

### Error: "Given URL is not permitted by the application configuration"
- Check that the callback URL is added to "Valid OAuth Redirect URIs"
- Verify App Domains includes `localhost` (for dev) or your domain (for prod)

## Development vs Production Differences

| Feature | Development Mode | Live Mode |
|---------|-----------------|-----------|
| Who can log in? | Only admins, developers, testers | Anyone with Facebook account |
| App Review needed? | No | Yes (for extended permissions) |
| Privacy Policy | Optional (but recommended) | Required |
| Permissions | Basic only | Requires review for extended |

## Privacy and Data Usage

### What data does Facebook provide?
- **Email:** User's email address (if verified)
- **Name:** User's full name
- **Profile Picture:** URL to profile photo
- **Facebook ID:** Unique identifier

### Data retention:
- Stored in your Prisma database
- Access tokens are encrypted by NextAuth
- Follow GDPR/privacy regulations for data handling

## File Changes Summary

### Modified Files:
- `.env.local` - Added Facebook OAuth credentials
- `src/app/api/auth/[...nextauth]/route.ts` - Added FacebookProvider
- `src/app/auth/login/page.tsx` - Facebook button now functional (line 255-268)
- `src/app/auth/register/page.tsx` - Facebook button now functional (line 321-334)

### No Additional Files Needed
Facebook OAuth uses the same infrastructure as Google OAuth:
- Same SessionProvider
- Same middleware
- Same database models (Account, Session, User)

## Next Steps

After successful setup:
- Test with different Facebook accounts
- Request additional permissions if needed
- Submit for App Review before going live
- Set up profile picture display from Facebook
- Implement account unlinking feature

## Support Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [NextAuth Facebook Provider Docs](https://next-auth.js.org/providers/facebook)
- [Facebook App Review Guide](https://developers.facebook.com/docs/app-review)

## Tips

1. **Development Mode:** Keep your app in development mode until you're ready to launch
2. **Test Users:** Create multiple test users to test different scenarios
3. **Permissions:** Only request permissions you actually need
4. **App Review:** Start the app review process early (can take 3-7 days)
5. **Error Handling:** Always handle cases where email might be null
