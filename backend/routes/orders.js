const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");

// Get all orders
router.get("/", async (req, res) => {
  try {
    const { status, riderId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (riderId) query.rider = riderId;
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order by orderNumber (for customer tracking)
router.get("/track/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post("/", async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, notes } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const order = new Order({
      customerName, customerPhone, customerAddress, items, totalAmount, notes,
      statusHistory: [{ status: "pending", note: "Order created" }]
    });
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign rider
router.patch("/:id/assign-rider", async (req, res) => {
  try {
    const { riderId } = req.body;
    const rider = await User.findById(riderId);
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        rider: riderId,
        riderName: rider.name,
        status: "accepted",
        $push: { statusHistory: { status: "accepted", note: `Assigned to ${rider.name}` } }
      },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["pending", "accepted", "picked_up", "on_the_way", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, note: note || `Status updated to ${status}` } }
      },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed sample orders
router.get("/seed", async (req, res) => {
  try {
    await Order.deleteMany({});
    await Order.insertMany([
      {
        orderNumber: "GD-0001",
        customerName: "Alice Uwimana",
        customerPhone: "+257 71 234 567",
        customerAddress: "Bujumbura, Rohero, Av. de la Plage 12",
        items: [{ name: "Primus 500ml x6", qty: 1, price: 12000 }, { name: "Fanta Orange", qty: 2, price: 1500 }],
        totalAmount: 15000,
        status: "pending",
        statusHistory: [{ status: "pending", note: "Order created" }]
      },
      {
        orderNumber: "GD-0002",
        customerName: "Bob Niyonzima",
        customerPhone: "+257 79 876 543",
        customerAddress: "Bujumbura, Ngagara, Rue 10",
        items: [{ name: "Amstel 330ml x12", qty: 1, price: 24000 }],
        totalAmount: 24000,
        status: "on_the_way",
        riderName: "Jean Rider",
        statusHistory: [
          { status: "pending", note: "Order created" },
          { status: "accepted", note: "Assigned to Jean Rider" },
          { status: "picked_up", note: "Rider picked up order" },
          { status: "on_the_way", note: "On the way to customer" }
        ]
      },
    ]);
    res.json({ message: "Sample orders seeded!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
