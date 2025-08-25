import express from 'express';
import Product from '../model/productModel.js';


export const createProduct = async (req, res) => {

    try {
            const {productName,title,price,category} = req.body;
            const image =  req.file.filename;
            console.log(productName,title,price,category,image);
             if (!productName || !title || !price || !category || !image) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const newProduct = new Product({
                productName,
                title,
                price,
                category,
                vendor:req.user.id,
                image,
            })

            await newProduct.save();
            res.status(201).json({ message: "Product created successfully", product: newProduct})
            
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const readProducts = async(req,res)=>{
    try {
          const products = await Product.find().populate("vendor","name email role");

          if (!products) {
            return res.status(404).json({ message: "No products found" });
          }
            res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const  readSingleProduct = async (req,res)=>{

    try {
        const {id}= req.params;
        const product = await Product.findById(id).populate("vendor","name email role");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
          }
            res.status(200).json({ product });
    } catch (error) {

        res.status(500).json({ message: "Server Error", error: error.message });
    }

}
    
export const updateProduct = async (req,res)=>{
    try {
        const {id}=req.params;
        const {productName,title,price,category} = req.body;
        const image = req.file.filename;

        const updatedData = {};
        if (productName) updatedData.productName = productName;
        if (title) updatedData.title = title;
        if (price) updatedData.price = price;
        if (category) updatedData.category = category;
        if (image) updatedData.image = image;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.vendor.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this product" });
        }

        const updateProduct = await Product.findByIdAndUpdate(id,{$set:updatedData},{new:true});
        res.status(200).json({message:"Product updated successfully",product:updateProduct})
        
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}


