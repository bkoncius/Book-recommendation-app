import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return next(new AppError("Not authenticated", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
