import { query } from "../config/db.js";
import { ensureBookingsTable, mapBookingRow, nightsBetween } from "../db/bookings.js";
import { ensurePropertiesTable, mapPropertyRow, normalizeDates } from "../db/properties.js";

function slugId() {
  return `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function getBookedNightsForProperty(propertyId, excludeBookingId = null) {
  const params = [propertyId];
  let sql = `
    SELECT check_in, check_out FROM bookings
    WHERE property_id = $1 AND status IN ('pending', 'confirmed', 'completed')
  `;
  if (excludeBookingId) {
    params.push(excludeBookingId);
    sql += ` AND id <> $${params.length}`;
  }
  const result = await query(sql, params);
  const nights = [];
  for (const row of result.rows) {
    const start = String(row.check_in).slice(0, 10);
    const end = String(row.check_out).slice(0, 10);
    nights.push(...nightsBetween(start, end));
  }
  return nights;
}

export async function createBooking(req, res, next) {
  try {
    await ensureBookingsTable();
    await ensurePropertiesTable();

    if (!req.user || req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Seuls les clients peuvent réserver un logement",
      });
    }

    const body = req.body || {};
    const propertyId = String(body.propertyId || "").trim();
    const checkIn = String(body.checkIn || "").slice(0, 10);
    const checkOut = String(body.checkOut || "").slice(0, 10);
    const guests = Number(body.guests) || 1;
    const guestFirstName = String(body.guestFirstName || req.user.firstName || "").trim();
    const guestLastName = String(body.guestLastName || req.user.lastName || "").trim();
    const guestEmail = String(body.guestEmail || req.user.email || "").trim().toLowerCase();
    const guestPhone = String(body.guestPhone || req.user.phone || "").trim();
    const specialRequests = String(body.specialRequests || "").trim();

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Bien et dates de séjour requis",
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "La date de départ doit être après l'arrivée",
      });
    }

    if (!guestFirstName || !guestLastName || !guestEmail || !guestPhone) {
      return res.status(400).json({
        success: false,
        message: "Coordonnées du voyageur incomplètes",
      });
    }

    const propRes = await query(`SELECT * FROM properties WHERE id = $1`, [propertyId]);
    const property = mapPropertyRow(propRes.rows[0]);

    if (!property) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    if (property.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Ce bien n'est pas disponible à la réservation",
      });
    }

    if (guests > property.capacity) {
      return res.status(400).json({
        success: false,
        message: `Capacité maximale : ${property.capacity} voyageurs`,
      });
    }

    const stayNights = nightsBetween(checkIn, checkOut);
    if (stayNights.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Séjour invalide",
      });
    }

    const blocked = new Set([
      ...normalizeDates(property.unavailableDates),
      ...(await getBookedNightsForProperty(propertyId)),
    ]);

    if (stayNights.some((d) => blocked.has(d))) {
      return res.status(409).json({
        success: false,
        message: "Certaines dates ne sont plus disponibles",
      });
    }

    const pricePerNight = Number(property.price) || 0;
    const nights = stayNights.length;
    const totalPrice = nights * pricePerNight;
    const serviceFee = Math.round(totalPrice * 0.05);
    const id = slugId();

    const insert = await query(
      `
      INSERT INTO bookings (
        id, property_id, client_id, host_id, check_in, check_out, guests,
        guest_first_name, guest_last_name, guest_email, guest_phone, special_requests,
        nights, price_per_night, total_price, service_fee, status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,
        $13,$14,$15,$16,'pending'
      )
      RETURNING *
      `,
      [
        id,
        propertyId,
        req.user.id,
        property.agencyId,
        checkIn,
        checkOut,
        guests,
        guestFirstName,
        guestLastName,
        guestEmail,
        guestPhone,
        specialRequests,
        nights,
        pricePerNight,
        totalPrice,
        serviceFee,
      ]
    );

    // Bloque les nuits sur le calendrier du bien
    const merged = normalizeDates([...property.unavailableDates, ...stayNights]);
    await query(`UPDATE properties SET unavailable_dates = $1::jsonb WHERE id = $2`, [
      JSON.stringify(merged),
      propertyId,
    ]);

    res.status(201).json({
      success: true,
      message: "Demande de réservation envoyée. L'hôte va la confirmer.",
      data: {
        ...mapBookingRow(insert.rows[0]),
        propertyName: property.name,
        propertyImg: property.img,
        propertyLoc: property.loc,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyBookings(req, res, next) {
  try {
    await ensureBookingsTable();

    const result = await query(
      `
      SELECT b.*,
        p.name AS property_name,
        p.img AS property_img,
        p.loc AS property_loc,
        p.city AS property_city
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.client_id = $1
      ORDER BY b.created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapBookingRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function listHostBookings(req, res, next) {
  try {
    await ensureBookingsTable();

    if (!["owner", "agency", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Réservé aux propriétaires et agences",
      });
    }

    const hostId = req.user.role === "admin" && req.query.hostId ? String(req.query.hostId) : req.user.id;

    const result = await query(
      `
      SELECT b.*,
        p.name AS property_name,
        p.img AS property_img,
        p.loc AS property_loc,
        p.city AS property_city,
        CONCAT(u.first_name, ' ', u.last_name) AS client_name,
        u.email AS client_email
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN users u ON u.id = b.client_id
      WHERE b.host_id = $1
      ORDER BY b.created_at DESC
      `,
      [hostId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapBookingRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    await ensureBookingsTable();

    const status = String(req.body?.status || "");
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs : ${allowed.join(", ")}`,
      });
    }

    const found = await query(
      `
      SELECT b.*, p.unavailable_dates
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.id = $1
      `,
      [req.params.id]
    );

    const row = found.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, message: "Réservation introuvable" });
    }

    const isClient = req.user.id === row.client_id;
    const isHost = req.user.id === row.host_id || req.user.role === "admin";

    if (!isClient && !isHost) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    // Client peut seulement annuler
    if (isClient && !isHost && status !== "cancelled") {
      return res.status(403).json({
        success: false,
        message: "Vous pouvez uniquement annuler votre réservation",
      });
    }

    const result = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    // Si annulation : libérer les dates (sauf si d'autres réservations les couvrent)
    if (status === "cancelled" && row.status !== "cancelled") {
      const stayNights = nightsBetween(
        String(row.check_in).slice(0, 10),
        String(row.check_out).slice(0, 10)
      );
      const stillBooked = new Set(await getBookedNightsForProperty(row.property_id, row.id));
      const current = normalizeDates(row.unavailable_dates);
      const freed = new Set(stayNights.filter((d) => !stillBooked.has(d)));
      const nextDates = current.filter((d) => !freed.has(d));
      await query(`UPDATE properties SET unavailable_dates = $1::jsonb WHERE id = $2`, [
        JSON.stringify(nextDates),
        row.property_id,
      ]);
    }

    const messages = {
      confirmed: "Réservation confirmée",
      cancelled: "Réservation annulée",
      completed: "Séjour marqué comme terminé",
      pending: "Remis en attente",
    };

    res.json({
      success: true,
      message: messages[status] || "Statut mis à jour",
      data: mapBookingRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}
