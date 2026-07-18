const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "rider", "customer"], default: "customer" },
  phone: { type: String },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("DeliveryUser", userSchema);
