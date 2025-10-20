# Firebase Cloud Messaging API Starter Template

A clean, production-ready Node.js API starter template with Firebase Cloud Messaging (FCM) push notifications and Firebase Authentication. Perfect for building APIs that need user authentication and push notification capabilities.

## ✨ Features

- 🚀 **Express.js API Server** - RESTful API with comprehensive error handling
- � **Firebase Authentication** - Complete user registration, login, and JWT token verification
- �📱 **Firebase Cloud Messaging** - Full FCM integration for push notifications
- 🗄️ **Token Management** - Register, update, and remove FCM tokens with user association
- 📬 **Flexible Notifications** - Send notifications to single or multiple authenticated users
- 🔒 **Production Ready** - Input validation, error handling, auth middleware, and deployment configs
- 🎯 **Clean Architecture** - Well-organized code structure without unnecessary complexity

## 📁 Project Structure

```
├── server.js                     # Main Express server
├── firebase-messaging-sw.js      # Service worker for web clients (Testing purposes only)
├── config/
│   └── firebase.js              # Firebase Admin SDK configuration
├── src/
│   ├── controllers/
│   │   ├── authController.js    # Authentication endpoints
│   │   └── fcmController.js     # FCM notification handling
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validation.js        # Request validation
│   ├── routes/
│   │   ├── auth.js              # Authentication API endpoints
│   │   └── fcm.js               # FCM API endpoints
│   ├── services/
│   │   ├── authService.js       # Firebase Auth business logic
│   │   ├── fcmService.js        # FCM business logic
│   │   └── firebaseService.js   # Core Firebase Admin setup
│   └── utils/
│       └── messageTemplates.js  # Notification templates
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies and scripts
```

## � Complete Firebase Setup Guide

Follow these steps to set up Firebase for this API template:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter your project name (e.g., `my-api-project`)
4. Choose whether to enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Required Services

#### Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password** provider
5. Click **"Save"**

#### Enable Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add proper rules immediately)
4. Select a location close to your users
5. Click **"Done"**
6. **Immediately add security rules** (see next section for the rules)

#### Enable Cloud Messaging

1. Go to **Project Settings** (gear icon) → **"Cloud Messaging"** tab
2. Note: FCM is enabled by default for new projects

### Step 3: Generate Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on **"Service accounts"** tab
3. Click **"Generate new private key"**
4. **Important**: Download and securely store this JSON file
5. Rename it to something like `your-project-firebase-adminsdk.json`

### Step 4: Get Web App Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click **"Add app"** → **Web** (</> icon)
4. Enter an app nickname (e.g., `my-api-web-client`)
5. **Check** "Also set up Firebase Hosting" (optional)
6. Click **"Register app"**
7. **Copy the Firebase configuration object** - you'll need this for your frontend/service worker

Example config (you'll get your own values):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef...",
};
```

### Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Open the downloaded service account JSON file
3. Fill in your `.env` file with the values:

```env
PORT=3000
NODE_ENV=development

# Firebase Service Account Configuration (from downloaded JSON file)
FIREBASE_PROJECT_ID=your-project-id                    # "project_id" field
FIREBASE_PRIVATE_KEY_ID=your-private-key-id            # "private_key_id" field
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"  # "private_key" field (keep the quotes!)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com  # "client_email" field
FIREBASE_CLIENT_ID=your-client-id                      # "client_id" field

# CORS Configuration
ALLOWED_ORIGINS=*
```

**Important Notes:**

- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- The private key should include `\n` characters for line breaks
- Never commit the `.env` file to version control

### Step 6: Configure Firestore Security Rules (IMPORTANT - Do This Immediately!)

Since you started in production mode, you need to add security rules right away or your database will reject all requests.

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // FCM tokens - users can only access their own tokens
    match /fcm_tokens/{tokenId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users collection (if you add one later)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

**⚠️ Critical**: Without these rules, your API won't be able to read/write to Firestore!

### Step 7: Update Service Worker Configuration

Edit `firebase-messaging-sw.js` with your web app configuration:

```javascript
// Replace with your Firebase config from Step 4
const firebaseConfig = {
  apiKey: "AIzaSyD...", // Your values here
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef...",
};
```

### Step 8: Test Your Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Test the health endpoint:

   ```bash
   curl http://localhost:3000/api/fcm/health
   ```

   You should see: `{"status":"healthy","timestamp":"..."}`

**✅ Success!** Your API is now properly configured with Firebase Auth + FCM and secure Firestore rules!

## 🚀 Quick Start

```bash
# Clone this template
git clone <your-repo-url>
cd api-starter-template-with-fcm

# Install dependencies
npm install

