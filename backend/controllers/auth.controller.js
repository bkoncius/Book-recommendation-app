import authService from "../services/auth.service.js";

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
};

export default authController;
