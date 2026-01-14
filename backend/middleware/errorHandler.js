import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(
      `${statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`
    );
  } else {
    logger.warn(
      `${statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`
    );
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    statusCode,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
  });
};
