import { query } from "../config/db.js";
import {
  ensureAgencyTeamTables,
  mapAgencyOwnerRow,
  mapMemberRow,
} from "../db/agencyTeam.js";
import { mapUserRow } from "../db/users.js";
import { createNotification, ensureNotificationsTable } from "../db/notifications.js";

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function agencyIdOf(req) {
  return req.user.role === "admin" && req.query.agencyId
    ? String(req.query.agencyId)
    : req.user.id;
}

export async function listMembers(req, res, next) {
  try {
    await ensureAgencyTeamTables();
    const agencyId = agencyIdOf(req);
    if (req.user.role !== "admin" && req.user.role !== "agency") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    if (req.user.role === "agency" && agencyId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const result = await query(
      `
      SELECT m.*,
        u.email,
        CASE WHEN u.role = 'agency' THEN u.agency_name
             ELSE CONCAT(u.first_name, ' ', u.last_name) END AS display_name,
        u.phone
      FROM agency_members m
      JOIN users u ON u.id = m.user_id
      WHERE m.agency_id = $1
      ORDER BY m.created_at DESC
      `,
      [agencyId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows.map(mapMemberRow) });
  } catch (err) {
    next(err);
  }
}

export async function inviteMember(req, res, next) {
  try {
    await ensureAgencyTeamTables();
    await ensureNotificationsTable();

    if (req.user.role !== "agency" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const agencyId = req.user.role === "agency" ? req.user.id : String(req.body?.agencyId || req.user.id);
    const email = String(req.body?.email || "").trim().toLowerCase();
    const memberRole = req.body?.memberRole === "manager" ? "manager" : "employee";

    if (!email) {
      return res.status(400).json({ success: false, message: "Email requis" });
    }

    const userRes = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun compte avec cet email. La personne doit d'abord s'inscrire.",
      });
    }

    const inserted = await query(
      `
      INSERT INTO agency_members (id, agency_id, user_id, member_role, status)
      VALUES ($1, $2, $3, $4, 'active')
      ON CONFLICT (agency_id, user_id) DO UPDATE SET
        member_role = EXCLUDED.member_role,
        status = 'active'
      RETURNING *
      `,
      [newId("am"), agencyId, user.id, memberRole]
    );

    await createNotification({
      userId: user.id,
      type: "team",
      title: "Ajouté à une agence",
      body: `Vous avez été ajouté comme ${memberRole} sur AXXAM.`,
      link: "/agence",
    });

    const mapped = mapMemberRow({
      ...inserted.rows[0],
      email: user.email,
      display_name: mapUserRow(user).displayName,
      phone: user.phone,
    });

    res.status(201).json({ success: true, message: "Membre ajouté", data: mapped });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberStatus(req, res, next) {
  try {
    await ensureAgencyTeamTables();
    const status = String(req.body?.status || "");
    if (!["active", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }

    const found = await query(`SELECT * FROM agency_members WHERE id = $1`, [req.params.id]);
    const row = found.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, message: "Membre introuvable" });
    }
    if (req.user.role !== "admin" && row.agency_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const result = await query(
      `UPDATE agency_members SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json({ success: true, data: mapMemberRow(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

export async function listLinkedOwners(req, res, next) {
  try {
    await ensureAgencyTeamTables();
    const agencyId = agencyIdOf(req);
    if (req.user.role === "agency" && agencyId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const result = await query(
      `
      SELECT ao.*,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) AS display_name,
        u.phone
      FROM agency_owners ao
      JOIN users u ON u.id = ao.owner_id
      WHERE ao.agency_id = $1
      ORDER BY ao.created_at DESC
      `,
      [agencyId]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapAgencyOwnerRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function linkOwner(req, res, next) {
  try {
    await ensureAgencyTeamTables();
    await ensureNotificationsTable();

    if (req.user.role !== "agency" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const agencyId = req.user.role === "agency" ? req.user.id : String(req.body?.agencyId || req.user.id);
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email du propriétaire requis" });
    }

    const userRes = await query(`SELECT * FROM users WHERE LOWER(email) = $1 AND role = 'owner'`, [
      email,
    ]);
    const owner = userRes.rows[0];
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Aucun propriétaire avec cet email",
      });
    }

    const inserted = await query(
      `
      INSERT INTO agency_owners (id, agency_id, owner_id, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (agency_id, owner_id) DO UPDATE SET status = 'active'
      RETURNING *
      `,
      [newId("ao"), agencyId, owner.id]
    );

    await createNotification({
      userId: owner.id,
      type: "team",
      title: "Agence liée",
      body: "Une agence AXXAM s'est liée à votre compte propriétaire.",
      link: "/proprietaire",
    });

    res.status(201).json({
      success: true,
      message: "Propriétaire rattaché",
      data: mapAgencyOwnerRow({
        ...inserted.rows[0],
        email: owner.email,
        display_name: mapUserRow(owner).displayName,
        phone: owner.phone,
      }),
    });
  } catch (err) {
    next(err);
  }
}

export async function unlinkOwner(req, res, next) {
  try {
    await ensureAgencyTeamTables();
    const found = await query(`SELECT * FROM agency_owners WHERE id = $1`, [req.params.id]);
    const row = found.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, message: "Lien introuvable" });
    }
    if (req.user.role !== "admin" && row.agency_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }
    await query(`DELETE FROM agency_owners WHERE id = $1`, [req.params.id]);
    res.json({ success: true, message: "Propriétaire détaché", data: mapAgencyOwnerRow(row) });
  } catch (err) {
    next(err);
  }
}
