import Delivery from "../model/roleBasedAuthModel.js";

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

