import express from "express";
import userRoutes from "./routes/user.js";
import { errorMiddleware } from "./middlewares/globalErrorMiddleware.js";

const app = express();

app.use(express.json());

// user routes
app.use("/api/v1/user", userRoutes);

// global error middlware
app.use(errorMiddleware);

export default app;
