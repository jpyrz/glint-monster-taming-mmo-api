const AuthService = require("../services/authService");

class AuthMiddleware {
  constructor() {
    this.authService = new AuthService();
  }

  // Verify JWT token and attach user to request
  async verifyToken(req, res, next) {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: "No authorization header provided",
          code: "NO_TOKEN",
        });
      }

      // Expected format: "Bearer <token>"
      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
          success: false,
          error:
            "Invalid authorization header format. Expected: Bearer <token>",
          code: "INVALID_TOKEN_FORMAT",
        });
      }

      const idToken = parts[1];

      // Verify the token
      const result = await this.authService.verifyToken(idToken);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      // Attach user info to request object
      req.user = result.user;

      console.log(`✅ [Auth Middleware] Authenticated user: ${req.user.uid}`);

      next();
    } catch (error) {
      console.error("❌ [Auth Middleware] Token verification failed:", error);

      return res.status(401).json({
        success: false,
        error: "Authentication failed",
        code: "AUTH_FAILED",
      });
    }
  }

  // Optional authentication - doesn't fail if no token, but adds user if valid token provided
  async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      // If no auth header, continue without user
      if (!authHeader) {
        req.user = null;
        return next();
      }

      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        req.user = null;
        return next();
      }

      const idToken = parts[1];
      const result = await this.authService.verifyToken(idToken);

      // If token is valid, attach user; otherwise continue without user
      req.user = result.success ? result.user : null;

      if (req.user) {
        console.log(
          `✅ [Auth Middleware] Optional auth - user: ${req.user.uid}`
        );
      }

      next();
    } catch (error) {
      console.error("❌ [Auth Middleware] Optional auth error:", error);
      req.user = null;
      next();
    }
  }

  // Check if user has specific custom claims
  requireClaims(requiredClaims) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "NOT_AUTHENTICATED",
        });
      }

      // Check if user has all required claims
      for (const [claimKey, claimValue] of Object.entries(requiredClaims)) {
        if (req.user.customClaims[claimKey] !== claimValue) {
          return res.status(403).json({
            success: false,
            error: `Missing required claim: ${claimKey}`,
            code: "INSUFFICIENT_CLAIMS",
          });
        }
      }

      console.log(
        `✅ [Auth Middleware] Claims verified for user: ${req.user.uid}`
      );
      next();
    };
  }

  // Check if user is an admin (custom claim)
  requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
    }

    if (!req.user.customClaims.admin) {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
        code: "NOT_ADMIN",
      });
    }

    console.log(
      `✅ [Auth Middleware] Admin access verified for user: ${req.user.uid}`
    );
    next();
  }

  // Check if user account is not disabled
  requireActiveUser(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
    }

    // Note: Firebase ID tokens won't be issued for disabled users,
    // but this is an additional safety check
    if (req.user.disabled) {
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
        code: "ACCOUNT_DISABLED",
      });
    }

    next();
  }

  // Check if user's email is verified
  requireEmailVerified(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
    }

    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: "Email verification required",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    console.log(
      `✅ [Auth Middleware] Email verified for user: ${req.user.uid}`
    );
    next();
  }
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

// Export middleware functions
module.exports = {
  // Required authentication
  auth: authMiddleware.verifyToken.bind(authMiddleware),

  // Optional authentication
  optionalAuth: authMiddleware.optionalAuth.bind(authMiddleware),

  // Claim-based authorization
  requireClaims: authMiddleware.requireClaims.bind(authMiddleware),
  requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),

  // Status-based authorization
  requireActiveUser: authMiddleware.requireActiveUser.bind(authMiddleware),
  requireEmailVerified:
    authMiddleware.requireEmailVerified.bind(authMiddleware),

  // Direct access to service (for controllers)
  authService: authMiddleware.authService,
};
