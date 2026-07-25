const rateLimit = require("express-rate-limit");

// Login uchun: brute-force (parolni taxmin qilishga urinish) hujumlarini to'xtatadi.
// Bitta IP 15 daqiqada faqat 8 marta login urinishi mumkin.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 8,
  message: { message: "Juda ko'p urinish. Iltimos, 15 daqiqadan so'ng qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI chat uchun: cheksiz so'rov yuborib, API balansini tugatishning oldini oladi.
// Bitta IP 1 daqiqada 15 ta xabar yubora oladi.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 daqiqa
  max: 15,
  message: { message: "Juda tez-tez xabar yubordingiz. Birozdan keyin qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ariza yuborish uchun: forma spam qilinishining oldini oladi.
// Bitta IP 10 daqiqada 5 marta ariza yubora oladi.
const applicationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 daqiqa
  max: 5,
  message: { message: "Juda ko'p ariza yuborildi. Birozdan keyin qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, chatLimiter, applicationLimiter };
