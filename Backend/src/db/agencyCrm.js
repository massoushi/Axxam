import { query } from "../config/db.js";
import { once } from "./once.js";

/** Schéma CRM / ops agence (Phase 2–3) */
export const ensureAgencyCrmTables = once(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS agency_clients (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      photo TEXT,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      cin TEXT NOT NULL DEFAULT '',
      passport TEXT NOT NULL DEFAULT '',
      profession TEXT NOT NULL DEFAULT '',
      employer TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_contracts (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      property_id TEXT,
      owner_id TEXT,
      client_id TEXT REFERENCES agency_clients(id) ON DELETE SET NULL,
      title TEXT NOT NULL DEFAULT '',
      start_date DATE,
      end_date DATE,
      duration_months INTEGER NOT NULL DEFAULT 12,
      rent NUMERIC NOT NULL DEFAULT 0,
      deposit NUMERIC NOT NULL DEFAULT 0,
      commission_pct NUMERIC NOT NULL DEFAULT 0,
      conditions TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
      signed_client_at TIMESTAMPTZ,
      signed_owner_at TIMESTAMPTZ,
      signed_agency_at TIMESTAMPTZ,
      client_signature TEXT,
      owner_signature TEXT,
      agency_signature TEXT,
      qr_token TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_payment_entries (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contract_id TEXT REFERENCES agency_contracts(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES agency_clients(id) ON DELETE SET NULL,
      label TEXT NOT NULL DEFAULT '',
      due_date DATE,
      amount NUMERIC NOT NULL DEFAULT 0,
      amount_paid NUMERIC NOT NULL DEFAULT 0,
      method TEXT NOT NULL DEFAULT 'cash'
        CHECK (method IN ('cash', 'ccp', 'transfer', 'card', 'online')),
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
      paid_at TIMESTAMPTZ,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_tasks (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date DATE,
      due_time TEXT,
      status TEXT NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'doing', 'done', 'cancelled')),
      priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
      related_type TEXT,
      related_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_appointments (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'visit'
        CHECK (kind IN ('visit', 'signature', 'maintenance', 'other')),
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ,
      location TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      client_id TEXT REFERENCES agency_clients(id) ON DELETE SET NULL,
      property_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_documents (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other'
        CHECK (category IN (
          'contract', 'invoice', 'receipt', 'id', 'passport',
          'property', 'insurance', 'photo', 'other'
        )),
      file_url TEXT NOT NULL DEFAULT '',
      mime_type TEXT NOT NULL DEFAULT '',
      related_type TEXT,
      related_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agency_expenses (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other'
        CHECK (category IN ('commission', 'tax', 'maintenance', 'marketing', 'salary', 'other')),
      amount NUMERIC NOT NULL DEFAULT 0,
      expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_agency_clients_agency ON agency_clients (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_contracts_agency ON agency_contracts (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_payments_agency ON agency_payment_entries (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_tasks_agency ON agency_tasks (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_appts_agency ON agency_appointments (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_docs_agency ON agency_documents (agency_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agency_expenses_agency ON agency_expenses (agency_id);`);
});

export function mapClientRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    photo: row.photo || null,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    cin: row.cin || "",
    passport: row.passport || "",
    profession: row.profession || "",
    employer: row.employer || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContractRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    propertyId: row.property_id || null,
    ownerId: row.owner_id || null,
    clientId: row.client_id || null,
    title: row.title || "",
    startDate: row.start_date ? String(row.start_date).slice(0, 10) : "",
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : "",
    durationMonths: Number(row.duration_months) || 12,
    rent: Number(row.rent) || 0,
    deposit: Number(row.deposit) || 0,
    commissionPct: Number(row.commission_pct) || 0,
    conditions: row.conditions || "",
    status: row.status,
    signedClientAt: row.signed_client_at,
    signedOwnerAt: row.signed_owner_at,
    signedAgencyAt: row.signed_agency_at,
    clientSignature: row.client_signature || null,
    ownerSignature: row.owner_signature || null,
    agencySignature: row.agency_signature || null,
    qrToken: row.qr_token || null,
    clientName: row.client_name || null,
    propertyName: row.property_name || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPaymentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    contractId: row.contract_id || null,
    clientId: row.client_id || null,
    label: row.label || "",
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : "",
    amount: Number(row.amount) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    method: row.method,
    status: row.status,
    paidAt: row.paid_at,
    notes: row.notes || "",
    clientName: row.client_name || null,
    createdAt: row.created_at,
  };
}

export function mapTaskRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    title: row.title,
    description: row.description || "",
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : "",
    dueTime: row.due_time || "",
    status: row.status,
    priority: row.priority,
    relatedType: row.related_type || null,
    relatedId: row.related_id || null,
    createdAt: row.created_at,
  };
}

export function mapAppointmentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    title: row.title,
    kind: row.kind,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location || "",
    notes: row.notes || "",
    clientId: row.client_id || null,
    propertyId: row.property_id || null,
    createdAt: row.created_at,
  };
}

export function mapDocumentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    title: row.title,
    category: row.category,
    fileUrl: row.file_url || "",
    mimeType: row.mime_type || "",
    relatedType: row.related_type || null,
    relatedId: row.related_id || null,
    createdAt: row.created_at,
  };
}

export function mapExpenseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    agencyId: row.agency_id,
    label: row.label,
    category: row.category,
    amount: Number(row.amount) || 0,
    expenseDate: row.expense_date ? String(row.expense_date).slice(0, 10) : "",
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}
