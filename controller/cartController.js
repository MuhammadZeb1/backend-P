import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

/**
 * POST /api/cart
 * Add product to cart
 */
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id; // 🔑 JWT middleware se aayega
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/cart
 * Get logged-in user's cart
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    res.status(200).json({ cartItems: cart ? cart.items : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/cart/:productId
 * Remove product from cart
 */
router.delete("/:productId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
