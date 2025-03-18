// ErrorHandler
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// global errorMiddleware...
export const errorMiddleware = (err, req, res, next) => {
  console.error("Error Caught in Middleware:", err);
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if(err.name === "CastError") err.message = "Invalid ID";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
