import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripePaymentId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
