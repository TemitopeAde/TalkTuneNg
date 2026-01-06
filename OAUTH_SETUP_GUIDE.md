# Social Login Setup Guide (Google & Facebook)

This guide will help you set up Google and Facebook OAuth for your TalkTune application.

## ✅ What's Already Configured

- ✅ NextAuth.js setup with Google and Facebook providers
- ✅ UI components updated with social login buttons
- ✅ Apple login removed from the interface
- ✅ Database schema configured for social logins
- ✅ Session management with NextAuth

## 🔧 Setup Instructions

### 1. Google OAuth Setup

#### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" and "People API"

#### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Configure the consent screen:
   - Application name: "TalkTune"
   - User support email: Your email
   - Developer contact email: Your email
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "TalkTune Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

#### Step 3: Get Your Credentials
1. Copy the **Client ID** and **Client Secret**
2. Update your `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your-actual-google-client-id"
   GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
   ```

### 2. Facebook OAuth Setup

#### Step 1: Go to Facebook Developers
1. Visit [Facebook for Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Business** as the app type
4. Fill in your app details:
   - App name: "TalkTune"
   - Contact email: Your email

#### Step 2: Add Facebook Login Product
1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** as the platform
4. Set your Site URL: `http://localhost:3000` (for development)

#### Step 3: Configure OAuth Redirect URIs
1. Go to **Facebook Login** > **Settings**
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (for development)
   - `https://yourdomain.com/api/auth/callback/facebook` (for production)

#### Step 4: Get Your Credentials
1. Go to **Settings** > **Basic**
2. Copy the **App ID** and **App Secret**
3. Update your `.env` file:
   ```env
   FACEBOOK_CLIENT_ID="your-actual-facebook-app-id"
   FACEBOOK_CLIENT_SECRET="your-actual-facebook-app-secret"
   ```

### 3. Update NextAuth Configuration

Your NextAuth configuration is already set up, but make sure your `.env` file has:

```env
NEXTAUTH_URL="http://localhost:3000"  # Change to your domain in production
NEXTAUTH_SECRET="your-super-secret-jwt-key-change-in-production-12345"
```

## 🚀 Testing the Setup

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Test Google Login
1. Go to `/auth/login` or `/auth/register`
2. Click the **Google** button
3. You should be redirected to Google's OAuth consent screen
4. After consent, you should be redirected back and logged in

### 3. Test Facebook Login
1. Go to `/auth/login` or `/auth/register`
2. Click the **Facebook** button
3. You should be redirected to Facebook's OAuth consent screen
4. After consent, you should be redirected back and logged in

## 🔒 Security Considerations

### Development vs Production
- **Development**: Use `http://localhost:3000` in redirect URIs
- **Production**: Use your actual domain with HTTPS: `https://yourdomain.com`

### Environment Variables
- Never commit real OAuth credentials to version control
- Use different OAuth apps for development and production
- Keep your `.env` file in `.gitignore`

### Database
- Social login users are automatically marked as verified
- Empty password field for social login users
- Users can link multiple OAuth providers to the same email

## 🐛 Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Make sure your redirect URIs match exactly in OAuth provider settings
   - Include the correct protocol (http/https) and port

2. **"App not yet approved"**
   - For Facebook, your app needs to be approved for public use
   - During development, add test users in Facebook App settings

3. **"Invalid client"**
   - Double-check your Client ID and Client Secret
   - Make sure there are no extra spaces or quotes

4. **Session issues**
   - Clear your browser cookies and try again
   - Check that NEXTAUTH_SECRET is set correctly

### Debug Mode
Add this to your NextAuth configuration for more detailed logs:
```javascript
debug: process.env.NODE_ENV === "development"
```

## 📱 Mobile App Considerations

If you plan to add mobile apps later:
- Google: Create additional OAuth clients for iOS/Android
- Facebook: Configure additional platforms in your Facebook app
- Update redirect URIs for mobile deep links

## ✨ Features Included

- 🔐 **Secure Authentication**: Using NextAuth.js industry standards
- 🚀 **Automatic User Creation**: New users are created automatically on first login
- ✅ **Email Verification Bypass**: Social login users are automatically verified
- 🔄 **Account Linking**: Users can link multiple social accounts
- 🎨 **Updated UI**: Clean 2-button layout (removed Apple login)
- 📱 **Mobile Responsive**: Social login buttons work on all devices

Your social login is now ready! Users can sign up and log in using their Google or Facebook accounts seamlessly.