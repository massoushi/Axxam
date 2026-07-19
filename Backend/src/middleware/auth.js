import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { query } from "../config/db.js";
import { ensureUsersTable, mapUserRow } from "../db/users.js";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentification requise" });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      return res.status(401).json({ success: false, message: "Session invalide ou expirée" });
    }

    await ensureUsersTable();
    const result = await query(`SELECT * FROM users WHERE id = $1`, [payload.sub]);
    const user = mapUserRow(result.rows[0]);

    if (!user) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ success: false, message: "Compte suspendu" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé pour ce rôle",
      });
    }
    next();
  };
}
