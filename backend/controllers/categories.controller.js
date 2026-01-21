import { pool } from "../config/db.js";
import logger from "../config/logger.js";

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

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await pool.query(
      "SELECT * FROM categories WHERE LOWER(name) = LOWER($1)",
      [name.trim()],
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Category "${name}" already exists`,
      });
    }

    const result = await pool.query(
      "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
      [name.trim(), description || null],
    );

    logger.info(`Category created: ${name}`);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category exists
    const categoryExists = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categoryExists = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if any books use this category
    const booksUsingCategory = await pool.query(
      "SELECT COUNT(*) as count FROM books WHERE category_id = $1",
      [id],
    );

    if (booksUsingCategory.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${booksUsingCategory.rows[0].count} book(s) are using this category`,
      });
    }

    await pool.query("DELETE FROM categories WHERE id = $1", [id]);

    logger.info(`Category deleted: ${id}`);
    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
