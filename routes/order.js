import express from "express";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.js";
import { adminOnly, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/new", newOrder);
router.get("/my", isAuthenticated, myOrders);
router.get("/all", adminOnly, allOrders);
router.route("/:id")
.get(getSingleOrder)
.put(processOrder)
.delete(deleteOrder);
    

export default router;
