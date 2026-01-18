import { pool } from "../config/db.js";
import logger from "../config/logger.js";

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required",
      });
    }

    // Check if book exists
    const bookCheck = await pool.query("SELECT id FROM books WHERE id = $1", [bookId]);
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Add to favorites
    try {
      const result = await pool.query(
        "INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) RETURNING *",
        [userId, bookId]
      );

      res.status(201).json({
        success: true,
        message: "Book added to favorites",
        data: result.rows[0],
      });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Book is already in favorites",
        });
      }
      throw err;
    }
  } catch (error) {
    logger.error(`Error adding favorite: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to add favorite",
      error: error.message,
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const result = await pool.query("DELETE FROM favorites WHERE user_id = $1 AND book_id = $2 RETURNING *", [
      userId,
      bookId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.json({
      success: true,
      message: "Book removed from favorites",
    });
  } catch (error) {
    logger.error(`Error removing favorite: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT b.* FROM books b
       INNER JOIN favorites f ON b.id = f.book_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error(`Error fetching favorites: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
      error: error.message,
    });
  }
};

export const isFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const result = await pool.query("SELECT id FROM favorites WHERE user_id = $1 AND book_id = $2", [userId, bookId]);

    res.json({
      success: true,
      isFavorite: result.rows.length > 0,
    });
  } catch (error) {
    logger.error(`Error checking favorite: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to check favorite",
      error: error.message,
    });
  }
};
