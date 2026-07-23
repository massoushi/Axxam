import { query } from "../config/db.js";
import { once } from "./once.js";

const SITE_CONTENT_SEEDS = [
  { key: "hero_title", title: "Titre hero", body: "Trouvez votre prochain séjour en Algérie" },
  { key: "hero_subtitle", title: "Sous-titre hero", body: "Locations, ventes et hébergements — AXXAM" },
  { key: "promo_banner", title: "Bannière promo", body: "Découvrez les meilleures offres de la semaine" },
  { key: "footer_note", title: "Note pied de page", body: "© AXXAM — Plateforme immobilière algérienne" },
  { key: "support_email", title: "Email support", body: "support@axxam.dz" },
  { key: "support_phone", title: "Téléphone support", body: "+213 555 000 000" },
];

const PLATFORM_SETTING_SEEDS = [
  { key: "default_commission", value: "0.05" },
  { key: "service_fee_rate", value: "0.05" },
  { key: "currency", value: "DZD" },
  { key: "maintenance_mode", value: "false" },
];

export const ensureAdminTables = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_claims (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      author_name TEXT NOT NULL DEFAULT '',
      author_email TEXT NOT NULL DEFAULT '',
      author_role TEXT NOT NULL DEFAULT '',
      related_type TEXT,
      related_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_admin_claims_status ON admin_claims (status);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_admin_claims_created ON admin_claims (created_at DESC);`);

  for (const s of SITE_CONTENT_SEEDS) {
    await query(
      `
      INSERT INTO site_content (key, title, body)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO NOTHING
      `,
      [s.key, s.title, s.body]
    );
  }

  for (const s of PLATFORM_SETTING_SEEDS) {
    await query(
      `
      INSERT INTO platform_settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO NOTHING
      `,
      [s.key, s.value]
    );
  }
});

export function mapClaimRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    subject: row.subject || "",
    body: row.body || "",
    authorName: row.author_name || "",
    authorEmail: row.author_email || "",
    authorRole: row.author_role || "",
    relatedType: row.related_type || null,
    relatedId: row.related_id || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContentRow(row) {
  if (!row) return null;
  return {
    key: row.key,
    title: row.title || "",
    body: row.body || "",
    updatedAt: row.updated_at,
  };
}
