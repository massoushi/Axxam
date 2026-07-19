import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

if (!env.databaseUrl) {
  console.warn("⚠ DATABASE_URL manquant dans .env");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

pool.on("error", (err) => {
  console.error("Erreur pool PostgreSQL:", err.message);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
