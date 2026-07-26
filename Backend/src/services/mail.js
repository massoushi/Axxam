import crypto from "crypto";
import { env } from "../config/env.js";

/**
 * Envoi d'e-mails AXXAM.
 * - SMTP_* configuré → envoi réel via nodemailer (si installé) ou fetch SMTP API
 * - Sinon → log console (dev) ; le lien est aussi renvoyé dans la réponse API en développement
 */
export async function sendMail({ to, subject, html, text }) {
  const from = env.smtpFrom || "AXXAM <noreply@axxam.dz>";

  if (env.resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error ${res.status}: ${body}`);
    }
    return { ok: true, provider: "resend" };
  }

  if (env.smtpHost && env.smtpUser && env.smtpPass) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      });
      await transporter.sendMail({ from, to, subject, html, text });
      return { ok: true, provider: "smtp" };
    } catch (err) {
      console.error("[mail] SMTP failed:", err.message);
      throw err;
    }
  }

  console.log("\n========== AXXAM EMAIL (dev — aucun SMTP configuré) ==========");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(text || html);
  console.log("==============================================================\n");
  return { ok: true, provider: "console" };
}

export function createVerifyToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function verificationEmailContent({ name, verifyUrl }) {
  const greeting = name ? `Bonjour ${name},` : "Bonjour,";
  const text = `${greeting}

Bienvenue sur AXXAM. Confirmez votre adresse e-mail en ouvrant ce lien (valide 24 h) :

${verifyUrl}

Si vous n'avez pas créé de compte, ignorez ce message.

— L'équipe AXXAM`;

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2f2f2e">
    <p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a65126">AXXAM</p>
    <h1 style="font-size:22px;margin:8px 0 16px">Confirmez votre e-mail</h1>
    <p>${greeting}</p>
    <p>Merci de vous être inscrit. Cliquez sur le bouton pour activer votre compte (lien valable 24 heures).</p>
    <p style="margin:28px 0">
      <a href="${verifyUrl}" style="background:#a65126;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700;display:inline-block">
        Vérifier mon e-mail
      </a>
    </p>
    <p style="font-size:13px;color:#666">Ou copiez ce lien :<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p style="font-size:12px;color:#999;margin-top:32px">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</p>
  </div>`;

  return { subject: "Confirmez votre e-mail — AXXAM", text, html };
}
