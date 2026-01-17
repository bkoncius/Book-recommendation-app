import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export const validateSchema = (schema) => {
  return async (req, res, next) => {
    await Promise.all(schema.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  };
};
