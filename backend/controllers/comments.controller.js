import { pool } from "../config/db.js";
import logger from "../config/logger.js";

export const addComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    // Check if book exists
    const bookCheck = await pool.query("SELECT id FROM books WHERE id = $1", [
      bookId,
    ]);
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const result = await pool.query(
      "INSERT INTO comments (user_id, book_id, comment) VALUES ($1, $2, $3) RETURNING *",
      [userId, bookId, content.trim()],
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error adding comment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { bookId } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.book_id = $1
       ORDER BY c.created_at DESC`,
      [bookId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error(`Error fetching comments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    // Check if comment exists and user owns it
    const commentCheck = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId],
    );
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (commentCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own comments",
      });
    }

    const result = await pool.query(
      "UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [content.trim(), commentId],
    );

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error updating comment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if comment exists and user owns it
    const commentCheck = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId],
    );
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (commentCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting comment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};
