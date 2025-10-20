const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error response
  let statusCode = 500;
  let message = "Internal server error";

  // Handle specific error types
  if (err.message?.includes("not found")) {
    statusCode = 404;
    message = err.message;
  } else if (err.message?.includes("Validation")) {
    statusCode = 400;
    message = err.message;
  } else if (err.message?.includes("Firebase")) {
    statusCode = 503;
    message = "Firebase service unavailable";
  } else if (err.message?.includes("already exists")) {
    statusCode = 409;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
