import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { ensurePropertiesTable } from "./db/properties.js";
import { ensureUsersTable } from "./db/users.js";
import { ensureBookingsTable } from "./db/bookings.js";
import { ensureFavoritesTable } from "./db/favorites.js";
import { ensureInvoicesTable } from "./db/invoices.js";
import { ensureMessagesTables } from "./db/messages.js";
import { ensureReviewsTable } from "./db/reviews.js";
import { ensureNotificationsTable } from "./db/notifications.js";
import { ensureAgencyTeamTables } from "./db/agencyTeam.js";
import { ensureAgencyCrmTables } from "./db/agencyCrm.js";
import { ensureAdminTables } from "./db/admin.js";

async function start() {
  if (!env.databaseUrl) {
    console.error("DATABASE_URL manquant dans .env");
    process.exit(1);
  }

  try {
    const ping = await pool.query("SELECT NOW() AS now");
    console.log(`PostgreSQL OK → ${ping.rows[0].now}`);
    await ensurePropertiesTable();
    console.log("Table properties prête (annonces démo seedées si besoin)");
    await ensureUsersTable();
    console.log("Table users prête (admin seed si besoin)");
    await ensureBookingsTable();
    console.log("Table bookings prête");
    await ensureFavoritesTable();
    console.log("Table favorites prête");
    await ensureInvoicesTable();
    await ensureMessagesTables();
    await ensureReviewsTable();
    await ensureNotificationsTable();
    await ensureAgencyTeamTables();
    await ensureAgencyCrmTables();
    await ensureAdminTables();
    console.log("Tables MVP + CRM agence + admin prêtes");
  } catch (err) {
    console.error("Connexion PostgreSQL échouée:", err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`AXXAM API → http://localhost:${env.port}`);
    console.log(`Environnement : ${env.nodeEnv}`);
    console.log(`CORS autorisé : ${env.clientOrigins.join(", ")}`);
  });
}

start();