# Configure environment (follow Firebase setup guide above)
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`

## 📋 API Endpoints

### Authentication Endpoints

| Method | Endpoint                  | Description             | Auth Required |
| ------ | ------------------------- | ----------------------- | ------------- |
| POST   | `/api/auth/register`      | Register new user       | No            |
| GET    | `/api/auth/verify`        | Verify user's JWT token | Yes           |
| PUT    | `/api/auth/profile`       | Update user profile     | Yes           |
| DELETE | `/api/auth/profile`       | Delete user account     | Yes           |
| GET    | `/api/auth/users`         | Get all users (admin)   | Yes (Admin)   |
| DELETE | `/api/auth/users/:userId` | Delete user (admin)     | Yes (Admin)   |

### FCM Token Management

| Method | Endpoint                        | Description                  | Auth Required |
| ------ | ------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/fcm/tokens`               | Register new FCM token       | Yes           |
| PUT    | `/api/fcm/tokens`               | Update existing FCM token    | Yes           |
| DELETE | `/api/fcm/tokens/:tokenId`      | Remove FCM token             | Yes           |
| GET    | `/api/fcm/tokens`               | Get all tokens (admin)       | Yes (Admin)   |
| GET    | `/api/fcm/users/:userId/tokens` | Get tokens for specific user | Yes           |

### Notifications

| Method | Endpoint          | Description                 | Auth Required |
| ------ | ----------------- | --------------------------- | ------------- |
| POST   | `/api/fcm/notify` | Send notification to tokens | Yes           |

### Health Check

| Method | Endpoint          | Description      | Auth Required |
| ------ | ----------------- | ---------------- | ------------- |
| GET    | `/api/fcm/health` | API health check | No            |

## 💡 Usage Examples

### 1. Register a New User

```javascript
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securePassword123",
    displayName: "John Doe",
  }),
});

const result = await response.json();
console.log("User registered:", result.data.user);
console.log("Auth token:", result.data.token); // Use this for authenticated requests
```

### 2. Register FCM Token (Authenticated)

```javascript
const authToken = "your-jwt-token-from-registration-or-login";

const response = await fetch("/api/fcm/tokens", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    fcmToken: "fcm-registration-token-here",
    metadata: {
      deviceType: "web",
      userAgent: "Chrome/91.0",
    },
  }),
});

const result = await response.json();
console.log("Token registered:", result.data.tokenId);
```

### 3. Send Notification to Authenticated Users

```javascript
const response = await fetch("/api/fcm/notify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    tokens: [
      { token: "fcm-token-1", userId: "user1", username: "alice" },
      { token: "fcm-token-2", userId: "user2", username: "bob" },
    ],
    messageType: "NOTIFICATION",
    messageData: {
      title: "Hello!",
      body: "You have a new message",
      customData: {
        action: "open_chat",
        chatId: "abc123",
      },
    },
  }),
});
```

### 4. Verify User Token

```javascript
const response = await fetch("/api/auth/verify", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
});

const result = await response.json();
console.log("User verified:", result.data.user);
```

## 🎨 Customization

### Frontend Integration Example

Here's how to integrate with your frontend application:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>FCM Demo</title>
  </head>
  <body>
    <script type="module">
      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
      import {
        getAuth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
      } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
      import {
        getMessaging,
        getToken,
      } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging.js";

      // Your Firebase config from Step 4 of setup
      const firebaseConfig = {
        apiKey: "AIzaSyD...",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project",
        // ... rest of config
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const messaging = getMessaging(app);

      // Register user and FCM token
      async function registerUser(email, password, displayName) {
        try {
          // 1. Register with Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          // 2. Register with your API
          const apiResponse = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, displayName }),
          });

          const { data } = await apiResponse.json();
          const authToken = data.token;

          // 3. Get FCM token and register it
          const fcmToken = await getToken(messaging, {
            vapidKey: "your-vapid-key",
          });

          await fetch("/api/fcm/tokens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              fcmToken,
              metadata: {
                deviceType: "web",
                userAgent: navigator.userAgent,
              },
            }),
          });

          console.log("User and FCM token registered successfully!");
          return { user, authToken };
        } catch (error) {
          console.error("Registration failed:", error);
        }
      }
    </script>
  </body>
</html>
```

### Adding Custom Message Types

Edit `src/utils/messageTemplates.js`:

```javascript
const MESSAGE_TYPES = {
  NOTIFICATION: "NOTIFICATION",
  UPDATE: "UPDATE",
  ALERT: "ALERT", // Add your custom types
  REMINDER: "REMINDER",
  CHAT_MESSAGE: "CHAT_MESSAGE",
};

