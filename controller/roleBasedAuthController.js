import express from "express";
import User from "../model/roleBasedAuthModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";

// ✅ Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password, role, address, cnicNumber, shopName, shopType } = req.body;
    console.log(req.body)

    // ✅ Check required fields
    if (!name || !email || !password || !address || !cnicNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already registered" });

    const cnicExists = await User.findOne({ cnicNumber });
    if (cnicExists) return res.status(400).json({ message: "CNIC already registered" });

    // ✅ Vendor validation
    if (role === "vendor" && (!shopName || !shopType)) {
      return res.status(400).json({ message: "shopName and shopType are required for vendors" });
    }

    // ✅ Check image exists
    if (!req.file) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    // ✅ Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "users" });

    // ✅ Remove local file
    fs.unlinkSync(req.file.path);

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      address,
      cnicNumber,
      shopName,
      shopType,
      ImageUrl: result.secure_url,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, role: user.role }
    });

  } catch (error) {
    
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// get only the prfile image 
export const getProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("ImageUrl");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
// ✅ Profile Controller
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
