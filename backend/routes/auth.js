const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/signup",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).matches(/[a-zA-Z]/).matches(/\d/),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      let existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        passwordHash,
      });
      await user.save();

      req.session.userId = user._id;
      res.status(201).json({ message: "Account created and signed in" });
    } catch (err) {
      next(err);
    }
  });

router.post("/signin",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid email or password" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "Invalid email or password" });

      req.session.userId = user._id;
      res.json({ message: "Signed in" });
    } catch (err) {
      next(err);
    }
  });

router.post("/signout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Signed out" });
  });
});

module.exports = router;