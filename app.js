import express from "express";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js"
import orderRoutes from "./routes/order.js"
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import morgan from "morgan";

const app = express();

const stdTTL = 5000;
export const myCache = new NodeCache({ stdTTL: stdTTL, checkperiod: 300 });

// Middlewares:
app.use(express.json());   ///req.body

app.use(morgan("dev"));
app.use(cookieParser()); 

// user routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes)
app.use("/api/v1/order", orderRoutes)

// make static uploads folder to access in browser via this path: http://localhost:5000/uploads/product.png
app.use("/uploads", express.static("uploads"));

// global error middlware
app.use(errorMiddleware);

export default app;
