# FORGE — Full Handoff Document (Updated May 2026)
> For AI-to-AI handoff. Contains full context, vision, architecture, current deployment info, and all source files.

---

## 1. VISION & PRODUCT OVERVIEW

**Forge** is a premium Hyrox & fitness tracker web app built as a mobile-first PWA (runs in browser, looks and feels like a native app). Designed specifically for Hyrox competitors and serious hybrid athletes who train across running, strength, and Hyrox-specific stations.

### Core Philosophy
- **Aesthetic first**: Dark military-green theme (`#0D0F09`), yellow-green accent (`#D4E020`), feels like a premium training app
- **No fluff**: No short forms, no abbreviations. Full words everywhere. Clean, readable.
- **AI-integrated**: Claude AI for exercise tutorials, workout analysis, and performance coaching
- **Hyrox-native**: Built around the actual Hyrox race format (8 × 1km runs + 8 functional stations)

---

## 2. TECH STACK

### Frontend
- **React** (Vite, JSX) — single `App.jsx` file, no component splitting
- **Inline styles only** — no CSS files, no Tailwind. All styles are JS objects.
- **Google Fonts**: `Barlow Condensed` (headings, numbers) + `Barlow` (body)
- **CSS animations** in `index.html`: `fadeInUp`, `pulse`, `breathe`, `spin`, `timerPulse`
- **GPS**: Browser `navigator.geolocation.watchPosition` with Haversine distance

### Backend
- **Node.js + Express** (`server.js`) — proxies Claude API calls
- **Anthropic SDK** — keeps API key server-side
- **Render deployment**: serves built Vite `dist/` as static files + `/api/claude` endpoint
- Vite proxies `/api` → `http://localhost:3001` in dev

### Auth & Database
- **Supabase** for auth (Google OAuth + email/password) and data storage
- **Supabase project URL**: `https://fjctnkfsyjjqtviazxna.supabase.co`
- **Google OAuth** configured in Google Cloud Console — redirect URI: `https://fjctnkfsyjjqtviazxna.supabase.co/auth/v1/callback`
- **profiles** table stores: `id`, `name`, `age`, `height_cm`, `weight_kg`, `lifting_level`, `running_level`, `jog_pace`, `jog_distance_km`, `onboarded`, plus `lift1_name`/`lift1_weight` etc.

### AI Models
- **`claude-haiku-4-20250514`** — exercise tutorials (fast, cheap)
- **`claude-sonnet-4-20250514`** — workout analysis + performance coaching
- All Claude calls go through `/api/claude` on the Express server
- All responses are structured JSON

### State & Persistence
- React `useState` — no Redux/Zustand
- **`logs` array persisted to `localStorage`** under key `forge_logs` — survives page refresh
- User profile loaded from Supabase on login and passed down as props

---

## 3. COLOUR THEME

```js
const T = {
  bg:"#0D0F09",          // Almost black, very dark green
  surface:"#161810",
  card:"#1E2118",
  border:"rgba(255,255,255,0.06)",
  borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020",      // PRIMARY ACCENT — yellow-green (Hyrox brand colour)
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
  text1:"#F5F5F0",       // Primary text — off-white cream
  text2:"#6B6D5C",       // Secondary text — muted
  text3:"#353628",       // Tertiary — very muted
};
```

---

## 4. APP STRUCTURE

```
App (root — handles auth state)
├── Auth             — Login screen (email/password + Google OAuth)
├── Onboarding       — 3-step setup (basics, lifting, running)
└── MainApp          — Main app (after login + onboarding)
    ├── HomeTab          — Dashboard, real stats, performance insights
    ├── HyroxTab         — Race simulations by division, custom builders
    ├── TrainingTab      — Strength workouts, PR tracker
    ├── RunningTab       — GPS tracking, manual logging, zone guide
    └── AccountTab       — Profile view/edit, sign out

Bottom Nav: Home ⚡ | Hyrox 🏁 | Training 🏋️ | Running 🏃 | Account (initials)
```

### Key Components in App.jsx
| Component | Purpose |
|---|---|
| `HomeTab` | Dashboard + real stats from logs + AI insights |
| `HyroxTab` | Select division → race simulation with live splits |
| `TrainingTab` | Browse/filter templates → start workout |
| `RunningTab` | GPS run tracker + manual logger + zone guide |
| `AccountTab` | Profile view/edit (name, age, weight, height) + sign out |
| `ActiveWorkout` | Live workout tracker (ready → active → done phases) |
| `GPSRunTracker` | Live GPS run (setup → active → done phases) |
| `WorkoutBuilder` | Custom workout creator |
| `HyroxCustomBuilder` | Custom Hyrox station configurator |
| `ExercisePicker` | Searchable exercise library + AI adder |
| `ExerciseGifModal` | AI-powered exercise tutorial |
| `ExitConfirmModal` | Mid-session exit: Save / Discard / Continue |
| `AIAnalysis` | Post-workout AI coaching panel |
| `PRScreen` | Personal records tracker |

