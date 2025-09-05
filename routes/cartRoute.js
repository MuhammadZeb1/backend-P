import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

// ✅ POST /api/cart - add product
router.post("/", addToCart);

// ✅ GET /api/cart - get cart with total price
router.get("/", getCart);

// ✅ DELETE /api/cart/:productId - remove product
router.delete("/:productId", removeFromCart);

export default router;
