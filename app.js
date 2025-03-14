import express from "express";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js"
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";

const app = express();

export const myCache = new NodeCache( stdTTL, 300 );

// Middlewares:
app.use(express.json());   ///req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// user routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes)

// make static uploads folder to access in browser via this path: http://localhost:5000/uploads/product.png
app.use("/uploads", express.static("uploads"));

// global error middlware
app.use(errorMiddleware);

export default app;
