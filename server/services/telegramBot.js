// Telegram Bot polling xizmati
// Foydalanuvchilar botga /start yozganda ularning chat_id sini
// telefon raqamiga bog'lab saqlaydi. Admin xabar yuborganda
// shu chat_id orqali foydalanuvchiga to'g'ridan-to'g'ri xabar boradi.

const fetch = require("node-fetch");
const { readDb, writeDb } = require("../utils/db");

let pollingTimeout = null;
const POLL_TIMEOUT = 30; // long polling seconds
const POLL_INTERVAL = 2000; // ms between polls when no timeout

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function getBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || "edunova_bot";
}

// Bot ishlayotganligini tekshirish
async function isBotRunning() {
  const token = getBotToken();
  if (!token) return false;
  try {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    const res = await fetch(url);
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// Webhookni o'chirib, polling rejimiga o'tish
async function deleteWebhook() {
  const token = getBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
  } catch {}
}

// Foydalanuvchining chat_id sini telefon raqami bo'yicha saqlash
function saveTelegramUser(phone, chatId, firstName) {
  const db = readDb();
  if (!db.telegramUsers) db.telegramUsers = [];
  
  const existing = db.telegramUsers.find((u) => u.phone === phone);
  if (existing) {
    existing.chatId = chatId;
    existing.firstName = firstName;
    existing.updatedAt = new Date().toISOString();
  } else {
    db.telegramUsers.push({
      phone,
      chatId,
      firstName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  writeDb(db);
  return true;
}

// Telefon raqam bo'yicha foydalanuvchi ma'lumotini olish
function getTelegramUserByPhone(phone) {
  const db = readDb();
  if (!db.telegramUsers) return null;
  // Telefon raqamni normalize qilish
  const normalized = phone.replace(/[\s\-()]/g, "");
  return db.telegramUsers.find((u) => {
    const uPhone = (u.phone || "").replace(/[\s\-()]/g, "");
    return uPhone === normalized;
  }) || null;
}

// Barcha telegram foydalanuvchilarni olish
function getAllTelegramUsers() {
  const db = readDb();
  return db.telegramUsers || [];
}

// Foydalanuvchiga xabar yuborish (chatId orqali)
async function sendMessageToUser(chatId, text, options = {}) {
  const token = getBotToken();
  if (!token) return { skipped: true, reason: "Bot token yo'q" };

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...options,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram sendMessage xatolik:", data.description);
    }
    return data;
  } catch (err) {
    console.error("Telegram sendMessage error:", err.message);
    return { error: err.message };
  }
}

// Telefon raqam bo'yicha foydalanuvchiga xabar yuborish
async function sendToUserByPhone(phone, text, options = {}) {
  const user = getTelegramUserByPhone(phone);
  if (!user) {
    return { skipped: true, reason: "Foydalanuvchi botga ulamagan" };
  }
  return await sendMessageToUser(user.chatId, text, options);
}

// Keyboard markup - telefon raqamni so'rash uchun
function requestPhoneKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{
          text: "📱 Telefon raqamni yuborish",
          request_contact: true,
        }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

function removeKeyboard() {
  return {
    reply_markup: { remove_keyboard: true },
  };
}

// /start komandasini boshqarish
async function handleStartCommand(chatId, text, msg) {
  const firstName = msg.from?.first_name || "Foydalanuvchi";

  // Botga xush kelibsiz xabari
  const welcomeMsg =
    `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
    `EduNova o'quv markazining rasmiy botiga xush kelibsiz! 🎓\n\n` +
    `📌 Bu bot orqali siz:\n` +
    `✅ Arizangiz holatini bilib olasiz\n` +
    `✅ Admin xabarlarini olasiz\n` +
    `✅ Xona va vaqt haqida ma'lumot olasiz\n\n` +
    `📱 <b>Iltimos, telefon raqamingizni yuboring</b> (quyidagi tugma orqali)\n` +
    `Shunda sizning arizangizga oid barcha xabarlar shu bot orqali keladi!`;

  await sendMessageToUser(chatId, welcomeMsg, requestPhoneKeyboard());
}

// Telefon raqamni qabul qilish
async function handleContact(chatId, contact, msg) {
  const phone = contact.phone_number;
  const firstName = msg.from?.first_name || "Foydalanuvchi";

  // Telefon raqamni + bilan normalize qilish
  const normalizedPhone = phone.startsWith("+") ? phone : "+" + phone;

  // Saqlash
  saveTelegramUser(normalizedPhone, chatId, firstName);

  // Muvaffaqiyatli ulanganligi haqida xabar
  const successMsg =
    `✅ <b>Telefon raqamingiz tasdiqlandi!</b>\n\n` +
    `📞 ${normalizedPhone}\n\n` +
    `🎉 Endi sizning arizangizga oid barcha xabarlar shu bot orqali keladi.\n\n` +
    `Agar siz saytimizda ro'yxatdan o'tgan bo'lsangiz, admin tez orada siz bilan bog'lanadi.\n\n` +
    `@${getBotUsername()} - EduNova AI yordamchisi 🤖`;

  await sendMessageToUser(chatId, successMsg, removeKeyboard());
  console.log(`✅ Telegram foydalanuvchi ulandi: ${firstName} (${normalizedPhone})`);
}

// Boshqa xabarlarni boshqarish
async function handleOtherMessage(chatId, text, msg) {
  const firstName = msg.from?.first_name || "Foydalanuvchi";

  // Foydalanuvchi allaqachon ulanganmi?
  const users = getAllTelegramUsers();
  const existing = users.find((u) => u.chatId === chatId);

  if (existing) {
    const replyMsg =
      `👋 <b>${firstName}</b>, siz allaqachon botga ulangansiz!\n\n` +
      `📞 Telefon: ${existing.phone}\n\n` +
      `Agar arizangiz bo'yicha savol bo'lsa, saytimizdagi ChatBot orqali yoki ${process.env.CLIENT_URL || "saytimiz"} orqali murojaat qiling.`;
    await sendMessageToUser(chatId, replyMsg);
  } else {
    // Hali ulanmagan bo'lsa, telefon raqamni so'rash
    const replyMsg =
      `❓ <b>${firstName}</b>, iltimos telefon raqamingizni yuboring.\n\n` +
      `Telefon raqamingizni yuborish uchun quyidagi tugmani bosing 👇`;
    await sendMessageToUser(chatId, replyMsg, requestPhoneKeyboard());
  }
}

// Yangi xabarlarni olish
async function getUpdates(offset) {
  const token = getBotToken();
  if (!token) return [];

  try {
    const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=${POLL_TIMEOUT}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (err) {
    console.error("Telegram getUpdates error:", err.message);
    return [];
  }
}

// Xabarlarni qayta ishlash
async function processUpdate(update) {
  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  try {
    // /start komandasi
    if (text.startsWith("/start")) {
      await handleStartCommand(chatId, text, msg);
      return;
    }

    // Telefon raqam yuborilgan
    if (msg.contact && msg.contact.phone_number) {
      await handleContact(chatId, msg.contact, msg);
      return;
    }

    // Boshqa xabarlar
    await handleOtherMessage(chatId, text, msg);
  } catch (err) {
    console.error("Telegram process update error:", err.message);
  }
}

// Polling siklini boshlash
async function startPolling() {
  const token = getBotToken();
  if (!token) {
    console.log("ℹ️  Telegram bot sozlanmagan (.env da TELEGRAM_BOT_TOKEN yo'q). Bot ishga tushirilmadi.");
    return;
  }

  // Webhook ni o'chirish (polling rejimi uchun)
  await deleteWebhook();

  let offset = 0;
  console.log("🤖 Telegram bot polling boshlandi...");

  const poll = async () => {
    try {
      const updates = await getUpdates(offset);
      for (const update of updates) {
        await processUpdate(update);
        offset = update.update_id + 1;
      }
    } catch (err) {
      console.error("Telegram polling error:", err.message);
    }
  };

  // Rekursiv setTimeout orqali polling (setInterval emas!)
  // Bu long polling vaqtida concurrent so'rovlar kelishini oldini oladi
  const scheduleNext = () => {
    pollingTimeout = setTimeout(() => {
      poll().finally(scheduleNext);
    }, POLL_INTERVAL);
  };

  // Birinchi poll
  poll().finally(scheduleNext);
}

// Pollingni to'xtatish
function stopPolling() {
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
    console.log("🤖 Telegram polling to'xtatildi.");
  }
}

// Foydalanuvchi botga ulanganligini tekshirish
function isUserConnected(phone) {
  const user = getTelegramUserByPhone(phone);
  return !!user;
}

// Foydalanuvchining bot username ni olish
function getBotLink() {
  const username = getBotUsername();
  return `https://t.me/${username}`;
}

module.exports = {
  startPolling,
  stopPolling,
  isBotRunning,
  sendToUserByPhone,
  sendMessageToUser,
  saveTelegramUser,
  getTelegramUserByPhone,
  getAllTelegramUsers,
  isUserConnected,
  getBotLink,
  getBotUsername,
};
