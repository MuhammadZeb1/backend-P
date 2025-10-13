import mongoose from "mongoose";
import roleBasedAuthModel from "./roleBasedAuthModel.js";

const deliveryBoyDeliverySchema = new mongoose.Schema({
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: roleBasedAuthModel.modelName, // ✅ reference to roleBasedAuthModel
    required: true,
  },
  vendorId: {
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

const DeliveryBoyDelivery = mongoose.model("DeliveryBoyDelivery", deliveryBoyDeliverySchema);
export default DeliveryBoyDelivery;
