import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#0D0F09", surface:"#161810", card:"#1E2118",
  border:"rgba(255,255,255,0.06)", borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020", orangeL:"rgba(212,224,32,0.1)", orangeM:"rgba(212,224,32,0.22)",
  green:"#3DBF82", greenL:"rgba(61,191,130,0.12)",
  purple:"#8B7FF0", purpleL:"rgba(139,127,240,0.12)",
  text1:"#F5F5F0", text2:"#6B6D5C", text3:"#252719",
};

const TOTAL = 5;
const ITEM_W = 68;

// ── SCROLL PICKER ─────────────────────────────────────────────────────────────
function ScrollPicker({ min, max, value, onChange }) {
  const ref = useRef(null);
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const timer = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = (value - min) * ITEM_W;
  }, []); // eslint-disable-line

  function onScroll() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(nums.length - 1, Math.round(ref.current.scrollLeft / ITEM_W)));
      ref.current.scrollLeft = idx * ITEM_W;
      onChange(min + idx);
    }, 60);
  }

  return (
    <div style={{ position:"relative", height:110 }}>
      {/* Selected box */}
      <div style={{
        position:"absolute", left:"50%", top:"50%",
        transform:"translate(-50%,-50%)",
        width:ITEM_W - 6, height:76, borderRadius:16,
        background:"rgba(212,224,32,0.07)",
        border:"1px solid rgba(212,224,32,0.18)",
        pointerEvents:"none", zIndex:1,
      }}/>
      {/* Fade edges */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:110, background:`linear-gradient(to right,${T.bg} 30%,transparent)`, pointerEvents:"none", zIndex:2 }}/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:110, background:`linear-gradient(to left,${T.bg} 30%,transparent)`, pointerEvents:"none", zIndex:2 }}/>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          display:"flex", overflowX:"scroll", scrollSnapType:"x mandatory",
          scrollbarWidth:"none", height:"100%", alignItems:"center",
          paddingLeft:`calc(50% - ${ITEM_W/2}px)`,
          paddingRight:`calc(50% - ${ITEM_W/2}px)`,
          WebkitOverflowScrolling:"touch",
        }}
      >
        {nums.map(n => {
          const active = n === value;
          return (
            <div key={n} style={{ width:ITEM_W, flexShrink:0, scrollSnapAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>
              <span style={{
                fontSize: active ? 50 : 22, lineHeight:1, userSelect:"none",
                color: active ? T.text1 : T.text3,
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight: active ? 800 : 500,
                transition:"font-size 0.12s,color 0.12s",
              }}>{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div style={{ display:"flex", gap:5 }}>
      {Array.from({ length:TOTAL }).map((_,i) => (
        <div key={i} style={{
          flex:1, height:3, borderRadius:2,
          background: i < step ? T.orange : i === step ? T.orangeM : "rgba(255,255,255,0.06)",
          transition:"all 0.35s",
        }}/>
      ))}
    </div>
  );
}

// ── BACK BUTTON ───────────────────────────────────────────────────────────────
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width:38, height:38, borderRadius:12, border:`1px solid rgba(255,255,255,0.1)`,
      background:"rgba(255,255,255,0.04)", color:T.text1, cursor:"pointer",
      fontSize:18, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0,
    }}>←</button>
  );
}

// ── CONTINUE BUTTON ───────────────────────────────────────────────────────────
function ContinueBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"18px", borderRadius:50, border:"none",
      background: disabled ? "rgba(255,255,255,0.06)" : T.orange,
      color: disabled ? T.text2 : "#0D0F09",
      fontSize:14, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif",
      cursor: disabled ? "not-allowed" : "pointer", letterSpacing:"0.08em",
      transition:"all 0.2s",
    }}>{children}</button>
  );
}

// ── LEVEL CARD ────────────────────────────────────────────────────────────────
function LevelCard({ label, desc, color, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", textAlign:"left", padding:"18px 20px",
      background: selected ? `rgba(${color},0.1)` : T.surface,
      border:`1px solid ${selected ? `rgba(${color},0.5)` : "rgba(255,255,255,0.08)"}`,
      borderRadius:16, cursor:"pointer", marginBottom:10, transition:"all 0.2s",
    }}>
      <div style={{ fontSize:15, fontWeight:700, color: selected ? `rgb(${color})` : T.text1, fontFamily:"'Barlow',sans-serif", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:12, color:T.text2, lineHeight:1.4 }}>{desc}</div>
    </button>
  );
}

