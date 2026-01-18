import express from "express";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comments.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Get comments (public)
router.get("/:bookId", getComments);

// All other routes require authentication
router.post("/:bookId", requireAuth, addComment);
router.put("/:commentId", requireAuth, updateComment);
router.delete("/:commentId", requireAuth, deleteComment);

export default router;
