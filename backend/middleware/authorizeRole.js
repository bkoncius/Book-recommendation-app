import AppError from "../utils/AppError.js";

export const authorizeRole = (...allowedRoleIds) => {
  return (req, res, next) => {
    const user = req.user;

    if (!allowedRoleIds.includes(user.role_id)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};
