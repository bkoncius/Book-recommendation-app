import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Public routes
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Admin routes (role_id = 2)
router.post("/", requireAuth, authorizeRole(2), createBook);
router.put("/:id", requireAuth, authorizeRole(2), updateBook);
router.delete("/:id", requireAuth, authorizeRole(2), deleteBook);

export default router;
