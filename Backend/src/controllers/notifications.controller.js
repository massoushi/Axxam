import { query } from "../config/db.js";
import {
  createNotification,
  ensureNotificationsTable,
  mapNotificationRow,
} from "../db/notifications.js";

export async function listMyNotifications(req, res, next) {
  try {
    await ensureNotificationsTable();
    const result = await query(
      `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [req.user.id]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapNotificationRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    await ensureNotificationsTable();
    const result = await query(
      `
      UPDATE notifications SET read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Notification introuvable" });
    }
    res.json({ success: true, data: mapNotificationRow(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await ensureNotificationsTable();
    await query(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id]
    );
    res.json({ success: true, message: "Toutes marquées comme lues", data: null });
  } catch (err) {
    next(err);
  }
}

export async function broadcastNotification(req, res, next) {
  try {
    await ensureNotificationsTable();
    const title = String(req.body?.title || "").trim();
    const body = String(req.body?.body || "").trim();
    const link = String(req.body?.link || "").trim();
    const role = req.body?.role ? String(req.body.role) : null;
    const userId = req.body?.userId ? String(req.body.userId) : null;

    if (!title) {
      return res.status(400).json({ success: false, message: "Titre requis" });
    }

    let users;
    if (userId) {
      users = await query(`SELECT id FROM users WHERE id = $1`, [userId]);
    } else if (role) {
      users = await query(`SELECT id FROM users WHERE role = $1 AND status = 'active'`, [role]);
    } else {
      users = await query(`SELECT id FROM users WHERE status = 'active'`);
    }

    const created = [];
    for (const u of users.rows) {
      created.push(
        await createNotification({
          userId: u.id,
          type: "broadcast",
          title,
          body,
          link,
        })
      );
    }

    res.json({
      success: true,
      message: `${created.length} notification(s) envoyée(s)`,
      count: created.length,
      data: created,
    });
  } catch (err) {
    next(err);
  }
}