---

## 5. NAVIGATION PATTERNS

- **Bottom nav** — 5 tabs: Home, Hyrox, Training, Running, Account
- Account tab icon shows user's **initials** in a circle (not emoji)
- Back buttons (`←`) on ALL screens using `sBtnStyle`
- Mid-workout/mid-run/mid-sim back → `ExitConfirmModal` (Save/Discard/Continue)
- `sBtnStyle` = `{width:32,height:32,borderRadius:10,border,background:T.card,color:T.text1,cursor:"pointer",fontWeight:700,fontSize:15}`

---

## 6. DATA MODELS

### Workout Log Entry
```js
{
  _id: Date.now(),        // timestamp — used for streak/weekly calc
  type: "STRENGTH" | "CUSTOM" | "HYROX" | "RUN" | "CARDIO",
  name: string,
  duration: number,       // seconds
  date: string,           // "17 May"
  detail: string,
  exercises: [{ name, sets, reps, weight, setLogs:[{reps,weight,duration,restAfter,timestamp}] }],
  // RUN only:
  distKm: number,
  pace: string,           // "5:10"
  zone: string,           // "Z2"
  // HYROX only:
  mode: string,           // "Pro Men"
  stationLogs: [{ phase, name, weight, split }]
}
```

---

## 7. DEPLOYMENT

- **Live URL**: `https://hyroxapp.onrender.com`
- **Git repo**: `https://github.com/aryaantech/hyroxapp.git` (branch: `main`)
- Render auto-deploys on every push to `main`
- **Render start command**: `node server.js` (serves built `dist/` + API)
- **Render build command**: `npm run build`
- **Environment variables on Render**: `ANTHROPIC_API_KEY`

### Supabase
- Project: `fjctnkfsyjjqtviazxna`
- Supabase URL/key are hardcoded in `src/supabase.js` (anon key, safe to expose)
- Auth redirect URLs in Supabase dashboard: `https://hyroxapp.onrender.com/**`

### Google OAuth (Google Cloud Console)
- Authorized JavaScript origins: `https://hyroxapp.onrender.com`
- Authorized redirect URIs: `https://fjctnkfsyjjqtviazxna.supabase.co/auth/v1/callback`

---

## 8. WHAT'S DONE ✅

✅ Full 5-tab app (Home, Hyrox, Training, Running, Account)
✅ User auth: Google OAuth + email/password via Supabase
✅ 3-step onboarding (name/age/height/weight → lifting level → running level)
✅ Account tab: view/edit profile, sign out, initials avatar in nav
✅ All dummy/hardcoded data removed — stats calculated from real logs
✅ Logs persisted to localStorage — survive page refresh
✅ Streak, best pace, weekly sessions, charts all real from log timestamps
✅ Login screen: gym hero image with gradient overlay, FORGE branding
✅ Exit confirmation modal on ActiveWorkout, GPSRunTracker, HyroxTab sim
✅ 130+ exercise library across 7 categories
✅ 20 pre-built workout templates
✅ Live workout tracker: set logging, rest timer, progress bar
✅ Hyrox race simulator (4 divisions + custom) with live splits
✅ GPS run tracker with Haversine distance calculation
✅ Manual run logger
✅ Personal Records tracker
✅ AI exercise tutorials (Claude Haiku)
✅ AI post-workout analysis (Claude Sonnet)
✅ AI performance coaching / insights (Claude Sonnet)
✅ AI custom exercise adder
✅ Full Insights screen: bar charts, time per discipline, improving/focus sections
✅ Week/Month toggle on insights
✅ Run detail view, Hyrox simulation detail view
✅ Zone guide on running tab

---

## 9. WHAT STILL NEEDS DOING

- **Supabase log persistence**: logs are saved to localStorage only, not Supabase. If user switches device or clears browser data, logs are lost. Need a `workout_logs` table.
- **Real historical charts**: Week/month charts read from localStorage logs — good, but no cross-device sync
- **Push notifications**: Rest timer reminders, daily training prompts
- **Heart rate integration**: Web Bluetooth API
- **Export / sharing**: Workout PDFs, share splits
- **Training plan / periodisation**: AI-generated weekly plans

---

## 10. IMPORTANT PATTERNS TO PRESERVE

