import { query } from "../config/db.js";
import {
  ensureMessagesTables,
  mapConversationRow,
  mapMessageRow,
} from "../db/messages.js";
import { createNotification, ensureNotificationsTable } from "../db/notifications.js";

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function listConversations(req, res, next) {
  try {
    await ensureMessagesTables();
    const result = await query(
      `
      SELECT c.*,
        p.name AS property_name,
        p.img AS property_img,
        CONCAT(cu.first_name, ' ', cu.last_name) AS client_name,
        CASE WHEN hu.role = 'agency' THEN hu.agency_name
             ELSE CONCAT(hu.first_name, ' ', hu.last_name) END AS host_name,
        (
          SELECT body FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC LIMIT 1
        ) AS last_message
      FROM conversations c
      LEFT JOIN properties p ON p.id = c.property_id
      LEFT JOIN users cu ON cu.id = c.client_id
      LEFT JOIN users hu ON hu.id = c.host_id
      WHERE c.client_id = $1 OR c.host_id = $1
      ORDER BY c.last_message_at DESC
      `,
      [req.user.id]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapConversationRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrCreateConversation(req, res, next) {
  try {
    await ensureMessagesTables();
    const body = req.body || {};
    const propertyId = body.propertyId ? String(body.propertyId) : null;
    const bookingId = body.bookingId ? String(body.bookingId) : null;
    let hostId = body.hostId ? String(body.hostId) : null;
    let clientId = req.user.id;

    if (req.user.role === "client") {
      if (!hostId && propertyId) {
        const prop = await query(`SELECT agency_id FROM properties WHERE id = $1`, [propertyId]);
        hostId = prop.rows[0]?.agency_id;
      }
      if (!hostId) {
        return res.status(400).json({ success: false, message: "Hôte introuvable" });
      }
    } else if (["owner", "agency"].includes(req.user.role)) {
      hostId = req.user.id;
      clientId = body.clientId ? String(body.clientId) : null;
      if (!clientId) {
        return res.status(400).json({ success: false, message: "clientId requis" });
      }
    } else if (req.user.role === "admin") {
      clientId = body.clientId ? String(body.clientId) : clientId;
      if (!hostId) {
        return res.status(400).json({ success: false, message: "hostId requis" });
      }
    }

    const existing = await query(
      `
      SELECT * FROM conversations
      WHERE client_id = $1 AND host_id = $2
        AND COALESCE(property_id, '') = COALESCE($3, '')
      LIMIT 1
      `,
      [clientId, hostId, propertyId]
    );

    if (existing.rows[0]) {
      return res.json({ success: true, data: mapConversationRow(existing.rows[0]) });
    }

    const id = newId("cv");
    const inserted = await query(
      `
      INSERT INTO conversations (id, property_id, booking_id, client_id, host_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [id, propertyId, bookingId, clientId, hostId]
    );

    res.status(201).json({ success: true, data: mapConversationRow(inserted.rows[0]) });
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req, res, next) {
  try {
    await ensureMessagesTables();
    const conv = await query(`SELECT * FROM conversations WHERE id = $1`, [req.params.id]);
    const c = conv.rows[0];
    if (!c) {
      return res.status(404).json({ success: false, message: "Conversation introuvable" });
    }
    if (c.client_id !== req.user.id && c.host_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const result = await query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapMessageRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    await ensureMessagesTables();
    await ensureNotificationsTable();

    const body = String(req.body?.body || "").trim();
    if (!body) {
      return res.status(400).json({ success: false, message: "Message vide" });
    }

    const conv = await query(`SELECT * FROM conversations WHERE id = $1`, [req.params.id]);
    const c = conv.rows[0];
    if (!c) {
      return res.status(404).json({ success: false, message: "Conversation introuvable" });
    }
    if (c.client_id !== req.user.id && c.host_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Action non autorisée" });
    }

    const id = newId("msg");
    const inserted = await query(
      `
      INSERT INTO messages (id, conversation_id, sender_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [id, req.params.id, req.user.id, body]
    );

    await query(`UPDATE conversations SET last_message_at = NOW() WHERE id = $1`, [req.params.id]);

    const recipientId = req.user.id === c.client_id ? c.host_id : c.client_id;
    await createNotification({
      userId: recipientId,
      type: "message",
      title: "Nouveau message",
      body: body.slice(0, 120),
      link: `/messages?c=${req.params.id}`,
    });

    res.status(201).json({ success: true, data: mapMessageRow(inserted.rows[0]) });
  } catch (err) {
    next(err);
  }
}
