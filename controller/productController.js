import express from 'express';
import Product from '../model/productModel.js';
export const createProduct = async (req, res) => {

    try {
            const {product,title,price,category} = req.body;
            const {image} = req.files;
            console.log(product,title,price,category,image);
             if (!product || !title || !price || !category || !image) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const newProduct = new Product({
                product,
                title,
                price,
                category,
                vendor:req.user.id,
                image:image.path
            })

            await newProduct.save();
            res.status(201).json({ message: "Product created successfully", product: newProduct})
            
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

