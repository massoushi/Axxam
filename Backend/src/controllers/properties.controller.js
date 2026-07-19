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
    if (category) add("category = ?", String(category).toLowerCase());
    if (bedrooms) add("bedrooms >= ?", Number(bedrooms));
    if (priceUnit) add("price_unit = ?", String(priceUnit));
    if (transaction) add("transaction_type = ?", String(transaction));
    if (status && status !== "all") add("status = ?", String(status));
    if (agencyId) add("agency_id = ?", String(agencyId));
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
      String(body.host || "Agence AXXAM").trim(),
      String(body.agencyId || "agence-demo"),
      String(body.type).toLowerCase(),
      String(body.category || "autre").toLowerCase(),
      body.transaction === "vente" ? "vente" : "location",
      status,
      JSON.stringify(unavailableDates),
    ];

    const result = await query(
      `
      INSERT INTO properties (
        id, name, city, commune, quartier, loc, price, price_unit, rating, badge,
        img, images, description, bedrooms, bathrooms, capacity, surface, amenities,
        host, agency_id, type, category, transaction_type, status, unavailable_dates
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12::jsonb,$13,$14,$15,$16,$17,$18::jsonb,
        $19,$20,$21,$22,$23,$24,$25::jsonb
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

    const result = await query(
      `UPDATE properties SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Bien introuvable",
      });
    }

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

export async function updatePropertyAvailability(req, res, next) {
  try {
    await ensurePropertiesTable();

    const unavailableDates = normalizeDates(req.body?.unavailableDates);

    const result = await query(
      `UPDATE properties SET unavailable_dates = $1::jsonb WHERE id = $2 RETURNING *`,
      [JSON.stringify(unavailableDates), req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Bien introuvable",
      });
    }

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

    const result = await query(`DELETE FROM properties WHERE id = $1 RETURNING *`, [
      req.params.id,
    ]);

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Bien introuvable",
      });
    }

    res.json({
      success: true,
      message: "Bien supprimé",
      data: mapPropertyRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}
