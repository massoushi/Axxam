import { Router } from "express";
import {
  getInvoiceByBooking,
  getRevenueSummary,
  listHostInvoices,
  listMyInvoices,
  simulatePayment,
} from "../controllers/payments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/simulate", authenticate, requireRole("client", "admin"), simulatePayment);
router.get("/invoices/mine", authenticate, listMyInvoices);
router.get("/invoices/host", authenticate, requireRole("owner", "agency", "admin"), listHostInvoices);
router.get("/invoices/booking/:bookingId", authenticate, getInvoiceByBooking);
router.get("/revenue", authenticate, requireRole("owner", "agency", "admin"), getRevenueSummary);

export default router;
