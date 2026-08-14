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

// Without JWT_SECRET, tokens would be unsigned/invalid — we never skip this
// check, since it would break the security of the whole admin panel.
if (!process.env.JWT_SECRET) {
  console.error(
    "\n🚨 ERROR: JWT_SECRET is not set in the .env file. Server stopped.\n" +
    "Please copy .env.example and set a long, random value for JWT_SECRET.\n"
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
// Security headers (basic protection against XSS, clickjacking, etc.)
app.use(helmet());

// IMPORTANT: CLIENT_URL must always be set in .env ("*" is unsafe in production).
// Multiple URLs can be listed separated by commas, e.g.:
// CLIENT_URL=http://localhost:5173,https://edunova.vercel.app
if (!process.env.CLIENT_URL) {
  console.warn("⚠️  WARNING: CLIENT_URL is not set in the .env file. CORS is only open for localhost.");
}
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman/cURL)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} is not allowed`));
      }
    },
  })
);
app.use(express.json());

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes); // sign-up / applications
app.use("/api/settings", settingsRoutes);
app.use("/api/chat", chatRoutes); // AI Chatbot (Google Gemini)

// Universal CRUD for the START/BUSINESS/PREMIUM plan sections:
app.use("/api/courses", createCrudRouter("courses")); // Courses section
app.use("/api/teachers", createCrudRouter("teachers")); // Teachers section
app.use("/api/branches", createCrudRouter("branches")); // Branches page (Premium)
app.use("/api/blog", createCrudRouter("blogPosts")); // Blog/News (Business+)
app.use("/api/reviews", createCrudRouter("reviews")); // Student reviews (Business+)

// Health check - to verify the server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running 🚀" });
});

// 404 - unknown endpoint
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

// ---------- Start the server ----------
ensureDefaultAdmin();

app.listen(PORT, () => {
  console.log(`\n🚀 Server started at http://localhost:${PORT}`);
  console.log(`📋 Admin login: http://localhost:${PORT}/api/auth/login\n`);

  // Start Telegram bot polling
  telegramBot.startPolling();
});
