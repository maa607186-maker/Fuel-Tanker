const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { ensureAuth } = require("../middleware/auth");

const router = express.Router();

router.use(ensureAuth);

// Get user profile
router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select("-passwordHash").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update user profile and settings
router.put("/",
  body("displayName").optional().isString(),
  body("preferredCurrency").optional().isLength({ min: 3, max: 3 }).isUppercase(),
  body("preferredDistanceUnit").optional().isIn(["km", "mi"]),
  body("preferredVolumeUnit").optional().isIn(["L", "gal"]),
  body("timeZone").optional().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const updates = {};
      ["displayName", "preferredCurrency", "preferredDistanceUnit", "preferredVolumeUnit", "timeZone"].forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(req.session.userId, updates, { new: true }).select("-passwordHash").lean();
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json(user);
    } catch (err) {
      next(err);
    }
  });

module.exports = router;