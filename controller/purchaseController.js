import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";

import CustomerPurchase from "../model/customerPurchaseModel.js";
import VendorPurchase from "../model/vendorPurchaseModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ PURCHASE PRODUCT
export const purchaseProduct = async (req, res) => {
  try {
    const { productId, paymentMethodId, amount, address, phone } = req.body;
    const customerId = req.user.id;

    // 🔎 1. Find cart for this customer
    const cart = await Cart.findOne({ userId: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // 🔎 2. Find product in cart
    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    const quantity = item.quantity;

    // 🔎 3. Verify product exists
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // 💳 4. Stripe Payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["card"],
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "❌ Payment failed",
        status: paymentIntent.status,
      });
    }

    // 🧾 5. Create Customer Purchase
    const customerPurchase = new CustomerPurchase({
      customerId,
      productId,
      quantity,
      amount,
      stripePaymentId: paymentIntent.id,
      address,
      phone,
    });
    await customerPurchase.save();

    // 🧾 6. Create Vendor Purchase (linked)
    const vendorPurchase = new VendorPurchase({
     vendorId: product.vendor,
      customerPurchaseId: customerPurchase._id,
      status: "Pending",
    });
    await vendorPurchase.save();

    // 🧹 7. Remove purchased item from cart
    await Cart.updateOne(
      { userId: customerId },
      { $pull: { items: { productId } } }
    );

    res.status(200).json({
      message: "✅ Product purchased successfully",
      customerPurchase,
      vendorPurchase,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET PURCHASES (Customer)
export const getCustomerPurchases = async (req, res) => {
  try {
    console.log("Decoded vendorId:", req.user.id);
    const customerId = req.user.id;
    const purchases = await CustomerPurchase.find({ customerId })
      .populate("productId", "productName image price")
      .sort({ createdAt: -1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET PURCHASES (Vendor)
export const getVendorPurchases = async (req, res) => {
  try {
    console.log("Inside getVendorPurchases");
    const vendorId = req.user.id;
    console.log("vendor " ,vendorId)

    const purchases = await VendorPurchase.find({ vendorId })
      .populate({
        path: "customerPurchaseId",
        populate: [
          { path: "productId", select: "productName image price" },
          { path: "customerId", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE PURCHASE (linked delete)
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const vendorPurchase = await VendorPurchase.findById(id);
    const customerPurchase = await CustomerPurchase.findById(id);

    if (!vendorPurchase && !customerPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (vendorPurchase) {
      await CustomerPurchase.findByIdAndDelete(vendorPurchase.customerPurchaseId);
      await VendorPurchase.findByIdAndDelete(id);
    } else {
      await CustomerPurchase.findByIdAndDelete(id);
    }

    res.status(200).json({ message: "✅ Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
