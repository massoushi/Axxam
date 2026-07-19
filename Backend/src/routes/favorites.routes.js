import { Router } from "express";
import {
  addFavorite,
  listFavoriteIds,
  listFavorites,
  removeFavorite,
} from "../controllers/favorites.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.get("/", listFavorites);
router.get("/ids", listFavoriteIds);
router.post("/", addFavorite);
router.delete("/:propertyId", removeFavorite);

export default router;
