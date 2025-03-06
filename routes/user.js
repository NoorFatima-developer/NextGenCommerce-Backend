import express from "express";
import { register, login } from "../controllers/user.js";

const router = express.Router();

// Signup Route...
router.post("/signup", register);

// Login Route...
router.post("/login", login);

export default router;
