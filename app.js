import express from "express";
import userRoutes from "./routes/user.js";
import { errorMiddleware } from "./middlewares/globalErrorMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares:
app.use(express.json());   ///req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 



// user routes
app.use("/api/v1/user", userRoutes);

// global error middlware
app.use(errorMiddleware);

export default app;
