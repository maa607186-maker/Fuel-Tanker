const express = require("express");
const { body, param, validationResult } = require("express-validator");
const FuelEntry = require("../models/FuelEntry");
const Vehicle = require("../models/Vehicle");
const { ensureAuth } = require("../middleware/auth");

const router = express.Router();
router.use(ensureAuth);

// Helper to validate ownership
async function verifyVehicleOwner(vehicleId, userId) {
  const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId });
  return !!vehicle;
}

// List fuel entries with optional filters
router.get("/", async (req, res, next) => {
  try {
    const { vehicleId } = req.query;
    // Only return entries for vehicles of this user
    const filter = {};
    if (vehicleId) {
      if (!(await verifyVehicleOwner(vehicleId, req.session.userId)))
        return res.status(403).json({ message: "Forbidden" });
      filter.vehicle = vehicleId;
    } else {
      // Find all user's vehicle IDs and fetch entries
      const vehicles = await Vehicle.find({ user: req.session.userId }).select("_id");
      filter.vehicle = { $in: vehicles.map(v => v._id) };
    }
    const entries = await FuelEntry.find(filter).sort({ date: -1 }).lean();
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

// Add new fuel entry
router.post("/",
  body("vehicle").isMongoId(),
  body("date").isISO8601().toDate(),
  body("odometer").isInt({ min: 0 }),
  body("station").isString().notEmpty(),
  body("brand").isString().notEmpty(),
  body("grade").isString().notEmpty(),
  body("liters").isFloat({ gt: 0 }),
  body("totalAmount").isFloat({ gt: 0 }),
  body("notes").optional().isLength({ max: 500 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        vehicle, date, odometer, station,
        brand, grade, liters, totalAmount, notes
      } = req.body;

      if (!(await verifyVehicleOwner(vehicle, req.session.userId))) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (date > new Date()) {
        return res.status(400).json({ message: "Date cannot be in the future" });
      }

      // Validate odometer should be higher than last entry
      const lastEntry = await FuelEntry.findOne({ vehicle }).sort({ date: -1 });
      if (lastEntry && odometer <= lastEntry.odometer) {
        return res.status(400).json({ message: "Odometer must be greater than last entry" });
      }

      const entry = new FuelEntry({
        vehicle, date, odometer, station,
        brand, grade, liters, totalAmount, notes
      });

      await entry.save();

      // Recompute stats placeholder...

      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  });

// Edit fuel entry
router.put("/:id",
  param("id").isMongoId(),
  body("vehicle").isMongoId(),
  body("date").isISO8601().toDate(),
  body("odometer").isInt({ min: 0 }),
  body("station").isString().notEmpty(),
  body("brand").isString().notEmpty(),
  body("grade").isString().notEmpty(),
  body("liters").isFloat({ gt: 0 }),
  body("totalAmount").isFloat({ gt: 0 }),
  body("notes").optional().isLength({ max: 500 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const entry = await FuelEntry.findById(req.params.id).populate("vehicle");
      if (!entry) return res.status(404).json({ message: "Entry not found" });
      if (entry.vehicle.user.toString() !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

      const {
        vehicle, date, odometer, station,
        brand, grade, liters, totalAmount, notes
      } = req.body;

      if (!(await verifyVehicleOwner(vehicle, req.session.userId))) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (date > new Date()) {
        return res.status(400).json({ message: "Date cannot be in the future" });
      }

      // Validate odometer correctness to adjacent entries:
      // Find previous and next entries by date for the same vehicle (excluding current one)
      const prevEntry = await FuelEntry.findOne({ vehicle, date: { $lt: date }, _id: { $ne: entry._id } }).sort({ date: -1 });
      if (prevEntry && odometer <= prevEntry.odometer)
        return res.status(400).json({ message: "Odometer must be greater than previous entry" });

      const nextEntry = await FuelEntry.findOne({ vehicle, date: { $gt: date }, _id: { $ne: entry._id } }).sort({ date: 1 });
      if (nextEntry && odometer >= nextEntry.odometer)
        return res.status(400).json({ message: "Odometer must be less than next entry" });

      Object.assign(entry, {
        vehicle, date, odometer, station,
        brand, grade, liters, totalAmount, notes
      });

      await entry.save();

      // Recompute stats placeholder...

      res.json(entry);
    } catch (err) {
      next(err);
    }
  });

// Delete fuel entry
router.delete("/:id", param("id").isMongoId(), async (req, res, next) => {
  try {
    const entry = await FuelEntry.findById(req.params.id).populate("vehicle");
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    if (entry.vehicle.user.toString() !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

    await entry.remove();

    // Recompute stats placeholder...

    res.json({ message: "Entry deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;