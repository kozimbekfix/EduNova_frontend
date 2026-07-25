// Bir xil turdagi CRUD (Create-Read-Update-Delete) operatsiyalarini
// har bir bo'lim (kurslar, o'qituvchilar, filiallar, blog, reviews) uchun
// alohida-alohida yozmaslik uchun universal generator.
//
// Ommaga ochiq (public) GET so'rovlar - hamma ko'ra oladi (sayt ziyoratchilari).
// POST/PUT/DELETE - faqat requireAuth orqali, ya'ni faqat admin panel.

const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("./db");
const { requireAuth } = require("../middleware/auth");

function createCrudRouter(collectionName) {
  const router = express.Router();

  // Hammaga ochiq: ro'yxatni olish (masalan saytdagi "Kurslar" bo'limi shundan foydalanadi)
  router.get("/", (req, res) => {
    const db = readDb();
    res.json(db[collectionName] || []);
  });

  // Hammaga ochiq: bitta elementni olish
  router.get("/:id", (req, res) => {
    const db = readDb();
    const item = (db[collectionName] || []).find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Topilmadi." });
    res.json(item);
  });

  // FAQAT ADMIN: yangi element qo'shish
  router.post("/", requireAuth, (req, res) => {
    const db = readDb();
    const newItem = {
      id: nanoid(10),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    db[collectionName].push(newItem);
    writeDb(db);
    res.status(201).json(newItem);
  });

  // FAQAT ADMIN: elementni tahrirlash
  router.put("/:id", requireAuth, (req, res) => {
    const db = readDb();
    const index = (db[collectionName] || []).findIndex((i) => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Topilmadi." });

    db[collectionName][index] = {
      ...db[collectionName][index],
      ...req.body,
      id: req.params.id, // id o'zgarmasin
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    res.json(db[collectionName][index]);
  });

  // FAQAT ADMIN: elementni o'chirish
  router.delete("/:id", requireAuth, (req, res) => {
    const db = readDb();
    const exists = (db[collectionName] || []).some((i) => i.id === req.params.id);
    if (!exists) return res.status(404).json({ message: "Topilmadi." });

    db[collectionName] = db[collectionName].filter((i) => i.id !== req.params.id);
    writeDb(db);
    res.json({ message: "O'chirildi." });
  });

  return router;
}

module.exports = { createCrudRouter };
