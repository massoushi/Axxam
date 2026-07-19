import { Router } from "express";
import healthRoutes from "./health.routes.js";
import propertiesRoutes from "./properties.routes.js";
import authRoutes from "./auth.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import favoritesRoutes from "./favorites.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/properties", propertiesRoutes);
router.use("/auth", authRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/favorites", favoritesRoutes);

export default router;
