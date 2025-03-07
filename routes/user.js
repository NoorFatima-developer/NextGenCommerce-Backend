import express from "express";
import { register, login, getUserDetails, adminDashboard } from "../controllers/user.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

// Signup Route...
router.post("/signup", register);

// Login Route...
router.post("/login", login);

router.get("/userdetails", isAuthenticated, getUserDetails);
router.get("/admin", isAuthenticated, isAuthorized("admin"), adminDashboard);


export default router;
