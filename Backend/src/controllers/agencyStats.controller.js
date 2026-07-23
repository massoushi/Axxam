import { query } from "../config/db.js";
import { ensureAgencyCrmTables } from "../db/agencyCrm.js";
import { ensureAgencyTeamTables } from "../db/agencyTeam.js";
import { ensurePropertiesTable } from "../db/properties.js";
import { ensureBookingsTable } from "../db/bookings.js";
import { ensureInvoicesTable } from "../db/invoices.js";
import { ensureMessagesTables } from "../db/messages.js";
import {
  mapContractRow,
  mapPaymentRow,
  mapTaskRow,
  mapAppointmentRow,
} from "../db/agencyCrm.js";

function agencyId(req) {
  return req.user.id;
}

function monthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** GET /agency/stats — dashboard cockpit */
export async function getAgencyStats(req, res, next) {
  try {
    await ensureAgencyCrmTables();
    await ensureAgencyTeamTables();
    await ensurePropertiesTable();
    await ensureBookingsTable();
    await ensureInvoicesTable();
    await ensureMessagesTables();

    const aid = agencyId(req);
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const today = now.toISOString().slice(0, 10);

    const [props, owners, clients, contractsActive, contractsExpiring, paymentsPending, paymentsOverdue, invoicesMonth, bookingsToday, unreadMsg, typeDist, occupancy] =
      await Promise.all([
        query(`SELECT COUNT(*)::int AS c FROM properties WHERE agency_id = $1`, [aid]),
        query(`SELECT COUNT(*)::int AS c FROM agency_owners WHERE agency_id = $1 AND status = 'active'`, [aid]),
        query(`SELECT COUNT(*)::int AS c FROM agency_clients WHERE agency_id = $1`, [aid]),
        query(
          `SELECT COUNT(*)::int AS c FROM agency_contracts WHERE agency_id = $1 AND status = 'active'`,
          [aid]
        ),
        query(
          `SELECT c.*,
            COALESCE(cl.first_name || ' ' || cl.last_name, '') AS client_name,
            COALESCE(p.name, '') AS property_name
           FROM agency_contracts c
           LEFT JOIN agency_clients cl ON cl.id = c.client_id
           LEFT JOIN properties p ON p.id = c.property_id
           WHERE c.agency_id = $1 AND c.status = 'active'
             AND c.end_date IS NOT NULL AND c.end_date <= $2 AND c.end_date >= CURRENT_DATE
           ORDER BY c.end_date ASC LIMIT 8`,
          [aid, in30.toISOString().slice(0, 10)]
        ),
        query(
          `SELECT pe.*,
            COALESCE(cl.first_name || ' ' || cl.last_name, 'Client') AS client_name
           FROM agency_payment_entries pe
           LEFT JOIN agency_clients cl ON cl.id = pe.client_id
           WHERE pe.agency_id = $1 AND pe.status IN ('pending', 'partial', 'overdue')
           ORDER BY pe.due_date ASC NULLS LAST LIMIT 10`,
          [aid]
        ),
        query(
          `SELECT COUNT(*)::int AS c,
                  COALESCE(SUM(amount - amount_paid), 0)::float AS total
           FROM agency_payment_entries
           WHERE agency_id = $1 AND status IN ('pending', 'partial', 'overdue')`,
          [aid]
        ),
        query(
          `SELECT COALESCE(SUM(total), 0)::float AS total
           FROM invoices
           WHERE host_id = $1 AND created_at >= $2 AND created_at < $3`,
          [aid, startMonth.toISOString(), endMonth.toISOString()]
        ),
        query(
          `SELECT COUNT(*)::int AS c FROM bookings b
           JOIN properties p ON p.id = b.property_id
           WHERE p.agency_id = $1
             AND (b.check_in = $2 OR b.created_at::date = $2::date)`,
          [aid, today]
        ),
        query(
          `SELECT COUNT(*)::int AS c FROM conversations c
           WHERE c.host_id = $1`,
          [aid]
        ),
        query(
          `SELECT type, COUNT(*)::int AS c FROM properties
           WHERE agency_id = $1 GROUP BY type ORDER BY c DESC`,
          [aid]
        ),
        query(
          `SELECT
             (SELECT COUNT(*)::int FROM properties WHERE agency_id = $1 AND status = 'active') AS available,
             (SELECT COUNT(*)::int FROM bookings b
                JOIN properties p ON p.id = b.property_id
                WHERE p.agency_id = $1 AND b.status IN ('confirmed', 'paid')
                  AND b.check_in <= CURRENT_DATE AND b.check_out > CURRENT_DATE) AS occupied`,
          [aid]
        ),
      ]);

    // Mark overdue payments
    await query(
      `UPDATE agency_payment_entries
       SET status = 'overdue'
       WHERE agency_id = $1 AND status IN ('pending', 'partial')
         AND due_date IS NOT NULL AND due_date < CURRENT_DATE`,
      [aid]
    );

    // Revenue last 6 months (invoices + paid schedule)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const inv = await query(
        `SELECT COALESCE(SUM(total), 0)::float AS t FROM invoices
         WHERE host_id = $1 AND created_at >= $2 AND created_at < $3`,
        [aid, d.toISOString(), next.toISOString()]
      );
      const pay = await query(
        `SELECT COALESCE(SUM(amount_paid), 0)::float AS t FROM agency_payment_entries
         WHERE agency_id = $1 AND status = 'paid'
           AND paid_at >= $2 AND paid_at < $3`,
        [aid, d.toISOString(), next.toISOString()]
      );
      months.push({
        month: monthKey(d),
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        revenue: (inv.rows[0]?.t || 0) + (pay.rows[0]?.t || 0),
      });
    }

    const paidScheduleMonth = await query(
      `SELECT COALESCE(SUM(amount_paid), 0)::float AS t FROM agency_payment_entries
       WHERE agency_id = $1 AND status = 'paid'
         AND paid_at >= $2 AND paid_at < $3`,
      [aid, startMonth.toISOString(), endMonth.toISOString()]
    );

    const available = occupancy.rows[0]?.available || 0;
    const occupied = occupancy.rows[0]?.occupied || 0;
    const totalUnits = available + occupied || available || 1;
    const occupancyRate = Math.round((occupied / Math.max(totalUnits, 1)) * 100);

    // Recent messages
    let recentMessages = [];
    try {
      const msgRes = await query(
        `SELECT m.id, m.body, m.created_at, m.sender_id,
                u.display_name AS sender_name
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         LEFT JOIN users u ON u.id = m.sender_id
         WHERE c.host_id = $1 OR c.client_id = $1
         ORDER BY m.created_at DESC LIMIT 5`,
        [aid]
      );
      recentMessages = msgRes.rows.map((r) => ({
        id: r.id,
        body: r.body,
        senderName: r.sender_name || "Utilisateur",
        createdAt: r.created_at,
      }));
    } catch {
      recentMessages = [];
    }

    // Agenda: tasks + appointments next 7 days
    const agendaTasks = await query(
      `SELECT * FROM agency_tasks
       WHERE agency_id = $1 AND status IN ('todo', 'doing')
       ORDER BY due_date ASC NULLS LAST LIMIT 8`,
      [aid]
    );
    const agendaAppts = await query(
      `SELECT * FROM agency_appointments
       WHERE agency_id = $1 AND start_at >= NOW() - INTERVAL '1 day'
       ORDER BY start_at ASC LIMIT 8`,
      [aid]
    );

    const typeTotal = typeDist.rows.reduce((s, r) => s + r.c, 0) || 1;
    const propertyTypes = typeDist.rows.map((r) => ({
      type: r.type,
      count: r.c,
      pct: Math.round((r.c / typeTotal) * 100),
    }));

    // Rappels auto (retard / contrats expirant) — max 1 notif/jour/type
    try {
      const { createNotification, ensureNotificationsTable } = await import("../db/notifications.js");
      await ensureNotificationsTable();
      const overdueCount = paymentsOverdue.rows[0]?.c || 0;
      const expiringCount = contractsExpiring.rows.length;
      if (overdueCount > 0) {
        const exists = await query(
          `SELECT id FROM notifications
           WHERE user_id = $1 AND type = 'payment_overdue'
             AND created_at::date = CURRENT_DATE LIMIT 1`,
          [aid]
        );
        if (!exists.rows[0]) {
          await createNotification({
            userId: aid,
            type: "payment_overdue",
            title: "Paiements en retard",
            body: `${overdueCount} échéance(s) à encaisser.`,
            link: "/agence/paiements",
          });
        }
      }
      if (expiringCount > 0) {
        const exists = await query(
          `SELECT id FROM notifications
           WHERE user_id = $1 AND type = 'contract_expiring'
             AND created_at::date = CURRENT_DATE LIMIT 1`,
          [aid]
        );
        if (!exists.rows[0]) {
          await createNotification({
            userId: aid,
            type: "contract_expiring",
            title: "Contrats bientôt expirés",
            body: `${expiringCount} contrat(s) expirent dans les 30 jours.`,
            link: "/agence/contrats",
          });
        }
      }
    } catch {
      /* notifications optionnelles */
    }

    res.json({
      success: true,
      data: {
        kpis: {
          properties: props.rows[0]?.c || 0,
          owners: owners.rows[0]?.c || 0,
          clients: clients.rows[0]?.c || 0,
          activeContracts: contractsActive.rows[0]?.c || 0,
          revenueMonth:
            (invoicesMonth.rows[0]?.total || 0) + (paidScheduleMonth.rows[0]?.t || 0),
          outstanding: paymentsOverdue.rows[0]?.total || 0,
          outstandingCount: paymentsOverdue.rows[0]?.c || 0,
          bookingsToday: bookingsToday.rows[0]?.c || 0,
          unreadMessages: unreadMsg.rows[0]?.c || 0,
          occupancyRate,
          available,
          occupied,
        },
        revenueSeries: months,
        propertyTypes,
        pendingPayments: paymentsPending.rows.map(mapPaymentRow),
        expiringContracts: contractsExpiring.rows.map(mapContractRow),
        recentMessages,
        agenda: {
          tasks: agendaTasks.rows.map(mapTaskRow),
          appointments: agendaAppts.rows.map(mapAppointmentRow),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
