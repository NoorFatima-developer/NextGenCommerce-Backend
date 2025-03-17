import jwt from 'jsonwebtoken';
import { myCache } from '../app.js';
import Product from '../models/product.js';

export const sendCookie = (user, res, statusCode=200, message) => {

    const token = jwt.sign(
        {_id:user._id}, 
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    )

    res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,

    }).json({
        success: true,
        message,
    })
}

export const invalidateCache = async(product, order,admin) => {
    if(product) {
        const productKeys = [
            "latest-products",
            "categories",
            "all-products"
        ];
        // `product-${id}`

        const products = await Product.find({}).select("_id");

        products.forEach(i => {
            // const id = i._id;
            // const id = `product-${id}`
            productKeys.push(`product-${id}`)
        })

        myCache.del(productKeys);
    }
    if(order) {

    }
    if(admin){

    }
}