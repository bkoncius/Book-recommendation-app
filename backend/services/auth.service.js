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

  login: async ({ email, password }) => {
    try {
      const query = `
                SELECT
                    u.id,
                    u.email,
                    u.role_id,  
                    us.password
                FROM users u
                JOIN user_secrets us ON us.user_id = u.id
                WHERE u.email = $1
            `;

      const values = [email];

      const result = await pool.query(query, values);

      console.log(result.rows);

      const row = result.rows[0];

      if (!row) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const match = await argon2.verify(row.password, password);

      if (!match) throw new Error("INVALID_CREDENTIALS");

      return { id: row.id, email: row.email, role_id: row.role_id };
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
