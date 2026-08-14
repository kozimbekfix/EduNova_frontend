// AI Chatbot - powered by the Groq API
// OpenAI-compatible API (baseURL: https://api.groq.com/openai/v1)

const express = require("express");
const OpenAI = require("openai");
const { nanoid } = require("nanoid");
const { chatLimiter } = require("../middleware/rateLimit");
const { readDb, writeDb } = require("../utils/db");
const { sendTelegramNotification } = require("../utils/telegram");

const router = express.Router();

// The model can easily be swapped via .env (GROQ_MODEL).
// If not set, gpt-oss-120b is used for a good quality/speed balance.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Groq client - created "lazily" (only when needed).
// IMPORTANT: if we created this immediately on module load and
// GROQ_API_KEY is empty, the OpenAI library would throw and stop
// THE ENTIRE SERVER from starting. So we only create the client
// when a request comes in, and only if the key exists.
let client = null;
function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!client) {
    client = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return client;
}

// ----------------------------------------------------------------------
// 1) GROUNDING IN REAL DATA
// On every request we read the latest data from the database (courses,
// teachers, settings) and build the system prompt from it. This way the
// bot never talks about outdated or wrong prices or courses - if
// anything changes in the admin panel, the bot picks it up IMMEDIATELY.
// ----------------------------------------------------------------------
function buildSystemPrompt() {
  const db = readDb();
  const s = db.settings || {};

  const coursesText = (db.courses || [])
    .map((c) => `- ${c.name}${c.price ? ` — ${c.price}` : ""}${c.duration ? ` (${c.duration})` : ""}`)
    .join("\n") || "The course list hasn't been filled in by the admin yet.";

  const teachersText = (db.teachers || [])
    .map((t) => `- ${t.name}${t.subject ? ` — ${t.subject}` : ""}`)
    .join("\n") || "";

  const blogText = (db.blogPosts || [])
    .slice(0, 8) // limit to the 8 most recent posts to save tokens
    .map((b) => `- ${b.title}${b.excerpt ? `: ${b.excerpt}` : ""}`)
    .join("\n") || "";

  return `You are the official AI assistant of the "${s.siteName || "EduNova"}" learning center.

ABOUT THE CENTER (LATEST DATA FROM THE DATABASE):
- Name: ${s.siteName || "EduNova"}
- Address: ${s.address || "not specified"}
- Phone: ${s.phone || "not specified"}
- Telegram: ${s.telegram || "not specified"}
- Email: ${s.email || "not specified"}
- Working hours: ${s.workHours || "not specified"}

COURSES (actual list from the database):
${coursesText}

${teachersText ? `TEACHERS:\n${teachersText}\n` : ""}
${blogText ? `LATEST BLOG POSTS (use these if the user asks about articles/news):\n${blogText}\n` : ""}
GUIDELINES:
1. Speak in English, warmly and professionally
2. ONLY use the real data above (courses, teachers, blog) — never make up a price, course, or article
3. If the requested information isn't available above, say so directly: "I don't have exact information on that, please contact ${s.phone || "our administrator"}"
4. Keep answers short and clear (3-5 sentences)
5. If the user shares their name and phone number during the conversation (wanting to sign up), use the create_application tool to create an application
6. Always confirm the name and phone number before creating an application`;
}

// ----------------------------------------------------------------------
// 3) GIVING THE BOT THE ABILITY TO "TAKE ACTION" — Function/Tool calling.
// When the user gives their name+phone during the conversation, the
// model calls this tool and we write a real application to the database
// (just as if it came through the site's sign-up form).
// ----------------------------------------------------------------------
const tools = [
  {
    type: "function",
    function: {
      name: "create_application",
      description:
        "Creates an application when the user gives their name and phone number and wants to sign up for a course.",
      parameters: {
        type: "object",
        properties: {
          fullName: { type: "string", description: "The user's full name" },
          phone: { type: "string", description: "Phone number, e.g. +998901234567" },
          courseName: { type: "string", description: "The course they're interested in (if mentioned)" },
        },
        required: ["fullName", "phone"],
      },
    },
  },
];

function executeCreateApplication(args, clientId) {
  const { fullName, phone, courseName } = args;
  if (!fullName || !phone) {
    return { success: false, message: "Name and phone number are required." };
  }

  const db = readDb();
  const existing = db.applications.find(
    (a) => a.phone === phone || (clientId && a.clientId === clientId)
  );

  if (existing) {
    existing.fullName = fullName;
    existing.phone = phone;
    if (courseName) existing.courseName = courseName;
    existing.clientId = clientId || existing.clientId;
    existing.updatedAt = new Date().toISOString();
    writeDb(db);
    return { success: true, updated: true, message: "Application updated." };
  }

  const application = {
    id: nanoid(10),
    fullName,
    phone,
    courseName: courseName || "Via chatbot",
    direction: "",
    preferredTime: "",
    message: "Application created via AI chatbot",
    telegramUsername: "",
    clientId: clientId || "",
    status: "new",
    isRead: false,
    notificationMessage: "",
    room: "",
    createdAt: new Date().toISOString(),
  };
  db.applications.push(application);
  writeDb(db);

  // The admin gets notified on Telegram immediately (same as a regular form)
  sendTelegramNotification(
    `🤖 <b>New application via AI chatbot!</b>\n\n👤 Name: ${fullName}\n📞 Phone: ${phone}\n📚 Course: ${application.courseName}`
  ).catch(() => {});

  return { success: true, updated: false, message: "Application created successfully." };
}

// POST /api/chat - conversation with the AI
// chatLimiter: prevents unlimited requests from draining the API balance
router.post("/", chatLimiter, async (req, res) => {
  const { message, history, clientId } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Please enter a message." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ message: "Message is too long (2000 characters max)." });
  }

  const aiClient = getClient();
  if (!aiClient) {
    return res.status(503).json({
      message: "The AI Chatbot is not configured yet. The administrator needs to add GROQ_API_KEY to the .env file.",
    });
  }

  try {
    const conversationHistory = Array.isArray(history)
      ? history.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.text,
        }))
      : [];

    // Keep the last 10 messages (for context and to save tokens)
    const recentHistory = conversationHistory.slice(-10);

    const messages = [
      { role: "system", content: buildSystemPrompt() },
      ...recentHistory,
      { role: "user", content: message },
    ];

    let completion = await aiClient.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.95,
    });

    let choice = completion.choices[0];
    const toolCalls = choice?.message?.tool_calls;

    // If the model calls the "create_application" tool - execute it
    // and pass the result back to the model so it writes a natural reply.
    if (toolCalls && toolCalls.length > 0) {
      messages.push(choice.message);

      for (const call of toolCalls) {
        let result = { success: false, message: "Unknown tool." };
        if (call.function?.name === "create_application") {
          try {
            const args = JSON.parse(call.function.arguments || "{}");
            result = executeCreateApplication(args, clientId);
          } catch {
            result = { success: false, message: "Error reading the data." };
          }
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }

      completion = await aiClient.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });
      choice = completion.choices[0];
    }

    const response = choice?.message?.content || "";
    res.json({ reply: response });
  } catch (error) {
    console.error("AI Chat error:", error.message);

    if (error.status === 401 || error.message?.includes("API")) {
      return res.status(500).json({ message: "The AI is not configured. Please try again later." });
    }

    if (error.status === 429) {
      return res.status(500).json({ message: "The AI is busy. Please try again shortly." });
    }

    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

module.exports = router;
