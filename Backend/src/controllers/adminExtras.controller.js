import { randomUUID } from "crypto";
import { query } from "../config/db.js";
import { mapUserRow } from "../db/users.js";
import { ensureAgencyCrmTables, mapContractRow } from "../db/agencyCrm.js";
import {
  ensureAdminTables,
  mapClaimRow,
  mapContentRow,
} from "../db/admin.js";

const CLAIM_STATUSES = new Set(["pending", "in_progress", "resolved", "closed"]);

function newClaimId() {
  return `cl-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
}

/** GET /admin/bookings — toutes réservations + bien / hôte / client. ?status=&q= */
export async function listAdminBookings(req, res, next) {
  try {
    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();
    const params = [];
    const where = [];

    if (status) {
      params.push(status);
      where.push(`b.status = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      const i = params.length;
      where.push(`(
        p.name ILIKE $${i}
        OR b.guest_first_name ILIKE $${i}
        OR b.guest_last_name ILIKE $${i}
        OR b.guest_email ILIKE $${i}
        OR COALESCE(c.email, '') ILIKE $${i}
        OR COALESCE(c.first_name, '') ILIKE $${i}
        OR COALESCE(c.last_name, '') ILIKE $${i}
        OR COALESCE(h.agency_name, '') ILIKE $${i}
        OR COALESCE(h.first_name, '') ILIKE $${i}
        OR COALESCE(h.last_name, '') ILIKE $${i}
        OR b.id ILIKE $${i}
      )`);
    }

    const sql = `
      SELECT
        b.*,
        p.name AS property_name,
        p.city AS property_city,
        p.img AS property_img,
        h.id AS host_id_row,
        h.role AS host_role,
        h.email AS host_email,
        h.first_name AS host_first_name,
        h.last_name AS host_last_name,
        h.agency_name AS host_agency_name,
        h.phone AS host_phone,
        c.id AS client_user_id,
        c.email AS client_email,
        c.first_name AS client_first_name,
        c.last_name AS client_last_name,
        c.phone AS client_phone
      FROM bookings b
      LEFT JOIN properties p ON p.id = b.property_id
      LEFT JOIN users h ON h.id = b.host_id
      LEFT JOIN users c ON c.id = b.client_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY b.created_at DESC
      LIMIT 500
    `;

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map((r) => ({
        id: r.id,
        propertyId: r.property_id,
        propertyName: r.property_name || "Bien",
        propertyCity: r.property_city || "",
        propertyImg: r.property_img || null,
        status: r.status,
        paymentStatus: r.payment_status || "unpaid",
        checkIn: r.check_in ? String(r.check_in).slice(0, 10) : "",
        checkOut: r.check_out ? String(r.check_out).slice(0, 10) : "",
        guests: Number(r.guests) || 1,
        nights: Number(r.nights) || 0,
        totalPrice: Number(r.total_price) || 0,
        serviceFee: Number(r.service_fee) || 0,
        paidAt: r.paid_at,
        createdAt: r.created_at,
        guest: {
          firstName: r.guest_first_name || "",
          lastName: r.guest_last_name || "",
          email: r.guest_email || "",
          phone: r.guest_phone || "",
        },
        host: {
          id: r.host_id,
          role: r.host_role || null,
          email: r.host_email || "",
          displayName:
            r.host_role === "agency"
              ? r.host_agency_name || "Agence"
              : [r.host_first_name, r.host_last_name].filter(Boolean).join(" ") ||
                r.host_email ||
                "Hôte",
          phone: r.host_phone || "",
        },
        client: {
          id: r.client_id,
          email: r.client_email || r.guest_email || "",
          displayName:
            [r.client_first_name, r.client_last_name].filter(Boolean).join(" ") ||
            [r.guest_first_name, r.guest_last_name].filter(Boolean).join(" ") ||
            r.client_email ||
            "",
          phone: r.client_phone || r.guest_phone || "",
        },
      })),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/contracts — contrats CRM + nom agence / client. ?status= */
