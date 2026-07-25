const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { readDb } = require("../utils/db");
const { loginLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// POST /api/auth/login
// Admin panelga kirish
// loginLimiter: parolni "urib ko'rish" (brute-force) hujumlarini to'xtatadi
router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Login va parolni kiriting." });
  }

  const db = readDb();
  const admin = db.admins.find((a) => a.username === username);

  if (!admin) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri." });
  }

  const isValid = bcrypt.compareSync(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri." });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Muvaffaqiyatli kirildi.",
    token,
    admin: { id: admin.id, username: admin.username },
  });
});

// GET /api/auth/me - joriy admin ma'lumotini tekshirish (frontend uchun qulay)
const { requireAuth } = require("../middleware/auth");
router.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
