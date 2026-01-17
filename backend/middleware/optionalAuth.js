import jwt from "jsonwebtoken";

console.log("OPTIONAL AUTH MIDDLEWARE LOADED");

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    req.user = null;
  }
  next();
};
