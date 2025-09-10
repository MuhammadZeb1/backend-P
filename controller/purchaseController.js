import Stripe from "stripe";
import dotenv from "dotenv";
import Purchase from "../model/purchseModel.js"; // ✅ correct import

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const purchaseProduct = async (req, res) => {
  try {
    const { productId, userId, number, cvc, exp_month, exp_year, amount } = req.body;

    // Step 1: Create PaymentMethod
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number,
        cvc,
        exp_month,
        exp_year,
      },
    });

    // Step 2: Create PaymentIntent with that method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: "usd",
      payment_method: paymentMethod.id,
      confirm: true,
    });

    // Step 3: Check payment success
    if (paymentIntent.status === "succeeded") {
      // Save purchase to DB
      const purchase = new Purchase({
        productId,
        userId,
        stripePaymentId: paymentIntent.id, // save Stripe payment id for tracking
        return_url: "http://localhost:3000/",
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