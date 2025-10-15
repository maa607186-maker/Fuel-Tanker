const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: null },
  preferredCurrency: { type: String, default: "USD", length: 3 },
  preferredDistanceUnit: { type: String, enum: ["km", "mi"], default: "km" },
  preferredVolumeUnit: { type: String, enum: ["L", "gal"], default: "L" },
  timeZone: { type: String, default: "UTC" },
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);