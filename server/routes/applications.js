const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("../utils/db");
const { requireAuth } = require("../middleware/auth");
const { applicationLimiter } = require("../middleware/rateLimit");
const { sendTelegramNotification, sendTelegramToUser, isUserConnectedToBot } = require("../utils/telegram");

const router = express.Router();

// PUBLIC: check for an existing application by clientId
router.get("/my/:clientId", (req, res) => {
  const db = readDb();
  const app = db.applications.find((a) => a.clientId === req.params.clientId);
  if (!app) return res.json({ exists: false, application: null });
  res.json({ exists: true, application: app });
});

// PUBLIC: check by phone number
router.post("/check", (req, res) => {
  const { phone, clientId } = req.body;
  if (!phone && !clientId) {
    return res.status(400).json({ message: "Phone or clientId is required." });
  }
  const db = readDb();
  const app = db.applications.find((a) => a.phone === phone || a.clientId === clientId);
  if (!app) return res.json({ exists: false, application: null });
  res.json({ exists: true, application: app });
});

// PUBLIC: a site visitor submits an application/sign-up form
// applicationLimiter: prevents form spam
router.post("/", applicationLimiter, async (req, res) => {
  const { fullName, phone, courseName, direction, preferredTime, message, clientId, telegramUsername } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ message: "Name and phone number are required." });
  }

  // Duplicate check - by phone or clientId
  const db = readDb();
  const existing = db.applications.find((a) => a.phone === phone || (clientId && a.clientId === clientId));
  if (existing) {
    // If it exists, update it
    existing.fullName = fullName;
    existing.phone = phone;
    existing.courseName = courseName || "Not specified";
    existing.direction = direction || "";
    existing.preferredTime = preferredTime || "";
    existing.message = message || "";
    existing.telegramUsername = (telegramUsername || "").replace(/^@/, "");
    existing.clientId = clientId || existing.clientId;
    existing.updatedAt = new Date().toISOString();
    writeDb(db);
    return res.json({ message: "Your application has been updated!", application: existing, updated: true });
  }

  const application = {
    id: nanoid(10),
    fullName,
    phone,
    courseName: courseName || "Not specified",
    direction: direction || "",
    preferredTime: preferredTime || "",
    message: message || "",
    telegramUsername: (telegramUsername || "").replace(/^@/, ""),
    clientId: clientId || "",
    status: "new",
    isRead: false,        // has it been read?
    notificationMessage: "",
    room: "",
    createdAt: new Date().toISOString(),
  };

  db.applications.push(application);
  writeDb(db);

  // Notify the admin immediately via Telegram
  const adminMsg =
    `📩 <b>New application!</b>\n\n` +
    `👤 Name: ${fullName}\n` +
    `📞 Phone: ${phone}\n` +
    `📚 Course: ${application.courseName}\n` +
    (direction ? `🎯 Direction: ${direction}\n` : "") +
    (preferredTime ? `⏰ Preferred time: ${preferredTime}\n` : "") +
    (application.telegramUsername ? `✈️ Telegram: @${application.telegramUsername}\n` : "") +
    (message ? `💬 Message: ${message}\n` : "");

  await sendTelegramNotification(adminMsg);

  // Check whether the user is connected to the bot
  const isConnected = isUserConnectedToBot(phone);

  res.status(201).json({
    message: "Your application has been received. We'll contact you soon!",
    application,
    telegramConnected: isConnected,
  });
});

// PUBLIC: a client updates their own application
// SECURITY: "ownership" is verified via clientId - otherwise anyone who
// learns someone else's ID could modify their application (IDOR vulnerability).
router.put("/:id/client-update", (req, res) => {
  const { fullName, phone, courseName, direction, preferredTime, message, clientId, telegramUsername } = req.body;
  const db = readDb();
  const index = db.applications.findIndex((a) => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Application not found." });

  const app = db.applications[index];

  // Ownership check: the requester must send their own clientId
  // and it must match the clientId on the application.
  if (!clientId || !app.clientId || clientId !== app.clientId) {
    return res.status(403).json({ message: "You don't have permission to modify this application." });
  }

  if (fullName) app.fullName = fullName;
  if (phone) app.phone = phone;
  if (courseName) app.courseName = courseName;
  if (direction !== undefined) app.direction = direction;
  if (preferredTime !== undefined) app.preferredTime = preferredTime;
  if (message !== undefined) app.message = message;
  if (telegramUsername !== undefined) app.telegramUsername = telegramUsername.replace(/^@/, "");
  app.updatedAt = new Date().toISOString();

  writeDb(db);
  res.json({ message: "Your application has been updated!", application: app });
});

// ADMIN ONLY: view all applications
router.get("/", requireAuth, (req, res) => {
  const db = readDb();
  const sorted = [...db.applications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sorted);
});

// ADMIN ONLY: change an application's status (new -> read -> accepted / rejected)
router.put("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  const db = readDb();
  const index = db.applications.findIndex((a) => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Application not found." });

  db.applications[index].status = status;
  if (status === "read") {
    db.applications[index].isRead = true;
  }
  writeDb(db);
  res.json(db.applications[index]);
});

// ADMIN ONLY: send a message about an application (notification + room) + Telegram
router.put("/:id/notify", requireAuth, async (req, res) => {
  const { notificationMessage, room } = req.body;
  const db = readDb();
  const index = db.applications.findIndex((a) => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Application not found." });

  const app = db.applications[index];
  if (notificationMessage !== undefined) app.notificationMessage = notificationMessage;
  if (room !== undefined) app.room = room;
  app.notifiedAt = new Date().toISOString();
  app.status = "accepted";
  app.isRead = true;

  writeDb(db);

  // Notify the admin via Telegram
  const adminNotifyMsg =
    `✅ <b>Application accepted!</b>\n\n` +
    `👤 Name: ${app.fullName}\n` +
    `📞 Phone: ${app.phone}\n` +
    `📚 Course: ${app.courseName}\n` +
    (notificationMessage ? `📝 Message: ${notificationMessage}\n` : "") +
    (room ? `🚪 Room: ${room}\n` : "");

  await sendTelegramNotification(adminNotifyMsg);

  // Send the user a message via Telegram
  let userTelegramSent = false;
  if (app.phone) {
    const userMsg =
      `✅ <b>Your application has been accepted!</b> 🎉\n\n` +
      `Hello, <b>${app.fullName}</b>!\n` +
      `Your application has been reviewed and accepted.\n\n` +
      (notificationMessage ? `📝 <b>Message:</b> ${notificationMessage}\n\n` : "") +
      (room ? `🚪 <b>Room:</b> ${room}\n\n` : "") +
      `🌐 <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Go to the website</a>\n\n` +
      `EduNova Learning Center 🎓`;

    const result = await sendTelegramToUser(app.phone, userMsg);
    userTelegramSent = !result.skipped;
  }

  res.json({
    message: "Message sent!",
    application: app,
    telegramSent: userTelegramSent,
  });
});

// ADMIN ONLY: delete an application
router.delete("/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.applications = db.applications.filter((a) => a.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Deleted." });
});

module.exports = router;
