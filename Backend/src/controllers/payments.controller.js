import { query } from "../config/db.js";
import { ensureBookingsTable, mapBookingRow } from "../db/bookings.js";
import { ensureInvoicesTable, mapInvoiceRow } from "../db/invoices.js";
import { createNotification, ensureNotificationsTable } from "../db/notifications.js";

function invoiceNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AXX-${y}${m}-${rand}`;
}

export async function simulatePayment(req, res, next) {
  try {
    await ensureBookingsTable();
    await ensureInvoicesTable();
    await ensureNotificationsTable();

    const bookingId = String(req.body?.bookingId || req.params?.bookingId || "").trim();
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId requis" });
    }

    const found = await query(
      `
      SELECT b.*, p.name AS property_name
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.id = $1
      `,
      [bookingId]
    );
    const row = found.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, message: "Réservation introuvable" });
    }

    if (row.client_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    if (row.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "La réservation doit être confirmée avant paiement",
      });
    }

    if (row.payment_status === "paid") {
      const inv = await query(`SELECT * FROM invoices WHERE booking_id = $1`, [bookingId]);
      return res.json({
        success: true,
        message: "Déjà payée",
        data: {
          booking: mapBookingRow(row),
          invoice: mapInvoiceRow(inv.rows[0]),
        },
      });
    }

    const updated = await query(
      `
      UPDATE bookings
      SET payment_status = 'paid', paid_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [bookingId]
    );

    const guestName = `${row.guest_first_name || ""} ${row.guest_last_name || ""}`.trim();
    const invId = `inv-${Date.now().toString(36)}`;
    const number = invoiceNumber();
    const subtotal = Number(row.total_price) || 0;
    const serviceFee = Number(row.service_fee) || 0;

    const invRes = await query(
      `
      INSERT INTO invoices (
        id, number, booking_id, client_id, host_id, property_id, property_name,
        check_in, check_out, nights, subtotal, service_fee, total, guest_name, guest_email
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15
      )
      RETURNING *
      `,
      [
        invId,
        number,
        bookingId,
        row.client_id,
        row.host_id,
        row.property_id,
        row.property_name || "",
        row.check_in,
        row.check_out,
        row.nights,
        subtotal,
        serviceFee,
        subtotal + serviceFee,
        guestName,
        row.guest_email || "",
      ]
    );

    await createNotification({
      userId: row.host_id,
      type: "payment",
      title: "Paiement reçu",
      body: `Paiement simulé pour « ${row.property_name} » — ${subtotal + serviceFee} DZD`,
      link: "/proprietaire/revenus",
    });

    res.json({
      success: true,
      message: "Paiement simulé réussi. Facture générée.",
      data: {
        booking: mapBookingRow(updated.rows[0]),
        invoice: mapInvoiceRow(invRes.rows[0]),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyInvoices(req, res, next) {
  try {
    await ensureInvoicesTable();
    const result = await query(
      `SELECT * FROM invoices WHERE client_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows.map(mapInvoiceRow) });
  } catch (err) {
    next(err);
  }
}

export async function listHostInvoices(req, res, next) {
  try {
    await ensureInvoicesTable();
    const hostId = req.user.role === "admin" && req.query.hostId ? String(req.query.hostId) : req.user.id;
    const result = await query(
      `SELECT * FROM invoices WHERE host_id = $1 ORDER BY created_at DESC`,
      [hostId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows.map(mapInvoiceRow) });
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceByBooking(req, res, next) {
  try {
    await ensureInvoicesTable();
    const result = await query(`SELECT * FROM invoices WHERE booking_id = $1`, [req.params.bookingId]);
    const invoice = mapInvoiceRow(result.rows[0]);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Facture introuvable" });
    }
    if (
      invoice.clientId !== req.user.id &&
      invoice.hostId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function getRevenueSummary(req, res, next) {
  try {
    await ensureBookingsTable();
    const hostId = req.user.role === "admin" && req.query.hostId ? String(req.query.hostId) : req.user.id;

    const result = await query(
      `
      SELECT
        COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_count,
        COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0) AS gross,
        COALESCE(SUM(service_fee) FILTER (WHERE payment_status = 'paid'), 0) AS fees,
        COALESCE(SUM(total_price + service_fee) FILTER (WHERE payment_status = 'paid'), 0) AS collected
      FROM bookings
      WHERE host_id = $1 AND status IN ('confirmed', 'completed')
      `,
      [hostId]
    );

    const row = result.rows[0] || {};
    const gross = Number(row.gross) || 0;
    const fees = Number(row.fees) || 0;

    const bookings = await query(
      `
      SELECT b.*,
        p.name AS property_name,
        p.img AS property_img,
        p.loc AS property_loc,
        p.city AS property_city
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.host_id = $1 AND b.payment_status = 'paid'
      ORDER BY b.paid_at DESC NULLS LAST, b.created_at DESC
      `,
      [hostId]
    );

    res.json({
      success: true,
      data: {
        paidCount: Number(row.paid_count) || 0,
        gross,
        platformFees: fees,
        net: gross,
        collected: Number(row.collected) || 0,
        bookings: bookings.rows.map(mapBookingRow),
      },
    });
  } catch (err) {
    next(err);
  }
}
