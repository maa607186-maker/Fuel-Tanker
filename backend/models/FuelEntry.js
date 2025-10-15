const mongoose = require("mongoose");

const fuelEntrySchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  date: { type: Date, required: true },
  odometer: { type: Number, required: true },
  station: { type: String, required: true },
  brand: { type: String, required: true },
  grade: { type: String, required: true },
  liters: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  notes: { type: String, maxlength: 500 }
}, {
  timestamps: true
});

module.exports = mongoose.model("FuelEntry", fuelEntrySchema);