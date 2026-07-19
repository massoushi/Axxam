import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "axxam-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
