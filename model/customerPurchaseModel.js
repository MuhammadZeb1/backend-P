import mongoose from "mongoose";

const customerPurchaseSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roleBasedAuth",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  stripePaymentId: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CustomerPurchase", customerPurchaseSchema);
