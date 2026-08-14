// Telegram Bot polling service
// When a user sends /start to the bot, their chat_id is stored linked
// to their phone number. When the admin sends a message, it goes
// directly to the user via that chat_id.

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

// Check whether the bot is running
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

// Remove the webhook and switch to polling mode
async function deleteWebhook() {
  const token = getBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
  } catch {}
}

// Save a user's chat_id keyed by their phone number
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

// Get a user's info by phone number
function getTelegramUserByPhone(phone) {
  const db = readDb();
  if (!db.telegramUsers) return null;
  // Normalize the phone number
  const normalized = phone.replace(/[\s\-()]/g, "");
  return db.telegramUsers.find((u) => {
    const uPhone = (u.phone || "").replace(/[\s\-()]/g, "");
    return uPhone === normalized;
  }) || null;
}

// Get all Telegram users
function getAllTelegramUsers() {
  const db = readDb();
  return db.telegramUsers || [];
}

// Send a message to a user (via chatId)
async function sendMessageToUser(chatId, text, options = {}) {
  const token = getBotToken();
  if (!token) return { skipped: true, reason: "No bot token" };

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
      console.error("Telegram sendMessage error:", data.description);
    }
    return data;
  } catch (err) {
    console.error("Telegram sendMessage error:", err.message);
    return { error: err.message };
  }
}

// Send a message to a user by phone number
async function sendToUserByPhone(phone, text, options = {}) {
  const user = getTelegramUserByPhone(phone);
  if (!user) {
    return { skipped: true, reason: "User has not connected to the bot" };
  }
  return await sendMessageToUser(user.chatId, text, options);
}

// Keyboard markup - to request the phone number
function requestPhoneKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{
          text: "📱 Send phone number",
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

// Handle the /start command
async function handleStartCommand(chatId, text, msg) {
  const firstName = msg.from?.first_name || "there";

  // Welcome message
  const welcomeMsg =
    `👋 <b>Hello, ${firstName}!</b>\n\n` +
    `Welcome to the official EduNova Learning Center bot! 🎓\n\n` +
    `📌 Through this bot you can:\n` +
    `✅ Check the status of your application\n` +
    `✅ Receive messages from the admin\n` +
    `✅ Get information about your room and schedule\n\n` +
    `📱 <b>Please share your phone number</b> (using the button below)\n` +
    `This way, all messages about your application will come through this bot!`;

  await sendMessageToUser(chatId, welcomeMsg, requestPhoneKeyboard());
}

// Handle receiving a phone number
async function handleContact(chatId, contact, msg) {
  const phone = contact.phone_number;
  const firstName = msg.from?.first_name || "there";

  // Normalize the phone number with a leading +
  const normalizedPhone = phone.startsWith("+") ? phone : "+" + phone;

  // Save it
  saveTelegramUser(normalizedPhone, chatId, firstName);

  // Confirmation message
  const successMsg =
    `✅ <b>Your phone number has been confirmed!</b>\n\n` +
    `📞 ${normalizedPhone}\n\n` +
    `🎉 All messages about your application will now come through this bot.\n\n` +
    `If you've registered on our website, an admin will contact you shortly.\n\n` +
    `@${getBotUsername()} - EduNova AI assistant 🤖`;

  await sendMessageToUser(chatId, successMsg, removeKeyboard());
  console.log(`✅ Telegram user connected: ${firstName} (${normalizedPhone})`);
}

// Handle other messages
async function handleOtherMessage(chatId, text, msg) {
  const firstName = msg.from?.first_name || "there";

  // Is the user already connected?
  const users = getAllTelegramUsers();
  const existing = users.find((u) => u.chatId === chatId);

  if (existing) {
    const replyMsg =
      `👋 <b>${firstName}</b>, you're already connected to the bot!\n\n` +
      `📞 Phone: ${existing.phone}\n\n` +
      `If you have a question about your application, please use the ChatBot on our website or reach us via ${process.env.CLIENT_URL || "our website"}.`;
    await sendMessageToUser(chatId, replyMsg);
  } else {
    // Not connected yet, ask for phone number
    const replyMsg =
      `❓ <b>${firstName}</b>, please share your phone number.\n\n` +
      `Tap the button below to send your phone number 👇`;
    await sendMessageToUser(chatId, replyMsg, requestPhoneKeyboard());
  }
}

// Get new messages
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

// Process incoming messages
async function processUpdate(update) {
  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  try {
    // /start command
    if (text.startsWith("/start")) {
      await handleStartCommand(chatId, text, msg);
      return;
    }

    // Phone number sent
    if (msg.contact && msg.contact.phone_number) {
      await handleContact(chatId, msg.contact, msg);
      return;
    }

    // Other messages
    await handleOtherMessage(chatId, text, msg);
  } catch (err) {
    console.error("Telegram process update error:", err.message);
  }
}

// Start the polling loop
async function startPolling() {
  const token = getBotToken();
  if (!token) {
    console.log("ℹ️  Telegram bot not configured (TELEGRAM_BOT_TOKEN missing in .env). Bot was not started.");
    return;
  }

  // Remove the webhook (needed for polling mode)
  await deleteWebhook();

  let offset = 0;
  console.log("🤖 Telegram bot polling started...");

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

  // Poll via recursive setTimeout (not setInterval!)
  // This prevents concurrent requests from piling up during long polling
  const scheduleNext = () => {
    pollingTimeout = setTimeout(() => {
      poll().finally(scheduleNext);
    }, POLL_INTERVAL);
  };

  // First poll
  poll().finally(scheduleNext);
}

// Stop polling
function stopPolling() {
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
    console.log("🤖 Telegram polling stopped.");
  }
}

// Check whether a user is connected to the bot
function isUserConnected(phone) {
  const user = getTelegramUserByPhone(phone);
  return !!user;
}

// Get the bot's link
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
