const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Get rider's assigned orders
router.get("/:riderId/orders", async (req, res) => {
  try {
    const orders = await Order.find({ rider: req.params.riderId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
