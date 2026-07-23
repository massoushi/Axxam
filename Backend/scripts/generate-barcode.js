/**
 * Usage CLI :
 *   node scripts/generate-barcode.js AX-12345
 *   node scripts/generate-barcode.js 5901234123457 ean13
 *   node scripts/generate-barcode.js https://axxam.dz qrcode
 *
 * Sortie : fichier PNG dans scripts/out/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateBarcodePng } from "../src/utils/barcode.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const text = process.argv[2] || `AX-${Date.now().toString(36).toUpperCase()}`;
const bcid = (process.argv[3] || "code128").toLowerCase();

const outDir = path.join(__dirname, "out");
fs.mkdirSync(outDir, { recursive: true });

const safeName = text.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
const outFile = path.join(outDir, `barcode-${safeName}.png`);

const png = await generateBarcodePng(text, {
  bcid,
  scale: 4,
  height: bcid === "qrcode" ? 25 : 14,
});

fs.writeFileSync(outFile, png);
console.log(`Code-barres généré → ${outFile}`);
console.log(`Texte : ${text} (${bcid})`);
