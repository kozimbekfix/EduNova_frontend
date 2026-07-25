// Oddiy fayl-asosidagi "database". Loyihani kattalashtirganda
// bu faylni MongoDB (mongoose) yoki PostgreSQL bilan almashtirish mumkin -
// routes/ ichidagi kodlar deyarli o'zgarmaydi, faqat shu funksiyalar
// haqiqiy DB so'rovlariga almashtiriladi.

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

const DEFAULT_DATA = {
  admins: [],
  courses: [],
  teachers: [],
  branches: [],
  blogPosts: [],
  applications: [], // ro'yxatdan o'tish / ariza so'rovlari
  reviews: [],
  settings: {
    siteName: "O'quv Markaz",
    phone: "",
    telegram: "",
    address: "",
    googleMapsUrl: "", // Google Maps'dagi joylashuv havolasi (Kontakt sahifasida ko'rsatiladi)
  },
};

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Server ishga tushganda default admin foydalanuvchi yo'q bo'lsa yaratadi
function ensureDefaultAdmin() {
  const db = readDb();
  if (db.admins.length === 0) {
    const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
    const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
    const hashed = bcrypt.hashSync(password, 10);
    db.admins.push({
      id: "admin_1",
      username,
      password: hashed,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    console.log(`✅ Default admin yaratildi -> login: ${username} | parol: ${password}`);

    if (username === "admin" && password === "admin123") {
      console.log("\n🚨🚨🚨 XAVFSIZLIK OGOHLANTIRISHI 🚨🚨🚨");
      console.log("Siz hali standart login/parol (admin / admin123) bilan ishlayapsiz!");
      console.log("Bu eng birinchi urinib ko'riladigan kombinatsiya — hoziroq .env faylida");
      console.log("DEFAULT_ADMIN_USERNAME va DEFAULT_ADMIN_PASSWORD ni almashtiring,");
      console.log("so'ng data/db.json faylidagi \"admins\" ro'yxatini tozalab, serverni qayta ishga tushiring.");
      console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n");
    } else {
      console.log("⚠️  Production'da bu parolni albatta xavfsiz saqlang!");
    }
  }
}

module.exports = { readDb, writeDb, ensureDefaultAdmin, DB_PATH };
