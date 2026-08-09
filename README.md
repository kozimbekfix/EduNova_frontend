# Prezo AI — Telegram AI Presentation & Referat Bot

Production-grade Telegram bot that generates professional PowerPoint presentations (`.pptx`) and academic essays/referats (`.docx`) from a single text prompt, powered by Google Gemini (with automatic OpenRouter fallback). Built for students and professionals who need polished documents in minutes instead of hours.

## ✨ Features

- **AI Presentation Generator** — turns any topic into a fully designed, 6-slide `.pptx` deck (Hero, Three Cards, Image + Text, Three Steps, Four Facts, Ending layouts), with theme-consistent typography, colors, and topic-relevant stock imagery.
- **AI Referat/Essay Generator** — produces a structured academic essay as a formatted `.docx` file, with automatic page-count estimation.
- **PDF Export** — every generated file can also be delivered as a PDF alongside the native format.
- **Bilingual UX** — all bot messages (progress updates, errors, buttons) are available in Uzbek and Russian; the user picks their language on first use.
- **Job Queue Architecture** — generation requests are processed asynchronously via BullMQ + Redis, so the bot stays responsive under load and users get live progress updates (`[2/4] Building slides...`).
- **Resilient AI Layer** — supports multiple Gemini API keys with automatic round-robin rotation to maximize free-tier throughput, plus automatic fallback to an OpenRouter model if all Gemini keys are rate-limited.
- **Monetization Built In** — daily free-generation limit per user, with paid top-ups via native **Telegram Stars** (no external payment gateway required).
- **Admin Tools** — admin-only commands to list users, block/unblock, grant unlimited access, and issue bonus credits.
- **Error Monitoring** — critical errors are automatically reported to a dedicated Telegram channel/chat, so issues are caught without watching server logs.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Bot framework | [Telegraf](https://telegraf.js.org/) (Telegram Bot API) |
| Server | Express |
| AI | Google Gemini API (`@google/generative-ai`), OpenRouter fallback |
| Queue / jobs | BullMQ + Redis (ioredis) |
| PPTX generation | pptxgenjs |
| DOCX generation | docx |
| PDF conversion | LibreOffice (headless, via Docker) |
| Image sourcing | Unsplash API (optional) |
| Validation | Zod |
| Runtime | Node.js ≥ 20.9 |

## 📂 Project Structure

```
src/
├── index.js                 # Bot entrypoint, commands, queue wiring
├── ai/
│   ├── pipeline.js          # Planner → Content writer AI pipeline
│   ├── geminiPool.js        # Multi-key rotation + OpenRouter fallback
│   └── schemas.js           # Zod schemas enforcing strict AI output shape
├── engine/
│   ├── pptx/
│   │   ├── index.js         # Slide deck assembly
│   │   ├── core/            # Layout coordinates, theme mapping
│   │   └── templates/       # Individual slide layout renderers
│   ├── docx/
│   │   └── referatEngine.js # Essay/referat document builder
│   └── pdfEngine.js         # .pptx/.docx → PDF conversion + cleanup
└── utils/
    ├── userStore.js         # User state, credits, daily usage tracking
    ├── messages.js          # All bot copy (uz/ru)
    ├── imageEngine.js       # Unsplash image fetching
    └── retry.js             # Retry/backoff helpers
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or higher
- A Redis instance (local, or free tier from [Upstash](https://upstash.com/))
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/) (free tier available)

### Installation

```bash
git clone <this-repo>
cd prezo-AI
npm install
cp .env.example .env
```

Fill in `.env` with your own values (see comments inside the file for guidance on every variable — `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, `REDIS_URL`, etc.).

### Run locally

```bash
npm run dev
```

### Run with Docker (recommended — includes LibreOffice for PDF export)

```bash
docker build -t prezo-ai .
docker run --env-file .env prezo-ai
```

## ⚙️ Configuration Highlights

- `GEMINI_API_KEYS` — comma-separated list of keys from **separate** Google Cloud projects, rotated automatically to multiply your free-tier quota.
- `DAILY_FREE_LIMIT` — number of free generations per user per day (default: 3).
- `ADMIN_IDS` — comma-separated Telegram user IDs with access to admin commands.
- `ERROR_LOG_CHAT_ID` — optional chat/channel where runtime errors are reported in real time.

Full details and comments for every variable are in `.env.example`.

## 💳 Monetization

The bot ships with a Telegram Stars payment flow already wired in — once a user hits their daily free limit, they're offered extra generations for Stars, with no third-party payment processor needed. Pricing and limits are fully configurable via environment variables.

## 📄 License

ISC — see `package.json`. Adjust as needed if distributing or reselling this codebase.
