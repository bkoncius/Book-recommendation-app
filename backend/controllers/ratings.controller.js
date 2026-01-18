import { pool } from "../config/db.js";
import logger from "../config/logger.js";

export const addOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
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

    // Check if rating already exists
    const existingRating = await pool.query("SELECT id FROM ratings WHERE user_id = $1 AND book_id = $2", [
      userId,
      bookId,
    ]);

    let result;
    if (existingRating.rows.length > 0) {
      // Update existing rating
      result = await pool.query(
        "UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND book_id = $3 RETURNING *",
        [rating, userId, bookId]
      );
    } else {
      // Create new rating
      result = await pool.query(
        "INSERT INTO ratings (user_id, book_id, rating) VALUES ($1, $2, $3) RETURNING *",
        [userId, bookId, rating]
      );
    }

    res.status(200).json({
      success: true,
      message: existingRating.rows.length > 0 ? "Rating updated successfully" : "Rating added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error adding/updating rating: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to add/update rating",
      error: error.message,
    });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const result = await pool.query("SELECT * FROM ratings WHERE user_id = $1 AND book_id = $2", [userId, bookId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error fetching user rating: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rating",
      error: error.message,
    });
  }
};

export const getBookRatings = async (req, res) => {
  try {
    const { bookId } = req.params;

    const result = await pool.query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings,
              FLOOR(AVG(rating)) as rounded_average
       FROM ratings WHERE book_id = $1`,
      [bookId]
    );

    const data = result.rows[0];
    data.average_rating = parseFloat(data.average_rating) || 0;
    data.total_ratings = parseInt(data.total_ratings);

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    logger.error(`Error fetching book ratings: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ratings",
      error: error.message,
    });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const result = await pool.query("DELETE FROM ratings WHERE user_id = $1 AND book_id = $2 RETURNING *", [
      userId,
      bookId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    res.json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting rating: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete rating",
      error: error.message,
    });
  }
};
