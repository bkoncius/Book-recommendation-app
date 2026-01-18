import { pool } from "../config/db.js";
import logger from "../config/logger.js";

export const getAllBooks = async (req, res) => {
  try {
    const { categoryId, search } = req.query;

    let query = `
      SELECT b.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN ratings r ON b.id = r.book_id
    `;
    const params = [];

    if (categoryId) {
      query += " WHERE b.category_id = $" + (params.length + 1);
      params.push(categoryId);
    }

    if (search) {
      const searchTerm = "%" + search + "%";
      const searchCondition =
        " (b.title ILIKE $" +
        (params.length + 1) +
        " OR b.description ILIKE $" +
        (params.length + 2) +
        ")";
      query +=
        params.length > 0
          ? " AND " + searchCondition
          : " WHERE " + searchCondition;
      params.push(searchTerm);
      params.push(searchTerm);
    }

    query += " GROUP BY b.id, c.id ORDER BY b.created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const bookQuery = `
      SELECT b.*, c.name as category_name FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.id = $1
    `;
    const bookResult = await pool.query(bookQuery, [id]);

    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = bookResult.rows[0];

    // Get average rating
    const ratingQuery = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings 
      FROM ratings WHERE book_id = $1
    `;
    const ratingResult = await pool.query(ratingQuery, [id]);
    book.average_rating = parseFloat(ratingResult.rows[0].average_rating) || 0;
    book.total_ratings = parseInt(ratingResult.rows[0].total_ratings);

    // Get comments count
    const commentsQuery = `SELECT COUNT(*) as total_comments FROM comments WHERE book_id = $1`;
    const commentsResult = await pool.query(commentsQuery, [id]);
    book.total_comments = parseInt(commentsResult.rows[0].total_comments);

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    logger.error(`Error fetching book: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC",
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
