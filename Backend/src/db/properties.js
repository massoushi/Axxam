import { query } from "../config/db.js";
import { DEMO_PROPERTIES } from "../data/properties.js";

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

  await seedDemoProperties();
}

/** Insère les hébergements d'exemple s'ils n'existent pas encore (sans écraser les vrais). */
export async function seedDemoProperties() {
  await query(`DELETE FROM properties WHERE type = 'vehicule' OR id LIKE 'demo-voiture%' OR id LIKE 'demo-4x4%'`);

  for (const p of DEMO_PROPERTIES) {
    await query(
      `
      INSERT INTO properties (
        id, name, city, commune, quartier, loc, price, price_unit, rating, badge,
        img, images, description, bedrooms, bathrooms, capacity, surface, amenities,
        host, agency_id, type, category, transaction_type, status, unavailable_dates
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12::jsonb, $13, $14, $15, $16, $17, $18::jsonb,
        $19, $20, $21, $22, $23, $24, '[]'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        city = EXCLUDED.city,
        commune = EXCLUDED.commune,
        quartier = EXCLUDED.quartier,
        loc = EXCLUDED.loc,
        price = EXCLUDED.price,
        price_unit = EXCLUDED.price_unit,
        rating = EXCLUDED.rating,
        badge = EXCLUDED.badge,
        img = EXCLUDED.img,
        images = EXCLUDED.images,
        description = EXCLUDED.description,
        bedrooms = EXCLUDED.bedrooms,
        bathrooms = EXCLUDED.bathrooms,
        capacity = EXCLUDED.capacity,
        surface = EXCLUDED.surface,
        amenities = EXCLUDED.amenities,
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        transaction_type = EXCLUDED.transaction_type,
        status = EXCLUDED.status
      WHERE properties.agency_id = 'agence-demo'
      `,
      [
        p.id,
        p.name,
        p.city,
        p.commune || "",
        p.quartier || "",
        p.loc,
        p.price,
        p.priceUnit || "nuit",
        p.rating || "—",
        p.badge,
        p.img,
        JSON.stringify(p.images || [p.img]),
        p.description || "",
        p.bedrooms || 0,
        p.bathrooms || 0,
        p.capacity || 1,
        p.surface || 0,
        JSON.stringify(p.amenities || []),
        p.host || "AXXAM Démo",
        p.agencyId || "agence-demo",
        p.type,
        p.category || "autre",
        p.transaction || "location",
        p.status || "active",
      ]
    );
  }
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
