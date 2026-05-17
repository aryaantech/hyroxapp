import { useState } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#0D0F09", surface:"#161810", card:"#1E2118",
  border:"rgba(255,255,255,0.06)", borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020", orangeL:"rgba(212,224,32,0.13)", orangeM:"rgba(212,224,32,0.24)",
  green:"#3DBF82", greenL:"rgba(61,191,130,0.13)",
  text1:"#F5F5F0", text2:"#6B6D5C",
};

const LIFTS = ["Back Squat","Bench Press","Deadlift","Overhead Press","Pull Ups","Front Squat","Romanian Deadlift","Hip Thrust"];

function Label({ children }) {
  return <div style={{fontSize:12,fontWeight:700,color:T.text2,letterSpacing:"0.1em",marginBottom:8}}>{children}</div>;
}

function Inp({ value, onChange, placeholder, type="text", unit }) {
  return (
    <div style={{position:"relative"}}>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width:"100%", background:T.surface, border:`1px solid ${T.borderM}`,
          borderRadius:14, padding:`15px ${unit?"48px":"18px"} 15px 18px`,
          color:T.text1, fontSize:16, fontFamily:"'Barlow',sans-serif",
          outline:"none", boxSizing:"border-box",
        }}
      />
      {unit && <span style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",color:T.text2,fontSize:13,fontWeight:600}}>{unit}</span>}
    </div>
  );
}

function OptionCard({ label, sub, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", background:selected?T.orangeL:T.surface,
      border:`1px solid ${selected?T.orange:T.borderM}`,
      borderRadius:14, padding:"18px", textAlign:"left", cursor:"pointer",
      transition:"all 0.2s", marginBottom:10,
    }}>
      <div style={{fontSize:15,fontWeight:700,color:selected?T.orange:T.text1,fontFamily:"'Barlow',sans-serif"}}>{label}</div>
      {sub && <div style={{fontSize:12,color:T.text2,marginTop:4}}>{sub}</div>}
    </button>
  );
}

function LiftRow({ index, name, weight, onName, onWeight }) {
  return (
    <div style={{display:"flex",gap:10,marginBottom:10}}>
      <select
        value={name} onChange={e=>onName(e.target.value)}
        style={{
          flex:1.6, background:T.surface, border:`1px solid ${T.borderM}`,
          borderRadius:14, padding:"14px 14px", color:name?T.text1:T.text2,
          fontSize:14, fontFamily:"'Barlow',sans-serif", outline:"none",
        }}
      >
        <option value="">Lift {index+1}</option>
        {LIFTS.map(l=><option key={l} value={l}>{l}</option>)}
      </select>
      <div style={{position:"relative",flex:1}}>
        <input
          type="number" value={weight} onChange={e=>onWeight(e.target.value)}
          placeholder="0"
          style={{
            width:"100%", background:T.surface, border:`1px solid ${T.borderM}`,
            borderRadius:14, padding:"14px 36px 14px 14px",
            color:T.text1, fontSize:14, fontFamily:"'Barlow',sans-serif",
            outline:"none", boxSizing:"border-box",
          }}
        />
        <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:T.text2,fontSize:12}}>kg</span>
      </div>
    </div>
  );
}