1. **Single-file architecture**: Keep everything in `App.jsx`. Do not split into files.
2. **Inline styles only**: Never introduce CSS classes or Tailwind.
3. **No short forms**: Write "Sessions", "Distance" — never abbreviations.
4. **Emoji badges**: TypeBadge and nav icons use emoji on coloured backgrounds.
5. **SecHead pattern**: Every section uses `<SecHead>` with a coloured accent bar.
6. **AI always returns JSON**: All Claude calls prompt for `ONLY valid JSON`, parsed with `JSON.parse()`.
7. **Back buttons**: Every screen has a `←` using `sBtnStyle`. Mid-workout back → `ExitConfirmModal`.
8. **Theme colours only**: Never introduce new hex values — use values from the `T` object.
9. **_id timestamps**: Every log entry has `_id: Date.now()` — used for streak/weekly calculations.
10. **Profile from Supabase**: `MainApp` fetches full profile on mount, passes as prop to `HomeTab` and `AccountTab`.

---

## 11. FILE STRUCTURE

```
/Users/aryaannath/Hyrox App/
├── index.html          — Entry point, Google Fonts, CSS keyframe animations
├── vite.config.js      — Vite config, port 3000, proxy /api → :3001
├── server.js           — Express backend, /api/claude, serves dist/
├── .env                — ANTHROPIC_API_KEY (not in git)
├── package.json
├── public/
│   └── gym.jpg         — Login screen hero image
└── src/
    ├── main.jsx        — Renders <App /> into #root
    ├── App.jsx         — ENTIRE APP (~2100 lines)
    ├── Auth.jsx        — Login screen (hero image + email/Google auth)
    ├── Onboarding.jsx  — 3-step onboarding flow
    └── supabase.js     — Supabase client init
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

## 12. SOURCE FILES

### src/supabase.js
```js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fjctnkfsyjjqtviazxna.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqY3Rua2ZzeWpqcXR2aWF6eG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY4NDAsImV4cCI6MjA5NDU3Mjg0MH0.gm9BXaszOk__8FiYCjwRwHkMmuDXhtJ1bf-aDWKuvCs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### src/main.jsx
```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### server.js
```js
import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
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

### package.json
```json
{
  "name": "forge-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "server": "node server.js",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@supabase/supabase-js": "^2.105.4",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### src/Auth.jsx
```jsx
import { useState } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#0D0F09", surface:"#161810", card:"#1E2118",
  border:"rgba(255,255,255,0.06)", borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020", orangeL:"rgba(212,224,32,0.13)",
  text1:"#F5F5F0", text2:"#6B6D5C",
};

const inp = {
  width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
  borderRadius:14, padding:"16px 18px", color:T.text1, fontSize:16,
  fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box",
};

const btn = (bg, color) => ({
  width:"100%", padding:"17px", borderRadius:14, border:"none",
  background:bg, color:color, fontSize:16, fontWeight:700,
  fontFamily:"'Barlow',sans-serif", cursor:"pointer", letterSpacing:"0.04em",
});

