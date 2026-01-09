const { Client } = require('pg');
require('dotenv').config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

async function setupDatabase() {
    const setupClient = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: 'postgres', // Connect to default database
    });

    try {
        await setupClient.connect();

        // Check if database exists
        const res = await setupClient.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database ${DB_NAME}...`);
            await setupClient.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`Database ${DB_NAME} created.`);
        } else {
            console.log(`Database ${DB_NAME} already exists.`);
        }

        await setupClient.end();

        // Now connect to the new database to create tables
        const dbClient = new Client({
            user: DB_USER,
            password: DB_PASSWORD,
            host: DB_HOST,
            port: DB_PORT,
            database: DB_NAME,
        });

        await dbClient.connect();

        console.log('Creating tables...');

        // Users table
        await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Books table
        await dbClient.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url VARCHAR(255),
        published_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Reviews table
        await dbClient.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Recommendations table (optional store for generated recommendations)
        await dbClient.query(`
        CREATE TABLE IF NOT EXISTS recommendations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
          score DECIMAL(3, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

        console.log('Tables created successfully.');
        await dbClient.end();

    } catch (err) {
        console.error('Error setting up database:', err);
    }
}

setupDatabase();
