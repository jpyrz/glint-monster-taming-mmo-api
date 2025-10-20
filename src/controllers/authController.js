const { authService } = require("../middleware/auth");

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password, customClaims = {} } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
          code: "MISSING_FIELDS",
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT",
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters",
          code: "PASSWORD_TOO_SHORT",
        });
      }

      console.log(`📝 [Auth Controller] Registration attempt: ${email}`);

      // Create user
      const result = await authService.createUser(
        email,
        password,
        customClaims
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      console.log(
        `✅ [Auth Controller] User registered successfully: ${result.user.uid}`
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Registration error:", error);

      res.status(500).json({
        success: false,
        error: "Registration failed",
        code: "REGISTRATION_ERROR",
      });
    }
  }

  // Verify user token (for client-side login validation)
  async verifyUser(req, res) {
    try {
      // User info is already attached by auth middleware
      const user = req.user;

      console.log(`🔍 [Auth Controller] User verification: ${user.uid}`);

      // Get fresh user data from Firebase
      const result = await authService.getUserByUid(user.uid);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        message: "User verified successfully",
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      console.error("❌ [Auth Controller] User verification error:", error);

      res.status(500).json({
        success: false,
        error: "User verification failed",
        code: "VERIFICATION_ERROR",
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = req.user;

      console.log(`👤 [Auth Controller] Get profile: ${user.uid}`);

      // Get fresh user data
      const result = await authService.getUserByUid(user.uid);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Get profile error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to get user profile",
        code: "PROFILE_ERROR",
      });
    }
  }

  // Update user profile (admin or self)
  async updateProfile(req, res) {
    try {
      const { targetUserId } = req.params;
      const currentUser = req.user;
      const updates = req.body;

      // Users can only update their own profile unless they're admin
      const isAdmin = currentUser.customClaims?.admin;
      const isSelfUpdate = !targetUserId || targetUserId === currentUser.uid;

      if (!isSelfUpdate && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Can only update your own profile",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      const userIdToUpdate = targetUserId || currentUser.uid;

      console.log(`🔄 [Auth Controller] Update profile: ${userIdToUpdate}`);

      // Filter allowed updates (prevent updating sensitive fields)
      const allowedFields = ["email", "password", "disabled"];
      const filteredUpdates = {};

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = value;
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields to update",
          code: "NO_VALID_FIELDS",
        });
      }

      // Update user
      const result = await authService.updateUser(
        userIdToUpdate,
        filteredUpdates
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Update profile error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to update profile",
        code: "UPDATE_ERROR",
      });
    }
  }

  // Delete user account (admin or self)
  async deleteAccount(req, res) {
    try {
      const { targetUserId } = req.params;
      const currentUser = req.user;

      // Users can only delete their own account unless they're admin
      const isAdmin = currentUser.customClaims?.admin;
      const isSelfDelete = !targetUserId || targetUserId === currentUser.uid;

      if (!isSelfDelete && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Can only delete your own account",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      const userIdToDelete = targetUserId || currentUser.uid;

      console.log(`🗑️ [Auth Controller] Delete account: ${userIdToDelete}`);

      // Delete user
      const result = await authService.deleteUser(userIdToDelete);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Delete account error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to delete account",
        code: "DELETE_ERROR",
      });
    }
  }

  // Set custom claims (admin only)
  async setCustomClaims(req, res) {
    try {
      const { targetUserId } = req.params;
      const { customClaims } = req.body;

      if (!targetUserId || !customClaims) {
        return res.status(400).json({
          success: false,
          error: "User ID and custom claims are required",
          code: "MISSING_FIELDS",
        });
      }

      console.log(`🏷️ [Auth Controller] Set custom claims: ${targetUserId}`);

      // Set custom claims
      const result = await authService.setCustomClaims(
        targetUserId,
        customClaims
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Set custom claims error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to set custom claims",
        code: "CLAIMS_ERROR",
      });
    }
  }

  // Disable/enable user account (admin only)
  async setAccountStatus(req, res) {
    try {
      const { targetUserId } = req.params;
      const { disabled } = req.body;

      if (!targetUserId || typeof disabled !== "boolean") {
        return res.status(400).json({
          success: false,
          error: "User ID and disabled status are required",
          code: "MISSING_FIELDS",
        });
      }

      console.log(
        `🔒 [Auth Controller] Set account status: ${targetUserId}, disabled: ${disabled}`
      );

      // Set account status
      const result = await authService.setUserDisabled(targetUserId, disabled);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Set account status error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to set account status",
        code: "STATUS_ERROR",
      });
    }
  }

  // Generate custom token (admin only - for server-to-server auth)
  async generateCustomToken(req, res) {
    try {
      const { targetUserId, additionalClaims = {} } = req.body;

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
          code: "MISSING_USER_ID",
        });
      }

      console.log(
        `🎫 [Auth Controller] Generate custom token: ${targetUserId}`
      );

      // Generate custom token
      const result = await authService.createCustomToken(
        targetUserId,
        additionalClaims
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.json({
        success: true,
        message: "Custom token generated successfully",
        data: {
          token: result.token,
        },
      });
    } catch (error) {
      console.error("❌ [Auth Controller] Generate custom token error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to generate custom token",
        code: "TOKEN_ERROR",
      });
    }
  }
}

module.exports = new AuthController();
