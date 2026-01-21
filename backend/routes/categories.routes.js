import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", getCategories);

router.post("/", requireAuth, authorizeRole(2), createCategory);
router.put("/:id", requireAuth, authorizeRole(2), updateCategory);
router.delete("/:id", requireAuth, authorizeRole(2), deleteCategory);

export default router;
