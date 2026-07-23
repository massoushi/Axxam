import { Router } from "express";
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  sendMessage,
} from "../controllers/messages.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, listConversations);
router.post("/", authenticate, getOrCreateConversation);
router.get("/:id/messages", authenticate, listMessages);
router.post("/:id/messages", authenticate, sendMessage);

export default router;
