import { query } from "../config/db.js";

export async function ensurePropertiesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      commune TEXT DEFAULT '',
      quartier TEXT DEFAULT '',
      loc TEXT NOT NULL,
      price NUMERIC NOT NULL,
      price_unit TEXT NOT NULL DEFAULT 'nuit',
      rating TEXT DEFAULT '—',
      badge TEXT,
      img TEXT NOT NULL,
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      description TEXT DEFAULT '',
      bedrooms INTEGER DEFAULT 0,
      bathrooms INTEGER DEFAULT 0,
      capacity INTEGER DEFAULT 1,
      surface NUMERIC DEFAULT 0,
      amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
      host TEXT DEFAULT 'Agence AXXAM',
      agency_id TEXT DEFAULT 'agence-demo',
      type TEXT NOT NULL,
      category TEXT DEFAULT 'autre',
      transaction_type TEXT NOT NULL DEFAULT 'location',
      status TEXT NOT NULL DEFAULT 'active',
      unavailable_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS unavailable_dates JSONB NOT NULL DEFAULT '[]'::jsonb;
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_properties_agency ON properties (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);`);
}

function normalizeDates(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((d) => String(d).slice(0, 10))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    ),
  ].sort();
}

export function mapPropertyRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    commune: row.commune,
    quartier: row.quartier,
    loc: row.loc,
    price: Number(row.price),
    priceUnit: row.price_unit,
    rating: row.rating,
    badge: row.badge,
    img: row.img,
    images: row.images || [],
    description: row.description,
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    capacity: Number(row.capacity) || 1,
    surface: Number(row.surface) || 0,
    amenities: row.amenities || [],
    host: row.host,
    agencyId: row.agency_id,
    type: row.type,
    category: row.category,
    transaction: row.transaction_type,
    status: row.status,
    unavailableDates: normalizeDates(row.unavailable_dates),
    createdAt: row.created_at,
  };
}

export { normalizeDates };
