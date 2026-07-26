import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { env } from "../config/env.js";
import { ensureUsersTable, mapUserRow } from "../db/users.js";
import { signToken } from "../middleware/auth.js";
import { createVerifyCode, sendMail, verificationEmailContent } from "../services/mail.js";

const ROLES = ["client", "owner", "agency"];

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function validatePhone(phone) {
  const cleaned = normalizePhone(phone).replace(/^\+/, "");
  return /^\d{8,15}$/.test(cleaned);
}

function normalizeCode(code) {
  return String(code || "").replace(/\D/g, "").slice(0, 6);
}

async function issueVerificationEmail(userRow) {
  const code = createVerifyCode();
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await query(
    `UPDATE users SET email_verify_token = $1, email_verify_expires = $2, email_verified = false WHERE id = $3`,
    [code, expires.toISOString(), userRow.id]
  );

  const displayName =
    userRow.role === "agency"
      ? userRow.agency_name || "Agence"
      : [userRow.first_name, userRow.last_name].filter(Boolean).join(" ") || "";

  const { subject, html, text } = verificationEmailContent({ name: displayName, code });

  let emailSent = false;
  let provider = "none";
  try {
    const result = await sendMail({ to: userRow.email, subject, html, text });
    emailSent = true;
    provider = result.provider;
  } catch (err) {
    console.error("[verify-email] send failed:", err.message);
  }

  return { code, emailSent, provider };
}

