import { query } from "../config/db.js";
import bcrypt from "bcryptjs";
import { once } from "./once.js";

export const ensureUsersTable = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('client', 'owner', 'agency', 'admin')),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      wilaya TEXT DEFAULT '',
      avatar TEXT,
      agency_name TEXT DEFAULT '',
      manager_name TEXT DEFAULT '',
      rc_number TEXT DEFAULT '',
      nif TEXT DEFAULT '',
      address TEXT DEFAULT '',
      logo TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free';`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate NUMERIC NOT NULL DEFAULT 0.05;`);

  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);`);

  await seedAdminIfNeeded();
});

async function seedAdminIfNeeded() {
  const email = (process.env.ADMIN_EMAIL || "admin@axxam.dz").toLowerCase();
  const existing = await query(`SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1`, [email]);
  if (existing.rows[0]) return;

  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  const id = `admin-${Date.now().toString(36)}`;

  await query(
    `
    INSERT INTO users (
      id, role, email, password_hash, first_name, last_name, phone, status
    ) VALUES ($1, 'admin', $2, $3, 'Admin', 'AXXAM', '', 'active')
    `,
    [id, email, hash]
  );
}

export function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    role: row.role,
    email: row.email,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    phone: row.phone || "",
    wilaya: row.wilaya || "",
    avatar: row.avatar || null,
    agencyName: row.agency_name || "",
    managerName: row.manager_name || "",
    rcNumber: row.rc_number || "",
    nif: row.nif || "",
    address: row.address || "",
    logo: row.logo || null,
    status: row.status,
    subscriptionPlan: row.subscription_plan || "free",
    commissionRate: Number(row.commission_rate) || 0.05,
    displayName:
      row.role === "agency"
        ? row.agency_name || "Agence"
        : [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email,
    createdAt: row.created_at,
  };
}
