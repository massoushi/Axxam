import { randomUUID, randomBytes } from "crypto";
import { query } from "../config/db.js";
import {
  ensureAgencyCrmTables,
  mapClientRow,
  mapContractRow,
  mapPaymentRow,
  mapTaskRow,
  mapAppointmentRow,
  mapDocumentRow,
  mapExpenseRow,
} from "../db/agencyCrm.js";

function aid(req) {
  return req.user.id;
}

function id() {
  return randomUUID();
}

/* —— Clients —— */
export async function listClients(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `SELECT * FROM agency_clients WHERE agency_id = $1 ORDER BY created_at DESC`,
      [aid(req)]
    );
    res.json({ success: true, count: r.rows.length, data: r.rows.map(mapClientRow) });
  } catch (e) {
    next(e);
  }
}

export async function getClient(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(`SELECT * FROM agency_clients WHERE id = $1 AND agency_id = $2`, [
      req.params.id,
      aid(req),
    ]);
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Client introuvable" });
    res.json({ success: true, data: mapClientRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function createClient(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    await query(
      `INSERT INTO agency_clients (
        id, agency_id, photo, first_name, last_name, phone, email, address,
        cin, passport, profession, employer, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        newId,
        aid(req),
        b.photo || null,
        b.firstName || "",
        b.lastName || "",
        b.phone || "",
        b.email || "",
        b.address || "",
        b.cin || "",
        b.passport || "",
        b.profession || "",
        b.employer || "",
        b.notes || "",
      ]
    );
    const r = await query(`SELECT * FROM agency_clients WHERE id = $1`, [newId]);
    res.status(201).json({ success: true, message: "Client créé", data: mapClientRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function updateClient(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const r = await query(
      `UPDATE agency_clients SET
        photo = COALESCE($3, photo),
        first_name = COALESCE($4, first_name),
        last_name = COALESCE($5, last_name),
        phone = COALESCE($6, phone),
        email = COALESCE($7, email),
        address = COALESCE($8, address),
        cin = COALESCE($9, cin),
        passport = COALESCE($10, passport),
        profession = COALESCE($11, profession),
        employer = COALESCE($12, employer),
        notes = COALESCE($13, notes),
        updated_at = NOW()
       WHERE id = $1 AND agency_id = $2
       RETURNING *`,
      [
        req.params.id,
        aid(req),
        b.photo !== undefined ? b.photo : null,
        b.firstName,
        b.lastName,
        b.phone,
        b.email,
        b.address,
        b.cin,
        b.passport,
        b.profession,
        b.employer,
        b.notes,
      ]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Client introuvable" });
    res.json({ success: true, data: mapClientRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function deleteClient(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `DELETE FROM agency_clients WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [req.params.id, aid(req)]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Client introuvable" });
    res.json({ success: true, data: mapClientRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

/* —— Contrats —— */
export async function listContracts(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `SELECT c.*,
        COALESCE(cl.first_name || ' ' || cl.last_name, '') AS client_name,
        COALESCE(p.name, '') AS property_name
       FROM agency_contracts c
       LEFT JOIN agency_clients cl ON cl.id = c.client_id
       LEFT JOIN properties p ON p.id = c.property_id
       WHERE c.agency_id = $1
       ORDER BY c.created_at DESC`,
      [aid(req)]
    );
    res.json({ success: true, count: r.rows.length, data: r.rows.map(mapContractRow) });
  } catch (e) {
    next(e);
  }
}

export async function createContract(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    const qr = randomBytes(16).toString("hex");
    await query(
      `INSERT INTO agency_contracts (
        id, agency_id, property_id, owner_id, client_id, title,
        start_date, end_date, duration_months, rent, deposit, commission_pct,
        conditions, status, qr_token
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        newId,
        aid(req),
        b.propertyId || null,
        b.ownerId || null,
        b.clientId || null,
        b.title || "Contrat de location",
        b.startDate || null,
        b.endDate || null,
        Number(b.durationMonths) || 12,
        Number(b.rent) || 0,
        Number(b.deposit) || 0,
        Number(b.commissionPct) || 0,
        b.conditions || "",
        b.status || "draft",
        qr,
      ]
    );

    // Auto-generate monthly payment schedule if rent + dates
    if (b.startDate && Number(b.rent) > 0) {
      const months = Number(b.durationMonths) || 12;
      const start = new Date(b.startDate);
      for (let i = 0; i < months; i++) {
        const due = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
        const label = due.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        await query(
          `INSERT INTO agency_payment_entries (
            id, agency_id, contract_id, client_id, label, due_date, amount, status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')`,
          [id(), aid(req), newId, b.clientId || null, `Loyer ${label}`, due.toISOString().slice(0, 10), Number(b.rent)]
        );
      }
    }

    const r = await query(
      `SELECT c.*, COALESCE(cl.first_name || ' ' || cl.last_name, '') AS client_name
       FROM agency_contracts c LEFT JOIN agency_clients cl ON cl.id = c.client_id
       WHERE c.id = $1`,
      [newId]
    );
    res.status(201).json({ success: true, message: "Contrat créé", data: mapContractRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function updateContract(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const r = await query(
      `UPDATE agency_contracts SET
        title = COALESCE($3, title),
        property_id = COALESCE($4, property_id),
        client_id = COALESCE($5, client_id),
        owner_id = COALESCE($6, owner_id),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        duration_months = COALESCE($9, duration_months),
        rent = COALESCE($10, rent),
        deposit = COALESCE($11, deposit),
        commission_pct = COALESCE($12, commission_pct),
        conditions = COALESCE($13, conditions),
        status = COALESCE($14, status),
        updated_at = NOW()
       WHERE id = $1 AND agency_id = $2
       RETURNING *`,
      [
        req.params.id,
        aid(req),
        b.title,
        b.propertyId,
        b.clientId,
        b.ownerId,
        b.startDate,
        b.endDate,
        b.durationMonths != null ? Number(b.durationMonths) : null,
        b.rent != null ? Number(b.rent) : null,
        b.deposit != null ? Number(b.deposit) : null,
        b.commissionPct != null ? Number(b.commissionPct) : null,
        b.conditions,
        b.status,
      ]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Contrat introuvable" });
    res.json({ success: true, data: mapContractRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function signContract(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const { party, signature } = req.body || {};
    if (!["client", "owner", "agency"].includes(party)) {
      return res.status(400).json({ success: false, message: "party invalide" });
    }
    const colSig = `${party}_signature`;
    const colAt = `signed_${party}_at`;
    const r = await query(
      `UPDATE agency_contracts SET ${colSig} = $3, ${colAt} = NOW(), updated_at = NOW()
       WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [req.params.id, aid(req), signature || "signed"]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Contrat introuvable" });

    const row = r.rows[0];
    if (row.signed_client_at && row.signed_owner_at && row.signed_agency_at) {
      await query(`UPDATE agency_contracts SET status = 'active' WHERE id = $1`, [row.id]);
      row.status = "active";
    } else if (row.status === "draft") {
      await query(`UPDATE agency_contracts SET status = 'pending_signature' WHERE id = $1`, [row.id]);
      row.status = "pending_signature";
    }

    res.json({ success: true, message: "Signature enregistrée", data: mapContractRow(row) });
  } catch (e) {
    next(e);
  }
}

/* —— Paiements —— */
export async function listPayments(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    // refresh overdue
    await query(
      `UPDATE agency_payment_entries SET status = 'overdue'
       WHERE agency_id = $1 AND status IN ('pending','partial')
         AND due_date < CURRENT_DATE`,
      [aid(req)]
    );
    const r = await query(
      `SELECT pe.*,
        COALESCE(cl.first_name || ' ' || cl.last_name, '') AS client_name
       FROM agency_payment_entries pe
       LEFT JOIN agency_clients cl ON cl.id = pe.client_id
       WHERE pe.agency_id = $1
       ORDER BY pe.due_date DESC NULLS LAST, pe.created_at DESC`,
      [aid(req)]
    );
    res.json({ success: true, count: r.rows.length, data: r.rows.map(mapPaymentRow) });
  } catch (e) {
    next(e);
  }
}

export async function createPayment(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    await query(
      `INSERT INTO agency_payment_entries (
        id, agency_id, contract_id, client_id, label, due_date, amount, amount_paid, method, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        newId,
        aid(req),
        b.contractId || null,
        b.clientId || null,
        b.label || "Paiement",
        b.dueDate || null,
        Number(b.amount) || 0,
        Number(b.amountPaid) || 0,
        b.method || "cash",
        b.status || "pending",
        b.notes || "",
      ]
    );
    const r = await query(`SELECT * FROM agency_payment_entries WHERE id = $1`, [newId]);
    res.status(201).json({ success: true, data: mapPaymentRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function recordPayment(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const amountPaid = Number(b.amountPaid);
    const method = b.method || "cash";
    const existing = await query(
      `SELECT * FROM agency_payment_entries WHERE id = $1 AND agency_id = $2`,
      [req.params.id, aid(req)]
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: "Échéance introuvable" });
    }
    const row = existing.rows[0];
    const paid = amountPaid != null && !Number.isNaN(amountPaid) ? amountPaid : Number(row.amount);
    const status = paid >= Number(row.amount) ? "paid" : paid > 0 ? "partial" : row.status;
    const r = await query(
      `UPDATE agency_payment_entries SET
        amount_paid = $3, method = $4, status = $5,
        paid_at = CASE WHEN $5 = 'paid' THEN NOW() ELSE paid_at END,
        notes = COALESCE($6, notes)
       WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [req.params.id, aid(req), paid, method, status, b.notes]
    );
    res.json({
      success: true,
      message: "Paiement enregistré",
      data: mapPaymentRow(r.rows[0]),
      receipt: {
        id: r.rows[0].id,
        amount: paid,
        method,
        date: new Date().toISOString(),
        label: r.rows[0].label,
      },
    });
  } catch (e) {
    next(e);
  }
}

/* —— Tâches —— */
export async function listTasks(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `SELECT * FROM agency_tasks WHERE agency_id = $1 ORDER BY
        CASE status WHEN 'todo' THEN 0 WHEN 'doing' THEN 1 ELSE 2 END,
        due_date ASC NULLS LAST`,
      [aid(req)]
    );
    res.json({ success: true, data: r.rows.map(mapTaskRow) });
  } catch (e) {
    next(e);
  }
}

export async function createTask(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    await query(
      `INSERT INTO agency_tasks (id, agency_id, title, description, due_date, due_time, status, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        newId,
        aid(req),
        b.title || "Tâche",
        b.description || "",
        b.dueDate || null,
        b.dueTime || null,
        b.status || "todo",
        b.priority || "medium",
      ]
    );
    const r = await query(`SELECT * FROM agency_tasks WHERE id = $1`, [newId]);
    res.status(201).json({ success: true, data: mapTaskRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const r = await query(
      `UPDATE agency_tasks SET
        title = COALESCE($3, title),
        description = COALESCE($4, description),
        due_date = COALESCE($5, due_date),
        due_time = COALESCE($6, due_time),
        status = COALESCE($7, status),
        priority = COALESCE($8, priority)
       WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [
        req.params.id,
        aid(req),
        b.title,
        b.description,
        b.dueDate,
        b.dueTime,
        b.status,
        b.priority,
      ]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Tâche introuvable" });
    res.json({ success: true, data: mapTaskRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(`DELETE FROM agency_tasks WHERE id = $1 AND agency_id = $2 RETURNING *`, [
      req.params.id,
      aid(req),
    ]);
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Tâche introuvable" });
    res.json({ success: true, data: mapTaskRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

/* —— Rendez-vous —— */
export async function listAppointments(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `SELECT * FROM agency_appointments WHERE agency_id = $1 ORDER BY start_at ASC`,
      [aid(req)]
    );
    res.json({ success: true, data: r.rows.map(mapAppointmentRow) });
  } catch (e) {
    next(e);
  }
}

export async function createAppointment(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    await query(
      `INSERT INTO agency_appointments (
        id, agency_id, title, kind, start_at, end_at, location, notes, client_id, property_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        newId,
        aid(req),
        b.title || "Rendez-vous",
        b.kind || "visit",
        b.startAt || new Date().toISOString(),
        b.endAt || null,
        b.location || "",
        b.notes || "",
        b.clientId || null,
        b.propertyId || null,
      ]
    );
    const r = await query(`SELECT * FROM agency_appointments WHERE id = $1`, [newId]);
    res.status(201).json({ success: true, data: mapAppointmentRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `DELETE FROM agency_appointments WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [req.params.id, aid(req)]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "RDV introuvable" });
    res.json({ success: true, data: mapAppointmentRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

/* —— Documents —— */
export async function listDocuments(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `SELECT * FROM agency_documents WHERE agency_id = $1 ORDER BY created_at DESC`,
      [aid(req)]
    );
    res.json({ success: true, data: r.rows.map(mapDocumentRow) });
  } catch (e) {
    next(e);
  }
}

export async function createDocument(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    await query(
      `INSERT INTO agency_documents (
        id, agency_id, title, category, file_url, mime_type, related_type, related_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        newId,
        aid(req),
        b.title || "Document",
        b.category || "other",
        b.fileUrl || "",
        b.mimeType || "",
        b.relatedType || null,
        b.relatedId || null,
      ]
    );
    const r = await query(`SELECT * FROM agency_documents WHERE id = $1`, [newId]);
    res.status(201).json({ success: true, data: mapDocumentRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `DELETE FROM agency_documents WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [req.params.id, aid(req)]
    );
    if (!r.rows[0]) return res.status(404).json({ success: false, message: "Document introuvable" });
    res.json({ success: true, data: mapDocumentRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

/* —— Comptabilité —— */
export async function listExpenses(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const r = await query(
      `SELECT * FROM agency_expenses WHERE agency_id = $1 ORDER BY expense_date DESC`,
      [aid(req)]
    );
    res.json({ success: true, data: r.rows.map(mapExpenseRow) });
  } catch (e) {
    next(e);
  }
}

export async function createExpense(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const b = req.body || {};
    const newId = id();
    await query(
      `INSERT INTO agency_expenses (id, agency_id, label, category, amount, expense_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        newId,
        aid(req),
        b.label || "Dépense",
        b.category || "other",
        Number(b.amount) || 0,
        b.expenseDate || new Date().toISOString().slice(0, 10),
        b.notes || "",
      ]
    );
    const r = await query(`SELECT * FROM agency_expenses WHERE id = $1`, [newId]);
    res.status(201).json({ success: true, data: mapExpenseRow(r.rows[0]) });
  } catch (e) {
    next(e);
  }
}

export async function getAccountingSummary(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const a = aid(req);
    const [income, expenses, commissions] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(amount_paid), 0)::float AS t FROM agency_payment_entries
         WHERE agency_id = $1 AND status = 'paid'`,
        [a]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::float AS t FROM agency_expenses WHERE agency_id = $1`,
        [a]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::float AS t FROM agency_expenses
         WHERE agency_id = $1 AND category = 'commission'`,
        [a]
      ),
    ]);
    const inv = await query(
      `SELECT COALESCE(SUM(total), 0)::float AS t FROM invoices WHERE host_id = $1`,
      [a]
    );
    const revenue = (income.rows[0]?.t || 0) + (inv.rows[0]?.t || 0);
    const expenseTotal = expenses.rows[0]?.t || 0;
    res.json({
      success: true,
      data: {
        revenue,
        expenses: expenseTotal,
        commissions: commissions.rows[0]?.t || 0,
        profit: revenue - expenseTotal,
      },
    });
  } catch (e) {
    next(e);
  }
}
