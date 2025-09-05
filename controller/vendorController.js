import Vendors from '../model/roleBasedAuthModel.js'
import Product from "../model/productModel.js"

export const vendorDeshborad = async(req,res)=>{
    try {
        const vendors = await Vendors.find({role:"vendor"})        
    if (vendors.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No vendors found" });
    }
            res.status(200).json({data:vendors})
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}
export const singleVendorProducts = async (req, res) => {
  try {
    const { id } = req.params; // vendor id

    // پہلے vendor نکالیں
    const vendor = await Vendors.findById(id)
    .select("name shopName shopType role email address");

    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(404)
        .json({ status: false, message: "Vendor not found" });
    }

    // پھر اس vendor کے products نکالیں
    const products = await Product.find({ vendor: id })
    // .populate("vendors","name shopName shopType");

    if (!products.length) {
      return res
        .status(404)
        .json({ status: false, message: "No products found for this vendor" });
    }

    res.status(200).json({
      status: true,
      vendor,
      products,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