function Progress({ step, total }) {
  return (
    <div style={{display:"flex",gap:6,marginBottom:36}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{
          flex:1, height:3, borderRadius:2,
          background: i < step ? T.orange : i === step ? T.orangeM : T.border,
          transition:"background 0.3s",
        }}/>
      ))}
    </div>
  );
}

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — basics
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 1 — lifting
  const [liftLevel, setLiftLevel] = useState(""); // new | experienced
  const [lifts, setLifts] = useState([
    {name:"",weight:""},{name:"",weight:""},{name:"",weight:""},
  ]);

  // Step 2 — running
  const [runLevel, setRunLevel] = useState(""); // new | experienced
  const [jogPace, setJogPace] = useState("");
  const [jogDist, setJogDist] = useState("");

  const TOTAL = 3;

  function updateLift(i, field, val) {
    setLifts(prev => prev.map((l,idx)=>idx===i?{...l,[field]:val}:l));
  }

  async function finish() {
    setSaving(true);
    const profileLifts = liftLevel === "experienced"
      ? lifts.filter(l=>l.name).reduce((acc,l,i)=>({
          ...acc,
          [`lift${i+1}_name`]:l.name,
          [`lift${i+1}_weight`]:parseFloat(l.weight)||null,
        }),{})
      : {};

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: name.trim(),
      age: parseInt(age)||null,
      height_cm: parseFloat(height)||null,
      weight_kg: parseFloat(weight)||null,
      lifting_level: liftLevel,
      ...profileLifts,
      running_level: runLevel,
      jog_pace: runLevel === "experienced" ? jogPace : null,
      jog_distance_km: runLevel === "experienced" ? parseFloat(jogDist)||null : null,
      onboarded: true,
    });
    setSaving(false);
    if (!error) onComplete();
  }

  const nextStep = () => setStep(s=>s+1);

  const canNext0 = name.trim() && age && height && weight;
  const canNext1 = liftLevel !== "";
  const canNext2 = runLevel !== "";

  // ── STEP 0: Basics ──────────────────────────────────────────────────────
  if (step === 0) return (
    <Screen>
      <Progress step={0} total={TOTAL}/>
      <StepHeader sup="LET'S GET STARTED" title="Tell us about yourself"/>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
        <div><Label>FULL NAME</Label><Inp value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
        <div><Label>AGE</Label><Inp value={age} onChange={e=>setAge(e.target.value)} placeholder="25" type="number" unit="yrs"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><Label>HEIGHT</Label><Inp value={height} onChange={e=>setHeight(e.target.value)} placeholder="175" type="number" unit="cm"/></div>
          <div><Label>WEIGHT</Label><Inp value={weight} onChange={e=>setWeight(e.target.value)} placeholder="75" type="number" unit="kg"/></div>
        </div>
      </div>
      <NextBtn disabled={!canNext0} onClick={nextStep}>NEXT →</NextBtn>
    </Screen>
  );

  // ── STEP 1: Lifting ──────────────────────────────────────────────────────
  if (step === 1) return (
    <Screen>
      <Progress step={1} total={TOTAL}/>
      <StepHeader sup="STRENGTH BACKGROUND" title="What's your lifting experience?"/>
      <OptionCard
        label="New to the gym"
        sub="I'm just getting started or don't track lifts yet"
        selected={liftLevel==="new"}
        onClick={()=>setLiftLevel("new")}
      />
      <OptionCard
        label="I lift regularly"
        sub="I track my lifts and know my numbers"
        selected={liftLevel==="experienced"}
        onClick={()=>setLiftLevel("experienced")}
      />
      {liftLevel === "experienced" && (
        <div style={{marginTop:4}}>
          <Label>YOUR BEST LIFTS (1RM or working weight)</Label>
          {lifts.map((l,i)=>(
            <LiftRow key={i} index={i} name={l.name} weight={l.weight}
              onName={v=>updateLift(i,"name",v)}
              onWeight={v=>updateLift(i,"weight",v)}
            />
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <BackBtn onClick={()=>setStep(0)}/>
        <NextBtn disabled={!canNext1} onClick={nextStep} flex>NEXT →</NextBtn>
      </div>
    </Screen>
  );

  // ── STEP 2: Running ──────────────────────────────────────────────────────
  if (step === 2) return (
    <Screen>
      <Progress step={2} total={TOTAL}/>
      <StepHeader sup="CARDIO BACKGROUND" title="How's your running?"/>
      <OptionCard
        label="New to running"
        sub="I don't run regularly or just getting started"
        selected={runLevel==="new"}
        onClick={()=>setRunLevel("new")}
      />
      <OptionCard
        label="I run regularly"
        sub="I know my pace and track my distances"
        selected={runLevel==="experienced"}
        onClick={()=>setRunLevel("experienced")}
      />
      {runLevel === "experienced" && (
        <div style={{marginTop:4,display:"flex",flexDirection:"column",gap:12}}>
          <div><Label>EASY JOG PACE</Label><Inp value={jogPace} onChange={e=>setJogPace(e.target.value)} placeholder="5:30" unit="min/km"/></div>
          <div><Label>COMFORTABLE DISTANCE</Label><Inp value={jogDist} onChange={e=>setJogDist(e.target.value)} placeholder="5" type="number" unit="km"/></div>
        </div>
      )}
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <BackBtn onClick={()=>setStep(1)}/>
        <NextBtn disabled={!canNext2} onClick={finish} flex>
          {saving ? "SAVING..." : "LET'S GO ✓"}
        </NextBtn>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div style={{
      minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column",
      justifyContent:"center", padding:"32px 24px", maxWidth:430, margin:"0 auto",
      fontFamily:"'Barlow',sans-serif", boxSizing:"border-box",
    }}>
      {children}
    </div>
  );
}

function StepHeader({ sup, title }) {
  return (
    <div style={{marginBottom:28}}>
      <div style={{fontSize:11,fontWeight:700,color:T.orange,letterSpacing:"0.12em",marginBottom:8}}>{sup}</div>
      <div style={{fontSize:32,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em",lineHeight:1.1}}>{title}</div>
    </div>
  );
}

function NextBtn({ children, disabled, onClick, flex }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: flex ? 1 : undefined,
      width: flex ? undefined : "100%",
      padding:"17px", borderRadius:14, border:"none",
      background: disabled ? T.border : T.orange,
      color: disabled ? T.text2 : "#0D0F09",
      fontSize:15, fontWeight:800, fontFamily:"'Barlow',sans-serif",
      letterSpacing:"0.06em", cursor: disabled ? "default" : "pointer",
      transition:"all 0.2s",
    }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"17px 20px", borderRadius:14, border:`1px solid ${T.borderM}`,
      background:"none", color:T.text2, fontSize:15, fontWeight:700,
      fontFamily:"'Barlow',sans-serif", cursor:"pointer",
    }}>←</button>
  );
}
