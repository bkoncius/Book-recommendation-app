const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Fixing database schema...');

function addColumn(table, column, type) {
    try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        console.log(`✅ Added column ${column} to table ${table}`);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log(`ℹ️ Column ${column} already exists in ${table}`);
        } else {
            console.error(`❌ Error adding column ${column}:`, err.message);
        }
    }
}

// Ensure categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log('✅ Categories table ensured');

// Fix users table (from previous step)
addColumn('users', 'role', "TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'))");

// Fix books table
addColumn('books', 'category_id', 'INTEGER');
addColumn('books', 'cover_image_url', 'TEXT');
addColumn('books', 'published_date', 'DATE');

console.log('Database fix complete!');
db.close();
