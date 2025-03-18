import mongoose from "mongoose";
import ErrorHandler from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { getOrders, invalidateCache, reduceStock, singleOrder } from "../utils/features.js";

// Get myOrders...
export const myOrders = asyncRequestHandler(async (req, res, next) => {
  if (!req.user?._id) {
    return next(new ErrorHandler("Invalid UserId", 400));
  }
  console.log(req.user);
  
  const userId = new mongoose.Types.ObjectId(req.user._id); 
  console.log(userId);
   
  const key = `my-orders-${userId}`;

  const orders = await getOrders(key, { user:userId });


  return res.status(200).json({
    success: true,
    orders,
  });
});

// Get allOrders of Admin...
export const allOrders = asyncRequestHandler(async (req, res, next) => {
  const key = `all-orders`;
  const orders = await getOrders(key, {});

  return res.status(200).json({
    success: true,
    orders,
  });
});

// Get Single Order...

export const getSingleOrder = asyncRequestHandler(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  const order = await singleOrder(id, key);
 
  return res.status(200).json({
    success: true,
    order,
  });
});

// Create New Order...
export const newOrder = asyncRequestHandler(async (req, res, next) => {
  const {
    shippingInfo,
    status,
    orderItems,
    subtotal,
    shippingCharges,
    discount,
    tax,
    total,
  } = req.body

  if (
    !shippingInfo ||
    !shippingCharges ||
    !discount ||
    !status ||
    !orderItems ||
    !subtotal ||
    !tax ||
    !total
  )
    return next(new ErrorHandler("Please Enter All Fields", 400));

    const userObjectId = new mongoose.Types.ObjectId(req.user._id);

  const order = await Order.create({
    shippingInfo,
    shippingCharges,
    discount,
    status,
    orderItems,
    user: userObjectId,
    subtotal,
    tax,
    total,
  });

  await reduceStock(orderItems);

  await invalidateCache(true, true, true, userObjectId.toString(), order._id, order.orderItems.map(i => i.productId));

  return res.status(201).json({
    success: true,
    message: "Order Placed Successfully.",
  });
});

// Process Order:

export const processOrder = asyncRequestHandler(async (req, res, next) => {
  const {id} = req.params;
  const key = `order-${id}`;

  let order = await singleOrder(id, key, true);

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
  
    case "Shipped":
      order.status = "Delivered";
      break;
  
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({ product: false, order: true, admin: true, userId: order.user, orderId: order._id });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully.",
  });
});

// Delete Order

export const deleteOrder = asyncRequestHandler(async (req, res, next) => {
  const {id} = req.params;

  const order = await singleOrder(id, true);
  if(!order)
    return next(new ErrorHandler("Order Not Found", 404));

  await order.deleteOne();

  await invalidateCache({ product: false, order: true, admin: true, userId: order.user, orderId: order._id });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully.",
  });

});




