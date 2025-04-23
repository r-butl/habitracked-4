const express = require("express");
const router = express.Router();
const cors = require("cors");
const { registerUser, loginUser, logout, getProfile, getHabits, createHabit, getCuratedHabits } = require("../controllers/authController");
// const { test, registerUser, loginUser, logout, getProfile } = require("../controllers/authController"); // uncomment for testing

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Allow requests from React frontend
  })
);

// router.get("/", test);
router.get("/");
router.get("/profile", getProfile);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/logout', logout);
router.get('/habits', getHabits);
router.get('/curatedHabits', getCuratedHabits);
router.post('/habits/create', createHabit);

module.exports = router;
