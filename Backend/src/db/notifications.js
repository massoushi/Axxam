import { query } from "../config/db.js";
import { once } from "./once.js";

export const ensureNotificationsTable = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      link TEXT DEFAULT '',
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);`);
});

export function mapNotificationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body || "",
    link: row.link || "",
    readAt: row.read_at || null,
    createdAt: row.created_at,
  };
}

export async function createNotification({ userId, type = "info", title, body = "", link = "" }) {
  const id = `ntf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const result = await query(
    `
    INSERT INTO notifications (id, user_id, type, title, body, link)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [id, userId, type, title, body, link]
  );
  return mapNotificationRow(result.rows[0]);
}
