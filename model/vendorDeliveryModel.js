import mongoose from "mongoose";
import roleBasedAuthModel from "./roleBasedAuthModel.js";

const vendorDeliverySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: roleBasedAuthModel.modelName, // ✅ reference to roleBasedAuthModel
    required: true,
  },
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: roleBasedAuthModel.modelName, // ✅ reference to roleBasedAuthModel
    required: true,
  },
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorPurchase",
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
});

const VendorDelivery = mongoose.model("VendorDelivery", vendorDeliverySchema);
export default VendorDelivery;
