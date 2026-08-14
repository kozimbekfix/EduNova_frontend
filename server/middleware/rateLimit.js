const rateLimit = require("express-rate-limit");

// For login: stops brute-force (password-guessing) attacks.
// A single IP can only attempt to log in 8 times within 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// For AI chat: prevents unlimited requests from draining the API balance.
// A single IP can send 15 messages per minute.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { message: "You're sending messages too quickly. Please try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

// For application submissions: prevents form spam.
// A single IP can submit 5 applications within 10 minutes.
const applicationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { message: "Too many applications submitted. Please try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, chatLimiter, applicationLimiter };