export default function Auth() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",fontFamily:"'Barlow',sans-serif",position:"relative",overflow:"hidden"}}>

      {/* Hero image */}
      <div style={{position:"relative",height:"46vh",minHeight:280,flexShrink:0,overflow:"hidden"}}>
        <img src="/gym.jpg" alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(13,15,9,0.3) 0%, rgba(13,15,9,0.15) 40%, rgba(13,15,9,0.85) 80%, #0D0F09 100%)"}}/>
        <div style={{position:"absolute",bottom:28,left:24,right:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,background:T.orange,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:24,filter:"brightness(0)"}}>⚡</span>
            </div>
            <div>
              <div style={{fontSize:34,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.06em",lineHeight:1}}>FORGE</div>
              <div style={{fontSize:11,color:"rgba(245,245,240,0.6)",marginTop:3,letterSpacing:"0.1em",fontWeight:600}}>HYROX & FITNESS TRACKER</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{flex:1,padding:"28px 24px 40px",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",background:T.surface,borderRadius:14,padding:4,marginBottom:24,border:`1px solid ${T.border}`}}>
          {["signin","signup"].map(m => (
            <button key={m} onClick={()=>{setMode(m);setError("");setMessage("");}} style={{flex:1,padding:"11px",borderRadius:11,border:"none",cursor:"pointer",background:mode===m?T.card:"transparent",color:mode===m?T.text1:T.text2,fontFamily:"'Barlow',sans-serif",fontSize:14,fontWeight:700,letterSpacing:"0.04em",transition:"all 0.2s"}}>
              {m === "signin" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          {error && <div style={{color:"#E05858",fontSize:13,textAlign:"center",padding:"10px",background:"rgba(224,88,88,0.1)",borderRadius:10}}>{error}</div>}
          {message && <div style={{color:T.orange,fontSize:13,textAlign:"center",padding:"10px",background:T.orangeL,borderRadius:10}}>{message}</div>}
          <button type="submit" disabled={loading} style={{...btn(T.orange,"#0D0F09"),marginTop:4,opacity:loading?0.6:1}}>
            {loading ? "…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>
        <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
          <div style={{flex:1,height:1,background:T.border}}/>
          <span style={{color:T.text2,fontSize:12,letterSpacing:"0.06em"}}>OR</span>
          <div style={{flex:1,height:1,background:T.border}}/>
        </div>
        <button onClick={handleGoogle} disabled={loading} style={{...btn(T.card,T.text1),border:`1px solid ${T.borderM}`,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>
        <div style={{marginTop:"auto",paddingTop:24,textAlign:"center"}}>
          <span style={{fontSize:11,color:T.text2,letterSpacing:"0.04em"}}>Built for Hyrox competitors</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 13. App.jsx

App.jsx is ~2100 lines and too large to paste here. It lives at:
**`/Users/aryaannath/Hyrox App/src/App.jsx`**
or on GitHub: `https://github.com/aryaantech/hyroxapp/blob/main/src/App.jsx`

### Key sections and line numbers:
- Line 1–16: Imports + Theme object `T`
- Line 18–128: `EXERCISE_LIBRARY` + `ALL_EXERCISES`
- Line 130–145: `HYROX_BASE_STATIONS` + `HYROX_MODES`
- Line 147–295: `WORKOUT_TEMPLATES` (20 templates)
- Line 297–317: Utility functions + micro components (`Pill`, `Divider`, `SL`, `Btn`, `GhostBtn`, `sBtnStyle`, `fmt`, `today`)
- Line 320–355: `AIAnalysis` component
- Line 357–390: `AIExerciseAdder` component
- Line 393–515: `ExerciseGifModal` (AI tutorial, Claude Haiku)
- Line 518–555: `ExercisePicker`
- Line 558–655: `WorkoutBuilder`
- Line 657–672: `ExitConfirmModal` (Save/Discard/Continue)
- Line 675–890: `ActiveWorkout` (ready/active/done phases)
- Line 892–940: `HyroxCustomBuilder`
- Line 943–980: `HyroxSimDetail`
- Line 983–1090: `HyroxTab` (with ExitConfirmModal on sim back/quit)
- Line 1150–1265: `GPSRunTracker`
- Line 1268–1310: `RunDetail` + `ManualRunLogger`
- Line 1315–1385: `RunningTab`
- Line 1390–1460: `PRScreen`
- Line 1462–1580: `TrainingTab`
- Line 1585–1610: `SecHead`, `TypeBadge` micro components
- Line 1612–1965: `HomeTab` (real stats from logs, no dummy data)
- Line 1967–2065: `AccountTab` (profile view/edit, sign out)
- Line 2068–2140: `MainApp` (fetches profile, 5-tab nav with initials)
- Line 2142–2175: `App` root (auth state machine: loading → Auth → Onboarding → MainApp)

### Root App auth flow:
```js
export default function App() {
  // session: undefined=loading, null=logged out, object=logged in
  // profile: fetched from Supabase profiles table (checks onboarded field)
  // States: loading spinner → Auth screen → Onboarding (if !onboarded) → MainApp
}
```

### MainApp structure:
```js
function MainApp({ user }) {
  // logs: persisted to localStorage under "forge_logs"
  // profile: fetched from Supabase profiles table (full row with all fields)
  // Passes profile + user to HomeTab and AccountTab
  // 5-tab nav: home, hyrox, training, running, account
  // Account nav icon = user initials (not emoji)
}
```

### AccountTab:
```js
function AccountTab({ user, profile, onProfileUpdate }) {
  // Displays: avatar (initials), name, email, age/weight/height strip
  // View mode: shows all profile fields from Supabase
  // Edit mode: inline form to update name, age, weight_kg, height_cm → saves to Supabase
  // Sign out button: calls supabase.auth.signOut()
}
```

### HomeTab — real data only:
```js
function HomeTab({ logs, setTab, profile, user }) {
  // NO dummy data. All stats derived from logs array.
  // streak: counts consecutive days with logs using _id timestamps
  // weeklySessions: filters logs where _id > (now - 7 days)
  // bestRun: reduces runLogs to find min pace in seconds
  // WEEK_BARS: groups logs by day of current Mon–Sun week using _id
  // MONTH_BARS: last 4 rolling weeks using _id
  // Header: "Hey, [FirstName]" using profile.name
}
```
