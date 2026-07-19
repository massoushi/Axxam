import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getPropertyById,
  listProperties,
  updatePropertyAvailability,
  updatePropertyStatus,
} from "../controllers/properties.controller.js";

const router = Router();

router.get("/", listProperties);
router.post("/", createProperty);
router.get("/:id", getPropertyById);
router.patch("/:id/status", updatePropertyStatus);
router.put("/:id/availability", updatePropertyAvailability);
router.delete("/:id", deleteProperty);

export default router;
