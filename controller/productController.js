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

