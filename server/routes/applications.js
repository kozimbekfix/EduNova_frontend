const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("../utils/db");
const { requireAuth } = require("../middleware/auth");
const { applicationLimiter } = require("../middleware/rateLimit");
const { sendTelegramNotification, sendTelegramToUser, isUserConnectedToBot } = require("../utils/telegram");

const router = express.Router();

// PUBLIC: mavjud arizani clientId bo'yicha tekshirish
router.get("/my/:clientId", (req, res) => {
  const db = readDb();
  const app = db.applications.find((a) => a.clientId === req.params.clientId);
  if (!app) return res.json({ exists: false, application: null });
  res.json({ exists: true, application: app });
});

// PUBLIC: telefon raqam bo'yicha tekshirish
router.post("/check", (req, res) => {
  const { phone, clientId } = req.body;
  if (!phone && !clientId) {
    return res.status(400).json({ message: "Telefon yoki clientId kerak." });
  }
  const db = readDb();
  const app = db.applications.find((a) => a.phone === phone || a.clientId === clientId);
  if (!app) return res.json({ exists: false, application: null });
  res.json({ exists: true, application: app });
});

// PUBLIC: sayt ziyoratchisi ariza/ro'yxatdan o'tish formasini yuboradi
// applicationLimiter: forma spam qilinishining oldini oladi
router.post("/", applicationLimiter, async (req, res) => {
  const { fullName, phone, courseName, direction, preferredTime, message, clientId, telegramUsername } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ message: "Ism va telefon raqam majburiy." });
  }

  // Duplicate check - telefon yoki clientId orqali
  const db = readDb();
  const existing = db.applications.find((a) => a.phone === phone || (clientId && a.clientId === clientId));
  if (existing) {
    // Mavjud bo'lsa, yangilaymiz
    existing.fullName = fullName;
    existing.phone = phone;
    existing.courseName = courseName || "Ko'rsatilmagan";
    existing.direction = direction || "";
    existing.preferredTime = preferredTime || "";
    existing.message = message || "";
    existing.telegramUsername = (telegramUsername || "").replace(/^@/, "");
    existing.clientId = clientId || existing.clientId;
    existing.updatedAt = new Date().toISOString();
    writeDb(db);
    return res.json({ message: "Arizangiz yangilandi!", application: existing, updated: true });
  }

  const application = {
    id: nanoid(10),
    fullName,
    phone,
    courseName: courseName || "Ko'rsatilmagan",
    direction: direction || "",
    preferredTime: preferredTime || "",
    message: message || "",
    telegramUsername: (telegramUsername || "").replace(/^@/, ""),
    clientId: clientId || "",
    status: "yangi",
    isRead: false,        // o'qilganmi?
    notificationMessage: "",
    room: "",
    createdAt: new Date().toISOString(),
  };

  db.applications.push(application);
  writeDb(db);

  // Telegram orqali adminga darhol xabar boradi
  const adminMsg =
    `📩 <b>Yangi ariza!</b>\n\n` +
    `👤 Ism: ${fullName}\n` +
    `📞 Tel: ${phone}\n` +
    `📚 Kurs: ${application.courseName}\n` +
    (direction ? `🎯 Yo'nalish: ${direction}\n` : "") +
    (preferredTime ? `⏰ Qulay vaqt: ${preferredTime}\n` : "") +
    (application.telegramUsername ? `✈️ Telegram: @${application.telegramUsername}\n` : "") +
    (message ? `💬 Xabar: ${message}\n` : "");

  await sendTelegramNotification(adminMsg);

  // Foydalanuvchi botga ulanganligini tekshirish
  const isConnected = isUserConnectedToBot(phone);

  res.status(201).json({
    message: "Arizangiz qabul qilindi. Tez orada bog'lanamiz!",
    application,
    telegramConnected: isConnected,
  });
});

