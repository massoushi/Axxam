import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { ensurePropertiesTable } from "./db/properties.js";
import { ensureUsersTable } from "./db/users.js";
import { ensureBookingsTable } from "./db/bookings.js";
import { ensureFavoritesTable } from "./db/favorites.js";

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
