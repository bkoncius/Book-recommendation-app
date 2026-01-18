import { pool } from "./config/db.js";

const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log("Starting database setup...");

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Categories table created");

    // Create books table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        cover_url VARCHAR(255),
        isbn VARCHAR(20) UNIQUE,
        published_date DATE,
        pages INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Books table created");

    // Create favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);
    console.log("Favorites table created");

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Comments table created");

    // Create ratings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);
    console.log("Ratings table created");

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments(book_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings(book_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id)`);
    console.log("Indexes created");

    // Insert sample categories
    await client.query(`
      INSERT INTO categories (name, description) VALUES
      ('Fiction', 'Novel and fiction books'),
      ('Science Fiction', 'Science fiction and fantasy'),
      ('Mystery', 'Mystery and thriller books'),
      ('Biography', 'Biographical and memoir books'),
      ('Self-Help', 'Personal development and self-help'),
      ('History', 'Historical non-fiction')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log("Sample categories inserted");

    // Insert sample books
    await client.query(`
      INSERT INTO books (title, author, description, category_id, isbn, pages) VALUES
      ('The Midnight Library', 'Matt Haig', 'A novel about a woman between life and death', 1, '978-0525555023', 304),
      ('Dune', 'Frank Herbert', 'Epic science fiction novel about a desert planet', 2, '978-0441172719', 688),
      ('The Girl with the Dragon Tattoo', 'Stieg Larsson', 'A mystery thriller novel', 3, '978-0307269935', 465),
      ('Steve Jobs', 'Walter Isaacson', 'Biography of Apple founder Steve Jobs', 4, '978-1451648539', 656),
      ('Atomic Habits', 'James Clear', 'Building good habits and breaking bad ones', 5, '978-0735211292', 320),
      ('The Silk Roads', 'Peter Frankopan', 'A history of trade and civilization', 6, '978-0747597629', 650)
      ON CONFLICT (isbn) DO NOTHING
    `);
    console.log("Sample books inserted");

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Database setup error:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

setupDatabase();
