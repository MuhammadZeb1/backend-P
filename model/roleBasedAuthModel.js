import mongoose from "mongoose";

const roleBasedAuthSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["vendor", "customer", "delivery"],
    default: "customer",
  },

  // ✅ Extra fields
  address: {
    type: String,
    required:true
  },

  cnicNumber: {
    type: String,
    unique: true,
    required:true
  },

  shopName: {
    type: String,
    required: function () {
      return this.role === "vendor";
    },
  },

  shopType: {
    type: String,
    enum: ["grocery", "electronics", "clothing", "pharmacy", "other"], 
    required: function () {
      return this.role === "vendor";
    },
  },
});

const roleBasedAuthModel = mongoose.model("roleBasedAuth", roleBasedAuthSchema);

export default roleBasedAuthModel;
