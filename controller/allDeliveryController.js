import Delivery from "../model/roleBasedAuthModel.js";
import deliveryBoyModel from "../model/deliveryBoyModel.js";

// ✅ Get all unapproved delivery users
export const allDelivery = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ role: "delivery" });

    if (!deliveries || deliveries.length === 0) {
      return res.status(404).json({ message: "No delivery users found" });
    }

    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Approve a delivery boy and remove him from allDelivery
export const addDelivery = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { deliveryId } = req.body;

    // ✅ Step 1: Create new approval record
    const newApproval = new deliveryBoyModel({
      vendorId,
      deliveryId,
    });

    await newApproval.save();

    // ✅ Step 2: Remove that delivery boy from roleBasedAuth list
    await Delivery.findByIdAndDelete(deliveryId);

    res.status(201).json({
      message: "Delivery boy approved successfully and removed from allDelivery list",
      newApproval,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all approved delivery boys for the logged-in vendor
export const getApprovedDeliveries = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const approvedDeliveries = await deliveryBoyModel
      .find({ vendorId })
      .populate("deliveryId", "name email address cnicNumber ImageUrl");

    if (!approvedDeliveries || approvedDeliveries.length === 0) {
      return res.status(404).json({ message: "No approved deliveries found" });
    }

    res.status(200).json(approvedDeliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
