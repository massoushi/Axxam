import bwipjs from "bwip-js";

/**
 * Génère un code-barres PNG (Code 128 par défaut).
 * @param {string} text - Texte à encoder (ex: id réservation)
 * @param {{ bcid?: string; scale?: number; height?: number; includetext?: boolean }} opts
 * @returns {Promise<Buffer>}
 */
export async function generateBarcodePng(text, opts = {}) {
  const value = String(text || "").trim();
  if (!value) {
    throw new Error("Texte du code-barres requis");
  }

  return bwipjs.toBuffer({
    bcid: opts.bcid || "code128",
    text: value,
    scale: opts.scale ?? 3,
    height: opts.height ?? 12,
    includetext: opts.includetext !== false,
    textxalign: "center",
  });
}
