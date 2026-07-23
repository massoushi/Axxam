import { Router } from "express";
import {
  getAdminAgencyDetail,
  getAdminStats,
  listAdminAgencies,
  updateUserCommission,
  updateUserSubscription,
} from "../controllers/admin.controller.js";
import {
  createAdminClaim,
  getAdminActivity,
  getAdminContent,
  getAdminSettings,
  listAdminBookings,
  listAdminClaims,
  listAdminCommissions,
  listAdminContracts,
  listAdminPayments,
  putAdminContent,
  putAdminSettings,
  updateAdminClaim,
} from "../controllers/adminExtras.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/overview-stats", getAdminStats);
router.get("/agencies", listAdminAgencies);
router.get("/agencies/:id", getAdminAgencyDetail);
router.patch("/users/:id/subscription", updateUserSubscription);
router.patch("/users/:id/commission", updateUserCommission);

router.get("/bookings", listAdminBookings);
router.get("/contracts", listAdminContracts);
router.get("/payments", listAdminPayments);
router.get("/commissions", listAdminCommissions);

router.get("/claims", listAdminClaims);
router.post("/claims", createAdminClaim);
router.patch("/claims/:id", updateAdminClaim);

router.get("/content", getAdminContent);
router.put("/content", putAdminContent);

router.get("/settings", getAdminSettings);
router.put("/settings", putAdminSettings);

router.get("/activity", getAdminActivity);

export default router;
