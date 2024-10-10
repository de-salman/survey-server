const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs/dist/bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Fetch user from the database
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare hashed password with the user's input
  console.log(user.password, "user.password");
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, "JWT_SECRET", {
    expiresIn: "1h", // Token expires in 1 hour
  });

  res.status(200).json({ message: "Login successful", token: token });
});

module.exports = router;
