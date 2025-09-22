import Stripe from "stripe";
import dotenv from "dotenv";
import Purchase from "../model/purchseModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";
import mongoose from "mongoose";
import roleBasedAuthModel from "../model/roleBasedAuthModel.js";
import productModel from "../model/productModel.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const purchaseProduct = async (req, res) => {
  try {
    const { productId, paymentMethodId, amount, address,phone } = req.body;
    const customerId = req.user.id;

    // ✅ Get quantity from cart instead of frontend
    const cart = await Cart.findOne({ userId: customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    const quantity = item.quantity; // ✅ now we have correct quantity
    console.log(quantity + " quantity");

    // ✅ Stripe payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["card"],
    });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    if (paymentIntent.status === "succeeded") {
      const purchase = new Purchase({
        productId,
        customerId,
        vendorId: product.vendor,
        quantity, // ✅ use correct quantity here
        amount,
        stripePaymentId: paymentIntent.id,
        address,
        phone,
      });
      await purchase.save();

      // ✅ Remove product from cart
      await Cart.updateOne(
        { userId: customerId },
        { $pull: { items: { productId } } }
      );

      return res.status(200).json({
        message: "✅ Product purchased successfully",
        purchase,
      });
    } else {
      return res.status(400).json({
        message: "❌ Payment failed",
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerPurchases = async (req, res) => {
  try {
    const customerId = req.user.id; // 🔑 from auth middleware
    const purchases = await Purchase.find({ customerId})
      .populate("productId", "productName image price ") // product info
      .populate("vendorId", "name email role");
    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getVendorPurchases = async (req, res) => {
  try {
    const vendorId = req.user.id; // 🔑 from auth middleware
    const purchases = await Purchase.find({ vendorId})
      .populate("productId", "productName image price ") 
      .populate("customerId", "name email role");
    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    await Purchase.findByIdAndDelete(id);
    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
