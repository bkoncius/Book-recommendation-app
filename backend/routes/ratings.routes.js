import express from "express";
import {
  addOrUpdateRating,
  getUserRating,
  getBookRatings,
  deleteRating,
} from "../controllers/ratings.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Public routes
router.get("/:bookId/stats", getBookRatings);

// Protected routes
router.post("/:bookId", requireAuth, addOrUpdateRating);
router.get("/:bookId", requireAuth, getUserRating);
router.delete("/:bookId", requireAuth, deleteRating);

export default router;
