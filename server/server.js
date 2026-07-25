require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { ensureDefaultAdmin } = require("./utils/db");
const { createCrudRouter } = require("./utils/crudFactory");

const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const settingsRoutes = require("./routes/settings");
const chatRoutes = require("./routes/chat");
const telegramBot = require("./services/telegramBot");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
// Xavfsizlik headerlari (XSS, clickjacking va h.k.dan asosiy himoya)
app.use(helmet());

// MUHIM: CLIENT_URL har doim .env da to'ldirilishi kerak (production'da "*" xavfli).
// Bir nechta manzilni vergul bilan ajratib yozish mumkin, masalan:
// CLIENT_URL=http://localhost:5173,https://edunova.vercel.app
if (!process.env.CLIENT_URL) {
  console.warn("⚠️  OGOHLANTIRISH: CLIENT_URL .env faylida sozlanmagan. Faqat localhost uchun CORS ochilyapti.");
}
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman/cURL kabi origin'siz so'rovlarga ruxsat beramiz
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: ${origin} manziliga ruxsat berilmagan`));
      }
    },
  })
);
app.use(express.json());

// ---------- Route'lar ----------
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes); // ro'yxatdan o'tish / arizalar
app.use("/api/settings", settingsRoutes);
app.use("/api/chat", chatRoutes); // AI Chatbot (Google Gemini)

// START/BUSINESS/PREMIUM tariflardagi bo'limlar uchun universal CRUD:
app.use("/api/courses", createCrudRouter("courses")); // Kurslar bo'limi
app.use("/api/teachers", createCrudRouter("teachers")); // O'qituvchilar bo'limi
app.use("/api/branches", createCrudRouter("branches")); // Filiallar sahifasi (Premium)
app.use("/api/blog", createCrudRouter("blogPosts")); // Blog/Yangiliklar (Business+)
app.use("/api/reviews", createCrudRouter("reviews")); // O'quvchilar fikrlari (Business+)

// Health check - server ishlab turganini tekshirish uchun
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server ishlamoqda 🚀" });
});

// 404 - noma'lum endpoint
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint topilmadi." });
});

// ---------- Serverni ishga tushirish ----------
ensureDefaultAdmin();

app.listen(PORT, () => {
  console.log(`\n🚀 Server http://localhost:${PORT} manzilida ishga tushdi`);
  console.log(`📋 Admin login: http://localhost:${PORT}/api/auth/login\n`);

  // Telegram bot pollingni boshlash
  telegramBot.startPolling();
});
