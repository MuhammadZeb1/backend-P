import express from "express";
import { addToCart, getCart, removeFromCart } from "../controller/cartController.js";
import auth from "../middleware/auth.js";


const router = express.Router();

// ✅ POST /api/cart - add product
router.post("/addToCart",auth, addToCart);

// ✅ GET /api/cart - get cart with total price
router.get("/getCarts",auth, getCart);

// ✅ DELETE /api/cart/:productId - remove product
router.delete("/removeCart/:productId",auth, removeFromCart);

export default router;
