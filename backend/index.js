const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5174"],
};
app.use(cors(corsOptions));

const db = require('./db');

app.get("/api", (req, res) => {
    res.json({ message: "hello from express" });
});

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            message: "Database connection successful!",
            time: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

app.listen(5000, () => {
    console.log("server running on port 5000");
});