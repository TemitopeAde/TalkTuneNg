# User Profile & Password Management API Endpoints

This document describes the API endpoints for managing user profile information and passwords in the TalkTune application.

## 📋 Overview

Two new API endpoints have been created to handle user profile and password updates:
- `/api/user/profile` - For updating personal information
- `/api/user/password` - For changing passwords

## 🔐 Authentication

Both endpoints require authentication via the `auth-token` cookie. Users must be logged in and have verified their email address to use these endpoints.

---

## 📝 Update Profile Endpoint

### `PUT /api/user/profile`

Update user profile information including name, email, and phone number.

#### Request Headers
```
Cookie: auth-token=<jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "countryCode": "+1"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "countryCode": 1,
    "isVerified": true,
    "createdAt": "2025-10-01T05:19:13.000Z"
  }
}
```

#### Success Response - Email Changed (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully. Please verify your new email address.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "newemail@example.com",
    "phoneNumber": "1234567890",
    "countryCode": 1,
    "isVerified": false,
    "createdAt": "2025-10-01T05:19:13.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized - Not logged in**
```json
{
  "error": "Authentication required. Please log in to update your profile."
}
```

**403 Forbidden - Email not verified**
```json
{
  "error": "Email verification required. Please verify your email to update your profile."
}
```

**400 Bad Request - Validation error**
```json
{
  "error": "Name must be at least 2 characters"
}
```

**409 Conflict - Email already taken**
```json
{
  "error": "Email address is already in use by another account"
}
```

---

## 🔑 Update Password Endpoint

### `PUT /api/user/password`

Change user password with current password verification.

#### Request Headers
```
Cookie: auth-token=<jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "currentPassword": "current123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Error Responses

**401 Unauthorized - Not logged in**
```json
{
  "error": "Authentication required. Please log in to update your password."
}
```

**403 Forbidden - Social login account**
```json
{
  "error": "Cannot change password for social login accounts. Please contact support."
}
```

**400 Bad Request - Wrong current password**
```json
{
  "error": "Current password is incorrect"
}
```

**400 Bad Request - Same password**
```json
{
  "error": "New password must be different from your current password"
}
```

**400 Bad Request - Password requirements**
```json
{
  "error": "New password must contain at least one uppercase letter, one lowercase letter, and one number"
}
```

**400 Bad Request - Password mismatch**
```json
{
  "error": "New passwords don't match"
}
```

---

## 📖 Get Profile Endpoint

### `GET /api/user/profile`

Get current user's profile information.

#### Request Headers
```
Cookie: auth-token=<jwt-token>
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "isVerified": true
  }
}
```

---

## 🔧 Validation Rules

### Profile Update Validation
- **name**: 2-50 characters
- **email**: Valid email format
- **phoneNumber**: Required if provided
- **countryCode**: Required if phoneNumber provided

### Password Update Validation
- **currentPassword**: Required for verification
- **newPassword**: 
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
- **confirmPassword**: Must match newPassword

---

## 🔍 Usage Examples

### Update Profile with Fetch
```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Profile updated:', result);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
updateProfile({
  name: "John Doe",
  email: "john@example.com",
  phoneNumber: "1234567890",
  countryCode: "+1"
});
```

### Update Password with Fetch
```javascript
const updatePassword = async (passwordData) => {
  try {
    const response = await fetch('/api/user/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(passwordData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Password updated successfully');
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
updatePassword({
  currentPassword: "oldPassword123",
  newPassword: "NewPassword123",
  confirmPassword: "NewPassword123"
});
```

---

## 🛡️ Security Features

### Profile Updates
- ✅ Authentication required via JWT cookies
- ✅ Email verification required for profile changes
- ✅ Duplicate email prevention
- ✅ Email re-verification when email is changed
- ✅ Input validation and sanitization
- ✅ Proper error handling and status codes

### Password Updates
- ✅ Current password verification required
- ✅ Strong password requirements enforced
- ✅ Password confirmation matching
- ✅ Prevention of reusing current password
- ✅ Special handling for social login accounts
- ✅ Secure password hashing with bcrypt (cost factor 12)

---

## 📁 File Structure

```
src/
├── actions/
│   ├── updateProfile.ts        # Server action for profile updates
│   └── updatePassword.ts       # Server action for password updates
├── app/api/user/
│   ├── profile/route.ts        # Profile API endpoint
│   └── password/route.ts       # Password API endpoint
├── lib/validations/
│   └── auth.ts                # Validation schemas
└── types/
    └── index.ts               # TypeScript type definitions
```

---

## ✨ Features Included

- 🔐 **Secure Authentication**: JWT token validation
- ✅ **Email Verification**: Required for sensitive operations
- 🛡️ **Password Security**: Strong requirements and secure hashing
- 📧 **Email Change Handling**: Automatic re-verification flow
- 🌍 **International Phone Support**: Country code handling
- 📱 **Social Login Support**: Special handling for OAuth accounts
- 🎯 **Comprehensive Validation**: Client and server-side validation
- 📚 **Full Documentation**: Detailed API documentation
- 🐛 **Error Handling**: Detailed error messages and proper HTTP status codes
- 🔒 **CSRF Protection**: Using secure HTTP-only cookies

Your user profile and password management API endpoints are now fully implemented and ready to use!