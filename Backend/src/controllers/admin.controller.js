import { query } from "../config/db.js";
import { mapUserRow } from "../db/users.js";

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getAdminStats(req, res, next) {
  try {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const seriesStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      users,
      props,
      bookings,
      byCity,
      recentAgencies,
      agencyPropCounts,
      reviews,
      revenueRows,
      activityAgencies,
      activityProps,
      activityBookings,
      paid,
      occ,
      crm,
    ] = await Promise.all([
      query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE role = 'client') AS clients,
          COUNT(*) FILTER (WHERE role = 'owner') AS owners,
          COUNT(*) FILTER (WHERE role = 'agency') AS agencies,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_users,
          COUNT(*) FILTER (WHERE status = 'suspended') AS suspended,
          COUNT(*) FILTER (WHERE role = 'agency' AND status = 'active') AS agencies_active,
          COUNT(*) FILTER (WHERE role = 'agency' AND status = 'pending') AS agencies_pending,
          COUNT(*) FILTER (WHERE role = 'agency' AND COALESCE(subscription_plan, 'free') = 'free') AS plan_free,
          COUNT(*) FILTER (WHERE role = 'agency' AND subscription_plan = 'pro') AS plan_pro
        FROM users
        WHERE role <> 'admin'
      `),
      query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending,
          COUNT(*) FILTER (WHERE status = 'active') AS active,
          COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
        FROM properties
        WHERE type <> 'vehicule'
      `),
      query(
        `
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending,
          COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
          COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid,
          COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0) AS gmv,
          COALESCE(SUM(service_fee) FILTER (WHERE payment_status = 'paid'), 0) AS commissions,
          COALESCE(SUM(total_price) FILTER (
            WHERE payment_status = 'paid' AND paid_at >= $1 AND paid_at < $2
          ), 0) AS gmv_month,
          COALESCE(SUM(service_fee) FILTER (
            WHERE payment_status = 'paid' AND paid_at >= $1 AND paid_at < $2
          ), 0) AS commissions_month,
          COUNT(*) FILTER (
            WHERE created_at >= $1 AND created_at < $2
          ) AS bookings_month
        FROM bookings
      `,
        [startMonth.toISOString(), endMonth.toISOString()]
      ),
      query(`
        SELECT city, COUNT(*)::int AS c
        FROM properties
        WHERE status = 'active' AND type <> 'vehicule'
        GROUP BY city
        ORDER BY c DESC
        LIMIT 8
      `),
      query(`
        SELECT id, first_name, last_name, agency_name, email, phone, wilaya, status,
               subscription_plan, commission_rate, created_at, logo, avatar, role
        FROM users
        WHERE role = 'agency'
        ORDER BY created_at DESC
        LIMIT 8
      `),
      query(`
        SELECT agency_id, COUNT(*)::int AS c
        FROM properties
        WHERE agency_id IS NOT NULL
        GROUP BY agency_id
      `),
      query(`SELECT COALESCE(AVG(rating), 0)::float AS avg, COUNT(*)::int AS c FROM reviews`).catch(
        () => ({ rows: [{ avg: 0, c: 0 }] })
      ),
      query(
        `
        SELECT
          to_char(date_trunc('month', COALESCE(paid_at, created_at)), 'YYYY-MM') AS month,
          COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0)::float AS gmv,
          COALESCE(SUM(service_fee) FILTER (WHERE payment_status = 'paid'), 0)::float AS fees
        FROM bookings
        WHERE COALESCE(paid_at, created_at) >= $1
        GROUP BY 1
        ORDER BY 1
      `,
        [seriesStart.toISOString()]
      ),
      query(`
        SELECT agency_name, first_name, last_name, created_at FROM users
        WHERE role = 'agency' ORDER BY created_at DESC LIMIT 3
      `),
      query(`
        SELECT name, created_at FROM properties
        WHERE type <> 'vehicule' ORDER BY created_at DESC LIMIT 3
      `),
      query(`SELECT id, total_price, created_at FROM bookings ORDER BY created_at DESC LIMIT 3`),
      query(`
        SELECT id, total_price, paid_at FROM bookings
        WHERE payment_status = 'paid' AND paid_at IS NOT NULL
        ORDER BY paid_at DESC LIMIT 5
      `),
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM properties WHERE status = 'active' AND type <> 'vehicule') AS available,
          (SELECT COUNT(*)::int FROM bookings
           WHERE status IN ('confirmed', 'paid')
             AND check_in <= CURRENT_DATE AND check_out > CURRENT_DATE) AS occupied
      `),
      Promise.all([
        query(`SELECT COUNT(*)::int AS c FROM agency_contracts WHERE status = 'active'`).catch(() => ({
          rows: [{ c: 0 }],
        })),
        query(`
          SELECT COALESCE(SUM(amount - amount_paid), 0)::float AS t
          FROM agency_payment_entries
          WHERE status IN ('pending', 'partial', 'overdue')
        `).catch(() => ({ rows: [{ t: 0 }] })),
      ]),
    ]);

    const contractsActive = crm[0].rows[0]?.c || 0;
    const outstanding = crm[1].rows[0]?.t || 0;

    const revMap = Object.fromEntries(
      revenueRows.rows.map((r) => [r.month, (r.gmv || 0) + (r.fees || 0)])
    );
    const revenueSeries = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      revenueSeries.push({
        month: key,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        revenue: revMap[key] || 0,
      });
    }

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
    activity.sort((a, b) => new Date(b.at) - new Date(a.at));

    const available = occ.rows[0]?.available || 0;
    const occupied = occ.rows[0]?.occupied || 0;
    const occupancyRate =
      available > 0 ? Math.round((occupied / Math.max(available, 1)) * 1000) / 10 : 0;

    const propCountMap = Object.fromEntries(
      agencyPropCounts.rows.map((r) => [r.agency_id, r.c])
    );
    const cityTotal = byCity.rows.reduce((s, r) => s + r.c, 0) || 1;
    const cities = byCity.rows.map((r) => ({
      city: r.city,
      count: r.c,
      pct: Math.round((r.c / cityTotal) * 100),
    }));

    const u = users.rows[0] || {};
    const p = props.rows[0] || {};
    const b = bookings.rows[0] || {};
    const planFree = Number(u.plan_free) || 0;
    const planPro = Number(u.plan_pro) || 0;
    const planTotal = planFree + planPro || 1;

    res.json({
      success: true,
      data: {
        kpis: {
          agencies: Number(u.agencies) || 0,
          agenciesActive: Number(u.agencies_active) || 0,
          agenciesPending: Number(u.agencies_pending) || 0,
          users: Number(u.total) || 0,
          clients: Number(u.clients) || 0,
          owners: Number(u.owners) || 0,
          propertiesOnline: Number(p.active) || 0,
          propertiesPending: Number(p.pending) || 0,
          propertiesTotal: Number(p.total) || 0,
          bookings: Number(b.total) || 0,
          bookingsMonth: Number(b.bookings_month) || 0,
          revenueMonth: Number(b.gmv_month) || 0,
          commissionsMonth: Number(b.commissions_month) || 0,
          gmv: Number(b.gmv) || 0,
          commissions: Number(b.commissions) || 0,
          outstanding,
          contractsActive,
          occupancyRate,
          avgRating: Math.round((reviews.rows[0]?.avg || 0) * 10) / 10,
          reviewsCount: reviews.rows[0]?.c || 0,
          pendingUsers: Number(u.pending_users) || 0,
        },
        revenueSeries,
        cities,
        subscriptions: [
          { id: "free", label: "Gratuit", count: planFree, pct: Math.round((planFree / planTotal) * 100) },
          { id: "starter", label: "Starter", count: 0, pct: 0 },
          { id: "pro", label: "Pro", count: planPro, pct: Math.round((planPro / planTotal) * 100) },
          { id: "business", label: "Business", count: 0, pct: 0 },
        ],
        recentAgencies: recentAgencies.rows.map((row) => ({
          ...mapUserRow(row),
          propertyCount: propCountMap[row.id] || 0,
        })),
        activity: activity.slice(0, 8),
        claims: [],
        transactions: paid.rows.slice(0, 5).map((row) => ({
          id: row.id,
          type: "Paiement réservation",
          amount: Number(row.total_price) || 0,
          method: "Plateforme",
          date: row.paid_at,
          status: "paid",
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserSubscription(req, res, next) {
  try {
    const plan = String(req.body?.subscriptionPlan || "").toLowerCase();
    if (!["free", "pro"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Plan invalide (free|pro)" });
    }
    const result = await query(
      `UPDATE users SET subscription_plan = $1 WHERE id = $2 RETURNING *`,
      [plan, req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }
    res.json({
      success: true,
      message: `Abonnement passé en ${plan}`,
      data: mapUserRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserCommission(req, res, next) {
  try {
    const rate = Number(req.body?.commissionRate);
    if (Number.isNaN(rate) || rate < 0 || rate > 0.5) {
      return res.status(400).json({
        success: false,
        message: "commissionRate entre 0 et 0.5 (ex: 0.05 = 5%)",
      });
    }
    const result = await query(
      `UPDATE users SET commission_rate = $1 WHERE id = $2 RETURNING *`,
      [rate, req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }
    res.json({
      success: true,
      message: "Taux de commission mis à jour",
      data: mapUserRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

function mapAgencyStatsRow(row) {
  return {
    ...mapUserRow(row),
    stats: {
      propertiesTotal: Number(row.properties_total) || 0,
      propertiesActive: Number(row.properties_active) || 0,
      propertiesPending: Number(row.properties_pending) || 0,
      bookingsTotal: Number(row.bookings_total) || 0,
      bookingsPending: Number(row.bookings_pending) || 0,
      bookingsConfirmed: Number(row.bookings_confirmed) || 0,
      bookingsCancelled: Number(row.bookings_cancelled) || 0,
      bookingsPaid: Number(row.bookings_paid) || 0,
      gmv: Number(row.gmv) || 0,
      commissions: Number(row.commissions) || 0,
      clientsCrm: Number(row.clients_crm) || 0,
      contractsActive: Number(row.contracts_active) || 0,
      teamMembers: Number(row.team_members) || 0,
    },
  };
}

const AGENCY_STATS_SELECT = `
  SELECT
    u.id, u.role, u.email, u.first_name, u.last_name, u.phone, u.wilaya, u.avatar,
    u.agency_name, u.manager_name, u.rc_number, u.nif, u.address, u.logo, u.status,
    u.subscription_plan, u.commission_rate, u.created_at,
    COALESCE(p.properties_total, 0)::int AS properties_total,
    COALESCE(p.properties_active, 0)::int AS properties_active,
    COALESCE(p.properties_pending, 0)::int AS properties_pending,
    COALESCE(b.bookings_total, 0)::int AS bookings_total,
    COALESCE(b.bookings_pending, 0)::int AS bookings_pending,
    COALESCE(b.bookings_confirmed, 0)::int AS bookings_confirmed,
    COALESCE(b.bookings_cancelled, 0)::int AS bookings_cancelled,
    COALESCE(b.bookings_paid, 0)::int AS bookings_paid,
    COALESCE(b.gmv, 0)::float AS gmv,
    COALESCE(b.commissions, 0)::float AS commissions,
    0::int AS clients_crm,
    0::int AS contracts_active,
    0::int AS team_members
  FROM users u
  LEFT JOIN (
    SELECT agency_id,
      COUNT(*)::int AS properties_total,
      COUNT(*) FILTER (WHERE status = 'active')::int AS properties_active,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS properties_pending
    FROM properties
    WHERE type <> 'vehicule'
    GROUP BY agency_id
  ) p ON p.agency_id = u.id
  LEFT JOIN (
    SELECT host_id,
      COUNT(*)::int AS bookings_total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS bookings_pending,
      COUNT(*) FILTER (WHERE status = 'confirmed')::int AS bookings_confirmed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int AS bookings_cancelled,
      COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS bookings_paid,
      COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0)::float AS gmv,
      COALESCE(SUM(service_fee) FILTER (WHERE payment_status = 'paid'), 0)::float AS commissions
    FROM bookings
    GROUP BY host_id
  ) b ON b.host_id = u.id
