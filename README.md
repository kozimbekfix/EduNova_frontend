# EduNova — Education Center Landing Page + Admin Panel

A complete, production-ready website template for language/course centers: a polished public-facing landing site plus a full admin panel to manage everything behind it — courses, teachers, branches, blog, reviews, and student applications. Built with React on the frontend and a Node.js/Express API on the backend, with an AI-powered chat widget built in.

**Live demo:** https://edu-nova-frontend-inky.vercel.app/

## ✨ What's Included

### Public Website
- Home, About, Courses, Course Details, Teachers, Blog, Blog Details, Gallery, Reviews, FAQ, Contact, Location, and Registration pages
- A student **Quiz** page (placement/level-test style flow)
- An **AI chat widget** (`ChatBot.jsx`) that answers visitor questions using an LLM (Groq API)
- Fully responsive, animated UI (Framer Motion), built with Tailwind CSS
- SEO-ready: page metadata, Open Graph tags, and social preview images already configured

### Admin Panel
- Secure login (JWT-based authentication)
- Manage courses, teachers, branches, blog posts, and reviews (full CRUD)
- View and manage student applications submitted from the registration form
- Site-wide settings management
- New applications are pushed instantly to a **Telegram bot**, so the center owner gets notified on their phone the moment someone signs up

### Backend API
- REST API built with Express, protected with Helmet, CORS whitelisting, and rate limiting
- JWT authentication with a generic CRUD factory used across resources (fast to extend with new content types)
- Telegram Bot integration for real-time application notifications
- AI chat endpoint (Groq API) for the frontend chatbot

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Zustand (state), Tailwind CSS 4, Framer Motion, React Hook Form, Axios |
| Backend | Node.js, Express, JWT, Helmet, express-rate-limit |
| AI Chat | Groq API |
| Notifications | Telegram Bot API |
| Deployment (demo) | Frontend on Vercel, Backend on Render |

## 📂 Project Structure

This template ships as two independent projects — a frontend and a backend — that work together over a REST API.

```
EduNova_frontend/
├── src/
│   ├── pages/          # All public + admin pages
│   │   └── admin/      # Admin panel screens
│   ├── components/     # Navbar, Footer, ChatBot, shared UI
│   ├── api/            # Axios calls to the backend, grouped by resource
│   ├── store/          # Zustand state
│   ├── layouts/, routes/, hooks/, utils/
│   └── App.jsx, main.jsx
└── vite.config.js

EduNova_backend_premium/
├── server.js            # App entrypoint, middleware, route mounting
├── routes/               # auth, applications, settings, chat
├── middleware/           # auth guard, rate limiting
├── services/telegramBot.js
├── utils/                # db.js, crudFactory.js, telegram.js
└── data/                 # local JSON data store
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Telegram bot token (optional, for application notifications) — get one from [@BotFather](https://t.me/BotFather)
- A free Groq API key (optional, for the AI chatbot) — from [console.groq.com](https://console.groq.com)

### 1. Backend setup

```bash
cd EduNova_backend_premium
npm install
cp .env.example .env
```

Fill in `.env`:
```
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=<generate a long random string>
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<choose a strong password>
TELEGRAM_BOT_TOKEN=<your bot token, optional>
TELEGRAM_CHAT_ID=<your chat id, optional>
TELEGRAM_BOT_USERNAME=<your bot username, optional>
GROQ_API_KEY=<your Groq key, optional>
```

Run it:
```bash
npm run dev
```
The API starts on `http://localhost:5000`. A default admin account is created automatically on first run using `DEFAULT_ADMIN_USERNAME` / `DEFAULT_ADMIN_PASSWORD` — **change this password immediately after first login.**

### 2. Frontend setup

```bash
cd EduNova_frontend
npm install
cp .env.example .env
```

For local development, leave `VITE_API_URL` empty — Vite's dev server proxies API calls to `http://localhost:5000` automatically. For production, set it to your deployed backend URL:
```
VITE_API_URL=https://your-backend-domain.com
```

Run it:
```bash
npm run dev
```
This starts both the frontend and backend together (via `concurrently`) if run from the frontend folder, or use `npm run dev:fe` / `npm run dev:be` to run them separately.

Visit `http://localhost:5173` for the site, and `/admin` for the admin panel login.

### 3. Deploying

- **Frontend** → any static host (Vercel, Netlify). Set `VITE_API_URL` to your live backend URL as an environment variable.
- **Backend** → any Node host (Render, Railway, etc). Set `CLIENT_URL` to your live frontend URL so CORS allows it (any `*.vercel.app` domain is allowed automatically).

## ⚙️ Customization Notes

- Branding, colors, and copy live in `src/pages` and `src/components` — no framework-level changes needed to reskin for a different center.
- New content types (e.g. a "Testimonials" resource) can be added quickly on the backend using the existing `crudFactory.js` pattern, and wired to the admin panel following the pattern of existing resources.
- The Telegram and Groq integrations are both optional — the site and admin panel work without them if those env variables are left blank.

## 🔒 Security Checklist Before Going Live

- [ ] Change `JWT_SECRET` to a long, random value
- [ ] Change `DEFAULT_ADMIN_PASSWORD` immediately after first login
- [ ] Set `CLIENT_URL` to your real frontend domain (avoid leaving CORS open)
- [ ] Never commit a filled-in `.env` file — only `.env.example` with placeholder values

## 📄 License

Provided as-is for use in your own or client projects. Adjust licensing terms as needed if reselling.
