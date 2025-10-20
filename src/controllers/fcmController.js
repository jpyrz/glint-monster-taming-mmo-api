const fcmService = require("../services/fcmService");
const { asyncHandler } = require("../middleware/errorHandler");

// Register user's FCM token
const registerToken = asyncHandler(async (req, res) => {
  const { fcmToken, metadata = {} } = req.body;
  const user = req.user; // From auth middleware

  // Use authenticated user's information
  const userId = user.uid;
  const username = user.email; // Use email as username, or get from custom claims

  const result = await fcmService.registerToken(userId, username, fcmToken, {
    ...metadata,
    authenticatedUser: true,
    registeredAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: result.message,
    data: {
      tokenId: result.tokenId,
      userId,
      username,
    },
  });
});

// Update user's FCM token
const updateToken = asyncHandler(async (req, res) => {
  const { fcmToken, metadata = {} } = req.body;
  const user = req.user; // From auth middleware

  // Use authenticated user's information
  const userId = user.uid;

  const result = await fcmService.updateToken(userId, fcmToken, {
    ...metadata,
    updatedBy: userId,
    updatedAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: result.message,
    data: {
      tokenId: result.tokenId,
      userId,
    },
  });
});

// Send notification to specific tokens
const sendNotification = asyncHandler(async (req, res) => {
  const { tokens, messageType, messageData } = req.body;

  // Send notifications
  const result = await fcmService.sendToTokens(
    tokens,
    messageType,
    messageData
  );

  res.json({
    success: true,
    message: result.message,
    data: {
      messageType,
      notificationResults: result.results,
    },
  });
});

// Remove FCM token
const removeToken = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const result = await fcmService.removeToken(tokenId);

  res.json({
    success: true,
    message: result.message,
    data: {
      tokenId,
    },
  });
});

// Get all tokens (for admin purposes)
const getAllTokens = asyncHandler(async (req, res) => {
  const tokens = await fcmService.getAllTokens();

  // Return limited data for security (partial tokens)
  const safeTokens = tokens.map(({ token, ...rest }) => ({
    ...rest,
    token: token ? token.substring(0, 20) + "..." : "N/A",
  }));

  res.json({
    success: true,
    message: `Found ${tokens.length} registered tokens`,
    data: {
      tokenCount: tokens.length,
      tokens: safeTokens,
    },
  });
});

// Get tokens by user ID
const getTokensByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const tokens = await fcmService.getTokensByUserId(userId);

  // Return limited data for security (partial tokens)
  const safeTokens = tokens.map(({ token, ...rest }) => ({
    ...rest,
    token: token ? token.substring(0, 20) + "..." : "N/A",
  }));

  res.json({
    success: true,
    message: `Found ${tokens.length} tokens for user ${userId}`,
    data: {
      userId,
      tokenCount: tokens.length,
      tokens: safeTokens,
    },
  });
});

// Health check endpoint
const healthCheck = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "FCM service is healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

module.exports = {
  registerToken,
  updateToken,
  sendNotification,
  removeToken,
  getAllTokens,
  getTokensByUserId,
  healthCheck,
};
