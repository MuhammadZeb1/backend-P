import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roleBasedAuth",
      required: true,
    },
    coustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roleBasedAuth",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,      
      default: 1,          
    },
    stripePaymentId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
