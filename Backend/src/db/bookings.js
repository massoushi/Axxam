import { query } from "../config/db.js";
import { once } from "./once.js";

export const ensureBookingsTable = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      host_id TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      guest_first_name TEXT NOT NULL DEFAULT '',
      guest_last_name TEXT NOT NULL DEFAULT '',
      guest_email TEXT NOT NULL DEFAULT '',
      guest_phone TEXT NOT NULL DEFAULT '',
      special_requests TEXT DEFAULT '',
      nights INTEGER NOT NULL DEFAULT 1,
      price_per_night NUMERIC NOT NULL DEFAULT 0,
      total_price NUMERIC NOT NULL DEFAULT 0,
      service_fee NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';`);
  await query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;`);

  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings (client_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings (host_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings (property_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_payment ON bookings (payment_status);`);
});

function toISODate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function mapBookingRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    propertyId: row.property_id,
    clientId: row.client_id,
    hostId: row.host_id,
    checkIn: toISODate(row.check_in),
    checkOut: toISODate(row.check_out),
    guests: Number(row.guests) || 1,
    guestFirstName: row.guest_first_name || "",
    guestLastName: row.guest_last_name || "",
    guestEmail: row.guest_email || "",
    guestPhone: row.guest_phone || "",
    specialRequests: row.special_requests || "",
    nights: Number(row.nights) || 0,
    pricePerNight: Number(row.price_per_night) || 0,
    totalPrice: Number(row.total_price) || 0,
    serviceFee: Number(row.service_fee) || 0,
    status: row.status,
    paymentStatus: row.payment_status || "unpaid",
    paidAt: row.paid_at || null,
    createdAt: row.created_at,
    propertyName: row.property_name || null,
    propertyImg: row.property_img || null,
    propertyLoc: row.property_loc || null,
    propertyCity: row.property_city || null,
    clientName: row.client_name || null,
    clientEmail: row.client_email || null,
  };
}

/** Génère les nuits [checkIn, checkOut) */
export function nightsBetween(checkIn, checkOut) {
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const days = [];
  const cur = new Date(start);
  while (cur < end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}
