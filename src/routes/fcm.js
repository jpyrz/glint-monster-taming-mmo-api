const express = require("express");
const router = express.Router();

const fcmController = require("../controllers/fcmController");
const { auth, optionalAuth } = require("../middleware/auth");
const {
  validateRegisterTokenRequest,
  validateUpdateTokenRequest,
  validateSendNotificationRequest,
} = require("../middleware/validation");

// Register FCM token (requires authentication)
router.post(
  "/tokens",
  auth,
  validateRegisterTokenRequest,
  fcmController.registerToken
);

// Update FCM token (requires authentication)
router.put(
  "/tokens",
  auth,
  validateUpdateTokenRequest,
  fcmController.updateToken
);

// Send notification to tokens (requires authentication)
router.post(
  "/notify",
  auth,
  validateSendNotificationRequest,
  fcmController.sendNotification
);

// Remove FCM token (requires authentication)
router.delete("/tokens/:tokenId", auth, fcmController.removeToken);

// Get all tokens (admin)
router.get("/tokens", fcmController.getAllTokens);

// Get tokens by user ID
router.get("/users/:userId/tokens", fcmController.getTokensByUserId);

// Health check
router.get("/health", fcmController.healthCheck);

module.exports = router;
