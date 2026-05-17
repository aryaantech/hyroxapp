# FORGE — Full Handoff Document
> For AI-to-AI handoff. Contains full context, vision, architecture, and all source files.

---

## 1. VISION & PRODUCT OVERVIEW

**Forge** is a premium Hyrox & fitness tracker web app built as a mobile-first PWA (runs in browser, looks and feels like a native app). It is designed specifically for Hyrox competitors and serious hybrid athletes who train across running, strength, and Hyrox-specific stations.

### Core Philosophy
- **Aesthetic first**: Dark military-green theme (`#0D0F09`), yellow-green accent (`#D4E020`), feels like a premium training app
- **No fluff**: No shorts forms, no abbreviations. Full words everywhere. Clean, readable.
- **AI-integrated**: Claude AI is used for exercise tutorials, workout analysis, and performance coaching — not as a gimmick but as a genuine coaching layer
- **Hyrox-native**: Built around the actual Hyrox race format (8 × 1km runs + 8 functional stations). Not a generic fitness app.

### Users
- Hyrox competitors (Pro Men/Women, Open Men/Women divisions)
- Hybrid athletes doing strength + running + conditioning
- Anyone who wants a serious, beautiful training tracker

---

## 2. TECH STACK

### Frontend
- **React** (Vite, JSX) — single `App.jsx` file, no component splitting
- **Inline styles only** — no CSS files, no Tailwind, no CSS modules. All styles are JS objects.
- **No external UI library** — everything is hand-built
- **Google Fonts**: `Barlow Condensed` (headings, numbers) + `Barlow` (body text)
- **CSS animations** in `index.html`: `fadeInUp`, `pulse`, `breathe`, `spin`, `timerPulse`
- **GPS**: Browser `navigator.geolocation.watchPosition` with Haversine distance calculation

### Backend
- **Node.js + Express** (`server.js`) — minimal proxy server
- **Anthropic SDK** — proxies Claude API calls to keep API key server-side
- **Port 3001** (backend), **Port 3000** (Vite frontend)
- Vite proxies `/api` → `http://localhost:3001`

### AI
- **`claude-haiku-4-20250514`** — exercise tutorials (fast, cheap)
- **`claude-sonnet-4-20250514`** — workout analysis + performance coaching (higher quality)
- All responses are structured JSON, parsed client-side

### State
- All state in React `useState` — no Redux, no Zustand
- No database, no persistence yet — state is in-memory per session
- `logs` array passed down from root `App` component as prop

---

## 3. COLOUR THEME

```js
const T = {
  bg:"#0D0F09",          // Almost black, very dark green
  surface:"#161810",      // Slightly lighter
  card:"#1E2118",         // Card backgrounds
  border:"rgba(255,255,255,0.06)",
  borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020",       // PRIMARY ACCENT — yellow-green (Hyrox brand colour)
  orangeL:"rgba(212,224,32,0.13)",
  orangeM:"rgba(212,224,32,0.24)",
  green:"#3DBF82",
  greenL:"rgba(61,191,130,0.13)",
  purple:"#8B7FF0",
  purpleL:"rgba(139,127,240,0.13)",
  blue:"#5B9CF6",
  blueL:"rgba(91,156,246,0.13)",
  red:"#E05858",
  redL:"rgba(224,88,88,0.13)",
  amber:"#F0C030",
  amberL:"rgba(240,192,48,0.13)",
  text1:"#F5F5F0",        // Primary text — off-white cream
  text2:"#6B6D5C",        // Secondary text — muted
  text3:"#353628",        // Tertiary — very muted
};
```

---

## 4. APP STRUCTURE

```
App (root)
├── HomeTab          — Dashboard, stats, performance insights
├── HyroxTab         — Race simulations by division, custom builders
├── TrainingTab      — Strength workouts, PR tracker
└── RunningTab       — GPS tracking, manual logging, zone guide

Bottom Nav: Home ⚡ | Hyrox 🏁 | Training 🏋️ | Running 🏃
(Each nav icon = emoji in yellow circle when active, matching TypeBadge pattern)
```

