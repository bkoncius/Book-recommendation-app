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
          "Password must be 6-20 cahrs and include at least one uppercase letter, one digit, an one special charcters",
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