// ── SVG ILLUSTRATIONS ─────────────────────────────────────────────────────────

function IllustrationForge() {
  return (
    <svg width="100%" height="240" viewBox="0 0 390 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow0" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4E020" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#D4E020" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Background glow */}
      <ellipse cx="195" cy="120" rx="160" ry="120" fill="url(#glow0)"/>
      {/* Hex grid subtle */}
      {[[195,60],[135,95],[255,95],[105,130],[195,130],[285,130],[135,165],[255,165],[195,200]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={28} stroke="rgba(212,224,32,0.06)" strokeWidth="1" fill="rgba(212,224,32,0.015)"/>
      ))}
      {/* Lightning bolt */}
      <path d="M210 50 L180 120 L200 120 L170 190 L230 110 L207 110 L235 50 Z"
        fill="rgba(212,224,32,0.18)" stroke="#D4E020" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Orbit rings */}
      <circle cx="195" cy="120" r="90" stroke="rgba(212,224,32,0.06)" strokeWidth="1" strokeDasharray="6 6"/>
      <circle cx="195" cy="120" r="65" stroke="rgba(212,224,32,0.04)" strokeWidth="1" strokeDasharray="4 8"/>
    </svg>
  );
}

function IllustrationTarget() {
  return (
    <svg width="100%" height="240" viewBox="0 0 390 240" fill="none">
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4E020" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#D4E020" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="195" cy="120" r="130" fill="url(#glow1)"/>
      {[100,78,56,36,18].map((r,i)=>(
        <circle key={r} cx="195" cy="120" r={r}
          stroke="#D4E020" strokeWidth="1"
          fill="none" opacity={0.05 + i*0.07}/>
      ))}
      <circle cx="195" cy="120" r="10" fill="rgba(212,224,32,0.35)" stroke="#D4E020" strokeWidth="1.5"/>
      <circle cx="195" cy="120" r="4" fill="#D4E020"/>
      {/* Cross hairs */}
      <line x1="195" y1="15" x2="195" y2="100" stroke="rgba(212,224,32,0.15)" strokeWidth="1"/>
      <line x1="195" y1="140" x2="195" y2="225" stroke="rgba(212,224,32,0.15)" strokeWidth="1"/>
      <line x1="90" y1="120" x2="177" y2="120" stroke="rgba(212,224,32,0.15)" strokeWidth="1"/>
      <line x1="213" y1="120" x2="300" y2="120" stroke="rgba(212,224,32,0.15)" strokeWidth="1"/>
    </svg>
  );
}

function IllustrationBody() {
  return (
    <svg width="100%" height="240" viewBox="0 0 390 240" fill="none">
      <defs>
        <radialGradient id="glow2" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#D4E020" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#D4E020" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="195" cy="110" rx="140" ry="110" fill="url(#glow2)"/>
      {/* Grid */}
      {[60,95,130,165,200].map(y => <line key={y} x1="80" y1={y} x2="310" y2={y} stroke="rgba(212,224,32,0.04)" strokeWidth="1"/>)}
      {[130,165,195,225,260].map(x => <line key={x} x1={x} y1="30" x2={x} y2="215" stroke="rgba(212,224,32,0.04)" strokeWidth="1"/>)}
      {/* Head */}
      <circle cx="195" cy="48" r="22" stroke="#D4E020" strokeWidth="1.5" fill="rgba(212,224,32,0.07)"/>
      {/* Torso */}
      <path d="M168 72 Q195 66 222 72 L230 148 Q195 158 160 148 Z" stroke="#D4E020" strokeWidth="1.5" fill="rgba(212,224,32,0.05)" strokeLinejoin="round"/>
      {/* Legs */}
      <line x1="174" y1="148" x2="163" y2="208" stroke="#D4E020" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="216" y1="148" x2="227" y2="208" stroke="#D4E020" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Arms */}
      <path d="M168 80 L138 118" stroke="rgba(212,224,32,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M222 80 L252 118" stroke="rgba(212,224,32,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Measurement marks */}
      <line x1="128" y1="72" x2="120" y2="72" stroke="rgba(212,224,32,0.3)" strokeWidth="1"/>
      <line x1="128" y1="148" x2="120" y2="148" stroke="rgba(212,224,32,0.3)" strokeWidth="1"/>
      <line x1="124" y1="72" x2="124" y2="148" stroke="rgba(212,224,32,0.2)" strokeWidth="1" strokeDasharray="3 3"/>
    </svg>
  );
}

