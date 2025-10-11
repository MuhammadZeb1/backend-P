import Delivery from "../model/roleBasedAuthModel.js";
import deliveryBoyModel from "../model/deliveryBoyModel.js";

export const allDelivery = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ role: "delivery" });

    if (!deliveries || deliveries.length === 0) {
      return res.status(404).json({ message: "No delivery boy or users found" });
    }

    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: error.message|| "Internal Server Error" });
  }
};


export const addDelivery = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const { deliveryId } = req.body;

    const newApproval = new deliveryBoyModel({
      vendorId,
      deliveryId,
    });

    await newApproval.save();

    res.status(201).json(newApproval);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get all approved delivery boys for one vendor
// Get all approved delivery boys for the logged-in vendor
export const getApprovedDeliveries = async (req, res) => {
  try {
    const vendorId = req.user.id; // 🔒 Authenticated vendor ki ID
    

    const approvedDeliveries = await deliveryBoyModel
      .find({ vendorId }) // filter by only this vendorId
      .populate("deliveryId", "name email address cnicNumber");

    if (!approvedDeliveries || approvedDeliveries.length === 0) {
      return res.status(404).json({ message: "No approved deliveries found" });
    }

    res.status(200).json(approvedDeliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




