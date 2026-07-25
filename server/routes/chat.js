// AI Chatbot - Groq API orqali ishlaydi
// OpenAI mos keluvchi API (baseURL: https://api.groq.com/openai/v1)

const express = require("express");
const OpenAI = require("openai");
const { nanoid } = require("nanoid");
const { chatLimiter } = require("../middleware/rateLimit");
const { readDb, writeDb } = require("../utils/db");
const { sendTelegramNotification } = require("../utils/telegram");

const router = express.Router();

// Modelni .env orqali osongina almashtirish mumkin (GROQ_MODEL).
// Sozlanmagan bo'lsa, sifat/tezlik balansi yaxshi bo'lgan gpt-oss-120b ishlatiladi.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Groq client - "lazy" yaratiladi (faqat kerak bo'lganda).
// MUHIM: agar buni modul yuklanganda darhol yaratsak va GROQ_API_KEY
// bo'sh bo'lsa, OpenAI kutubxonasi xato tashlab BUTUN SERVERNI
// ishga tushishdan to'xtatib qo'yadi. Shuning uchun klientni faqat
// so'rov kelganda, va faqat kalit mavjud bo'lsagina yaratamiz.
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
// 1) HAQIQIY MA'LUMOTLAR BILAN BOG'LASH
// Har bir so'rovda bazadan (courses, teachers, settings) eng so'nggi
// ma'lumotni o'qib, system promptni SHU asosda quramiz. Shunday qilib
// bot hech qachon eskirgan/noto'g'ri narx yoki kurs haqida gapirmaydi -
// admin panelda biror narsa o'zgartirilsa, bot DARHOL bilib oladi.
// ----------------------------------------------------------------------
function buildSystemPrompt() {
  const db = readDb();
  const s = db.settings || {};

  const coursesText = (db.courses || [])
    .map((c) => `- ${c.name}${c.price ? ` — ${c.price}` : ""}${c.duration ? ` (${c.duration})` : ""}`)
    .join("\n") || "Hozircha kurslar ro'yxati admin tomonidan to'ldirilmagan.";

  const teachersText = (db.teachers || [])
    .map((t) => `- ${t.name}${t.subject ? ` — ${t.subject}` : ""}`)
    .join("\n") || "";

  const blogText = (db.blogPosts || [])
    .slice(0, 8) // token tejash uchun eng so'nggi 8 ta maqola
    .map((b) => `- ${b.title}${b.excerpt ? `: ${b.excerpt}` : ""}`)
    .join("\n") || "";

  return `Sen "${s.siteName || "EduNova"}" o'quv markazining rasmiy AI yordamchisisan.

MARKAZ HAQIDA (BAZADAN OLINGAN, ENG SO'NGGI MA'LUMOT):
- Nomi: ${s.siteName || "EduNova"}
- Manzil: ${s.address || "ko'rsatilmagan"}
- Telefon: ${s.phone || "ko'rsatilmagan"}
- Telegram: ${s.telegram || "ko'rsatilmagan"}
- Email: ${s.email || "ko'rsatilmagan"}
- Ish vaqti: ${s.workHours || "ko'rsatilmagan"}

KURSLAR (bazadagi haqiqiy ro'yxat):
${coursesText}

${teachersText ? `O'QITUVCHILAR:\n${teachersText}\n` : ""}
${blogText ? `SO'NGGI BLOG MAQOLALARI (agar foydalanuvchi maqola/yangilik haqida so'rasa, shulardan foydalan):\n${blogText}\n` : ""}
QO'LLANMA:
1. O'zbek tilida, samimiy va professional gaplash
2. FAQAT yuqoridagi haqiqiy ma'lumotlardan (kurslar, o'qituvchilar, blog) foydalan — narx, kurs yoki maqola haqida hech narsa o'zingdan o'ylab topma
3. Agar kerakli ma'lumot yuqorida yo'q bo'lsa, to'g'ridan-to'g'ri ayt: "Bu haqda aniq ma'lumotim yo'q, ${s.phone || "administratorimiz"}ga murojaat qiling"
4. Javoblar qisqa va tushunarli bo'lsin (3-5 jumla)
5. Agar suhbat davomida foydalanuvchi ism va telefon raqamini aytsa (ro'yxatdan o'tmoqchi bo'lsa), create_application vositasidan foydalanib ariza yarat
6. Ariza yaratishdan oldin ism va telefon raqamini albatta tasdiqlab ol`;
}

// ----------------------------------------------------------------------
// 3) BOTGA "HARAKAT QILISH" IMKONIYATI — Function/Tool calling.
// Model suhbat davomida foydalanuvchi ism+telefon aytsa, shu vositani
// chaqiradi va biz haqiqiy arizani bazaga yozamiz (xuddi saytdagi
// ro'yxatdan o'tish formasi orqali kelgandek).
// ----------------------------------------------------------------------
const tools = [
  {
    type: "function",
    function: {
      name: "create_application",
      description:
        "Foydalanuvchi ism va telefon raqamini aytib, kursga yozilmoqchi bo'lganda ariza yaratadi.",
      parameters: {
        type: "object",
        properties: {
          fullName: { type: "string", description: "Foydalanuvchining to'liq ismi" },
          phone: { type: "string", description: "Telefon raqami, masalan +998901234567" },
          courseName: { type: "string", description: "Qiziqqan kursi nomi (agar aytilgan bo'lsa)" },
        },
        required: ["fullName", "phone"],
      },
    },
  },
];

function executeCreateApplication(args, clientId) {
  const { fullName, phone, courseName } = args;
  if (!fullName || !phone) {
    return { success: false, message: "Ism va telefon raqam kerak." };
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
    return { success: true, updated: true, message: "Ariza yangilandi." };
  }

  const application = {
    id: nanoid(10),
    fullName,
    phone,
    courseName: courseName || "Chatbot orqali",
    direction: "",
    preferredTime: "",
    message: "AI chatbot orqali yaratilgan ariza",
    telegramUsername: "",
    clientId: clientId || "",
    status: "yangi",
    isRead: false,
    notificationMessage: "",
    room: "",
    createdAt: new Date().toISOString(),
  };
  db.applications.push(application);
  writeDb(db);

  // Admin darhol Telegramdan xabar oladi (xuddi oddiy forma kabi)
  sendTelegramNotification(
    `🤖 <b>AI chatbot orqali yangi ariza!</b>\n\n👤 Ism: ${fullName}\n📞 Tel: ${phone}\n📚 Kurs: ${application.courseName}`
  ).catch(() => {});

  return { success: true, updated: false, message: "Ariza muvaffaqiyatli yaratildi." };
}

// POST /api/chat - AI bilan suhbat
// chatLimiter: cheksiz so'rov yuborib API balansini tugatishning oldini oladi
router.post("/", chatLimiter, async (req, res) => {
  const { message, history, clientId } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Xabar matnini kiriting." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ message: "Xabar juda uzun (maksimal 2000 belgi)." });
  }

  const aiClient = getClient();
  if (!aiClient) {
    return res.status(503).json({
      message: "AI Chatbot hali sozlanmagan. Administrator GROQ_API_KEY ni .env fayliga qo'shishi kerak.",
    });
  }

  try {
    const conversationHistory = Array.isArray(history)
      ? history.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.text,
        }))
      : [];

    // Oxirgi 10 xabarni saqlaymiz (kontekst + token tejash uchun)
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

    // Agar model "create_application" vositasini chaqirsa - bajaramiz
    // va natijani modelga qaytarib, foydalanuvchiga tabiiy javob yozdiramiz.
    if (toolCalls && toolCalls.length > 0) {
      messages.push(choice.message);

      for (const call of toolCalls) {
        let result = { success: false, message: "Noma'lum vosita." };
        if (call.function?.name === "create_application") {
          try {
            const args = JSON.parse(call.function.arguments || "{}");
            result = executeCreateApplication(args, clientId);
          } catch {
            result = { success: false, message: "Ma'lumotlarni o'qishda xatolik." };
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
    console.error("AI Chat xatolik:", error.message);

    if (error.status === 401 || error.message?.includes("API")) {
      return res.status(500).json({ message: "AI sozlanmagan. Iltimos, keyinroq urinib ko'ring." });
    }

    if (error.status === 429) {
      return res.status(500).json({ message: "AI band. Iltimos, birozdan keyin urinib ko'ring." });
    }

    res.status(500).json({ message: "Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring." });
  }
});

module.exports = router;
