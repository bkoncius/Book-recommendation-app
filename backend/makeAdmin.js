const db = require('./db');

// Make the first user (andrius123) an admin
try {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = 1');
    const result = stmt.run('admin');

    if (result.changes > 0) {
        console.log('✅ First user updated to admin role!');
        const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = 1').get();
        console.log('User:', user);
    } else {
        console.log('❌ No user found with id = 1');
    }
} catch (err) {
    console.error('Error:', err);
}
