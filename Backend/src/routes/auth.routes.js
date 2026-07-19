import { Router } from "express";
import {
  listUsers,
  login,
  me,
  register,
  updateProfile,
  updateUserStatus,
} from "../controllers/auth.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, updateProfile);
router.get("/users", authenticate, requireRole("admin"), listUsers);
router.patch("/users/:id/status", authenticate, requireRole("admin"), updateUserStatus);

export default router;
