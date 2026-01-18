import { checkSchema } from "express-validator";

export const authSchema = {
  register: checkSchema({
    email: {
      in: ["body"],
      trim: true,
      notEmpty: {
        errorMessage: "Email is required",
      },
      isEmail: {
        errorMessage: "Email must be valid",
      },
      normalizeEmail: true,
    },
    password: {
      in: ["body"],
      trim: true,
      notEmpty: {
        errorMessage: "Password is required",
      },
      matches: {
        options:
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%.&+=])(?=\S+$).{6,20}$/,
        errorMessage:
          "Password must have uppercase, lowercase, digit, and special char (@#$%.&+=)",
      },
    },
  }),
  login: checkSchema({
    email: {
      in: ["body"],
      trim: true,
      notEmpty: {
        errorMessage: "Email is required",
      },
      isEmail: {
        errorMessage: "Email must be valid",
      },
      normalizeEmail: true,
    },
    password: {
      in: ["body"],
      trim: true,
      notEmpty: {
        errorMessage: "Password is required",
      },
    },
  }),
};
