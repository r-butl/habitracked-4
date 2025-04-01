import express from "express";
const router = express.Router();
import cors from "cors";
import { test, registerUser, loginUser } from "../controllers/authController.js";

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Allow requests from React frontend
  })
);

router.get("/", test);
router.post("/register", registerUser)
router.post("/login", loginUser)

export default router;