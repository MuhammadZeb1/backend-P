import VendorDelivery from "../model/vendorDeliveryModel.js";
import DeliveryBoyDelivery from "../model/deliveryBoyDeliveryModel.js";
import roleBasedAuthModel from "../model/roleBasedAuthModel.js";

/**
 * ✅ Assign Delivery
 * Vendor assigns a delivery to a delivery boy
 */
export const assignDelivery = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    console.log("vendor id :", vendorId);
    const { deliveryBoyId, purchaseId } = req.body;

    if (!vendorId || !deliveryBoyId || !purchaseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check vendor role
    const vendor = await roleBasedAuthModel.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(403)
        .json({ message: "Only vendors can assign deliveries" });
    }

    // ✅ Check delivery boy role
    const deliveryBoy = await roleBasedAuthModel.findById(deliveryBoyId);
    if (!deliveryBoy || deliveryBoy.role !== "delivery") {
      return res.status(400).json({ message: "Invalid delivery boy" });
    }

    // ✅ Create vendor-side record
    const vendorDelivery = new VendorDelivery({
      vendorId,
      deliveryBoyId,
      purchaseId,
    });
    await vendorDelivery.save();

    // ✅ Create delivery boy-side record
    const deliveryBoyDelivery = new DeliveryBoyDelivery({
      deliveryBoyId,
      vendorId,
      purchaseId,
    });
    await deliveryBoyDelivery.save();

    res.status(201).json({
      message: "Delivery assigned successfully",
      vendorDelivery,
      deliveryBoyDelivery,
    });
  } catch (error) {
    console.error("Error assigning delivery:", error);
    res.status(500).json({ message: "Internal server error" });
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
