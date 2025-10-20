const admin = require("firebase-admin");

class AuthService {
  constructor() {
    this.auth = admin.auth();
  }

  // Create a new user with email and password
  async createUser(email, password, additionalClaims = {}) {
    try {
      console.log(`🔐 [Auth Service] Creating user: ${email}`);

      const userRecord = await this.auth.createUser({
        email: email,
        password: password,
        emailVerified: false,
        disabled: false,
      });

      // Set custom claims if provided
      if (Object.keys(additionalClaims).length > 0) {
        await this.auth.setCustomUserClaims(userRecord.uid, additionalClaims);
        console.log(
          `✅ [Auth Service] Custom claims set for user: ${userRecord.uid}`
        );
      }

      console.log(
        `✅ [Auth Service] User created successfully: ${userRecord.uid}`
      );

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
          },
          customClaims: additionalClaims,
        },
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error creating user:", error);

      // Handle specific Firebase Auth errors
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          error: "Email already exists",
          code: "EMAIL_EXISTS",
        };
      } else if (error.code === "auth/invalid-email") {
        return {
          success: false,
          error: "Invalid email address",
          code: "INVALID_EMAIL",
        };
      } else if (error.code === "auth/weak-password") {
        return {
          success: false,
          error: "Password is too weak",
          code: "WEAK_PASSWORD",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Verify an ID token from the client
  async verifyToken(idToken) {
    try {
      console.log("🔍 [Auth Service] Verifying token...");

      const decodedToken = await this.auth.verifyIdToken(idToken);

      console.log(
        `✅ [Auth Service] Token verified for user: ${decodedToken.uid}`
      );

      return {
        success: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          customClaims: decodedToken,
        },
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error verifying token:", error);

      if (error.code === "auth/id-token-expired") {
        return {
          success: false,
          error: "Token has expired",
          code: "TOKEN_EXPIRED",
        };
      } else if (error.code === "auth/id-token-revoked") {
        return {
          success: false,
          error: "Token has been revoked",
          code: "TOKEN_REVOKED",
        };
      }

      return {
        success: false,
        error: "Invalid token",
        code: "INVALID_TOKEN",
      };
    }
  }

  // Get user by UID
  async getUserByUid(uid) {
    try {
      console.log(`🔍 [Auth Service] Getting user: ${uid}`);

      const userRecord = await this.auth.getUser(uid);

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
          },
          customClaims: userRecord.customClaims || {},
        },
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error getting user:", error);

      if (error.code === "auth/user-not-found") {
        return {
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      console.log(`🔍 [Auth Service] Getting user by email: ${email}`);

      const userRecord = await this.auth.getUserByEmail(email);

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
          },
          customClaims: userRecord.customClaims || {},
        },
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error getting user by email:", error);

      if (error.code === "auth/user-not-found") {
        return {
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Update user (email, password, etc.)
  async updateUser(uid, updates) {
    try {
      console.log(`🔄 [Auth Service] Updating user: ${uid}`);

      const userRecord = await this.auth.updateUser(uid, updates);

      console.log(`✅ [Auth Service] User updated successfully: ${uid}`);

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
        },
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error updating user:", error);

      if (error.code === "auth/user-not-found") {
        return {
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        };
      } else if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          error: "Email already exists",
          code: "EMAIL_EXISTS",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Disable/enable user account
  async setUserDisabled(uid, disabled = true) {
    try {
      const action = disabled ? "Disabling" : "Enabling";
      console.log(`🔒 [Auth Service] ${action} user: ${uid}`);

      await this.auth.updateUser(uid, { disabled });

      console.log(
        `✅ [Auth Service] User ${disabled ? "disabled" : "enabled"}: ${uid}`
      );

      return {
        success: true,
        message: `User ${disabled ? "disabled" : "enabled"} successfully`,
      };
    } catch (error) {
      console.error(
        `❌ [Auth Service] Error ${disabled ? "disabling" : "enabling"} user:`,
        error
      );

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Delete user account
  async deleteUser(uid) {
    try {
      console.log(`🗑️ [Auth Service] Deleting user: ${uid}`);

      await this.auth.deleteUser(uid);

      console.log(`✅ [Auth Service] User deleted successfully: ${uid}`);

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error deleting user:", error);

      if (error.code === "auth/user-not-found") {
        return {
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Set custom claims for user
  async setCustomClaims(uid, customClaims) {
    try {
      console.log(`🏷️ [Auth Service] Setting custom claims for user: ${uid}`);

      await this.auth.setCustomUserClaims(uid, customClaims);

      console.log(`✅ [Auth Service] Custom claims set successfully: ${uid}`);

      return {
        success: true,
        message: "Custom claims set successfully",
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error setting custom claims:", error);

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Generate custom token (for server-side authentication)
  async createCustomToken(uid, additionalClaims = {}) {
    try {
      console.log(`🎫 [Auth Service] Creating custom token for user: ${uid}`);

      const customToken = await this.auth.createCustomToken(
        uid,
        additionalClaims
      );

      console.log(`✅ [Auth Service] Custom token created: ${uid}`);

      return {
        success: true,
        token: customToken,
      };
    } catch (error) {
      console.error("❌ [Auth Service] Error creating custom token:", error);

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
  }
}

module.exports = AuthService;
