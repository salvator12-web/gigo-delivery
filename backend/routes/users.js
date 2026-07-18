const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all riders
router.get("/riders", async (req, res) => {
  try {
    const riders = await User.find({ role: "rider" }).select("-password");
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle rider availability
router.patch("/:id/availability", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAvailable: req.body.isAvailable },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
