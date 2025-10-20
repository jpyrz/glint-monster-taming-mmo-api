const validateRegisterTokenRequest = (req, res, next) => {
  const { fcmToken } = req.body;

  const errors = [];

  // Note: userId and username are now taken from authenticated user (req.user)
  // So we only need to validate the fcmToken

  if (
    !fcmToken ||
    typeof fcmToken !== "string" ||
    fcmToken.trim().length === 0
  ) {
    errors.push("fcmToken is required and must be a non-empty string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Trim whitespace
  req.body.fcmToken = fcmToken.trim();

  next();
};

const validateUpdateTokenRequest = (req, res, next) => {
  const { fcmToken } = req.body;

  const errors = [];

  // Note: We now update by userId (from authenticated user), not tokenId

  if (
    !fcmToken ||
    typeof fcmToken !== "string" ||
    fcmToken.trim().length === 0
  ) {
    errors.push("fcmToken is required and must be a non-empty string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Trim whitespace
  req.body.fcmToken = fcmToken.trim();

  next();
};

const validateSendNotificationRequest = (req, res, next) => {
  const { tokens, messageType, messageData } = req.body;

  const errors = [];

  if (!Array.isArray(tokens)) {
    errors.push("tokens is required and must be an array");
  } else if (tokens.length === 0) {
    errors.push("tokens array cannot be empty");
  } else {
    // Validate each token object
    tokens.forEach((token, index) => {
      if (!token || typeof token !== "object") {
        errors.push(`tokens[${index}] must be an object`);
      } else {
        if (!token.token || typeof token.token !== "string") {
          errors.push(
            `tokens[${index}].token is required and must be a string`
          );
        }
      }
    });
  }

  if (
    !messageType ||
    typeof messageType !== "string" ||
    messageType.trim().length === 0
  ) {
    errors.push("messageType is required and must be a non-empty string");
  }

  if (!messageData || typeof messageData !== "object") {
    errors.push("messageData is required and must be an object");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Trim whitespace
  req.body.messageType = messageType.trim();

  next();
};

// Generic validation function for any schema
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Check each field in the schema
    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = req.body[fieldName];

      // Check if required field is missing
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${fieldName} is required`);
        continue;
      }

      // Skip validation if field is not required and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rules.type) {
        switch (rules.type) {
          case "string":
            if (typeof value !== "string") {
              errors.push(`${fieldName} must be a string`);
            } else if (rules.minLength && value.length < rules.minLength) {
              errors.push(
                `${fieldName} must be at least ${rules.minLength} characters`
              );
            }
            break;

          case "email":
            if (typeof value !== "string") {
              errors.push(`${fieldName} must be a string`);
            } else {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                errors.push(`${fieldName} must be a valid email address`);
              }
            }
            break;

          case "boolean":
            if (typeof value !== "boolean") {
              errors.push(`${fieldName} must be a boolean`);
            }
            break;

          case "object":
            if (typeof value !== "object" || Array.isArray(value)) {
              errors.push(`${fieldName} must be an object`);
            }
            break;

          case "array":
            if (!Array.isArray(value)) {
              errors.push(`${fieldName} must be an array`);
            }
            break;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

module.exports = {
  validateRegisterTokenRequest,
  validateUpdateTokenRequest,
  validateSendNotificationRequest,
  validateRequest,
};