const MESSAGE_TEMPLATES = {
  // Add custom message templates
  [MESSAGE_TYPES.ALERT]: (data) => ({
    title: data.title || "Alert!",
    body: data.body || "Something needs your attention",
    data: {
      type: MESSAGE_TYPES.ALERT,
      priority: "high",
      ...data.customData,
    },
  }),

  [MESSAGE_TYPES.CHAT_MESSAGE]: (data) => ({
    title: `New message from ${data.senderName}`,
    body: data.messagePreview,
    data: {
      type: MESSAGE_TYPES.CHAT_MESSAGE,
      chatId: data.chatId,
      senderId: data.senderId,
      ...data.customData,
    },
  }),
};
```

### Database Structure

#### FCM Tokens Collection (`fcm_tokens`)

```javascript
{
  userId: "firebase-auth-user-id",        // Links to authenticated user
  username: "john_doe",                   // Display name for easier identification
  token: "fcm-registration-token",        // The actual FCM token
  metadata: {
    deviceType: "web",                    // web, ios, android
    userAgent: "Chrome/91.0",             // Browser/device info
    appVersion: "1.0.0"                   // Your app version
  },
  createdAt: "2024-01-15T10:00:00.000Z",
  lastActive: "2024-01-15T15:30:00.000Z"
}
```

#### User Data (managed by Firebase Auth)

- User authentication is handled by Firebase Auth
- Additional user data can be stored in Firestore if needed
- JWT tokens contain user claims and can be customized

### Authentication Middleware Customization

The auth middleware supports different protection levels:

```javascript
// src/middleware/auth.js examples

// Protect routes that require any authenticated user
router.get("/api/fcm/tokens", verifyToken, fcmController.getUserTokens);

// Protect admin-only routes
router.get(
  "/api/fcm/tokens/all",
  verifyToken,
  requireAdmin,
  fcmController.getAllTokens
);

// Optional auth (works with or without token)
router.get("/api/fcm/public-data", optionalAuth, fcmController.getPublicData);

// Custom claims requirement
router.post(
  "/api/fcm/broadcast",
  verifyToken,
  requireClaims(["broadcaster"]),
  fcmController.broadcast
);
```

### Adding Custom User Claims

```javascript
// In src/services/authService.js
async function setCustomClaims(uid, claims) {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to set custom claims: ${error.message}`);
  }
}

// Usage example - make user an admin
await authService.setCustomClaims("user-id", {
  admin: true,
  role: "administrator",
});
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000

# Firebase Service Account Configuration (same as development)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# CORS Configuration - Specify your production domains
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Additional security headers
TRUST_PROXY=true
```

### Security Checklist for Production

1. **Firestore Rules**: Secure rules are configured during setup (Step 6)
2. **CORS**: Set specific domain origins instead of `*`
3. **HTTPS**: Ensure your API is served over HTTPS
4. **Environment Variables**: Never commit `.env` to version control
5. **Firebase Auth**: Configure authorized domains in Firebase Console

### Platform-Specific Deployment

#### Render.com (Recommended)

The project includes `render.yaml` for one-click deployment:

1. Fork/clone this repository
2. Connect to [Render](https://render.com)
3. Add environment variables in Render dashboard
4. Deploy automatically

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Heroku

```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
# ... set other environment variables
git push heroku main
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Vercel (Serverless)

```json
// vercel.json
{
  "functions": {
    "server.js": {
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## 🛠️ Extensions & Enhancements

This template provides a solid foundation. Consider adding:

### Core Features

- **Rate Limiting** - Implement with express-rate-limit
- **Logging** - Add Winston or Pino for structured logging
- **Monitoring** - Health checks and metrics with Prometheus
- **Caching** - Redis for token and user data caching
- **Validation** - Enhanced input validation with Joi or Zod

### FCM Features

- **Topic Management** - Subscribe users to FCM topics
- **Batch Notifications** - Send to multiple users efficiently
- **Delivery Tracking** - Track notification delivery status
- **Message Scheduling** - Queue notifications for later delivery
- **Template Engine** - Advanced message templates with variables

### Authentication Features

- **OAuth Providers** - Add Google, GitHub, Twitter login
- **Email Verification** - Verify email addresses on registration
- **Password Reset** - Forgot password functionality
- **Two-Factor Auth** - Add TOTP or SMS verification
- **Session Management** - Advanced session handling

### Advanced Features

- **WebSocket Support** - Real-time connections with Socket.io
- **File Upload** - Handle profile images and attachments
- **Analytics** - Track user engagement and notification metrics
- **Internationalization** - Multi-language support
- **Background Jobs** - Queue system with Bull/Agenda

### Example Extensions

#### Add Email Verification

```javascript
// In authController.js
async function sendEmailVerification(req, res) {
  try {
    const { email } = req.body;
    const link = await admin.auth().generateEmailVerificationLink(email);
    // Send email with verification link
    res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
}
```

#### Add Rate Limiting

```javascript
// In server.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);
```

## 📊 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Files Included

- **Authentication Tests**: User registration, login, token verification
- **FCM Tests**: Token management, notification sending
- **Integration Tests**: Full API workflow testing
- **Load Tests**: Performance testing with artillery

### Manual Testing

Use the included test files:

- `test-fcm.html` - Basic FCM functionality testing
- `test-auth-fcm.html` - Complete auth + FCM workflow testing

## 📄 License

MIT License - Use this template freely for any project!

---

**🚀 Ready to build your authenticated API with push notifications?**

This template gets you up and running with Firebase Auth + FCM in minutes, not hours. Perfect for:

- **SaaS Applications** - User management with notifications
- **Mobile App Backends** - Push notifications for iOS/Android
- **Web Apps** - Real-time user engagement
- **API Services** - Authentication and messaging foundation