export async function register(req, res, next) {
  try {
    await ensureUsersTable();

    const body = req.body || {};
    const role = String(body.role || "client").toLowerCase();

    if (!ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide. Choisissez client, owner ou agency.",
      });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const phone = normalizePhone(body.phone);

    if (!email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, téléphone et mot de passe sont requis",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Adresse email invalide",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Numéro de téléphone invalide (minimum 8 chiffres)",
      });
    }

    let firstName = String(body.firstName || "").trim();
    let lastName = String(body.lastName || "").trim();
    const wilaya = String(body.wilaya || "").trim();
    const avatar = body.avatar || null;
    let address = String(body.address || "").trim();

    let agencyName = "";
    let managerName = "";
    let rcNumber = "";
    let nif = "";
    let logo = null;
    let status = "active";

    if (role === "client" || role === "owner") {
      if (!firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "Nom et prénom requis",
        });
      }
      if (!address) {
        return res.status(400).json({
          success: false,
          message: "Adresse requise",
        });
      }
      if (role === "owner" && !wilaya) {
        return res.status(400).json({
          success: false,
          message: "Wilaya requise pour un propriétaire",
        });
      }
    }

    if (role === "agency") {
      agencyName = String(body.agencyName || "").trim();
      managerName = String(body.managerName || "").trim();
      rcNumber = String(body.rcNumber || "").trim();
      nif = String(body.nif || "").trim();
      address = String(body.address || "").trim();
      logo = body.logo || null;

      if (!agencyName || !managerName) {
        return res.status(400).json({
          success: false,
          message: "Nom de l'agence et nom du responsable requis",
        });
      }
      if (!wilaya) {
        return res.status(400).json({
          success: false,
          message: "Wilaya requise pour une agence",
        });
      }
      if (!address) {
        return res.status(400).json({
          success: false,
          message: "Adresse de l'agence requise",
        });
      }

      // Compte agence en attente de validation admin
      status = "pending";
      const parts = managerName.split(/\s+/);
      firstName = parts[0] || managerName;
      lastName = parts.slice(1).join(" ") || "";
    }

    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    if (existing.rows[0]) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cet email",
      });
    }

    const idBase =
      role === "agency"
        ? `agence-${slugify(agencyName) || "axxam"}`
        : role === "owner"
          ? `proprietaire-${slugify(lastName) || "user"}`
          : `client-${slugify(lastName) || "user"}`;
    const id = `${idBase}-${Date.now().toString(36)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `
      INSERT INTO users (
        id, role, email, password_hash, first_name, last_name, phone, wilaya, avatar,
        agency_name, manager_name, rc_number, nif, address, logo, status, email_verified
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16, false
      )
      RETURNING *
      `,
      [
        id,
        role,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        wilaya,
        avatar,
        agencyName,
        managerName,
        rcNumber,
        nif,
        address,
        logo,
        status,
      ]
    );

    const row = result.rows[0];
    const mail = await issueVerificationEmail(row);
    const user = mapUserRow({ ...row, email_verified: false });

    const messages = {
      client: "Compte créé. Vérifiez votre e-mail pour activer la connexion.",
      owner: "Compte créé. Vérifiez votre e-mail pour activer la connexion.",
      agency:
        "Compte agence créé. Vérifiez votre e-mail, puis attendez la validation admin avant publication.",
    };

    res.status(201).json({
      success: true,
      message: messages[role],
      data: {
        user,
        requiresVerification: true,
        emailSent: mail.emailSent,
        // Code visible en test sans SMTP
        devCode:
          env.nodeEnv !== "production" || mail.provider === "console" ? mail.code : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    await ensureUsersTable();

    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    const row = result.rows[0];

    if (!row) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const user = mapUserRow(row);

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Compte suspendu. Contactez le support AXXAM.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message:
          "E-mail non vérifié. Saisissez le code reçu par e-mail, ou renvoyez un nouveau code.",
      });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Connexion réussie",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    await ensureUsersTable();

    const email = String(req.body?.email || req.query.email || "")
      .trim()
      .toLowerCase();
    const code = normalizeCode(req.body?.code || req.query.code || req.query.token || "");

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Adresse e-mail requise" });
    }
    if (code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Code invalide. Entrez les 6 chiffres reçus par e-mail.",
      });
    }

    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    const row = result.rows[0];
    if (!row) {
      return res.status(400).json({
        success: false,
        message: "Code incorrect ou compte introuvable.",
      });
    }

    if (row.email_verified) {
      const user = mapUserRow(row);
      return res.json({
        success: true,
        message: "E-mail déjà vérifié. Vous pouvez vous connecter.",
        data: { user, alreadyVerified: true },
      });
    }

    if (!row.email_verify_token || normalizeCode(row.email_verify_token) !== code) {
      return res.status(400).json({
        success: false,
        message: "Code incorrect. Vérifiez l'e-mail ou renvoyez un nouveau code.",
      });
    }

    if (row.email_verify_expires && new Date(row.email_verify_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Code expiré. Demandez un nouveau code.",
      });
    }

    const updated = await query(
      `
      UPDATE users
      SET email_verified = true, email_verify_token = NULL, email_verify_expires = NULL
      WHERE id = $1
      RETURNING *
      `,
      [row.id]
    );

    const user = mapUserRow(updated.rows[0]);
    const token = signToken(user);

    res.json({
      success: true,
      message: "E-mail vérifié. Vous êtes connecté.",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req, res, next) {
  try {
    await ensureUsersTable();

    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Adresse e-mail invalide" });
    }

    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    const row = result.rows[0];

    if (!row) {
      return res.json({
        success: true,
        message: "Si un compte existe pour cet e-mail, un nouveau code a été envoyé.",
      });
    }

    if (row.email_verified) {
      return res.json({
        success: true,
        message: "Cet e-mail est déjà vérifié. Vous pouvez vous connecter.",
        data: { alreadyVerified: true },
      });
    }

    const mail = await issueVerificationEmail(row);

    res.json({
      success: true,
      message: mail.emailSent
        ? "Un nouveau code a été envoyé par e-mail."
        : "Code généré (e-mail non configuré — voir devCode en développement).",
      data: {
        emailSent: mail.emailSent,
        devCode:
          env.nodeEnv !== "production" || mail.provider === "console" ? mail.code : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({
    success: true,
    data: { user: req.user },
  });
}

export async function updateProfile(req, res, next) {
  try {
    await ensureUsersTable();

    const body = req.body || {};
    const userId = req.user.id;

    const firstName = String(body.firstName ?? req.user.firstName ?? "").trim();
    const lastName = String(body.lastName ?? req.user.lastName ?? "").trim();
    const phone = normalizePhone(body.phone ?? req.user.phone ?? "");
    const address = String(body.address ?? req.user.address ?? "").trim();
    const wilaya = String(body.wilaya ?? req.user.wilaya ?? "").trim();
    const avatar = body.avatar !== undefined ? body.avatar : req.user.avatar;

    let agencyName = req.user.agencyName || "";
    let managerName = req.user.managerName || "";
    let rcNumber = req.user.rcNumber || "";
    let nif = req.user.nif || "";
    let logo = req.user.logo;
    let email = req.user.email;

    if (body.email) {
      const nextEmail = String(body.email).trim().toLowerCase();
      if (!validateEmail(nextEmail)) {
        return res.status(400).json({ success: false, message: "Email invalide" });
      }
      if (nextEmail !== req.user.email) {
        const exists = await query(
          `SELECT id FROM users WHERE LOWER(email) = $1 AND id <> $2 LIMIT 1`,
          [nextEmail, userId]
        );
        if (exists.rows[0]) {
          return res.status(409).json({ success: false, message: "Cet email est déjà utilisé" });
        }
        email = nextEmail;
      }
    }

    if (req.user.role === "client" || req.user.role === "owner") {
      if (!firstName || !lastName) {
        return res.status(400).json({ success: false, message: "Nom et prénom requis" });
      }
      if (!phone || !validatePhone(phone)) {
        return res.status(400).json({ success: false, message: "Téléphone invalide" });
      }
      if (!address) {
        return res.status(400).json({ success: false, message: "Adresse requise" });
      }
    }

    if (req.user.role === "agency") {
      agencyName = String(body.agencyName ?? agencyName).trim();
      managerName = String(body.managerName ?? managerName).trim();
      rcNumber = String(body.rcNumber ?? rcNumber).trim();
      nif = String(body.nif ?? nif).trim();
      if (body.logo !== undefined) logo = body.logo;
      if (!agencyName || !managerName) {
        return res.status(400).json({
          success: false,
          message: "Nom de l'agence et responsable requis",
        });
      }
      if (!phone || !validatePhone(phone)) {
        return res.status(400).json({ success: false, message: "Téléphone invalide" });
      }
      if (!address) {
        return res.status(400).json({ success: false, message: "Adresse requise" });
      }
    }

    let passwordHash = null;
    if (body.password) {
      const password = String(body.password);
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = passwordHash
      ? await query(
          `
          UPDATE users SET
            email = $1, first_name = $2, last_name = $3, phone = $4, address = $5,
            wilaya = $6, avatar = $7, agency_name = $8, manager_name = $9,
            rc_number = $10, nif = $11, logo = $12, password_hash = $13
          WHERE id = $14
          RETURNING *
          `,
          [
            email,
            firstName,
            lastName,
            phone,
            address,
            wilaya,
            avatar,
            agencyName,
            managerName,
            rcNumber,
            nif,
            logo,
            passwordHash,
            userId,
          ]
        )
      : await query(
          `
          UPDATE users SET
            email = $1, first_name = $2, last_name = $3, phone = $4, address = $5,
            wilaya = $6, avatar = $7, agency_name = $8, manager_name = $9,
            rc_number = $10, nif = $11, logo = $12
          WHERE id = $13
          RETURNING *
          `,
          [
            email,
            firstName,
            lastName,
            phone,
            address,
            wilaya,
            avatar,
            agencyName,
            managerName,
            rcNumber,
            nif,
            logo,
            userId,
          ]
        );

    const user = mapUserRow(result.rows[0]);

    res.json({
      success: true,
      message: "Profil mis à jour",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    await ensureUsersTable();

    const role = req.query.role ? String(req.query.role) : null;
    const status = req.query.status ? String(req.query.status) : null;
    const clauses = [];
    const params = [];

    if (role) {
      params.push(role);
      clauses.push(`role = $${params.length}`);
    }
    if (status) {
      params.push(status);
      clauses.push(`status = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await query(
      `SELECT id, role, email, first_name, last_name, phone, wilaya, avatar,
              agency_name, manager_name, rc_number, nif, address, logo, status,
              subscription_plan, commission_rate, email_verified, created_at
       FROM users ${where}
       ORDER BY created_at DESC`,
      params
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(mapUserRow),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    await ensureUsersTable();

    const status = String(req.body?.status || "");
    const allowed = ["active", "pending", "suspended"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs : ${allowed.join(", ")}`,
      });
    }

    const result = await query(
      `UPDATE users SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    res.json({
      success: true,
      message: status === "active" ? "Compte activé" : "Statut mis à jour",
      data: mapUserRow(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}
