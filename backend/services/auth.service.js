import { pool } from "../config/db.js";
import argon2 from "argon2";

const authService = {
  register: async ({ email, password }) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const passwordHash = await argon2.hash(password);

      const userInsertQuery = `
                INSERT INTO users (email)
                VALUES ($1)
                RETURNING id, role_id, created_at, email;
            `;

      const userValues = [email];

      const userResult = await client.query(userInsertQuery, userValues);
      console.log(userResult);
      const user = userResult.rows[0];

      const secretInsertQuery = `
                INSERT INTO user_secrets (user_id, password)
                VALUES ($1, $2)
                RETURNING id
            `;

      const secretValues = [user.id, passwordHash];

      await client.query(secretInsertQuery, secretValues);

      await client.query("COMMIT");

      return { id: user.id, email: user.email, role_id: user.role_id };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

export default authService;
