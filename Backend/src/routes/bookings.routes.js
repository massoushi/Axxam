import { Router } from "express";
import {
  createBooking,
  listHostBookings,
  listMyBookings,
  markBookingPayment,
  updateBookingStatus,
} from "../controllers/bookings.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("client"), createBooking);
router.get("/mine", authenticate, listMyBookings);
router.get("/host", authenticate, requireRole("owner", "agency", "admin"), listHostBookings);
router.patch("/:id/status", authenticate, updateBookingStatus);
router.patch(
  "/:id/payment",
  authenticate,
  requireRole("owner", "agency", "admin"),
  markBookingPayment
);

export default router;
