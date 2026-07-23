import { Router } from "express";
import healthRoutes from "./health.routes.js";
import propertiesRoutes from "./properties.routes.js";
import authRoutes from "./auth.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import favoritesRoutes from "./favorites.routes.js";
import paymentsRoutes from "./payments.routes.js";
import messagesRoutes from "./messages.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import agencyTeamRoutes from "./agencyTeam.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/properties", propertiesRoutes);
router.use("/auth", authRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/favorites", favoritesRoutes);
router.use("/payments", paymentsRoutes);
router.use("/messages", messagesRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/agency", agencyTeamRoutes);
router.use("/admin", adminRoutes);

export default router;
