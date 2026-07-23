import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getPropertyById,
  listProperties,
  updateProperty,
  updatePropertyAssignment,
  updatePropertyAvailability,
  updatePropertyStatus,
} from "../controllers/properties.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listProperties);
router.get("/:id", getPropertyById);

router.post("/", authenticate, requireRole("owner", "agency", "admin"), createProperty);
router.patch("/:id", authenticate, requireRole("owner", "agency", "admin"), updateProperty);
router.patch("/:id/status", authenticate, requireRole("owner", "agency", "admin"), updatePropertyStatus);
router.patch("/:id/assign", authenticate, requireRole("agency", "admin"), updatePropertyAssignment);
router.put("/:id/availability", authenticate, requireRole("owner", "agency", "admin"), updatePropertyAvailability);
router.delete("/:id", authenticate, requireRole("owner", "agency", "admin"), deleteProperty);

export default router;
