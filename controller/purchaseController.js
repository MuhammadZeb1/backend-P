import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";

import CustomerPurchase from "../model/customerPurchaseModel.js";
import VendorPurchase from "../model/vendorPurchaseModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";
import User from '../model/roleBasedAuthModel.js'

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ PURCHASE PRODUCT
export const purchaseProduct = async (req, res) => {
  try {
    const { productId, paymentMethodId, amount, address, phone } = req.body;
    const customerId = req.user.id;

    // 1️⃣ Find cart
    const cart = await Cart.findOne({ userId: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // 2️⃣ Find product in cart
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    const quantity = item.quantity;

    // 3️⃣ Verify product exists and populate vendor
    const product = await Product.findById(productId).populate("vendor");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 4️⃣ Stripe Payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["card"],
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment failed", status: paymentIntent.status });
    }

    // 5️⃣ Save Customer Purchase
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

    // 6️⃣ Fetch customer details for snapshot
    const customer = await User.findById(customerId);

    // 7️⃣ Save Vendor Purchase with snapshot
    const vendorPurchase = new VendorPurchase({
      vendorId: product.vendor._id,
      productId,
      customerId,
      customerPurchaseId: customerPurchase._id,
      quantity,
      amount,
      address,
      phone,
      status: "Pending",
      customerName: customer?.name || "Unknown",
      customerEmail: customer?.email || "Not provided",
      customerPhone: phone,
      customerAddress: address,
    });
    await vendorPurchase.save();

    // 8️⃣ Remove item from cart
    await Cart.updateOne({ userId: customerId }, { $pull: { items: { productId } } });

    res.status(200).json({ message: "Product purchased successfully", customerPurchase, vendorPurchase });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET PURCHASES (Customer)
export const getCustomerPurchases = async (req, res) => {
  try {
    const customerId = req.user.id;

    const purchases = await CustomerPurchase.find({
      customerId,
      isDeleted: false, // 👈 add this line
    })
      .populate({
        path: "productId",
        select: "productName image price vendor",
        populate: { path: "vendor", select: "name shopName" },
      })
      .populate({
        path: "customerId",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ GET PURCHASES (Vendor)
export const getVendorPurchases = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const purchases = await VendorPurchase.find({ vendorId })
      .select(
        "productId customerName customerEmail customerPhone customerAddress quantity amount status createdAt"
      )
      .populate({ path: "productId", select: "productName image price" })
      .populate("vendorId", "name shopName")
      .sort({ createdAt: -1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// ✅ DELETE PURCHASE (Vendor soft delete)
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const vendorPurchase = await VendorPurchase.findById(id);
    if (!vendorPurchase) {
      return res.status(404).json({ message: "Vendor purchase not found" });
    }

    await VendorPurchase.findByIdAndDelete(id);

    res.status(200).json({ message: "✅ Vendor purchase permanently deleted" });
  } catch (error) {
    console.error("❌ Error deleting vendor purchase:", error.message);
    res.status(500).json({ message: error.message });
  }
};




// DELETE CUSTOMER PURCHASE (soft delete)
export const deleteCustomerPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const customerPurchase = await CustomerPurchase.findById(id);
    if (!customerPurchase) {
      return res.status(404).json({ message: "Customer purchase not found" });
    }

    await CustomerPurchase.findByIdAndDelete(id);

    res.status(200).json({ message: "✅ Customer purchase permanently deleted" });
  } catch (error) {
    console.error("❌ Error deleting customer purchase:", error.message);
    res.status(500).json({ message: error.message });
  }
};


