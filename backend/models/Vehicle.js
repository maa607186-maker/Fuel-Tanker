const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  label: { type: String, required: true },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  fuelType: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("Vehicle", vehicleSchema);