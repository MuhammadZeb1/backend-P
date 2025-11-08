// import mongoose from "mongoose";

// const vendorPurchaseSchema = new mongoose.Schema({
//   vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "roleBasedAuth", required: true },
//   customerPurchaseId:
//    { type: mongoose.Schema.Types.ObjectId,
//      ref: "CustomerPurchase" },
//   status: { type: String, default: "Pending" },
//   isDeleted: { type: Boolean, default: false }, // ✅ Added
// });
import mongoose from "mongoose";

const vendorPurchaseSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roleBasedAuth",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roleBasedAuth",
    required: true,
  },
  customerPurchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerPurchase",
  },

  // 🧾 store customer details snapshot (so vendor still sees them)
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  customerAddress: { type: String },

  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("VendorPurchase", vendorPurchaseSchema);


