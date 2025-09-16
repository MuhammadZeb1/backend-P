import express from "express";
import Product from "../model/productModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinaryConfig.js";

export const createProduct = async (req, res) => {
  console.log("erererre 7");
  try {
    const { productName, title, price, category, count } = req.body;
    console.log("req.file ===>", req.file);
    console.log("req.body ===>", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });

    console.log(productName, title, price, category, count);
    if (!productName || !title || !price || !category || !count) {
      return res.status(400).json({ message: "All fields are required" });
    }
    fs.unlinkSync(filePath);
    console.log("erererre 26");

    const newProduct = new Product({
      productName,
      title,
      price,
      category,
      vendor: req.user.id,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      count,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
    console.log("erererre 75");
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const readProducts = async (req, res) => {
  try {
    const id = req.user.id;
    const products = await Product.findById(id).populate("vendor", "name email role");

    if (!products) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json({ meassage: "product fetch successfully", products });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const readSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate(
      "vendor",
      "name email role"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, title, price, category, count } = req.body;

    const updatedData = {};
    if (productName) updatedData.productName = productName;
    if (title) updatedData.title = title;
    if (price) updatedData.price = price;
    if (category) updatedData.category = category;
    if (count) updatedData.count = count;
    if (req.file) {
      const filePath = req.file.path;
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "products",
      });
      fs.unlinkSync(filePath);
      updatedData.image =  {
        url: result.secure_url,
        public_id: result.public_id,
      }
      
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this product" });
    }

    const updateProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );
    res.status(200).json({
      message: "Product updated successfully",
      product: updateProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // find product first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check ownership
    if (product.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this product" });
    }

    // delete after ownership check
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
