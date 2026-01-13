const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Seeding data with robust script...');

try {
    // 1. Create tables if they don't exist (just in case)
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT
        );
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT,
            category_id INTEGER,
            cover_image_url TEXT,
            published_date DATE
        );
    `);

    // 2. Clear existing data to avoid duplicates/conflicts during testing
    db.exec('DELETE FROM books');
    db.exec('DELETE FROM categories');

    // 3. Insert categories
    const categories = [
        ['Science Fiction', 'Explore the future and outer space'],
        ['Fantasy', 'Magic, dragons, and epic quests'],
        ['Mystery', 'Thrilling puzzles and suspense'],
        ['Non-Fiction', 'Real stories and facts']
    ];

    const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    for (const cat of categories) {
        insertCat.run(cat[0], cat[1]);
    }

    // 4. Get the IDs
    const sciFiId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Science Fiction').id;
    const fantasyId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Fantasy').id;

    // 5. Insert books
    const books = [
        ['Dune', 'Frank Herbert', 'A stunning blend of adventure and mysticism...', sciFiId, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg'],
        ['The Hobbit', 'J.R.R. Tolkien', 'Bilbo Baggins is a hobbit who enjoys a comfortable...', fantasyId, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg'],
        ['Project Hail Mary', 'Andy Weir', 'Ryland Grace is the sole survivor on a desperate...', sciFiId, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597655892i/54493401.jpg']
    ];

    const insertBook = db.prepare('INSERT INTO books (title, author, description, category_id, cover_image_url) VALUES (?, ?, ?, ?, ?)');
    for (const book of books) {
        insertBook.run(...book);
    }

    console.log('✅ DATABASE SUCCESSFULLY SEEDED WITH 3 BOOKS');

    // Quick verification
    const count = db.prepare('SELECT COUNT(*) as count FROM books').get().count;
    console.log('Total books in DB now:', count);

} catch (err) {
    console.error('❌ SEED ERROR:', err.message);
} finally {
    db.close();
}
