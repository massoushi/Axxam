import { ensurePropertiesTable } from "../src/db/properties.js";
import { query } from "../src/config/db.js";

await ensurePropertiesTable();
const r = await query("SELECT count(*)::int AS c FROM properties WHERE status = 'active'");
console.log("Annonces actives:", r.rows[0].c);
process.exit(0);
