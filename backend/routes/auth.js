const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Simple login (no JWT for MVP - just return user data)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed sample users
router.get("/seed", async (req, res) => {
  try {
    await User.deleteMany({});
    await User.insertMany([
      { name: "Admin GIGO", email: "admin@gigo.com", password: "admin123", role: "admin", phone: "+257 00 000 000" },
      { name: "Jean Rider", email: "rider1@gigo.com", password: "rider123", role: "rider", phone: "+257 11 111 111", isAvailable: true },
      { name: "Pierre Rider", email: "rider2@gigo.com", password: "rider123", role: "rider", phone: "+257 22 222 222", isAvailable: true },
      { name: "Marie Customer", email: "customer@gigo.com", password: "cust123", role: "customer", phone: "+257 33 333 333" },
    ]);
    res.json({ message: "Sample users seeded!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
