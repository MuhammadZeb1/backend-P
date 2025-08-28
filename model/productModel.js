import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
   image: {
       url: { type: String, required: true },
       public_id: { type: String, required: true },
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roleBasedAuth", 
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;