### Key Components
| Component | Purpose |
|---|---|
| `HomeTab` | Dashboard + stats overview + insights entry point |
| `HyroxTab` | Select division → race simulation with live splits |
| `TrainingTab` | Browse/filter templates → start workout |
| `RunningTab` | GPS run tracker + manual logger + zone guide |
| `ActiveWorkout` | Live workout tracker (ready → active → done phases) |
| `GPSRunTracker` | Live GPS run (setup → active → done phases) |
| `WorkoutBuilder` | Custom workout creator with exercise picker |
| `HyroxCustomBuilder` | Custom Hyrox station configurator |
| `ExercisePicker` | Searchable exercise library + AI adder |
| `ExerciseGifModal` | AI-powered exercise tutorial (muscles, cues, mistakes, pro tip) |
| `ExitConfirmModal` | Mid-workout exit confirmation (Save / Discard / Continue) |
| `AIAnalysis` | Post-workout AI coaching panel |
| `AIExerciseAdder` | Add custom exercises via AI |
| `PRScreen` | Personal records tracker |
| `RunDetail` | Individual run detail view |
| `HyroxSimDetail` | Individual Hyrox simulation breakdown |
| `ManualRunLogger` | Manual run entry form |

### Micro Components
```js
Pill        // Type tag chip (e.g. "STRENGTH")
Divider     // 0.5px horizontal rule
SL          // Section label (small grey caps)
Btn         // Primary CTA button
GhostBtn    // Ghost/secondary button
SecHead     // Section heading with coloured accent bar
TypeBadge   // Emoji on coloured background (used in recent activity feeds)
```

---

## 5. NAVIGATION PATTERNS

- **Bottom nav** switches between 4 tabs
- **Back buttons** (`←`) are present on ALL screens/steps, top-left
- Mid-workout back → `ExitConfirmModal` with 3 options
- `sBtnStyle` = shared style object for all small icon buttons (32×32px)
- Screens within a tab use local `useState` (e.g. `screen: "home" | "gps" | "manual"`)
- Modals/overlays use `position: fixed, inset: 0, zIndex: 200–500`

---

## 6. DATA MODELS

### Workout Log Entry (added via `addLog`)
```js
{
  type: "STRENGTH" | "CUSTOM" | "HYROX" | "RUN" | "CARDIO",
  name: string,
  duration: number,          // seconds
  date: string,              // "15 May"
  detail: string,            // "16/16 sets" or "8.5km · 5:10/km"
  exercises: [               // for strength/HIIT
    {
      name: string,
      sets: number,
      reps: string,
      weight: string,
      setLogs: [{ reps, weight, duration, restAfter, timestamp }]
    }
  ],
  // RUN only:
  distKm: number,
  pace: string,              // "5:10"
  zone: string,              // "Z2"
  // HYROX only:
  mode: string,              // "Pro Men"
  stationLogs: [{ phase, name, weight, split }]
}
```

### Workout Template
```js
{
  id: string,
  tag: "STRENGTH" | "HYROX" | "CARDIO" | "CUSTOM",
  category: "UPPER" | "LOWER" | "CORE" | "CARDIO" | "HYBRID" | "HYROX",
  name: string,
  exercises: [{ name, sets, reps, weight, category }]
}
```

---

## 7. HYROX RACE FORMAT

8 stations, each preceded by a 1km run:
1. Ski Erg — 1,000m
2. Sled Push — 50m×2
3. Sled Pull — 50m×2
4. Burpee Broad Jump — 80m
5. Rowing (Erg) — 1,000m
6. Farmers Carry — 200m
7. Sandbag Lunges — 100m
8. Wall Balls — 75 reps

4 divisions with different weights (Pro Men / Pro Women / Open Men / Open Women).
The simulation tracks live splits per run + per station, stores them on finish.

---

## 8. AI INTEGRATION

### Exercise Tutorial (`ExerciseGifModal`)
```
Model: claude-haiku-4-20250514
Max tokens: 600
Returns JSON: {
  primaryMuscles, secondaryMuscles,
  setup, cues, mistakes, proTip
}
```
Renders: muscle chips, setup card (blue border), numbered coaching cues,
common mistakes (red-tinted), pro tip (amber).

### Post-Workout Analysis (`AIAnalysis`)
```
Model: claude-sonnet-4-20250514
Max tokens: 1000
Returns JSON: {
  summary, strengths, improvements,
  nextSession, progressionAdvice, recoveryAdvice
}
```

### Performance Coaching (`HomeTab` Insights Screen)
```
Model: claude-sonnet-4-20250514
Max tokens: 1000
Returns JSON: {
  overview, runningInsights, strengthInsights,
  hyroxReadiness, weeklyFocus, longTermGoals
}
```

### AI Exercise Adder (`AIExerciseAdder`)
```
Model: claude-sonnet-4-20250514
Max tokens: 300
Returns JSON: { name, category, unit, notes }
```

All AI calls go through `/api/claude` on the Express server.

---

## 9. HOME TAB (INSIGHTS) — DETAILED

The home tab has two states:
1. **Main dashboard** — stats overview + compact chart preview
2. **Insights screen** (`insightScreen === true`) — full analysis

