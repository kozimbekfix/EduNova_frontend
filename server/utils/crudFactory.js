// A universal generator for the standard CRUD (Create-Read-Update-Delete)
// operations, so we don't have to write the same logic separately for
// each collection (courses, teachers, branches, blog, reviews).
//
// Public GET requests - anyone can view (site visitors).
// POST/PUT/DELETE - only via requireAuth, i.e. admin panel only.

const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("./db");
const { requireAuth } = require("../middleware/auth");

function createCrudRouter(collectionName) {
  const router = express.Router();

  // Public: get the full list (e.g. the site's "Courses" section uses this)
  router.get("/", (req, res) => {
    const db = readDb();
    res.json(db[collectionName] || []);
  });

  // Public: get a single item
  router.get("/:id", (req, res) => {
    const db = readDb();
    const item = (db[collectionName] || []).find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Not found." });
    res.json(item);
  });

  // ADMIN ONLY: add a new item
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

  // ADMIN ONLY: edit an item
  router.put("/:id", requireAuth, (req, res) => {
    const db = readDb();
    const index = (db[collectionName] || []).findIndex((i) => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Not found." });

    db[collectionName][index] = {
      ...db[collectionName][index],
      ...req.body,
      id: req.params.id, // keep the id unchanged
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    res.json(db[collectionName][index]);
  });

  // ADMIN ONLY: delete an item
  router.delete("/:id", requireAuth, (req, res) => {
    const db = readDb();
    const exists = (db[collectionName] || []).some((i) => i.id === req.params.id);
    if (!exists) return res.status(404).json({ message: "Not found." });

    db[collectionName] = db[collectionName].filter((i) => i.id !== req.params.id);
    writeDb(db);
    res.json({ message: "Deleted." });
  });

  return router;
}

module.exports = { createCrudRouter };
