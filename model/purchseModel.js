import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roleBasedAuth", // user who bought
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roleBasedAuth", // product owner
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    stripePaymentId: {
      type: String,
      required: true,
    },
    address: { type: String, required: true }, 
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