// PUBLIC: mijoz o'z arizasini yangilaydi
// XAVFSIZLIK: clientId orqali "egalik" tekshiriladi - aks holda har kim
// boshqa birovning ID'sini bilib, uning arizasini o'zgartira olardi (IDOR zaifligi).
router.put("/:id/client-update", (req, res) => {
  const { fullName, phone, courseName, direction, preferredTime, message, clientId, telegramUsername } = req.body;
  const db = readDb();
  const index = db.applications.findIndex((a) => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Ariza topilmadi." });

  const app = db.applications[index];

  // Egalik tekshiruvi: so'rovchi o'ziga tegishli clientId'ni yuborishi shart
  // va u arizadagi clientId bilan bir xil bo'lishi kerak.
  if (!clientId || !app.clientId || clientId !== app.clientId) {
    return res.status(403).json({ message: "Bu arizani o'zgartirishga ruxsatingiz yo'q." });
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
  res.json({ message: "Arizangiz yangilandi!", application: app });
});

// FAQAT ADMIN: barcha arizalarni ko'rish
router.get("/", requireAuth, (req, res) => {
  const db = readDb();
  const sorted = [...db.applications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sorted);
});

// FAQAT ADMIN: ariza statusini o'zgartirish (yangi -> o'qildi -> qabul qilindi / rad etildi)
router.put("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  const db = readDb();
  const index = db.applications.findIndex((a) => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Ariza topilmadi." });

  db.applications[index].status = status;
  if (status === "o'qildi") {
    db.applications[index].isRead = true;
  }
  writeDb(db);
  res.json(db.applications[index]);
});

// FAQAT ADMIN: ariza bo'yicha xabar yuborish (notification + room) + Telegram
router.put("/:id/notify", requireAuth, async (req, res) => {
  const { notificationMessage, room } = req.body;
  const db = readDb();
  const index = db.applications.findIndex((a) => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: "Ariza topilmadi." });

  const app = db.applications[index];
  if (notificationMessage !== undefined) app.notificationMessage = notificationMessage;
  if (room !== undefined) app.room = room;
  app.notifiedAt = new Date().toISOString();
  app.status = "qabul qilindi";
  app.isRead = true;
  
  writeDb(db);

  // Telegram orqali adminga xabar
  const adminNotifyMsg =
    `✅ <b>Ariza qabul qilindi!</b>\n\n` +
    `👤 Ism: ${app.fullName}\n` +
    `📞 Tel: ${app.phone}\n` +
    `📚 Kurs: ${app.courseName}\n` +
    (notificationMessage ? `📝 Xabar: ${notificationMessage}\n` : "") +
    (room ? `🚪 Xona: ${room}\n` : "");

  await sendTelegramNotification(adminNotifyMsg);
  
  // Foydalanuvchiga Telegram orqali xabar yuborish
  let userTelegramSent = false;
  if (app.phone) {
    const userMsg =
      `✅ <b>Arizangiz qabul qilindi!</b> 🎉\n\n` +
      `Assalomu alaykum, <b>${app.fullName}</b>!\n` +
      `Sizning arizangiz ko'rib chiqildi va qabul qilindi.\n\n` +
      (notificationMessage ? `📝 <b>Xabar:</b> ${notificationMessage}\n\n` : "") +
      (room ? `🚪 <b>Xona:</b> ${room}\n\n` : "") +
      `🌐 <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Saytga o'tish</a>\n\n` +
      `EduNova o'quv markazi 🎓`;

    const result = await sendTelegramToUser(app.phone, userMsg);
    userTelegramSent = !result.skipped;
  }

  res.json({
    message: "Xabar yuborildi!",
    application: app,
    telegramSent: userTelegramSent,
  });
});

// FAQAT ADMIN: arizani o'chirish
router.delete("/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.applications = db.applications.filter((a) => a.id !== req.params.id);
  writeDb(db);
  res.json({ message: "O'chirildi." });
});

module.exports = router;
