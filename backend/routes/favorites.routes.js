import express from "express";
import { addFavorite, removeFavorite, getUserFavorites, isFavorite } from "../controllers/favorites.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.post("/", addFavorite);
router.delete("/:bookId", removeFavorite);
router.get("/", getUserFavorites);
router.get("/check/:bookId", isFavorite);

export default router;