export async function listAdminContracts(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    const status = String(req.query.status || "").trim();
    const params = [];
    const where = [];

    if (status) {
      params.push(status);
      where.push(`c.status = $${params.length}`);
    }

    const result = await query(
      `
      SELECT
        c.*,
        COALESCE(cl.first_name || ' ' || cl.last_name, '') AS client_name,
        COALESCE(p.name, '') AS property_name,
        COALESCE(u.agency_name, TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), u.email, '') AS agency_name,
        u.email AS agency_email
      FROM agency_contracts c
      LEFT JOIN agency_clients cl ON cl.id = c.client_id
      LEFT JOIN properties p ON p.id = c.property_id
      LEFT JOIN users u ON u.id = c.agency_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY c.created_at DESC
      LIMIT 500
      `,
      params
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map((r) => ({
        ...mapContractRow(r),
        agencyName: r.agency_name || "",
        agencyEmail: r.agency_email || "",
      })),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/payments — paiements plateforme + entrées CRM, liste unifiée */
export async function listAdminPayments(req, res, next) {
  try {
    await ensureAgencyCrmTables().catch(() => {});

    const [bookingsPaid, agencyPayments] = await Promise.all([
      query(`
        SELECT
          b.id, b.total_price, b.service_fee, b.paid_at, b.created_at,
          b.payment_status, b.guest_first_name, b.guest_last_name, b.guest_email,
          p.name AS property_name,
          COALESCE(h.agency_name, TRIM(COALESCE(h.first_name, '') || ' ' || COALESCE(h.last_name, '')), h.email) AS host_name
        FROM bookings b
        LEFT JOIN properties p ON p.id = b.property_id
        LEFT JOIN users h ON h.id = b.host_id
        WHERE b.payment_status = 'paid'
        ORDER BY COALESCE(b.paid_at, b.created_at) DESC
        LIMIT 300
      `),
      query(`
        SELECT
          pe.id, pe.amount, pe.amount_paid, pe.status, pe.method, pe.label,
          pe.paid_at, pe.created_at, pe.due_date,
          COALESCE(u.agency_name, u.email) AS agency_name,
          COALESCE(cl.first_name || ' ' || cl.last_name, '') AS client_name
        FROM agency_payment_entries pe
        LEFT JOIN users u ON u.id = pe.agency_id
        LEFT JOIN agency_clients cl ON cl.id = pe.client_id
        ORDER BY COALESCE(pe.paid_at, pe.created_at) DESC
        LIMIT 300
      `).catch(() => ({ rows: [] })),
    ]);

    const bookingItems = bookingsPaid.rows.map((r) => ({
      id: r.id,
      type: "booking",
      label: r.property_name || "Réservation",
      amount: Number(r.total_price) || 0,
      fee: Number(r.service_fee) || 0,
      status: "paid",
      method: "plateforme",
      partyName:
        [r.guest_first_name, r.guest_last_name].filter(Boolean).join(" ") ||
        r.guest_email ||
        "",
      counterparty: r.host_name || "",
      paidAt: r.paid_at,
      createdAt: r.created_at,
      at: r.paid_at || r.created_at,
    }));

    const agencyItems = agencyPayments.rows.map((r) => ({
      id: r.id,
      type: "agency",
      label: r.label || "Paiement agence",
      amount: Number(r.amount_paid) || Number(r.amount) || 0,
      amountDue: Number(r.amount) || 0,
      amountPaid: Number(r.amount_paid) || 0,
      fee: 0,
      status: r.status,
      method: r.method || "cash",
      partyName: r.client_name || "",
      counterparty: r.agency_name || "",
      paidAt: r.paid_at,
      dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
      createdAt: r.created_at,
      at: r.paid_at || r.created_at,
    }));

    const items = [...bookingItems, ...agencyItems].sort(
      (a, b) => new Date(b.at) - new Date(a.at)
    );

    const summary = {
      bookingPaidCount: bookingItems.length,
      bookingPaidTotal: bookingItems.reduce((s, i) => s + i.amount, 0),
      bookingFeesTotal: bookingItems.reduce((s, i) => s + i.fee, 0),
      agencyEntriesCount: agencyItems.length,
      agencyCollected: agencyItems
        .filter((i) => i.status === "paid" || i.status === "partial")
        .reduce((s, i) => s + (i.amountPaid || 0), 0),
    };

    res.json({
      success: true,
      count: items.length,
      summary,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/commissions — agences + propriétaires avec GMV / commissions payées */
export async function listAdminCommissions(req, res, next) {
  try {
    const result = await query(`
      SELECT
        u.id, u.role, u.email, u.first_name, u.last_name, u.phone, u.wilaya,
        u.agency_name, u.avatar, u.logo, u.status,
        u.subscription_plan, u.commission_rate, u.created_at,
        COALESCE(b.bookings_paid, 0)::int AS bookings_paid,
        COALESCE(b.gmv, 0)::float AS gmv,
        COALESCE(b.commissions, 0)::float AS commissions
      FROM users u
      LEFT JOIN (
        SELECT
          host_id,
          COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS bookings_paid,
          COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0)::float AS gmv,
          COALESCE(SUM(service_fee) FILTER (WHERE payment_status = 'paid'), 0)::float AS commissions
        FROM bookings
        GROUP BY host_id
      ) b ON b.host_id = u.id
      WHERE u.role IN ('agency', 'owner')
      ORDER BY COALESCE(b.commissions, 0) DESC, u.created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map((r) => ({
        ...mapUserRow(r),
        bookingsPaid: Number(r.bookings_paid) || 0,
        gmv: Number(r.gmv) || 0,
        commissionsPaid: Number(r.commissions) || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/claims */
export async function listAdminClaims(req, res, next) {
  try {
    await ensureAdminTables();
    const status = String(req.query.status || "").trim();
    const params = [];
    let where = "";
    if (status) {
      params.push(status);
      where = `WHERE status = $1`;
    }
    const result = await query(
      `SELECT * FROM admin_claims ${where} ORDER BY created_at DESC LIMIT 500`,
      params
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapClaimRow),
    });
  } catch (err) {
    next(err);
  }
}

/** POST /admin/claims */
export async function createAdminClaim(req, res, next) {
  try {
    await ensureAdminTables();
    const b = req.body || {};
    const subject = String(b.subject || "").trim();
    if (!subject) {
      return res.status(400).json({ success: false, message: "subject requis" });
    }
    const status = String(b.status || "pending").trim();
    if (!CLAIM_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: "status invalide (pending|in_progress|resolved|closed)",
      });
    }

    const id = newClaimId();
    const authorName =
      String(b.authorName || "").trim() ||
      [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") ||
      "Admin";
    const authorEmail = String(b.authorEmail || req.user?.email || "").trim();
    const authorRole = String(b.authorRole || req.user?.role || "admin").trim();

    await query(
      `
      INSERT INTO admin_claims (
        id, subject, body, author_name, author_email, author_role,
        related_type, related_id, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        id,
        subject,
        String(b.body || ""),
        authorName,
        authorEmail,
        authorRole,
        b.relatedType || null,
        b.relatedId || null,
        status,
      ]
    );

    const result = await query(`SELECT * FROM admin_claims WHERE id = $1`, [id]);
    res.status(201).json({
      success: true,
      message: "Réclamation créée",
      data: mapClaimRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

/** PATCH /admin/claims/:id */
export async function updateAdminClaim(req, res, next) {
  try {
    await ensureAdminTables();
    const existing = await query(`SELECT * FROM admin_claims WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: "Réclamation introuvable" });
    }

    const b = req.body || {};
    const row = existing.rows[0];
    let status = row.status;
    if (b.status !== undefined) {
      status = String(b.status).trim();
      if (!CLAIM_STATUSES.has(status)) {
        return res.status(400).json({
          success: false,
          message: "status invalide (pending|in_progress|resolved|closed)",
        });
      }
    }
    const subject =
      b.subject !== undefined ? String(b.subject).trim() : row.subject;
    if (!subject) {
      return res.status(400).json({ success: false, message: "subject requis" });
    }
    const body = b.body !== undefined ? String(b.body) : row.body;

    const result = await query(
      `
      UPDATE admin_claims
      SET subject = $1, body = $2, status = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [subject, body, status, req.params.id]
    );

    res.json({
      success: true,
      message: "Réclamation mise à jour",
      data: mapClaimRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/content */
export async function getAdminContent(req, res, next) {
  try {
    await ensureAdminTables();
    const result = await query(`SELECT * FROM site_content ORDER BY key`);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapContentRow),
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /admin/content — body: { items: [{key, title, body}] } */
export async function putAdminContent(req, res, next) {
  try {
    await ensureAdminTables();
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "items requis (tableau {key, title, body})",
      });
    }

    for (const item of items) {
      const key = String(item?.key || "").trim();
      if (!key) continue;
      await query(
        `
        INSERT INTO site_content (key, title, body, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (key) DO UPDATE SET
          title = EXCLUDED.title,
          body = EXCLUDED.body,
          updated_at = NOW()
        `,
        [key, String(item.title ?? ""), String(item.body ?? "")]
      );
    }

    const result = await query(`SELECT * FROM site_content ORDER BY key`);
    res.json({
      success: true,
      message: "Contenu mis à jour",
      data: result.rows.map(mapContentRow),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/settings */
export async function getAdminSettings(req, res, next) {
  try {
    await ensureAdminTables();
    const result = await query(`SELECT key, value, updated_at FROM platform_settings ORDER BY key`);
    const settings = Object.fromEntries(result.rows.map((r) => [r.key, r.value]));
    res.json({
      success: true,
      data: settings,
      meta: result.rows.map((r) => ({
        key: r.key,
        value: r.value,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /admin/settings — body: Record<string, string> */
export async function putAdminSettings(req, res, next) {
  try {
    await ensureAdminTables();
    const body = req.body && typeof req.body === "object" ? req.body : null;
    if (!body || Array.isArray(body) || !Object.keys(body).length) {
      return res.status(400).json({
        success: false,
        message: "Corps attendu: objet { clé: valeur }",
      });
    }

    for (const [key, value] of Object.entries(body)) {
      const k = String(key).trim();
      if (!k) continue;
      await query(
        `
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = NOW()
        `,
        [k, String(value ?? "")]
      );
    }

    const result = await query(`SELECT key, value FROM platform_settings ORDER BY key`);
    const settings = Object.fromEntries(result.rows.map((r) => [r.key, r.value]));
    res.json({
      success: true,
      message: "Paramètres mis à jour",
      data: settings,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/activity — fil d'activité (50 derniers) */
export async function getAdminActivity(req, res, next) {
  try {
    await ensureAdminTables().catch(() => {});

    const [
      activityAgencies,
      activityProps,
      activityBookings,
      paid,
      claimUpdates,
    ] = await Promise.all([
      query(`
        SELECT agency_name, first_name, last_name, created_at FROM users
        WHERE role = 'agency' ORDER BY created_at DESC LIMIT 15
      `),
      query(`
        SELECT name, created_at FROM properties
        WHERE type <> 'vehicule' ORDER BY created_at DESC LIMIT 15
      `),
      query(`SELECT id, total_price, created_at FROM bookings ORDER BY created_at DESC LIMIT 15`),
      query(`
        SELECT id, total_price, paid_at FROM bookings
        WHERE payment_status = 'paid' AND paid_at IS NOT NULL
        ORDER BY paid_at DESC LIMIT 15
      `),
      query(`
        SELECT id, subject, status, updated_at FROM admin_claims
        ORDER BY updated_at DESC LIMIT 15
      `).catch(() => ({ rows: [] })),
    ]);

    const activity = [];
    for (const row of activityAgencies.rows) {
      activity.push({
        type: "agency",
        title: "Nouvelle agence inscrite",
        detail: row.agency_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || "Agence",
        at: row.created_at,
      });
    }
    for (const row of activityProps.rows) {
      activity.push({
        type: "property",
        title: "Nouveau bien publié",
        detail: row.name,
        at: row.created_at,
      });
    }
    for (const row of activityBookings.rows) {
      activity.push({
        type: "booking",
        title: "Nouvelle réservation",
        detail: `${Number(row.total_price).toLocaleString("fr-DZ")} DA`,
        at: row.created_at,
      });
    }
    for (const row of paid.rows) {
      activity.push({
        type: "payment",
        title: "Paiement reçu",
        detail: `${Number(row.total_price).toLocaleString("fr-DZ")} DA`,
        at: row.paid_at,
      });
    }
    for (const row of claimUpdates.rows) {
      activity.push({
        type: "claim",
        title: "Réclamation mise à jour",
        detail: `${row.subject || "Sans objet"} (${row.status})`,
        at: row.updated_at,
      });
    }

    activity.sort((a, b) => new Date(b.at) - new Date(a.at));

    res.json({
      success: true,
      count: Math.min(activity.length, 50),
      data: activity.slice(0, 50),
    });
  } catch (err) {
    next(err);
  }
}
