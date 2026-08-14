// Helper functions for sending Telegram messages
// The main logic lives in server/services/telegramBot.js

const telegramBot = require("../services/telegramBot");

// Send a message to the admin (to the primary chat_id)
async function sendTelegramNotification(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("ℹ️  Telegram bot not configured (TOKEN/CHAT_ID missing in .env). Skipped.");
    return { skipped: true };
  }

  return await telegramBot.sendMessageToUser(chatId, text);
}

// Send a message to a user via Telegram
// Finds the chat_id by phone number and sends the message
async function sendTelegramToUser(phone, text) {
  const result = await telegramBot.sendToUserByPhone(phone, text);

  if (result.skipped) {
    console.log(`ℹ️  User (${phone}) is not connected to the bot. Message will only appear on the site.`);
  }

  return result;
}

// Check whether a user is connected to the bot
function isUserConnectedToBot(phone) {
  return telegramBot.isUserConnected(phone);
}

// Get the bot's link
function getBotLink() {
  return telegramBot.getBotLink();
}

// Get the bot's username
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
