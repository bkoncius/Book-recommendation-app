import express from "express";
import {
  getAllBooks,
  getBookById,
  getCategories,
} from "../controllers/books.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllBooks);
router.get("/categories", getCategories);
router.get("/:id", getBookById);

export default router;
