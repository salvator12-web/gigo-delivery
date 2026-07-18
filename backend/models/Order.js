const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [{ name: String, qty: Number, price: Number }],
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "accepted", "picked_up", "on_the_way", "delivered", "cancelled"],
    default: "pending"
  },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryUser", default: null },
  riderName: { type: String, default: null },
  notes: { type: String },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

orderSchema.pre("save", async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("DeliveryOrder").countDocuments();
    this.orderNumber = `GD-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("DeliveryOrder", orderSchema);
