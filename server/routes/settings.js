// "Admin panel (ma'lumotlarni o'zgartirish)" funksiyasining bir qismi -
// sayt nomi, telefon, manzil kabi umumiy ma'lumotlarni tahrirlash uchun.

const express = require("express");
const { readDb, writeDb } = require("../utils/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// PUBLIC: frontend saytning umumiy sozlamalarini shundan oladi
router.get("/", (req, res) => {
  const db = readDb();
  // .env dan bot ma'lumotlarini qo'shamiz
  const settings = {
    ...db.settings,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "edunova_bot",
    botLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || "edunova_bot"}`,
  };
  res.json(settings);
});

// FAQAT ADMIN: sozlamalarni yangilash
router.put("/", requireAuth, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

module.exports = router;