`;

async function enrichAgencyCrmStats(rows) {
  if (!rows.length) return rows;
  try {
    const ids = rows.map((r) => r.id);
    const [clients, contracts, team] = await Promise.all([
      query(
        `SELECT agency_id, COUNT(*)::int AS c FROM agency_clients
         WHERE agency_id = ANY($1::text[]) GROUP BY agency_id`,
        [ids]
      ),
      query(
        `SELECT agency_id, COUNT(*)::int AS c FROM agency_contracts
         WHERE agency_id = ANY($1::text[]) AND status = 'active' GROUP BY agency_id`,
        [ids]
      ),
      query(
        `SELECT agency_id, COUNT(*)::int AS c FROM agency_members
         WHERE agency_id = ANY($1::text[]) AND status = 'active' GROUP BY agency_id`,
        [ids]
      ).catch(() => ({ rows: [] })),
    ]);
    const cMap = Object.fromEntries(clients.rows.map((r) => [r.agency_id, r.c]));
    const ctMap = Object.fromEntries(contracts.rows.map((r) => [r.agency_id, r.c]));
    const tMap = Object.fromEntries(team.rows.map((r) => [r.agency_id, r.c]));
    return rows.map((r) => ({
      ...r,
      clients_crm: cMap[r.id] || 0,
      contracts_active: ctMap[r.id] || 0,
      team_members: tMap[r.id] || 0,
    }));
  } catch {
    return rows;
  }
}

/** GET /admin/agencies — liste enrichie (demandes, biens, etc.) */
export async function listAdminAgencies(req, res, next) {
  try {
    const result = await query(`
      ${AGENCY_STATS_SELECT}
      WHERE u.role = 'agency'
      ORDER BY
        CASE u.status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
        u.created_at DESC
    `);
    const rows = await enrichAgencyCrmStats(result.rows);

    res.json({
      success: true,
      count: rows.length,
      data: rows.map(mapAgencyStatsRow),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/agencies/:id — fiche détaillée + dernières demandes */
export async function getAdminAgencyDetail(req, res, next) {
  try {
    const id = req.params.id;
    const agency = await query(`${AGENCY_STATS_SELECT} WHERE u.role = 'agency' AND u.id = $1`, [id]);
    if (!agency.rows[0]) {
      return res.status(404).json({ success: false, message: "Agence introuvable" });
    }
    const [enriched] = await enrichAgencyCrmStats(agency.rows);

    const [recentBookings, recentProperties] = await Promise.all([
      query(
        `
        SELECT b.id, b.status, b.payment_status, b.total_price, b.check_in, b.check_out,
               b.guests, b.guest_first_name, b.guest_last_name, b.guest_email, b.created_at,
               p.name AS property_name, p.city AS property_city
        FROM bookings b
        LEFT JOIN properties p ON p.id = b.property_id
        WHERE b.host_id = $1
        ORDER BY b.created_at DESC
        LIMIT 20
      `,
        [id]
      ),
      query(
        `
        SELECT id, name, city, status, price, price_unit, transaction_type, type, created_at
        FROM properties
        WHERE agency_id = $1 AND type <> 'vehicule'
        ORDER BY created_at DESC
        LIMIT 12
      `,
        [id]
      ),
    ]);

    res.json({
      success: true,
      data: {
        ...mapAgencyStatsRow(enriched),
        recentBookings: recentBookings.rows.map((r) => ({
          id: r.id,
          status: r.status,
          paymentStatus: r.payment_status,
          totalPrice: Number(r.total_price) || 0,
          checkIn: r.check_in,
          checkOut: r.check_out,
          guests: Number(r.guests) || 1,
          guestName: [r.guest_first_name, r.guest_last_name].filter(Boolean).join(" "),
          guestEmail: r.guest_email || "",
          propertyName: r.property_name || "Bien",
          propertyCity: r.property_city || "",
          createdAt: r.created_at,
        })),
        recentProperties: recentProperties.rows.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          status: r.status,
          price: Number(r.price) || 0,
          priceUnit: r.price_unit,
          transaction: r.transaction_type,
          type: r.type,
          createdAt: r.created_at,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