### Main Dashboard sections:
- Header (FORGE logo + streak counter)
- **THIS WEEK** — 2×2 grid of stat cards (sessions, km, best pace, Hyrox sims)
- **ACTIVITY BREAKDOWN** — 3 emoji buttons (Running/Training/Hyrox) that navigate to tabs
- **PERFORMANCE INSIGHTS** — tappable card with compact 7-bar weekly chart → opens insights screen
- **RECENT ACTIVITY** — list with TypeBadge + name + detail + duration

### Full Insights Screen sections:
- Week/Month toggle pill
- 3-card summary strip (sessions / distance / streak)
- **ACTIVITY CHART** — CSS bar chart (7 bars for week, 4 for month), color-coded
- **TIME PER DISCIPLINE** — horizontal progress bars with emoji + % badge
- **WHERE YOU'RE IMPROVING** — green cards with ↑ delta chips
- **WHERE TO FOCUS** — amber cards with action prompts
- **AI COACHING** — lazy-load button → spinner → structured AI response

### Bar chart implementation (CSS only, no library):
```jsx
// Bar height = percentage of max duration
const h = duration > 0 ? Math.max((duration / maxDuration) * 100, 12) : 3;
<div style={{ height: `${h}%`, background: color, borderRadius: "5px 5px 0 0" }} />
```

---

## 10. ACTIVE WORKOUT FLOW

```
Phase: "ready"
  → shows exercise list with ▶ tutorial buttons
  → rest preset adjuster (15s increments)
  → ← back button goes to training home directly

Phase: "active"
  → live timer (with glow animation)
  → exercise nav chips (asymmetric pill style for active)
  → LOG SET button (shows rest countdown after each set)
  → animated rest progress bar (green → orange → red)
  → ▶ tutorial button on current exercise
  → ← back button → ExitConfirmModal (Save/Discard/Continue)

Phase: "done"
  → set summary per exercise
  → AIAnalysis component (lazy, button-triggered)
  → Save & Exit button
  → ← back to training home
```

---

## 11. CURRENT STATE — WHAT'S DONE

✅ Full 4-tab app (Home, Hyrox, Training, Running)  
✅ 130+ exercise library across 7 categories  
✅ 20 pre-built workout templates (Upper/Lower/Core/Cardio/Hybrid/Hyrox)  
✅ Live workout tracker with set logging, rest timer, progress bar  
✅ Hyrox race simulator (4 divisions + custom) with live splits  
✅ GPS run tracker with Haversine distance calculation  
✅ Manual run logger  
✅ Personal Records tracker (auto-extracts from set logs)  
✅ AI exercise tutorials (Claude Haiku)  
✅ AI post-workout analysis (Claude Sonnet)  
✅ AI performance coaching / insights (Claude Sonnet)  
✅ AI custom exercise adder  
✅ ExitConfirmModal for mid-workout exits (Save/Discard/Continue)  
✅ Back buttons on every single screen/step  
✅ Full Insights screen with bar charts, progress bars, improving/struggling sections  
✅ Compact weekly bar chart preview on home  
✅ Week/Month toggle on insights  
✅ TypeBadge with emoji on coloured backgrounds (matching nav pattern)  
✅ SecHead with bold text + coloured accent bar  
✅ WorkoutBuilder redesigned (empty state, category chips, exercise cards, bottom bar)  
✅ Category filter chips on Training tab  
✅ Last session benchmark shown on each workout template card  
✅ Run detail view, Hyrox simulation detail view  
✅ Zone guide on running tab with weekly mileage bar chart  

---

## 12. WHAT NEEDS DOING (SUGGESTED NEXT STEPS)

These were not explicitly requested yet but are natural next steps:

- **Persistence**: Currently all data is lost on page refresh. Need `localStorage` or a real database (Supabase / Firebase suggested — simple, free tier works)
- **User auth**: If adding persistence, needs user accounts
- **Real historical data**: Charts use hardcoded demo data. Should read from actual `logs` array
- **Push notifications**: Rest timer, daily training reminders
- **Expo / React Native conversion**: A native mobile version was started in `/Users/aryaannath/forge-native/` but is incomplete
- **Training plan / periodisation**: AI-generated weekly plans
- **Heart rate integration**: Via Web Bluetooth API or wearable API
- **Export / sharing**: Export workouts as PDF or share splits

---

## 13. FILE STRUCTURE

```
/Users/aryaannath/Hyrox App/
├── index.html          — Entry point, Google Fonts, CSS keyframe animations
├── vite.config.js      — Vite config, port 3000, proxy /api → :3001
├── server.js           — Express backend, /api/claude endpoint
├── .env                — ANTHROPIC_API_KEY + EXERCISEDB_API_KEY (unused)
├── package.json        — Dependencies
└── src/
    ├── main.jsx        — Renders <App /> into #root
    └── App.jsx         — ENTIRE APP (single file, ~1958 lines)
```

