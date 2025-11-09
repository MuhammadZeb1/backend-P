import VendorDelivery from "../model/vendorDeliveryModel.js";
import DeliveryBoyDelivery from "../model/deliveryBoyDeliveryModel.js";
import roleBasedAuthModel from "../model/roleBasedAuthModel.js";
import mongoose from "mongoose";
import VendorPurchase from "../model/vendorPurchaseModel.js";

/**
 * ✅ Assign Delivery
 * Vendor assigns a delivery to a delivery boy
 */
export const assignDelivery = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { deliveryBoyId, purchaseId } = req.body;

    if (!vendorId || !deliveryBoyId || !purchaseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Convert to ObjectIds
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);
    const purchaseObjectId = new mongoose.Types.ObjectId(purchaseId);

    // ✅ Check roles
    const vendor = await roleBasedAuthModel.findById(vendorObjectId);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can assign deliveries" });
    }

    const deliveryBoy = await roleBasedAuthModel.findById(deliveryBoyObjectId);
    if (!deliveryBoy || deliveryBoy.role !== "delivery") {
      return res.status(400).json({ message: "Invalid delivery boy" });
    }

    // ✅ Prevent duplicate assignment
    const alreadyAssigned = await VendorDelivery.findOne({ purchaseId: purchaseObjectId });
    if (alreadyAssigned) {
      return res.status(400).json({ message: "This purchase is already assigned to a delivery boy" });
    }

    // ✅ Find vendor purchase
    const vendorPurchase = await VendorPurchase.findOne({
      vendorId: vendorObjectId,
      _id: purchaseObjectId,
    });

    if (!vendorPurchase) {
      return res.status(400).json({ message: "Purchase not found or already assigned" });
    }

    // ✅ Create delivery records
    const vendorDelivery = await VendorDelivery.create({
      vendorId: vendorObjectId,
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

    // ✅ Mark purchase as assigned (optional flag)
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
  .populate("deliveryBoyId", "name email")
  .populate({
    path: "purchaseId",
    populate: [
      { path: "productId", select: "title image price name" },
      { path: "customerId", select: "name email address phone" }
    ]
  });


    if (!deliveries || deliveries.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(deliveries);
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
      .populate("vendorId", "name email shopName")
      .populate({
        path: "purchaseId",
        populate: {
          path: "productId",
          select: "title image price",
        },
        select: "productId address phone",
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

    // ✅ Update both collections
    await VendorDelivery.findOneAndUpdate({ purchaseId }, { status });
    await DeliveryBoyDelivery.findOneAndUpdate({ purchaseId }, { status });

    res.status(200).json({ message: `Status updated to '${status}'` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Delete a Delivery Assignment
 */
export const deleteDelivery = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const vendorId = req.user?.id;

    if (!purchaseId) {
      return res.status(400).json({ message: "purchaseId is required" });
    }

    const purchaseObjectId = new mongoose.Types.ObjectId(purchaseId);
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const vendorDelivery = await VendorDelivery.findOne({
      purchaseId: purchaseObjectId,
      vendorId: vendorObjectId,
    });

    if (!vendorDelivery) {
      return res.status(404).json({ message: "Delivery not found or not authorized" });
    }

    await VendorDelivery.deleteOne({ _id: vendorDelivery._id });
    await DeliveryBoyDelivery.deleteOne({ purchaseId: purchaseObjectId });

    res.status(200).json({ message: "Delivery assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: error.message });
  }
};
