
import mongoose from "mongoose";

const vendorPurchaseSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "roleBasedAuth", required: true },
  customerPurchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerPurchase" },
  status: { type: String, default: "Pending" },
});

export default mongoose.model("VendorPurchase", vendorPurchaseSchema);
// kkk
