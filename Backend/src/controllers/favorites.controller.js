import { query } from "../config/db.js";
import { ensureFavoritesTable } from "../db/favorites.js";
import { ensurePropertiesTable, mapPropertyRow } from "../db/properties.js";

export async function listFavorites(req, res, next) {
  try {
    await ensureFavoritesTable();
    await ensurePropertiesTable();

    const result = await query(
      `
      SELECT p.*
      FROM favorites f
      JOIN properties p ON p.id = f.property_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapPropertyRow),
      ids: result.rows.map((r) => r.id),
    });
  } catch (err) {
    next(err);
  }
}

export async function listFavoriteIds(req, res, next) {
  try {
    await ensureFavoritesTable();

    const result = await query(`SELECT property_id FROM favorites WHERE user_id = $1`, [
      req.user.id,
    ]);

    res.json({
      success: true,
      data: result.rows.map((r) => r.property_id),
    });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  try {
    await ensureFavoritesTable();

    const propertyId = String(req.body?.propertyId || "").trim();
    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Bien requis" });
    }

    const prop = await query(`SELECT id FROM properties WHERE id = $1`, [propertyId]);
    if (!prop.rows[0]) {
      return res.status(404).json({ success: false, message: "Bien introuvable" });
    }

    await query(
      `
      INSERT INTO favorites (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id) DO NOTHING
      `,
      [req.user.id, propertyId]
    );

    res.status(201).json({
      success: true,
      message: "Ajouté aux favoris",
      data: { propertyId },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    await ensureFavoritesTable();

    const propertyId = String(req.params.propertyId || "").trim();
    await query(`DELETE FROM favorites WHERE user_id = $1 AND property_id = $2`, [
      req.user.id,
      propertyId,
    ]);

    res.json({
      success: true,
      message: "Retiré des favoris",
      data: { propertyId },
    });
  } catch (err) {
    next(err);
  }
}
