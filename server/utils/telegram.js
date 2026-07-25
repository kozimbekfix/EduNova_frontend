// Telegram xabarlarni yuborish uchun yordamchi funksiyalar
// Asosiy logika server/services/telegramBot.js da

const telegramBot = require("../services/telegramBot");

// Adminga xabar yuborish (asosiy chat_id ga)
async function sendTelegramNotification(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("ℹ️  Telegram bot sozlanmagan (.env faylida TOKEN/CHAT_ID yo'q). O'tkazib yuborildi.");
    return { skipped: true };
  }

  return await telegramBot.sendMessageToUser(chatId, text);
}

// Foydalanuvchiga telegram orqali xabar yuborish
// Telefon raqam bo'yicha chat_id ni topib, xabar yuboradi
async function sendTelegramToUser(phone, text) {
  const result = await telegramBot.sendToUserByPhone(phone, text);
  
  if (result.skipped) {
    console.log(`ℹ️  Foydalanuvchi (${phone}) botga ulanmagan. Xabar faqat saytda ko'rinadi.`);
  }
  
  return result;
}

// Foydalanuvchi botga ulanganligini tekshirish
function isUserConnectedToBot(phone) {
  return telegramBot.isUserConnected(phone);
}

// Bot linkini olish
function getBotLink() {
  return telegramBot.getBotLink();
}

// Bot usernameni olish
function getBotUsername() {
  return telegramBot.getBotUsername();
}

module.exports = {
  sendTelegramNotification,
  sendTelegramToUser,
  isUserConnectedToBot,
  getBotLink,
  getBotUsername,
};
