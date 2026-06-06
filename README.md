# ExamMind — Student Wellness Companion

A calm, privacy-first AI micro-app for students preparing for **JEE, NEET, CUET, CAT, GATE, UPSC, and Board Exams**.  
ExamMind helps you track mood, reflect on emotions, spot stress patterns, and build healthy study habits — without ever diagnosing or prescribing.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Daily Check-In** | Log mood, energy, stress, sleep, study hours, emotion, and a journal entry |
| **Burnout Risk Score** | Deterministic rule-based score (0–100) — AI has zero influence |
| **AI Reflection** | Gemini-powered empathetic summary, encouragement, focus tips, and self-care suggestions |
| **Stress Trigger Detection** | Pattern-based analysis of journal text and metrics |
| **Mood Timeline** | SVG line charts for mood, energy, stress, sleep, study hours (7-day / 30-day) |
| **Mood Heatmap** | GitHub-style calendar heatmap showing 14 weeks of mood data |
| **Journal** | Search, filter, and read all past entries with AI reflection summaries |
| **Export** | Download journal as CSV or plain text |
| **Achievements** | 10 badges for consistency, balance, and milestones with streak tracking |
| **Dark Mode** | Persisted theme preference |
| **Offline-first** | All data stored in localStorage — no sign-up, no database |

---

## 🏗️ Architecture

```
Frontend/
├── api/
│   └── wellness-companion.js    # Vercel serverless function (Gemini AI)
│
├── src/
│   ├── constants/               # Shared enums, keys, definitions
│   ├── utils/
│   │   ├── burnoutCalculator.js # Deterministic burnout scoring (no AI)
│   │   ├── triggerDetector.js   # Pattern-based stress trigger analysis
│   │   ├── achievements.js      # Achievement evaluation logic
│   │   └── exportUtils.js       # CSV / text export
│   ├── hooks/
│   │   ├── useLocalStorage.js   # Persistent state hook
│   │   └── useStreak.js         # Streak calculation hook
│   ├── context/
│   │   ├── AppContext.jsx        # Global app state + AI orchestration
│   │   └── ThemeContext.jsx      # Dark/light mode
│   ├── services/
│   │   └── aiService.js         # API client for serverless function
│   └── components/
│       ├── layout/              # Header, NavBar
│       ├── common/              # ErrorBoundary, Spinner, Skeleton, EmptyState
│       ├── CheckIn/             # Daily check-in form
│       ├── Dashboard/           # Today's snapshot, burnout, streak, reflection
│       ├── Timeline/            # SVG charts and mood heatmap
│       ├── Journal/             # Entry list with search and export
│       └── Achievements/        # Badges and progress
│
├── tests/                       # Vitest unit tests
└── scripts/
    └── api-server.mjs           # Local dev server (mirrors Vercel runtime)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)

### Installation

```bash
git clone <repo-url>
cd Frontend
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and add your Gemini key:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
GEMINI_API_KEY=AIzaSy...
```

> **Where to get the key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey), click **Create API key**, and paste it above.

### Development

```bash
npm run dev
```

This starts:
- **Vite** dev server on `http://localhost:3000`
- **Local API server** on `http://localhost:3001` (mirrors Vercel serverless runtime)

### Build & Deploy

```bash
npm run build
npm run preview      # preview production build locally
```

For Vercel deployment, add `GEMINI_API_KEY` to your project's **Environment Variables** in the Vercel dashboard.

### Tests

```bash
npm test             # watch mode
npm run test:run     # single run
npm run test:coverage
```

### Lint & Format

```bash
npm run lint
npm run format
```

---

## 🧠 Responsible AI

ExamMind is **not a therapist** and **does not diagnose mental illness**.

The AI companion:
- Uses qualifying language: *"Based on your patterns..."*, *"It might help to..."*
- Never claims certainty about a student's mental state
- When burnout risk is high, encourages rest and talking to trusted people

**Burnout risk score** is computed using deterministic rule-based logic only. The AI has zero influence on this calculation.

---

## 📱 Design Principles

- **Mobile-first** — designed for phone use during study breaks
- **Non-intimidating** — calm blue/purple palette, no alarming language
- **Accessible** — keyboard navigation, ARIA labels, focus management
- **Privacy-first** — all data stays in the browser; only the AI analysis call leaves the device

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS 3 (dark mode via class) |
| Charts | Custom SVG components (no chart library) |
| State | React Context + localStorage |
| AI | Google Gemini Flash via `@google/generative-ai` |
| Backend | Vercel Serverless Functions |
| Testing | Vitest |
| Linting | ESLint + Prettier |
| Deployment | Vercel |

---

## 📄 License

MIT — built with care for students navigating the pressure of competitive exams.
