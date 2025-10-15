const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Vehicle = require("../models/Vehicle");
const { ensureAuth } = require("../middleware/auth");

const router = express.Router();

router.use(ensureAuth);

// Get user vehicles
router.get("/", async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ user: req.session.userId }).lean();
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
});

// Add new vehicle
router.post("/",
  body("label").isString().notEmpty(),
  body("make").optional().isString(),
  body("model").optional().isString(),
  body("year").optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  body("fuelType").optional().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const data = req.body;
      const vehicle = new Vehicle({
        ...data,
        user: req.session.userId
      });
      await vehicle.save();
      res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  });

// Update vehicle
router.put("/:id",
  param("id").isMongoId(),
  body("label").isString().notEmpty(),
  body("make").optional().isString(),
  body("model").optional().isString(),
  body("year").optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  body("fuelType").optional().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.session.userId });
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

      Object.assign(vehicle, req.body);
      await vehicle.save();
      res.json(vehicle);
    } catch (err) {
      next(err);
    }
  });

// Delete vehicle
router.delete("/:id",
  param("id").isMongoId(),
  async (req, res, next) => {
    try {
      const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
      res.json({ message: "Vehicle deleted" });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;