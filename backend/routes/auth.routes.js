import express from "express";
import { authSchema } from "../schema/authSchema.js";
import { validateSchema } from "../middleware/validateSchema.js";
import authController from "../controllers/auth.controller.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const authRoute = express.Router();

authRoute.get("/me", optionalAuth, authController.me);
authRoute.post(
  "/register",
  validateSchema(authSchema.register),
  authController.register
);
authRoute.post(
  "/login",
  validateSchema(authSchema.login),
  authController.login
);
authRoute.post("/logout", authController.logout);

export default authRoute;
