import { query } from "../config/db.js";
import { ensureReviewsTable, mapReviewRow } from "../db/reviews.js";

function newId() {
  return `rv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function createReview(req, res, next) {
  try {
    await ensureReviewsTable();

    const bookingId = String(req.body?.bookingId || "").trim();
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || "").trim();

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "bookingId et note (1-5) requis",
      });
    }

    const booking = await query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
    const b = booking.rows[0];
    if (!b) {
      return res.status(404).json({ success: false, message: "Réservation introuvable" });
    }
    if (b.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const checkOut = String(b.check_out).slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const stayEnded = checkOut <= today;
    const canReview =
      b.status === "completed" ||
      (b.status === "confirmed" && stayEnded);

    if (!canReview) {
      return res.status(400).json({
        success: false,
        message:
          "Vous pourrez noter après la fin du séjour (ou quand l'hôte l'aura marqué terminé)",
      });
    }

    if (!comment || comment.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Le commentaire doit contenir au moins 5 caractères",
      });
    }

    // Si confirmé et séjour fini → passe en completed pour cohérence
    if (b.status === "confirmed" && stayEnded) {
      await query(`UPDATE bookings SET status = 'completed' WHERE id = $1`, [bookingId]);
    }

    const existing = await query(`SELECT id FROM reviews WHERE booking_id = $1`, [bookingId]);
    if (existing.rows[0]) {
      return res.status(409).json({ success: false, message: "Avis déjà déposé pour ce séjour" });
    }

    const result = await query(
      `
      INSERT INTO reviews (id, booking_id, property_id, client_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [newId(), bookingId, b.property_id, req.user.id, rating, comment]
    );

    const avg = await query(
      `SELECT ROUND(AVG(rating)::numeric, 1) AS avg FROM reviews WHERE property_id = $1`,
      [b.property_id]
    );
    if (avg.rows[0]?.avg) {
      await query(`UPDATE properties SET rating = $1 WHERE id = $2`, [
        String(avg.rows[0].avg),
        b.property_id,
      ]);
    }

    res.status(201).json({
      success: true,
      message: "Merci pour votre avis",
      data: mapReviewRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function listPropertyReviews(req, res, next) {
  try {
    await ensureReviewsTable();
    const result = await query(
      `
      SELECT r.*,
        CONCAT(u.first_name, ' ', u.last_name) AS client_name
      FROM reviews r
      JOIN users u ON u.id = r.client_id
      WHERE r.property_id = $1
      ORDER BY r.created_at DESC
      `,
      [req.params.propertyId]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapReviewRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyReviews(req, res, next) {
  try {
    await ensureReviewsTable();
    const result = await query(
      `SELECT r.* FROM reviews r WHERE r.client_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapReviewRow),
    });
  } catch (err) {
    next(err);
  }
}
