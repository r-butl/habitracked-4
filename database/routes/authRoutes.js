const express = require("express");
const router = express.Router();
const cors = require("cors");
const { test, registerUser, loginUser } = require("../controllers/authController.js");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Allow requests from React frontend
  })
);

router.get("/", test);
router.post("/register", registerUser)
router.post("/login", loginUser)

module.exports = router;
