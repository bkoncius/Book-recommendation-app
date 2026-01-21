import express from "express";
import { getAllBooks, getBookById } from "../controllers/books.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);

export default router;