function IllustrationBarbell() {
  return (
    <svg width="100%" height="200" viewBox="0 0 390 200" fill="none">
      <defs>
        <radialGradient id="glow3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4E020" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#D4E020" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="bargrad" x1="60" y1="0" x2="330" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4E020" stopOpacity="0"/>
          <stop offset="0.5" stopColor="#D4E020" stopOpacity="0.22"/>
          <stop offset="1" stopColor="#D4E020" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <ellipse cx="195" cy="100" rx="150" ry="80" fill="url(#glow3)"/>
      {/* Bar */}
      <rect x="60" y="93" width="270" height="14" rx="7" fill="url(#bargrad)" stroke="rgba(212,224,32,0.25)" strokeWidth="1"/>
      {/* Knurling */}
      {[130,140,150,160,170,180,195,210,220,230,240,250,260].map(x=>(
        <line key={x} x1={x} y1="96" x2={x} y2="104" stroke="rgba(212,224,32,0.12)" strokeWidth="1"/>
      ))}
      {/* Left collar */}
      <rect x="112" y="88" width="12" height="24" rx="3" fill="rgba(212,224,32,0.35)" stroke="#D4E020" strokeWidth="1"/>
      {/* Left inner plate */}
      <rect x="78" y="78" width="20" height="44" rx="5" fill="rgba(212,224,32,0.15)" stroke="rgba(212,224,32,0.45)" strokeWidth="1.5"/>
      {/* Left outer plate */}
      <rect x="52" y="68" width="26" height="64" rx="6" fill="rgba(212,224,32,0.22)" stroke="#D4E020" strokeWidth="1.5"/>
      {/* Right collar */}
      <rect x="266" y="88" width="12" height="24" rx="3" fill="rgba(212,224,32,0.35)" stroke="#D4E020" strokeWidth="1"/>
      {/* Right inner plate */}
      <rect x="292" y="78" width="20" height="44" rx="5" fill="rgba(212,224,32,0.15)" stroke="rgba(212,224,32,0.45)" strokeWidth="1.5"/>
      {/* Right outer plate */}
      <rect x="312" y="68" width="26" height="64" rx="6" fill="rgba(212,224,32,0.22)" stroke="#D4E020" strokeWidth="1.5"/>
      {/* Ground shadow */}
      <ellipse cx="195" cy="172" rx="120" ry="7" fill="rgba(212,224,32,0.05)"/>
    </svg>
  );
}

function IllustrationRunner() {
  return (
    <svg width="100%" height="240" viewBox="0 0 390 240" fill="none">
      <defs>
        <radialGradient id="glow4" cx="55%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#D4E020" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#D4E020" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="215" cy="120" rx="145" ry="110" fill="url(#glow4)"/>
      {/* Speed lines */}
      <line x1="60" y1="88" x2="148" y2="88" stroke="rgba(212,224,32,0.18)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="44" y1="106" x2="138" y2="106" stroke="rgba(212,224,32,0.1)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="56" y1="124" x2="144" y2="124" stroke="rgba(212,224,32,0.07)" strokeWidth="1" strokeLinecap="round"/>
      {/* Runner — head */}
      <circle cx="240" cy="50" r="20" stroke="#D4E020" strokeWidth="1.5" fill="rgba(212,224,32,0.08)"/>
      {/* Torso — leaning fwd */}
      <path d="M236 70 L210 122" stroke="#D4E020" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Front leg */}
      <path d="M210 122 L232 158 L214 200" stroke="#D4E020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Back leg */}
      <path d="M210 122 L196 152 L218 188" stroke="rgba(212,224,32,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Front arm */}
      <path d="M228 88 L264 100" stroke="#D4E020" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Back arm */}
      <path d="M220 85 L190 98" stroke="rgba(212,224,32,0.35)" strokeWidth="2" strokeLinecap="round"/>
      {/* Ground */}
      <line x1="100" y1="205" x2="320" y2="205" stroke="rgba(212,224,32,0.1)" strokeWidth="1"/>
      {/* Foot dots */}
      <circle cx="214" cy="200" r="4" fill="#D4E020" opacity="0.5"/>
      <circle cx="218" cy="188" r="3" fill="#D4E020" opacity="0.25"/>
    </svg>
  );
}

