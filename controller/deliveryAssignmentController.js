import VendorDelivery from "../model/vendorDeliveryModel.js";
import DeliveryBoyDelivery from "../model/deliveryBoyDeliveryModel.js";
import roleBasedAuthModel from "../model/roleBasedAuthModel.js";
import mongoose from "mongoose";

/**
 * ✅ Assign Delivery
 * Vendor assigns a delivery to a delivery boy
 */
import VendorPurchase from "../model/vendorPurchaseModel.js";

export const assignDelivery = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    let { deliveryBoyId, purchaseId } = req.body;

    console.log("Starting assignDelivery...");

    if (!vendorId || !deliveryBoyId || !purchaseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Convert to ObjectId
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);
    const purchaseObjectId = new mongoose.Types.ObjectId(purchaseId);

    const allPurchases = await VendorPurchase.find({});
console.log("All VendorPurchases in DB:", allPurchases);
    console.log("ObjectIds ready:", {
      vendorObjectId,
      deliveryBoyObjectId,
      purchaseObjectId,
    });


    // ✅ Check vendor role
    const vendor = await roleBasedAuthModel.findById(vendorObjectId);
    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(403)
        .json({ message: "Only vendors can assign deliveries" });
    }

    console.log("Vendor verified:", vendor.name);

    // ✅ Check delivery boy role
    const deliveryBoy = await roleBasedAuthModel.findById(deliveryBoyObjectId);
    if (!deliveryBoy || deliveryBoy.role !== "delivery") {
      return res.status(400).json({ message: "Invalid delivery boy" });
    }

    console.log("Delivery boy verified:", deliveryBoy.name);

    // ✅ Find VendorPurchase and ensure it's not already assigned
    const vendorPurchase = await VendorPurchase.findOne({
      vendorId: vendorObjectId,
       _id: purchaseObjectId,
      isDeleted: false,
    });

    console.log("VendorPurchase found:", vendorPurchase);

    if (!vendorPurchase) {
      return res
        .status(400)
        .json({ message: "Purchase already assigned or not found" });
    }

    // ✅ Create delivery records
    const vendorDelivery = await VendorDelivery.create({
      vendorId:  vendorObjectId,
      deliveryBoyId: deliveryBoyObjectId,
      purchaseId: purchaseObjectId,
      status: "pending",
    });

    const deliveryBoyDelivery = await DeliveryBoyDelivery.create({
      deliveryBoyId: deliveryBoyObjectId,
      vendorId: vendorObjectId,
      purchaseId: purchaseObjectId,
      status: "pending",
    });

    // ✅ Mark purchase as deleted
    vendorPurchase.isDeleted = true;
    await vendorPurchase.save();

    res.status(201).json({
      message: "Delivery assigned successfully",
      vendorDelivery,
      deliveryBoyDelivery,
    });
  } catch (error) {
    console.error("Error assigning delivery:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Get Deliveries Assigned by Vendor
 */
export const getVendorDeliveries = async (req, res) => {
  try {
    const vendorId = req.user?.id;

    const deliveries = await VendorDelivery.find({ vendorId })
      .populate("deliveryBoyId", "name email") // delivery boy info
      .populate({
        path: "purchaseId", // VendorPurchase reference
        populate: {
          path: "customerPurchaseId", // nested populate → CustomerPurchase
          populate: {
            path: "productId", // optional: to get product image/title/price
            select: "title image price",
          },
          select: "address phone", // 👈 add this line to get address & phone
        },
      });

    res.status(200).json(deliveries, "hello");
  } catch (error) {
    console.error("Error fetching vendor deliveries:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Get Deliveries Assigned to a Delivery Boy
 */
export const getDeliveryBoyDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.user?.id;

    const deliveries = await DeliveryBoyDelivery.find({ deliveryBoyId })
      .populate("vendorId", "name email shopName") // ✅ Vendor info
      .populate({
        path: "purchaseId", // link to VendorPurchase
        populate: {
          path: "customerPurchaseId", // link to CustomerPurchase
          populate: {
            path: "productId", // link to Product
            select: "title image price", // ✅ product details
          },
          select: "address phone", // ✅ customer address & phone
        },
      });

    if (!deliveries || deliveries.length === 0) {
      return res.status(404).json({ message: "No assigned deliveries found" });
    }

    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Error fetching delivery boy deliveries:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Update Delivery Status (for both)
 */
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { purchaseId, status } = req.body;

    if (!purchaseId || !status) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const allowedStatus = ["pending", "in-progress", "completed"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update both collections
    await VendorDelivery.findOneAndUpdate({ purchaseId }, { status });
    await DeliveryBoyDelivery.findOneAndUpdate({ purchaseId }, { status });

    res.status(200).json({ message: `Status updated to '${status}'` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * ✅ Delete a Delivery Assignment
 * Vendor can delete a delivery assignment by purchaseId
 */
export const deleteDelivery = async (req, res) => {
  try {
    const { purchaseId } = req.params; // purchaseId as route param
    const vendorId = req.user?.id;

    if (!purchaseId) {
      return res.status(400).json({ message: "purchaseId is required" });
    }

    // Convert to ObjectId
    const purchaseObjectId = new mongoose.Types.ObjectId(purchaseId);
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    // Find delivery assigned by this vendor
    const vendorDelivery = await VendorDelivery.findOne({
      purchaseId: purchaseObjectId,
      vendorId: vendorObjectId,
    });

    if (!vendorDelivery) {
      return res.status(404).json({ message: "Delivery not found or not authorized" });
    }

    // Delete from both collections
    await VendorDelivery.deleteOne({ _id: vendorDelivery._id });
    await DeliveryBoyDelivery.deleteOne({ purchaseId: purchaseObjectId });

    res.status(200).json({ message: "Delivery assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: error.message });
  }
};

