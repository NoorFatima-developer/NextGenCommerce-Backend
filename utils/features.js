import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { myCache } from "../app.js";
import Product from "../models/product.js";
import ErrorHandler from "../middlewares/error.js";
import { Order } from "../models/order.js";

// sendCookie...
export const sendCookie = (user, res, statusCode = 200, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? false : true,
    })
    .json({
      success: true,
      message,
    });
};

// invalidateCache...
export const invalidateCache = async (product, order, admin, userId, orderId, productId) => {
    if (product) {
        const productKeys = ["latest-products", "all-products"];
        
    if (productId === "string") {
        productKeys.push(`product-${productId}`);
        console.log("Product cache invalidated for a single product.");
    } else if (Array.isArray(productId)) { // Agar array hai toh loop chalay ga
        console.log("Detected Array:", productId);
        productId.forEach((i) => productKeys.push(`product-${i}`));
        console.log("Product cache invalidated for multiple products.");
    } else {
        console.warn("Warning: productId is missing or invalid!");
    }
    
        myCache.del(productKeys);
    }
  if (order) {
    const orderKeys = ["all-orders"];
    if (userId) 
        orderKeys.push(`my-orders-${userId}`);
    if (orderId) 
        orderKeys.push(`order-${orderId}`);

    myCache.del(orderKeys);
  }
  if (admin) {
  }
};

// Calculate Average Rating...

export const calculateAverageRating = (product) => {
  const totalReviews = product.reviews.length;

  if (totalReviews == 0) {
    product.averageRating = 0;
  } else {
    // I can also use loop but reduce is more efficent...
    // let totalRating = 0;
    // for (let i = 0; i < product.reviews.length; i++) {
    //     totalRating += product.reviews[i].rating;
    // }

    // reduce() ek loop ki tarah kaam karta hai jo reviews ke har element pe chalega.
    // acc initial value is 0...

    const totalRating = product.reviews.reduce(
      (acc, rev) => acc + rev.rating,
      0
    );
    product.averageRating = totalRating / totalReviews; //totalreviews means kitny users ny review dea...
  }
};

// ReduceStock..
export const reduceStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(
      new mongoose.Types.ObjectId(order.productId)
    );
    if (!product) throw new ErrorHandler("Product Not Found", 400);
    if (product.stock < order.quantity) {
      throw new ErrorHandler(`Not enough stock for ${product.name}`, 400);
    }
    product.stock -= order.quantity;
    await product.save();
  }
};

// Get Orders

export const getOrders = async (key, query, shouldPopulate = false) => {
  let data = [];

  if (myCache.has(key)) {
    data = JSON.parse(myCache.get(key));
  } else {
    let orderQuery = Order.find(query);
    // Populate tabhi hoga jab shouldPopulate TRUE ho
    if (shouldPopulate) {
      orderQuery = orderQuery.populate("user", "name");
    }

    data = await orderQuery;
    myCache.set(key, JSON.stringify(data));
  }

  return data;
};

// Get Single order..

export const singleOrder = async (id, key, update = false) => {
  let order;
  const objectId = new mongoose.Types.ObjectId(id);

  if (myCache.has(key) && !update) {
    order = JSON.parse(myCache.get(key));
  } else {
    order = await Order.findById(objectId).populate("user", "name");
    if (!order) {
      throw new ErrorHandler("Order Not Found", 404);
    }
    if (update) {
        myCache.set(key, JSON.stringify(order));
      }
  }
  return order;
};
