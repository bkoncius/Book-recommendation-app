const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require('./db');
require('dotenv').config();

const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174"],
};

app.use(cors(corsOptions));
app.use(express.json()); // Essential for parsing JSON bodies

// JWT Secret - in production this should be in .env
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

app.get("/api", (req, res) => {
    res.json({ message: "hello from express" });
});

// Registration logic
app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check if email already exists
        const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (userExists) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if this is the first user (make them admin)
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const role = userCount.count === 0 ? 'admin' : 'user';

        // Insert user (using email as username if not provided)
        const stmt = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
        const result = stmt.run(username || email.split('@')[0], email, passwordHash, role);

        const newUser = db.prepare('SELECT id, email, username, role FROM users WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// Login logic
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check for user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during login" });
    }
});

// Import middleware
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// ============= CATEGORY ROUTES (Admin Only) =============

// Get all categories (public)
app.get("/api/categories", (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching categories" });
    }
});

// Create category (admin only)
app.post("/api/categories", authenticateToken, requireAdmin, (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: "Category name is required" });
    }

    try {
        const stmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
        const result = stmt.run(name.trim(), description || null);

        const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });
    } catch (err) {
        console.error(err);
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }
        res.status(500).json({ message: "Error creating category" });
    }
});

// Update category (admin only)
app.put("/api/categories/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: "Category name is required" });
    }

    try {
        const stmt = db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?');
        const result = stmt.run(name.trim(), description || null, id);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

        res.json({
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (err) {
        console.error(err);
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }
        res.status(500).json({ message: "Error updating category" });
    }
});

// Delete category (admin only)
app.delete("/api/categories/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting category" });
    }
});

// ============= BOOK ROUTES =============

// Get all books (public)
app.get("/api/books", (req, res) => {
    try {
        console.log('Query Params:', req.query);
        const { category, search } = req.query;

        let query = `
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id
        `;

        const finalParams = [];
        const whereClauses = [];

        if (category && category !== '') {
            whereClauses.push('b.category_id = ?');
            finalParams.push(category);
        }

        if (search && search !== '') {
            whereClauses.push('(b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)');
            const s = `%${search}%`;
            finalParams.push(s, s, s);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY b.id DESC';

        console.log('Executing Query:', query);
        console.log('With Params:', finalParams);

        const books = db.prepare(query).all(...finalParams);
        console.log(`Found ${books.length} books`);
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Get single book
app.get("/api/books/:id", (req, res) => {
    const { id } = req.params;
    try {
        const book = db.prepare('SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?').get(id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching book" });
    }
});

// Create book (admin only)
app.post("/api/books", authenticateToken, requireAdmin, (req, res) => {
    const { title, author, description, category_id, cover_image_url, published_date } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: "Title and author are required" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO books (title, author, description, category_id, cover_image_url, published_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(title, author, description || null, category_id || null, cover_image_url || null, published_date || null);

        const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            message: "Book created successfully",
            book: newBook
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating book" });
    }
});

// Update book (admin only)
app.put("/api/books/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { title, author, description, category_id, cover_image_url, published_date } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: "Title and author are required" });
    }

    try {
        const stmt = db.prepare(`
            UPDATE books 
            SET title = ?, author = ?, description = ?, category_id = ?, cover_image_url = ?, published_date = ?
            WHERE id = ?
        `);
        const result = stmt.run(title, author, description || null, category_id || null, cover_image_url || null, published_date || null, id);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);

        res.json({
            message: "Book updated successfully",
            book: updatedBook
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating book" });
    }
});

// Delete book (admin only)
app.delete("/api/books/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM books WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting book" });
    }
});

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const result = db.prepare('SELECT datetime("now") as now').get();
        res.json({
            message: "Database connection successful!",
            time: result.now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

// ============= REVIEW ROUTES =============

// Get reviews for a book
app.get("/api/books/:id/reviews", (req, res) => {
    const { id } = req.params;
    try {
        const reviews = db.prepare(`
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.book_id = ? 
            ORDER BY r.created_at DESC
        `).all(id);
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching reviews" });
    }
});

// Add a review
app.post("/api/books/:id/reviews", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        // Check if user already reviewed this book
        const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND book_id = ?').get(user_id, id);

        if (existing) {
            db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?')
                .run(rating, comment, existing.id);
            res.json({ message: "Review updated successfully" });
        } else {
            db.prepare('INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)')
                .run(user_id, id, rating, comment);
            res.status(201).json({ message: "Review added successfully" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving review" });
    }
});

app.listen(5000, () => {
    console.log("server running on port 5000");
});
