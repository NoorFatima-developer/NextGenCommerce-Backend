import express from "express";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.js";
import { adminOnly, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/new",isAuthenticated, newOrder);
router.get("/my", isAuthenticated, myOrders);
router.get("/all",isAuthenticated, adminOnly, allOrders);
router.route("/:id")
.get(getSingleOrder)
.put(isAuthenticated, adminOnly, processOrder)
.delete(isAuthenticated, adminOnly,deleteOrder);
    

export default router;
