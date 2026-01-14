import authService from "../services/auth.service.js";
import AppError from "../utils/AppError.js";
import {
  createAccessToken,
  setAuthCookie,
  clearAuthCookie,
} from "../utils/auth.js";

const authController = {
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await authService.register({ email, password });

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      if (error.code === "23505") {
        return next(new AppError("Email already exits", 409));
      }

      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await authService.login({ email, password });

      const token = createAccessToken(user);

      setAuthCookie(res, token);

      res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        data: user,
      });
    } catch (error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return next(new AppError("Invalid email or password", 401));
      }

      next(error);
    }
  },

  logout: (req, res) => {
    clearAuthCookie(res);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  },

  me: (req, res) => {
    res.status(200).json({
      status: "success",
      data: req.user,
    });
  },
};

export default authController;
