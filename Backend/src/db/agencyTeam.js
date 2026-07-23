import { query } from "../config/db.js";

export async function ensureAgencyTeamTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS agency_members (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_role TEXT NOT NULL DEFAULT 'employee' CHECK (member_role IN ('employee', 'manager')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (agency_id, user_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_owners (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (agency_id, owner_id)
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_agency_members_agency ON agency_members (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_owners_agency ON agency_owners (agency_id);`);
}

export function mapMemberRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    userId: row.user_id,
    memberRole: row.member_role,
    status: row.status,
    createdAt: row.created_at,
    email: row.email || null,
    displayName: row.display_name || null,
    phone: row.phone || null,
  };
}

export function mapAgencyOwnerRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    ownerId: row.owner_id,
    status: row.status,
    createdAt: row.created_at,
    email: row.email || null,
    displayName: row.display_name || null,
    phone: row.phone || null,
  };
}
