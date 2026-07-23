import { Router } from "express";
import { generateBarcodePng } from "../utils/barcode.js";

const router = Router();

/**
 * GET /api/barcode/:code
 * Exemple: /api/barcode/AX-12345 → image PNG Code 128
 * Query: ?format=code128|ean13|qrcode&scale=3
 */
router.get("/:code", async (req, res, next) => {
  try {
    const code = decodeURIComponent(req.params.code || "").trim();
    if (!code) {
      return res.status(400).json({ success: false, message: "Code requis" });
    }

    const bcid = String(req.query.format || "code128").toLowerCase();
    const allowed = new Set(["code128", "ean13", "code39", "qrcode"]);
    if (!allowed.has(bcid)) {
      return res.status(400).json({
        success: false,
        message: "format invalide (code128|ean13|code39|qrcode)",
      });
    }

    // EAN-13 exige 12 ou 13 chiffres
    if (bcid === "ean13" && !/^\d{12,13}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "EAN-13 : fournir 12 ou 13 chiffres",
      });
    }

    const png = await generateBarcodePng(code, {
      bcid,
      scale: Number(req.query.scale) || 3,
      height: Number(req.query.height) || (bcid === "qrcode" ? 20 : 12),
      includetext: req.query.text !== "0",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(png);
  } catch (err) {
    next(err);
  }
});

export default router;