const LIFT_OPTIONS = ["Back Squat","Bench Press","Deadlift","Overhead Press","Pull Ups","Front Squat","Romanian Deadlift","Hip Thrust"];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Form data
  const [name, setName]         = useState("");
  const [age, setAge]           = useState(25);
  const [weightKg, setWeightKg] = useState(75);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightCm, setHeightCm] = useState(175);
  const [liftLevel, setLiftLevel] = useState("");
  const [lifts, setLifts]       = useState([{name:"Back Squat",weight:""},{name:"Bench Press",weight:""},{name:"Deadlift",weight:""}]);
  const [runLevel, setRunLevel] = useState("");
  const [jogPace, setJogPace]   = useState("5:30");
  const [jogDist, setJogDist]   = useState("5");

  function updateLift(i, field, val) {
    setLifts(p => p.map((l,idx) => idx===i ? {...l,[field]:val} : l));
  }

  function next() { setErr(""); setStep(s => s + 1); }
  function back() { setErr(""); setStep(s => Math.max(0, s - 1)); }

  async function finish() {
    setSaving(true); setErr("");
    const kgs = weightUnit === "kg" ? parseFloat(weightKg) : Math.round(parseFloat(weightKg) / 2.205 * 10) / 10;
    const liftData = liftLevel === "experienced"
      ? lifts.filter(l => l.name).reduce((a,l,i) => ({ ...a, [`lift${i+1}_name`]:l.name, [`lift${i+1}_weight`]:parseFloat(l.weight)||null }),{})
      : {};
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: name.trim(), age: parseInt(age)||null,
      height_cm: parseFloat(heightCm)||null,
      weight_kg: kgs||null,
      lifting_level: liftLevel, ...liftData,
      running_level: runLevel,
      jog_pace: runLevel === "experienced" ? jogPace : null,
      jog_distance_km: runLevel === "experienced" ? parseFloat(jogDist)||null : null,
      onboarded: true,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onComplete();
  }

  const screens = [
    // ── 0: NAME ────────────────────────────────────────────────────────────
    <Slide key={0}>
      <IllustrationForge/>
      <div style={{ padding:"0 28px 40px" }}>
        <div style={{ marginBottom:6 }}><StepBar step={0}/></div>
        <div style={{ fontSize:11, color:T.orange, fontWeight:700, letterSpacing:"0.12em", marginTop:24, marginBottom:10 }}>STEP 1 OF {TOTAL}</div>
        <div style={{ fontSize:34, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.02em", lineHeight:1.05, marginBottom:8 }}>What should we<br/>call you?</div>
        <div style={{ fontSize:14, color:T.text2, marginBottom:28, lineHeight:1.5 }}>Your training plan will be built around you.</div>
        <input
          value={name} onChange={e=>setName(e.target.value)}
          placeholder="Your full name"
          style={{
            width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:16, padding:"18px 20px", color:T.text1, fontSize:17,
            fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box", marginBottom:24,
          }}
        />
        <ContinueBtn onClick={next} disabled={!name.trim()}>CONTINUE</ContinueBtn>
      </div>
    </Slide>,

    // ── 1: AGE ─────────────────────────────────────────────────────────────
    <Slide key={1}>
      <IllustrationTarget/>
      <div style={{ padding:"0 28px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <BackBtn onClick={back}/>
          <div style={{ flex:1 }}><StepBar step={1}/></div>
        </div>
        <div style={{ fontSize:11, color:T.orange, fontWeight:700, letterSpacing:"0.12em", marginTop:24, marginBottom:10 }}>STEP 2 OF {TOTAL}</div>
        <div style={{ fontSize:34, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.02em", lineHeight:1.05, marginBottom:8 }}>How old are you?</div>
        <div style={{ fontSize:14, color:T.text2, marginBottom:28, lineHeight:1.5 }}>Used to calibrate your training zones and recovery.</div>
        <ScrollPicker min={13} max={80} value={age} onChange={setAge}/>
        <div style={{ textAlign:"center", fontSize:13, color:T.text2, marginBottom:28, marginTop:6 }}>years old</div>
        <ContinueBtn onClick={next}>CONTINUE</ContinueBtn>
      </div>
    </Slide>,

    // ── 2: BODY STATS ──────────────────────────────────────────────────────
    <Slide key={2}>
      <IllustrationBody/>
      <div style={{ padding:"0 28px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <BackBtn onClick={back}/>
          <div style={{ flex:1 }}><StepBar step={2}/></div>
        </div>
        <div style={{ fontSize:11, color:T.orange, fontWeight:700, letterSpacing:"0.12em", marginTop:24, marginBottom:10 }}>STEP 3 OF {TOTAL}</div>
        <div style={{ fontSize:34, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.02em", lineHeight:1.05, marginBottom:8 }}>Your body stats</div>
        <div style={{ fontSize:14, color:T.text2, marginBottom:20, lineHeight:1.5 }}>Helps tailor intensity, load targets, and BMI tracking.</div>

        {/* Weight */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:700, color:T.text2, letterSpacing:"0.1em" }}>WEIGHT</span>
            <div style={{ display:"flex", background:T.surface, borderRadius:20, padding:3, border:"1px solid rgba(255,255,255,0.08)" }}>
              {["kg","lb"].map(u => (
                <button key={u} onClick={()=>setWeightUnit(u)} style={{
                  padding:"5px 16px", borderRadius:16, border:"none", cursor:"pointer",
                  background: weightUnit===u ? T.orange : "transparent",
                  color: weightUnit===u ? "#0D0F09" : T.text2,
                  fontSize:12, fontWeight:700, fontFamily:"'Barlow',sans-serif",
                  transition:"all 0.2s",
                }}>{u.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <ScrollPicker
            min={weightUnit==="kg" ? 40 : 88}
            max={weightUnit==="kg" ? 160 : 352}
            value={weightKg}
            onChange={setWeightKg}
          />
          <div style={{ textAlign:"center", fontSize:13, color:T.text2, marginTop:6 }}>{weightUnit}</div>
        </div>

        {/* Height */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.text2, letterSpacing:"0.1em", marginBottom:12 }}>HEIGHT</div>
          <div style={{ position:"relative" }}>
            <input
              type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value)}
              placeholder="175"
              style={{
                width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:16, padding:"16px 56px 16px 20px", color:T.text1, fontSize:18,
                fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, outline:"none", boxSizing:"border-box",
              }}
            />
            <span style={{ position:"absolute", right:18, top:"50%", transform:"translateY(-50%)", color:T.text2, fontSize:13, fontWeight:600 }}>cm</span>
          </div>
        </div>
        <ContinueBtn onClick={next} disabled={!heightCm}>CONTINUE</ContinueBtn>
      </div>
    </Slide>,

    // ── 3: LIFTING ─────────────────────────────────────────────────────────
    <Slide key={3}>
      <IllustrationBarbell/>
      <div style={{ padding:"0 28px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <BackBtn onClick={back}/>
          <div style={{ flex:1 }}><StepBar step={3}/></div>
        </div>
        <div style={{ fontSize:11, color:T.orange, fontWeight:700, letterSpacing:"0.12em", marginTop:20, marginBottom:10 }}>STEP 4 OF {TOTAL}</div>
        <div style={{ fontSize:34, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.02em", lineHeight:1.05, marginBottom:8 }}>Lifting experience?</div>
        <div style={{ fontSize:14, color:T.text2, marginBottom:20, lineHeight:1.5 }}>Sets the baseline for your strength programming.</div>
        <LevelCard label="New to the gym" desc="Just getting started or don't track lifts yet" color="61,191,130" selected={liftLevel==="new"} onClick={()=>setLiftLevel("new")}/>
        <LevelCard label="I lift regularly" desc="I track my numbers and know my working weights" color="212,224,32" selected={liftLevel==="experienced"} onClick={()=>setLiftLevel("experienced")}/>
        {liftLevel === "experienced" && (
          <div style={{ marginTop:4 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.text2, letterSpacing:"0.1em", marginBottom:12 }}>ONE REP MAX — 1RM (kg)</div>
            {lifts.map((l,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                <select value={l.name} onChange={e=>updateLift(i,"name",e.target.value)} style={{
                  flex:1.8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, padding:"13px 14px", color:l.name?T.text1:T.text2,
                  fontSize:13, fontFamily:"'Barlow',sans-serif", outline:"none",
                }}>
                  <option value="">Lift {i+1}</option>
                  {LIFT_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <div style={{ position:"relative", flex:1 }}>
                  <input type="number" value={l.weight} onChange={e=>updateLift(i,"weight",e.target.value)} placeholder="0" style={{
                    width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:14, padding:"13px 34px 13px 14px", color:T.text1,
                    fontSize:14, fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box",
                  }}/>
                  <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:T.text2, fontSize:11 }}>kg</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {err && <div style={{ color:"#E05858", fontSize:13, margin:"10px 0", padding:"10px 14px", background:"rgba(224,88,88,0.1)", borderRadius:10 }}>{err}</div>}
        <div style={{ marginTop:16 }}>
          <ContinueBtn onClick={next} disabled={!liftLevel}>CONTINUE</ContinueBtn>
        </div>
      </div>
    </Slide>,

    // ── 4: RUNNING ─────────────────────────────────────────────────────────
    <Slide key={4}>
      <IllustrationRunner/>
      <div style={{ padding:"0 28px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <BackBtn onClick={back}/>
          <div style={{ flex:1 }}><StepBar step={4}/></div>
        </div>
        <div style={{ fontSize:11, color:T.orange, fontWeight:700, letterSpacing:"0.12em", marginTop:20, marginBottom:10 }}>STEP 5 OF {TOTAL}</div>
        <div style={{ fontSize:34, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.02em", lineHeight:1.05, marginBottom:8 }}>How's your running?</div>
        <div style={{ fontSize:14, color:T.text2, marginBottom:20, lineHeight:1.5 }}>Calibrates your pacing targets and Hyrox run splits.</div>
        <LevelCard label="New to running" desc="Don't run regularly or just getting started" color="61,191,130" selected={runLevel==="new"} onClick={()=>setRunLevel("new")}/>
        <LevelCard label="I run regularly" desc="I know my pace and track my distances" color="212,224,32" selected={runLevel==="experienced"} onClick={()=>setRunLevel("experienced")}/>
        {runLevel === "experienced" && (
          <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.text2, letterSpacing:"0.1em", marginBottom:10 }}>EASY JOG PACE</div>
              <div style={{ position:"relative" }}>
                <input value={jogPace} onChange={e=>setJogPace(e.target.value)} placeholder="5:30" style={{
                  width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, padding:"15px 90px 15px 18px", color:T.text1,
                  fontSize:16, fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box",
                }}/>
                <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:T.text2, fontSize:12, fontWeight:600 }}>min/km</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.text2, letterSpacing:"0.1em", marginBottom:10 }}>COMFORTABLE DISTANCE</div>
              <div style={{ position:"relative" }}>
                <input type="number" value={jogDist} onChange={e=>setJogDist(e.target.value)} placeholder="5" style={{
                  width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, padding:"15px 50px 15px 18px", color:T.text1,
                  fontSize:16, fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box",
                }}/>
                <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:T.text2, fontSize:12, fontWeight:600 }}>km</span>
              </div>
            </div>
          </div>
        )}
        {err && <div style={{ color:"#E05858", fontSize:13, margin:"10px 0", padding:"10px 14px", background:"rgba(224,88,88,0.1)", borderRadius:10 }}>{err}</div>}
        <div style={{ marginTop:16 }}>
          <ContinueBtn onClick={finish} disabled={!runLevel || saving}>
            {saving ? "SETTING UP…" : "LET'S GO →"}
          </ContinueBtn>
        </div>
      </div>
    </Slide>,
  ];

  return (
    <div style={{
      maxWidth:430, margin:"0 auto", minHeight:"100vh",
      background:T.bg, fontFamily:"'Barlow',sans-serif", color:T.text1,
      overflowX:"hidden",
    }}>
      {screens[step]}
    </div>
  );
}

function Slide({ children }) {
  return (
    <div
      style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        animation:"fadeInUp 0.3s ease both",
      }}
    >
      {children}
    </div>
  );
}
