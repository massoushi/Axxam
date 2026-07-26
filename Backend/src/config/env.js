import "dotenv/config";

function parseClientOrigins() {
  const raw = process.env.CLIENT_URL || "http://localhost:3000";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  clientOrigins: parseClientOrigins(),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "axxam-dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  /** Première origine front (liens e-mail) */
  publicAppUrl: (process.env.PUBLIC_APP_URL || parseClientOrigins()[0] || "http://localhost:3000").replace(
    /\/$/,
    ""
  ),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "AXXAM <noreply@axxam.dz>",
  resendApiKey: process.env.RESEND_API_KEY || "",
};
