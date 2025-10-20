const { messaging, db } = require("../../config/firebase");
const { createMessage, MESSAGE_TYPES } = require("../utils/messageTemplates");

class FCMService {
  constructor() {
    this.messaging = messaging;
  }

  // Send notification to a single token
  async sendToToken(token, message) {
    try {
      console.log(
        "🚀 [FCM Service] Sending message to token:",
        token.substring(0, 20) + "..."
      );
      console.log(
        "📋 [FCM Service] Message structure:",
        JSON.stringify(message, null, 2)
      );

      // Convert all data values to strings (FCM requirement)
      const stringData = {};
      if (message.data) {
        Object.keys(message.data).forEach((key) => {
          stringData[key] = String(message.data[key]);
        });
      }

      const payload = {
        token: token,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: stringData,
        android: {
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
      };

      console.log(
        "📤 [FCM Service] Full payload being sent:",
        JSON.stringify(payload, null, 2)
      );

      const response = await this.messaging.send(payload);
      console.log(
        "✅ [FCM Service] Message sent successfully. Response:",
        response
      );

      return { success: true, messageId: response };
    } catch (error) {
      console.error("Error sending to token:", error);

      // If token is invalid, we should remove it
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token"
      ) {
        return { success: false, invalidToken: true, error: error.message };
      }

      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple tokens
  async sendToMultipleTokens(tokens, message) {
    const results = {
      successful: [],
      failed: [],
      invalidTokens: [],
    };

    // Send to all tokens in parallel
    const promises = tokens.map(async (tokenData) => {
      const result = await this.sendToToken(tokenData.token, message);

      if (result.success) {
        results.successful.push({
          userId: tokenData.userId,
          username: tokenData.username,
          messageId: result.messageId,
        });
      } else if (result.invalidToken) {
        results.invalidTokens.push({
          userId: tokenData.userId,
          username: tokenData.username,
          token: tokenData.token,
        });
      } else {
        results.failed.push({
          userId: tokenData.userId,
          username: tokenData.username,
          error: result.error,
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Send notification to a group of tokens
  async sendToTokens(tokens, messageType, messageData) {
    try {
      if (!Array.isArray(tokens) || tokens.length === 0) {
        return {
          success: true,
          message: "No tokens to notify",
          results: { successful: [], failed: [], invalidTokens: [] },
        };
      }

      // Create the message
      const message = createMessage(messageType, messageData);

      // Send notifications
      const results = await this.sendToMultipleTokens(tokens, message);

      // Clean up invalid tokens from database
      if (results.invalidTokens.length > 0) {
        await this.cleanupInvalidTokens(results.invalidTokens);
      }

      return {
        success: true,
        message: `Notified ${results.successful.length} users`,
        results,
      };
    } catch (error) {
      console.error("Error sending to tokens:", error);
      throw error;
    }
  }

  // Clean up invalid tokens from database
  async cleanupInvalidTokens(invalidTokens) {
    try {
      const batch = db.batch();

      invalidTokens.forEach((tokenData) => {
        if (tokenData.tokenId) {
          const tokenRef = db.collection("fcm_tokens").doc(tokenData.tokenId);
          batch.delete(tokenRef);
        }
      });

      await batch.commit();

      console.log(
        `Cleaned up ${invalidTokens.length} invalid tokens from database`
      );
    } catch (error) {
      console.error("Error cleaning up invalid tokens:", error);
    }
  }

  // Register a new FCM token
  async registerToken(userId, username, fcmToken, metadata = {}) {
    try {
      const tokenData = {
        userId,
        username,
        token: fcmToken,
        metadata,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      const tokenRef = await db.collection("fcm_tokens").add(tokenData);

      return {
        success: true,
        tokenId: tokenRef.id,
        message: `Token registered for user ${username}`,
      };
    } catch (error) {
      console.error("Error registering token:", error);
      throw error;
    }
  }

  // Update an existing FCM token (by userId - finds most recent token)
  async updateToken(userId, newToken, metadata = {}) {
    try {
      // Find the user's most recent token
      const tokensSnapshot = await db
        .collection("fcm_tokens")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (tokensSnapshot.empty) {
        throw new Error("No token found for this user");
      }

      const tokenDoc = tokensSnapshot.docs[0];
      const tokenRef = tokenDoc.ref;

      await tokenRef.update({
        token: newToken,
        lastActive: new Date().toISOString(),
        ...metadata,
      });

      return {
        success: true,
        message: "Token updated successfully",
        tokenId: tokenDoc.id,
      };
    } catch (error) {
      console.error("Error updating token:", error);
      throw error;
    }
  }

  // Update token by specific tokenId (for backward compatibility)
  async updateTokenById(tokenId, newToken, metadata = {}) {
    try {
      const tokenRef = db.collection("fcm_tokens").doc(tokenId);

      await tokenRef.update({
        token: newToken,
        lastActive: new Date().toISOString(),
        ...metadata,
      });

      return {
        success: true,
        message: "Token updated successfully",
        tokenId,
      };
    } catch (error) {
      console.error("Error updating token by ID:", error);
      throw error;
    }
  }

  // Remove a token
  async removeToken(tokenId) {
    try {
      const tokenRef = db.collection("fcm_tokens").doc(tokenId);
      await tokenRef.delete();

      return {
        success: true,
        message: "Token removed successfully",
      };
    } catch (error) {
      console.error("Error removing token:", error);
      throw error;
    }
  }

  // Get tokens by user ID
  async getTokensByUserId(userId) {
    try {
      const tokensSnapshot = await db
        .collection("fcm_tokens")
        .where("userId", "==", userId)
        .get();

      const tokens = [];
      tokensSnapshot.forEach((doc) => {
        tokens.push({
          tokenId: doc.id,
          ...doc.data(),
        });
      });

      return tokens;
    } catch (error) {
      console.error("Error getting tokens by user ID:", error);
      throw error;
    }
  }

  // Get all tokens (for admin purposes)
  async getAllTokens() {
    try {
      const tokensSnapshot = await db.collection("fcm_tokens").get();

      const tokens = [];
      tokensSnapshot.forEach((doc) => {
        tokens.push({
          tokenId: doc.id,
          ...doc.data(),
        });
      });

      return tokens;
    } catch (error) {
      console.error("Error getting all tokens:", error);
      throw error;
    }
  }
}

module.exports = new FCMService();
