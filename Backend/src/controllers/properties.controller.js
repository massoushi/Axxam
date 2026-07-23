import { query } from "../config/db.js";
import { ensurePropertiesTable, mapPropertyRow, normalizeDates } from "../db/properties.js";

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function listProperties(req, res, next) {
  try {
    await ensurePropertiesTable();

    const {
      city,
      type,
      category,
      bedrooms,
      minPrice,
      maxPrice,
      priceUnit,
      transaction,
      agencyId,
      status,
      assignedTo,
    } = req.query;

    const clauses = [];
    const params = [];

    const add = (sql, value) => {
      params.push(value);
      clauses.push(sql.replace("?", `$${params.length}`));
    };

    if (city) {
      params.push(`%${String(city).toLowerCase()}%`);
      clauses.push(
        `(LOWER(city) LIKE $${params.length} OR LOWER(loc) LIKE $${params.length} OR LOWER(commune) LIKE $${params.length})`
      );
    }

    if (type) add("type = ?", String(type).toLowerCase());
    else add("type <> ?", "vehicule");
    if (category) add("category = ?", String(category).toLowerCase());
    // Anciennes catégories véhicules
    if (!category) {
      clauses.push(`(category IS NULL OR category NOT IN ('voiture', 'utilitaire'))`);
    }    if (bedrooms) add("bedrooms >= ?", Number(bedrooms));
    if (priceUnit) add("price_unit = ?", String(priceUnit));
    if (transaction) add("transaction_type = ?", String(transaction));
    if (status && status !== "all") add("status = ?", String(status));
    if (agencyId) add("agency_id = ?", String(agencyId));
    if (assignedTo) add("assigned_to = ?", String(assignedTo));
    if (minPrice) add("price >= ?", Number(minPrice));
    if (maxPrice) add("price <= ?", Number(maxPrice));

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await query(
      `SELECT * FROM properties ${where} ORDER BY created_at DESC`,
      params
    );

    const data = result.rows.map(mapPropertyRow);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPropertyById(req, res, next) {
  try {
    await ensurePropertiesTable();

    const result = await query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    const property = mapPropertyRow(result.rows[0]);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Bien introuvable",
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProperty(req, res, next) {
  try {
    await ensurePropertiesTable();

    const body = req.body || {};
    const required = ["name", "type", "city", "price", "priceUnit", "transaction"];
    const missing = required.filter((key) => body[key] === undefined || body[key] === "");

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Champs requis manquants : ${missing.join(", ")}`,
      });
    }

    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ajoutez au moins une image depuis la galerie",
      });
    }

    const idBase = slugify(body.name) || "bien";
    const id = `${idBase}-${Date.now().toString(36)}`;

    const city = String(body.city).trim();
    const commune = String(body.commune || "").trim();
    const quartier = String(body.quartier || "").trim();
    const locParts = [quartier, commune || city, "Algérie"].filter(Boolean);

    const status = "pending";
    const unavailableDates = normalizeDates(body.unavailableDates);

    const hostName =
      req.user.role === "agency"
        ? req.user.agencyName || req.user.displayName
        : req.user.displayName || "Hôte AXXAM";

    const values = [
      id,
      String(body.name).trim(),
      city,
      commune || city,
      quartier,
      locParts.join(", "),
      Number(body.price),
      body.priceUnit === "mois" ? "mois" : "nuit",
      "—",
      body.badge || "Nouveauté",
      images[0],
      JSON.stringify(images),
      String(body.description || "").trim(),
      Number(body.bedrooms) || 0,
      Number(body.bathrooms) || 0,
      Number(body.capacity) || 1,
      Number(body.surface) || 0,
      JSON.stringify(Array.isArray(body.amenities) ? body.amenities : []),
      String(body.host || hostName).trim(),
      req.user?.id || String(body.agencyId || "agence-demo"),
      String(body.type).toLowerCase(),
      String(body.category || "autre").toLowerCase(),
      body.transaction === "vente" ? "vente" : "location",
      status,
      JSON.stringify(unavailableDates),
      body.assignedTo || null,
      Number(body.charges) || 0,
      body.gpsLat != null && body.gpsLat !== "" ? Number(body.gpsLat) : null,
      body.gpsLng != null && body.gpsLng !== "" ? Number(body.gpsLng) : null,
      ["available", "occupied", "maintenance"].includes(body.opsStatus)
        ? body.opsStatus
        : "available",
      String(body.videoUrl || "").trim(),
      String(body.virtualTourUrl || "").trim(),
    ];

    const result = await query(
      `
      INSERT INTO properties (
        id, name, city, commune, quartier, loc, price, price_unit, rating, badge,
        img, images, description, bedrooms, bathrooms, capacity, surface, amenities,
        host, agency_id, type, category, transaction_type, status, unavailable_dates, assigned_to,
        charges, gps_lat, gps_lng, ops_status, video_url, virtual_tour_url
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12::jsonb,$13,$14,$15,$16,$17,$18::jsonb,
        $19,$20,$21,$22,$23,$24,$25::jsonb,$26,
        $27,$28,$29,$30,$31,$32
      )
      RETURNING *
      `,
      values
    );

    res.status(201).json({
      success: true,
      message: "Bien soumis à validation. Un administrateur doit l'approuver avant publication.",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePropertyStatus(req, res, next) {
  try {
    await ensurePropertiesTable();

    const { status } = req.body || {};
    const allowed = ["active", "pending", "draft", "on_hold", "inactive", "sold", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs : ${allowed.join(", ")}`,
      });
    }

    const existing = await query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    const prop = existing.rows[0];
    if (!prop) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = prop.agency_id === req.user?.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    // Seul l'admin peut approuver (active) ou refuser
    if (!isAdmin && ["active", "rejected"].includes(status) && prop.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Seule la modération AXXAM peut approuver ou refuser une annonce",
      });
    }

    const result = await query(
      `UPDATE properties SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    const messages = {
      active: "Annonce approuvée et publiée sur l'accueil",
      rejected: "Annonce refusée",
      pending: "Annonce remise en attente",
      inactive: "Annonce désactivée",
      draft: "Annonce en brouillon",
      on_hold: "Annonce mise en pause",
      sold: "Annonce marquée comme vendue",
    };

    res.json({
      success: true,
      message: messages[status] || "Statut mis à jour",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProperty(req, res, next) {
  try {
    await ensurePropertiesTable();

    const existing = await query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    const prop = existing.rows[0];
    if (!prop) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = prop.agency_id === req.user?.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const body = req.body || {};
    const price = body.price !== undefined ? Number(body.price) : Number(prop.price);
    const priceUnit =
      body.priceUnit === "mois" || body.priceUnit === "nuit"
        ? body.priceUnit
        : prop.price_unit;
    const name = body.name !== undefined ? String(body.name).trim() : prop.name;
    const description =
      body.description !== undefined ? String(body.description).trim() : prop.description;
    const charges = body.charges !== undefined ? Number(body.charges) : Number(prop.charges || 0);
    const gpsLat =
      body.gpsLat !== undefined
        ? body.gpsLat === null || body.gpsLat === ""
          ? null
          : Number(body.gpsLat)
        : prop.gps_lat;
    const gpsLng =
      body.gpsLng !== undefined
        ? body.gpsLng === null || body.gpsLng === ""
          ? null
          : Number(body.gpsLng)
        : prop.gps_lng;
    const opsStatus = ["available", "occupied", "maintenance"].includes(body.opsStatus)
      ? body.opsStatus
      : prop.ops_status || "available";
    const videoUrl =
      body.videoUrl !== undefined ? String(body.videoUrl).trim() : prop.video_url || "";
    const virtualTourUrl =
      body.virtualTourUrl !== undefined
        ? String(body.virtualTourUrl).trim()
        : prop.virtual_tour_url || "";

    const result = await query(
      `
      UPDATE properties
      SET price = $1, price_unit = $2, name = $3, description = $4,
          charges = $5, gps_lat = $6, gps_lng = $7, ops_status = $8,
          video_url = $9, virtual_tour_url = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        price,
        priceUnit,
        name,
        description,
        charges,
        gpsLat,
        gpsLng,
        opsStatus,
        videoUrl,
        virtualTourUrl,
        req.params.id,
      ]
    );

    res.json({
      success: true,
      message: "Bien mis à jour",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePropertyAssignment(req, res, next) {
  try {
    await ensurePropertiesTable();

    const existing = await query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    const prop = existing.rows[0];
    if (!prop) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    if (req.user.role !== "admin" && prop.agency_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const assignedTo = req.body?.assignedTo ? String(req.body.assignedTo) : null;

    const result = await query(
      `UPDATE properties SET assigned_to = $1 WHERE id = $2 RETURNING *`,
      [assignedTo, req.params.id]
    );

    res.json({
      success: true,
      message: assignedTo ? "Logement attribué" : "Attribution retirée",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePropertyAvailability(req, res, next) {
  try {
    await ensurePropertiesTable();

    const existing = await query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    const prop = existing.rows[0];
    if (!prop) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    if (req.user.role !== "admin" && prop.agency_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const unavailableDates = normalizeDates(req.body?.unavailableDates);

    const result = await query(
      `UPDATE properties SET unavailable_dates = $1::jsonb WHERE id = $2 RETURNING *`,
      [JSON.stringify(unavailableDates), req.params.id]
    );

    res.json({
      success: true,
      message: "Calendrier de disponibilités mis à jour",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProperty(req, res, next) {
  try {
    await ensurePropertiesTable();

    const existing = await query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    const prop = existing.rows[0];
    if (!prop) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    if (req.user.role !== "admin" && prop.agency_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const result = await query(`DELETE FROM properties WHERE id = $1 RETURNING *`, [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Bien supprimé",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}
