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

export const createBook = async (req, res) => {
  try {
    const { title, description, image_url, category_id, isbn, pages } =
      req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Book title is required",
      });
    }

    // Check if category exists (if provided)
    if (category_id) {
      const categoryExists = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [category_id],
      );
      if (categoryExists.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    const result = await pool.query(
      "INSERT INTO books (title, description, image_url, category_id, isbn, pages) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        title.trim(),
        description || null,
        image_url || null,
        category_id || null,
        isbn || null,
        pages || null,
      ],
    );

    logger.info(`Book created: ${title}`);
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error creating book: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, category_id, isbn, pages } =
      req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Book title is required",
      });
    }

    // Check if book exists
    const bookExists = await pool.query("SELECT * FROM books WHERE id = $1", [
      id,
    ]);

    if (bookExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if category exists (if provided)
    if (category_id) {
      const categoryExists = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [category_id],
      );
      if (categoryExists.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    const result = await pool.query(
      "UPDATE books SET title = $1, description = $2, image_url = $3, category_id = $4, isbn = $5, pages = $6 WHERE id = $7 RETURNING *",
      [
        title.trim(),
        description || null,
        image_url || null,
        category_id || null,
        isbn || null,
        pages || null,
        id,
      ],
    );

    logger.info(`Book updated: ${title}`);
    res.json({
      success: true,
      message: "Book updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error updating book: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const bookExists = await pool.query("SELECT * FROM books WHERE id = $1", [
      id,
    ]);

    if (bookExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Delete related records first (ratings, comments, favorites)
    await pool.query("DELETE FROM ratings WHERE book_id = $1", [id]);
    await pool.query("DELETE FROM comments WHERE book_id = $1", [id]);
    await pool.query("DELETE FROM favorites WHERE book_id = $1", [id]);

    // Delete the book
    await pool.query("DELETE FROM books WHERE id = $1", [id]);

    logger.info(`Book deleted: ${id}`);
    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting book: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};
