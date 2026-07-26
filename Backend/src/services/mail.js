import crypto from "crypto";
import { env } from "../config/env.js";

/**
 * Envoi d'e-mails AXXAM.
 * - RESEND_API_KEY ou SMTP_* → envoi réel
 * - Sinon → log console (dev) ; le code est aussi renvoyé dans la réponse API
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

/** Code à 6 chiffres pour vérification e-mail */
export function createVerifyCode() {
  return String(crypto.randomInt(100000, 999999));
}

export function verificationEmailContent({ name, code }) {
  const greeting = name ? `Bonjour ${name},` : "Bonjour,";
  const text = `${greeting}

Bienvenue sur AXXAM. Votre code de vérification est :

${code}

Saisissez ce code sur la page de vérification (valide 30 minutes).

Si vous n'avez pas créé de compte, ignorez ce message.

— L'équipe AXXAM`;

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2f2f2e">
    <p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a65126">AXXAM</p>
    <h1 style="font-size:22px;margin:8px 0 16px">Votre code de vérification</h1>
    <p>${greeting}</p>
    <p>Entrez ce code sur AXXAM pour activer votre compte (valable <strong>30 minutes</strong>) :</p>
    <p style="margin:28px 0;text-align:center">
      <span style="display:inline-block;background:#f7f3ee;border:1px solid #e5d9c8;border-radius:12px;padding:16px 28px;font-size:32px;letter-spacing:0.35em;font-weight:700;color:#2f2f2e">
        ${code}
      </span>
    </p>
    <p style="font-size:12px;color:#999;margin-top:32px">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</p>
  </div>`;

  return { subject: `${code} — code de vérification AXXAM`, text, html };
}
