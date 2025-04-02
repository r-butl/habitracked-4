const express = require("express");
const router = express.Router();
const cors = require("cors");
const { test, registerUser, loginUser, logout, getProfile } = require("../controllers/authController");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Allow requests from React frontend
  })
);

router.get("/", test);
router.get("/profile", getProfile);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/logout', logout);

module.exports = router;