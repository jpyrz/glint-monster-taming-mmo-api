const express = require("express");
const router = express.Router();

// Import auth middleware and controller
const { auth, requireAdmin } = require("../middleware/auth");
const authController = require("../controllers/authController");

// Import validation middleware
const { validateRequest } = require("../middleware/validation");

// Validation schemas
const registerSchema = {
  email: {
    required: true,
    type: "email",
  },
  password: {
    required: true,
    type: "string",
    minLength: 6,
  },
  customClaims: {
    required: false,
    type: "object",
  },
};

const updateProfileSchema = {
  email: {
    required: false,
    type: "email",
  },
  password: {
    required: false,
    type: "string",
    minLength: 6,
  },
  disabled: {
    required: false,
    type: "boolean",
  },
};

const customClaimsSchema = {
  customClaims: {
    required: true,
    type: "object",
  },
};

const accountStatusSchema = {
  disabled: {
    required: true,
    type: "boolean",
  },
};

const customTokenSchema = {
  targetUserId: {
    required: true,
    type: "string",
  },
  additionalClaims: {
    required: false,
    type: "object",
  },
};

// ================================
// PUBLIC ROUTES (No Authentication)
// ================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 * @body    { email: string, password: string, customClaims?: object }
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

// ================================
// PROTECTED ROUTES (Authentication Required)
// ================================

/**
 * @route   GET /api/auth/verify
 * @desc    Verify user token and get user info
 * @access  Private (requires valid JWT token)
 * @header  Authorization: Bearer <token>
 */
router.get("/verify", auth, authController.verifyUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user's profile
 * @access  Private (requires valid JWT token)
 * @header  Authorization: Bearer <token>
 */
router.get("/profile", auth, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user's profile
 * @access  Private (requires valid JWT token)
 * @header  Authorization: Bearer <token>
 * @body    { email?: string, password?: string }
 */
router.put(
  "/profile",
  auth,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete current user's account
 * @access  Private (requires valid JWT token)
 * @header  Authorization: Bearer <token>
 */
router.delete("/account", auth, authController.deleteAccount);

// ================================
// ADMIN ROUTES (Admin Access Required)
// ================================

/**
 * @route   GET /api/auth/users/:targetUserId
 * @desc    Get any user's profile (admin only)
 * @access  Admin
 * @header  Authorization: Bearer <admin-token>
 */
router.get(
  "/users/:targetUserId",
  auth,
  requireAdmin,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/users/:targetUserId
 * @desc    Update any user's profile (admin only)
 * @access  Admin
 * @header  Authorization: Bearer <admin-token>
 * @body    { email?: string, password?: string, disabled?: boolean }
 */
router.put(
  "/users/:targetUserId",
  auth,
  requireAdmin,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

/**
 * @route   DELETE /api/auth/users/:targetUserId
 * @desc    Delete any user's account (admin only)
 * @access  Admin
 * @header  Authorization: Bearer <admin-token>
 */
router.delete(
  "/users/:targetUserId",
  auth,
  requireAdmin,
  authController.deleteAccount
);

/**
 * @route   POST /api/auth/users/:targetUserId/claims
 * @desc    Set custom claims for a user (admin only)
 * @access  Admin
 * @header  Authorization: Bearer <admin-token>
 * @body    { customClaims: object }
 */
router.post(
  "/users/:targetUserId/claims",
  auth,
  requireAdmin,
  validateRequest(customClaimsSchema),
  authController.setCustomClaims
);

/**
 * @route   PUT /api/auth/users/:targetUserId/status
 * @desc    Enable/disable user account (admin only)
 * @access  Admin
 * @header  Authorization: Bearer <admin-token>
 * @body    { disabled: boolean }
 */
router.put(
  "/users/:targetUserId/status",
  auth,
  requireAdmin,
  validateRequest(accountStatusSchema),
  authController.setAccountStatus
);

/**
 * @route   POST /api/auth/custom-token
 * @desc    Generate custom token for server-to-server auth (admin only)
 * @access  Admin
 * @header  Authorization: Bearer <admin-token>
 * @body    { targetUserId: string, additionalClaims?: object }
 */
router.post(
  "/custom-token",
  auth,
  requireAdmin,
  validateRequest(customTokenSchema),
  authController.generateCustomToken
);

// ================================
// HEALTH CHECK
// ================================

/**
 * @route   GET /api/auth/health
 * @desc    Auth service health check
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Firebase Authentication",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
