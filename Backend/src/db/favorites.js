import { query } from "../config/db.js";
import { once } from "./once.js";

export const ensureFavoritesTable = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, property_id)
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);`);
});
