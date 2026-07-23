import { Router } from "express";
import bwipjs from "bwip-js";

const router = Router();

/**
 * GET /api/barcode/:code
 * Même logique que ton exemple Express + bwip-js
 * Exemple : /api/barcode/AX-12345
 */
router.get("/:code", async (req, res) => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: req.params.code,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: "center",
    });

    res.set("Content-Type", "image/png");
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du code-barres",
    });
  }
});

export default router;
