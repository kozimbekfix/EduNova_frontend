// Part of the "Admin panel (edit data)" feature -
// for editing general information like site name, phone, and address.

const express = require("express");
const { readDb, writeDb } = require("../utils/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// PUBLIC: the frontend gets the site's general settings from here
router.get("/", (req, res) => {
  const db = readDb();
  // Add bot info from .env
  const settings = {
    ...db.settings,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "edunova_bot",
    botLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || "edunova_bot"}`,
  };
  res.json(settings);
});

// ADMIN ONLY: update settings
router.put("/", requireAuth, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

module.exports = router;
