import { Router } from "express";
import {
  listUsers,
  login,
  me,
  register,
  resendVerification,
  updateProfile,
  updateUserStatus,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, updateProfile);
router.get("/users", authenticate, requireRole("admin"), listUsers);
router.patch("/users/:id/status", authenticate, requireRole("admin"), updateUserStatus);

export default router;
