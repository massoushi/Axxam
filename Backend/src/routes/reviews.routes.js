import { Router } from "express";
import {
  createReview,
  listMyReviews,
  listPropertyReviews,
} from "../controllers/reviews.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/property/:propertyId", listPropertyReviews);
router.get("/mine", authenticate, requireRole("client"), listMyReviews);
router.post("/", authenticate, requireRole("client"), createReview);

export default router;
