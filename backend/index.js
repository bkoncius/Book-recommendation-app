import express from "express";
import { pool } from "./config/db.js";
import authRoute from "./routes/auth.routes.js";
import booksRoute from "./routes/books.routes.js";
import categoriesRoute from "./routes/categories.routes.js";
import favoritesRoute from "./routes/favorites.routes.js";
import commentsRoute from "./routes/comments.routes.js";
import ratingsRoute from "./routes/ratings.routes.js";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
import cookieParser from "cookie-parser";

const postgressConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

postgressConnection();

const app = express();

app.use(cookieParser());

app.use(requestLogger);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/books", booksRoute);
app.use("/api/v1/categories", categoriesRoute);
app.use("/api/v1/favorites", favoritesRoute);
app.use("/api/v1/comments", commentsRoute);
app.use("/api/v1/ratings", ratingsRoute);
app.use("/api/v1/auth", authRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  logger.info("Shutting down server.");

  server.close(async () => {
    logger.info("HTTP server closed.");

    try {
      await pool.end();
      logger.info("PostgreSQL connection closed.");
    } catch (error) {
      logger.error(`Error closing DB connection ${error.message}`);
    }

    logger.info("Shutdown complete.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
