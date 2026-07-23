import { Router } from "express";
import {
  broadcastNotification,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notifications.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, listMyNotifications);
router.patch("/read-all", authenticate, markAllNotificationsRead);
router.patch("/:id/read", authenticate, markNotificationRead);
router.post("/broadcast", authenticate, requireRole("admin"), broadcastNotification);

export default router;
