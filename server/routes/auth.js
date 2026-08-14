const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { readDb } = require("../utils/db");
const { loginLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// POST /api/auth/login
// Admin panel login
// loginLimiter: stops brute-force password-guessing attacks
router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please enter your username and password." });
  }

  const db = readDb();
  const admin = db.admins.find((a) => a.username === username);

  if (!admin) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }

  const isValid = bcrypt.compareSync(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Logged in successfully.",
    token,
    admin: { id: admin.id, username: admin.username },
  });
});

// GET /api/auth/me - check the current admin's info (convenient for the frontend)
const { requireAuth } = require("../middleware/auth");
router.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
