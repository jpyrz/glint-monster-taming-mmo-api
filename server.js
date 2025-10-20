require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Firebase config (this initializes Firebase)
require("./config/firebase");

// Import routes and middleware
const fcmRoutes = require("./src/routes/fcm");
const authRoutes = require("./src/routes/auth");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (for testing)
app.use(express.static("."));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/fcm", fcmRoutes);
app.use("/api/auth", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Firebase API Starter Template",
    version: "2.0.0",
    description: "Firebase Authentication + Cloud Messaging API",
    services: {
      authentication: "Firebase Auth with email/password",
      notifications: "Firebase Cloud Messaging",
    },
    endpoints: {
      // Authentication
      register: "POST /api/auth/register",
      verify: "GET /api/auth/verify",
      profile: "GET /api/auth/profile",
      updateProfile: "PUT /api/auth/profile",
      deleteAccount: "DELETE /api/auth/account",
      // FCM Token Management
      registerToken: "POST /api/fcm/tokens",
      updateToken: "PUT /api/fcm/tokens",
      removeToken: "DELETE /api/fcm/tokens/:tokenId",
      // FCM Notifications
      sendNotification: "POST /api/fcm/notify",
      // Health Checks
      authHealth: "GET /api/auth/health",
      fcmHealth: "GET /api/fcm/health",
    },
    testing: {
      fcmOnly: "Visit /test-fcm.html for FCM testing",
      authAndFcm: "Visit /test-auth-fcm.html for Auth + FCM testing",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FCM API Server running on port ${PORT}`);
  console.log(`📱 Firebase Cloud Messaging ready`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/fcm`);
  console.log(`📖 Documentation: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
