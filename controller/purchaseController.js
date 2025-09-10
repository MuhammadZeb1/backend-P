import Stripe from "stripe";
import dotenv from "dotenv";
import Purchase from "../model/purchseModel.js"; // ✅ correct import
import Product from "../model/productModel.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const purchaseProduct = async (req, res) => {
  try {
    const { productId, paymentMethodId, amount } = req.body;
    const userId = req.user.id;

    // ✅ Create PaymentIntent for card only, no redirect
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["card"], // only card
      // automatic_payment_methods: { enabled: true, allow_redirects: "never" }, // disables redirect warnings
    });

    // Save purchase if succeeded
    if (paymentIntent.status === "succeeded") {
      const purchase = new Purchase({
        productId,
        userId,
        amount,
        stripePaymentId: paymentIntent.id, // save Stripe ID
      });
      await purchase.save();

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





export const getPurchases = async (req, res) => {
  try {
    const userId = req.user.id; // 🔑 from auth middleware
    const purchases = await Purchase.find({ userId })
      .populate("productId", "productName image price")   // product info
      .populate("userId", "name email role");             
    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
    try {
       const {id} = req.params;
         await Purchase.findByIdAndDelete(id);
         res.status(200).json({message:"Purchase deleted successfully"})

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}