### To run locally:
```bash
# Terminal 1 — backend
node server.js

# Terminal 2 — frontend
npm run dev

# Open: http://localhost:3000
```

---

## 14. SOURCE FILES

### server.js
```js
import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(express.json({ limit: "2mb" }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/claude", async (req, res) => {
  try {
    const { model, max_tokens, messages } = req.body;
    const response = await client.messages.create({ model, max_tokens, messages });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

### vite.config.js
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forge — Hyrox & Fitness Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#0D0F09;overscroll-behavior:none;}
      @keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:0.85}}
      @keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(212,224,32,0.4)}70%{box-shadow:0 0 0 10px rgba(212,224,32,0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
      @keyframes timerPulse{0%,100%{text-shadow:0 0 0px rgba(212,224,32,0)}50%{text-shadow:0 0 20px rgba(212,224,32,0.5)}}
      .card-enter{animation:fadeInUp 0.35s ease both}
      .pulse{animation:pulse 2s ease-in-out infinite}
      .breathe{animation:breathe 2s ease-in-out infinite}
      .timer-glow{animation:timerPulse 1.5s ease-in-out infinite}
      input,button{font-family:'Barlow',sans-serif;outline:none;}
      input::-webkit-inner-spin-button{-webkit-appearance:none;}
      ::-webkit-scrollbar{width:0;height:0;}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 15. FULL App.jsx SOURCE CODE

> The file is located at: `/Users/aryaannath/Hyrox App/src/App.jsx`
> It is ~1958 lines. Paste the file content below when sharing with another AI.
> To get the full content: read the file at the path above.

**Key sections and their line numbers:**
- Line 1: Imports
- Line 2–12: Theme object `T`
- Line 15–127: `EXERCISE_LIBRARY` + `ALL_EXERCISES`
- Line 130–145: `HYROX_BASE_STATIONS` + `HYROX_MODES`
- Line 147–295: `WORKOUT_TEMPLATES` (20 templates)
- Line 297–302: `RUN_TYPES`
- Line 304–317: Utility functions + micro component styles
- Line 320–352: `AIAnalysis` component
- Line 355–387: `AIExerciseAdder` component
- Line 390–513: `ExerciseGifModal` (AI tutorial, Claude Haiku)
- Line 516–554: `ExercisePicker` (searchable library + AI add)
- Line 557–649: `WorkoutBuilder` (custom workout creator)
- Line 652–666: `ExitConfirmModal` (Save/Discard/Continue)
- Line 669–881: `ActiveWorkout` (ready/active/done phases)
- Line 884–931: `HyroxCustomBuilder`
- Line 934–972: `HyroxSimDetail`
- Line 975–1139: `HyroxTab`
- Line 1142–1239: `GPSRunTracker`
- Line 1242–1272: `RunDetail`
- Line 1275–1304: `ManualRunLogger`
- Line 1307–1373: `RunningTab`
- Line 1376–1446: `PRScreen` (Personal Records)
- Line 1448–1564: `TrainingTab`
- Line 1567–1572: `SecHead` component
- Line 1573–1577: `TypeBadge` component
- Line 1579–1930: `HomeTab` (dashboard + full insights screen)
- Line 1932–1957: `App` root component + bottom nav

---

## 16. IMPORTANT PATTERNS TO PRESERVE

1. **Single-file architecture**: Keep everything in `App.jsx`. Don't split into files unless explicitly asked.
2. **Inline styles only**: Never introduce CSS classes or external style libraries.
3. **No short forms**: Write "Sessions", "Distance", "Hyrox Simulations" — never "HX", "ST", "RN", "CD".
4. **Emoji badges**: TypeBadge and nav icons use emoji on coloured backgrounds (not text abbreviations).
5. **SecHead pattern**: Every section uses `<SecHead>` with a coloured accent bar.
6. **AI always returns JSON**: All Claude calls prompt for `ONLY valid JSON`, parsed with `JSON.parse()`.
7. **Back buttons**: Every screen must have a `←` using `sBtnStyle`. Mid-workout/mid-run back → `ExitConfirmModal`.
8. **sBtnStyle**: `{width:32,height:32,borderRadius:10,border,background:T.card,color:T.text1,cursor:"pointer",fontWeight:700,fontSize:15}`
9. **Fonts**: Headings/numbers use `fontFamily:"'Barlow Condensed',sans-serif"`. Body uses `'Barlow'`.
10. **Theme colours only**: Never introduce new hex values — use values from the `T` object.
