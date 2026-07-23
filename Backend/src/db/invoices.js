import { query } from "../config/db.js";

export async function ensureInvoicesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      host_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      property_name TEXT NOT NULL DEFAULT '',
      check_in DATE,
      check_out DATE,
      nights INTEGER NOT NULL DEFAULT 0,
      subtotal NUMERIC NOT NULL DEFAULT 0,
      service_fee NUMERIC NOT NULL DEFAULT 0,
      total NUMERIC NOT NULL DEFAULT 0,
      guest_name TEXT NOT NULL DEFAULT '',
      guest_email TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices (client_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_invoices_host ON invoices (host_id);`);
}

export function mapInvoiceRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    bookingId: row.booking_id,
    clientId: row.client_id,
    hostId: row.host_id,
    propertyId: row.property_id,
    propertyName: row.property_name || "",
    checkIn: row.check_in ? String(row.check_in).slice(0, 10) : "",
    checkOut: row.check_out ? String(row.check_out).slice(0, 10) : "",
    nights: Number(row.nights) || 0,
    subtotal: Number(row.subtotal) || 0,
    serviceFee: Number(row.service_fee) || 0,
    total: Number(row.total) || 0,
    guestName: row.guest_name || "",
    guestEmail: row.guest_email || "",
    createdAt: row.created_at,
  };
}
