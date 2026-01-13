const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

try {
    // 1. Give Admin to andrius123
    const userUpdate = db.prepare('UPDATE users SET role = ? WHERE username = ?').run('admin', 'andrius123');
    if (userUpdate.changes > 0) {
        console.log('✅ User andrius123 is now an Admin!');
    } else {
        console.log('⚠️ User andrius123 not found in database.');
    }

    // 2. Fix Project Hail Mary cover
    const bookUpdate = db.prepare('UPDATE books SET cover_image_url = ? WHERE title = ?')
        .run('https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597655892i/54493401.jpg', 'Project Hail Mary');

    if (bookUpdate.changes > 0) {
        console.log('✅ Project Hail Mary cover image fixed!');
    } else {
        console.log('⚠️ Project Hail Mary not found in database.');
    }

} catch (err) {
    console.error('❌ Error during update:', err.message);
} finally {
    db.close();
}
