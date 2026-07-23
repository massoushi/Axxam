import { query } from "../config/db.js";
import { once } from "./once.js";

export const ensureReviewsTable = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews (property_id);`);
});

export function mapReviewRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookingId: row.booking_id,
    propertyId: row.property_id,
    clientId: row.client_id,
    rating: Number(row.rating) || 0,
    comment: row.comment || "",
    createdAt: row.created_at,
    clientName: row.client_name || null,
  };
}
