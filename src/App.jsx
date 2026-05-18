import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Onboarding from "./Onboarding";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const T = {
  bg:"#0D0F09", surface:"#161810", card:"#1E2118",
  border:"rgba(255,255,255,0.06)", borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020", orangeL:"rgba(212,224,32,0.13)", orangeM:"rgba(212,224,32,0.24)",
  green:"#3DBF82",  greenL:"rgba(61,191,130,0.13)",
  purple:"#8B7FF0", purpleL:"rgba(139,127,240,0.13)",
  blue:"#5B9CF6",   blueL:"rgba(91,156,246,0.13)",
  red:"#E05858",    redL:"rgba(224,88,88,0.13)",
  amber:"#F0C030",  amberL:"rgba(240,192,48,0.13)",
  text1:"#F5F5F0", text2:"#6B6D5C", text3:"#353628",
};

// ─── EXERCISE LIBRARY ────────────────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  "Legs":[
    {name:"Back Squat",unit:"kg",notes:"Barbell on upper back, squat to parallel"},
    {name:"Front Squat",unit:"kg",notes:"Barbell in front rack position"},
    {name:"Goblet Squat",unit:"kg",notes:"Hold dumbbell/kettlebell at chest"},
    {name:"Bulgarian Split Squat",unit:"kg",notes:"Rear foot elevated, front leg drives"},
    {name:"Romanian Deadlift",unit:"kg",notes:"Hip hinge, bar stays close to body"},
    {name:"Conventional Deadlift",unit:"kg",notes:"Hip width stance, double overhand"},
    {name:"Sumo Deadlift",unit:"kg",notes:"Wide stance, toes out, grip inside"},
    {name:"Trap Bar Deadlift",unit:"kg",notes:"Neutral grip, stand inside bar"},
    {name:"Leg Press",unit:"kg",notes:"Full range, don't lock out knees"},
    {name:"Leg Extension",unit:"kg",notes:"Controlled eccentric"},
    {name:"Leg Curl (Lying)",unit:"kg",notes:"Full ROM, squeeze at top"},
    {name:"Leg Curl (Seated)",unit:"kg",notes:"Slow eccentric"},
    {name:"Walking Lunges",unit:"kg",notes:"Back knee to floor each step"},
    {name:"Reverse Lunges",unit:"kg",notes:"Step back, drop back knee"},
    {name:"Step Ups",unit:"kg",notes:"Drive through front heel"},
    {name:"Hip Thrust",unit:"kg",notes:"Shoulders on bench, drive hips up"},
    {name:"Glute Bridge",unit:"kg",notes:"Barbell across hips"},
    {name:"Nordic Curl",unit:"bw",notes:"Ankle anchored, lower slowly"},
    {name:"Calf Raise",unit:"kg",notes:"Full ROM top to bottom"},
    {name:"Hack Squat",unit:"kg",notes:"Machine, lower chest to pads"},
    {name:"Box Squat",unit:"kg",notes:"Sit back onto box, controlled"},
    {name:"Pause Squat",unit:"kg",notes:"3 second pause at bottom"},
  ],
  "Push":[
    {name:"Bench Press",unit:"kg",notes:"Bar to chest, drive up"},
    {name:"Incline Bench Press",unit:"kg",notes:"30–45 degree incline"},
    {name:"Decline Bench Press",unit:"kg",notes:"Lower chest focus"},
    {name:"Dumbbell Bench Press",unit:"kg",notes:"Greater ROM than barbell"},
    {name:"Overhead Press",unit:"kg",notes:"Bar from front rack, press overhead"},
    {name:"Push Press",unit:"kg",notes:"Dip and drive with legs"},
    {name:"Arnold Press",unit:"kg",notes:"Rotate from palms-in to palms-out"},
    {name:"Dips",unit:"bw",notes:"Lean forward for chest, upright for triceps"},
    {name:"Weighted Dips",unit:"kg",notes:"Belt with plate"},
    {name:"Push Ups",unit:"bw",notes:"Full plank position"},
    {name:"Lateral Raise",unit:"kg",notes:"Raise to shoulder height"},
    {name:"Front Raise",unit:"kg",notes:"Arms forward to shoulder height"},
    {name:"Tricep Pushdown",unit:"kg",notes:"Elbows tucked, cable or band"},
    {name:"Skull Crushers",unit:"kg",notes:"Lower bar to forehead"},
    {name:"Close Grip Bench",unit:"kg",notes:"Shoulder width grip"},
    {name:"Landmine Press",unit:"kg",notes:"Single arm, angled press"},
    {name:"Cable Fly",unit:"kg",notes:"Arms wide, squeeze at centre"},
  ],
  "Pull":[
    {name:"Pull Ups",unit:"bw",notes:"Full dead hang, chin over bar"},
    {name:"Weighted Pull Ups",unit:"kg",notes:"Belt with plate"},
    {name:"Chin Ups",unit:"bw",notes:"Supinated grip, bicep focused"},
    {name:"Lat Pulldown",unit:"kg",notes:"Wide grip, pull to upper chest"},
    {name:"Bent Over Row",unit:"kg",notes:"Hinge to 45°, row to lower chest"},
    {name:"Pendlay Row",unit:"kg",notes:"Deadstop each rep from floor"},
    {name:"Dumbbell Row",unit:"kg",notes:"Single arm, pull to hip"},
    {name:"Cable Row",unit:"kg",notes:"Seated, elbows back, chest up"},
    {name:"Face Pull",unit:"kg",notes:"Rope, pull to face, elbows high"},
    {name:"Shrugs",unit:"kg",notes:"Full trap contraction"},
    {name:"Barbell Curl",unit:"kg",notes:"Supinated grip, full ROM"},
    {name:"Hammer Curl",unit:"kg",notes:"Neutral grip, brachialis"},
    {name:"Incline Dumbbell Curl",unit:"kg",notes:"Full stretch at bottom"},
    {name:"Preacher Curl",unit:"kg",notes:"Arm braced, isolates bicep"},
    {name:"Ring Row",unit:"bw",notes:"Feet elevated for difficulty"},
    {name:"Rack Pull",unit:"kg",notes:"Deadlift from knee height"},
  ],
  "Core":[
    {name:"Plank",unit:"sec",notes:"Neutral spine, don't let hips sag"},
    {name:"Side Plank",unit:"sec",notes:"Hip stacked, maintain alignment"},
    {name:"Ab Wheel Rollout",unit:"reps",notes:"Brace hard, control descent"},
    {name:"Hanging Leg Raise",unit:"reps",notes:"Dead hang, legs to 90°"},
    {name:"Toes to Bar",unit:"reps",notes:"Full ROM, kip or strict"},
    {name:"GHD Sit Up",unit:"reps",notes:"Full extension at bottom"},
    {name:"GHD Back Extension",unit:"reps",notes:"Full hip extension at top"},
    {name:"Dead Bug",unit:"reps",notes:"Lower back pressed to floor"},
    {name:"Bird Dog",unit:"reps",notes:"Opposite arm/leg, controlled"},
    {name:"Russian Twist",unit:"kg",notes:"Rotate side to side, feet off floor"},
    {name:"Cable Crunch",unit:"kg",notes:"Rope attachment, crunch through hips"},
    {name:"Hollow Hold",unit:"sec",notes:"Lower back pressed down"},
    {name:"L-Sit",unit:"sec",notes:"Legs parallel, parallel bars"},
    {name:"Pallof Press",unit:"kg",notes:"Anti-rotation, press and hold"},
    {name:"Suitcase Carry",unit:"kg",notes:"Single side load, anti-lateral flexion"},
  ],
  "Hyrox":[
    {name:"Ski Erg",unit:"m",notes:"Full body pull, maintain rhythm"},
    {name:"Sled Push",unit:"kg",notes:"Low hips, drive with legs"},
    {name:"Sled Pull",unit:"kg",notes:"Backward walk, rope hand over hand"},
    {name:"Burpee Broad Jump",unit:"m",notes:"Explosive jump forward"},
    {name:"Rowing (Erg)",unit:"m",notes:"Legs, hips, arms sequence"},
    {name:"Farmers Carry",unit:"kg",notes:"Packed shoulders, quick steps"},
    {name:"Sandbag Lunges",unit:"kg",notes:"Full knee extension each rep"},
    {name:"Wall Balls",unit:"kg",notes:"Deep squat, explosive drive"},
    {name:"Sled Push Intervals",unit:"kg",notes:"Short bursts 10–25m"},
    {name:"Assault Bike",unit:"cal",notes:"Arms and legs, constant output"},
  ],
  "Olympic":[
    {name:"Power Clean",unit:"kg",notes:"Catch in quarter squat"},
    {name:"Hang Power Clean",unit:"kg",notes:"Start from hang"},
    {name:"Clean & Jerk",unit:"kg",notes:"Full clean + split jerk"},
    {name:"Power Snatch",unit:"kg",notes:"Wide grip, quarter squat catch"},
    {name:"Snatch",unit:"kg",notes:"Full squat catch overhead"},
    {name:"Clean Pull",unit:"kg",notes:"Triple extension, no catch"},
    {name:"Push Jerk",unit:"kg",notes:"Dip, drive, press under"},
    {name:"Split Jerk",unit:"kg",notes:"Split stance catch"},
  ],
  "Cardio":[
    {name:"Run",unit:"km",notes:"Track pace and distance"},
    {name:"Cycling",unit:"km",notes:"Road or stationary"},
    {name:"Jump Rope",unit:"min",notes:"Single or double unders"},
    {name:"Box Jumps",unit:"reps",notes:"Land softly, full extension"},
    {name:"Broad Jump",unit:"m",notes:"Max horizontal distance"},
    {name:"Shuttle Runs",unit:"m",notes:"10–20m back and forth"},
    {name:"Battle Ropes",unit:"sec",notes:"Alternating waves"},
    {name:"Burpees",unit:"reps",notes:"Chest to floor, jump at top"},
  ],
};
const ALL_EXERCISES = Object.entries(EXERCISE_LIBRARY).flatMap(([cat,exs])=>exs.map(e=>({...e,category:cat})));

// ─── HYROX MODES ────────────────────────────────────────────────────────────
const HYROX_BASE_STATIONS = [
  {name:"Ski Erg",          detail:"1,000m", tip:"Full body pull, maintain rhythm"},
  {name:"Sled Push",        detail:"50m×2",  tip:"Low hips, drive with legs"},
  {name:"Sled Pull",        detail:"50m×2",  tip:"Backward walk, rope hand over hand"},
  {name:"Burpee Broad Jump",detail:"80m",    tip:"Explosive jump each rep"},
  {name:"Rowing",           detail:"1,000m", tip:"Legs, hips, arms sequence"},
  {name:"Farmers Carry",    detail:"200m",   tip:"Packed shoulders, quick steps"},
  {name:"Sandbag Lunges",   detail:"100m",   tip:"Full knee extension"},
  {name:"Wall Balls",       detail:"100 reps (75 Open Women)",tip:"Deep squat, explosive drive"},
];
const HYROX_MODES = {
  "Pro Men":   {color:T.orange, weights:["—","202kg","153kg","—","—","2×32kg","30kg","9kg · 10ft"]},
  "Pro Women": {color:T.purple, weights:["—","152kg","103kg","—","—","2×24kg","20kg","6kg · 9ft"]},
  "Open Men":  {color:T.blue,   weights:["—","152kg","103kg","—","—","2×24kg","20kg","6kg · 10ft"]},
  "Open Women":{color:T.green,  weights:["—","102kg","78kg", "—","—","2×16kg","10kg","4kg · 9ft"]},
};

const WORKOUT_TEMPLATES = [
  // ── UPPER ──────────────────────────────────────────────────────────────
  {id:"upper-1",tag:"STRENGTH",category:"UPPER",name:"Push / Pull Power",exercises:[
    {name:"Bench Press",sets:4,reps:"5",weight:"75kg",category:"Push"},
    {name:"Bent Over Row",sets:4,reps:"5",weight:"70kg",category:"Pull"},
    {name:"Overhead Press",sets:3,reps:"6",weight:"50kg",category:"Push"},
    {name:"Weighted Pull Ups",sets:3,reps:"5",weight:"10kg",category:"Pull"},
    {name:"Dips",sets:3,reps:"8",weight:"BW",category:"Push"},
  ]},
  {id:"upper-2",tag:"STRENGTH",category:"UPPER",name:"Chest & Triceps",exercises:[
    {name:"Incline Bench Press",sets:4,reps:"8",weight:"65kg",category:"Push"},
    {name:"Dumbbell Bench Press",sets:3,reps:"10",weight:"30kg",category:"Push"},
    {name:"Cable Fly",sets:3,reps:"12",weight:"15kg",category:"Push"},
    {name:"Skull Crushers",sets:3,reps:"10",weight:"30kg",category:"Push"},
    {name:"Tricep Pushdown",sets:3,reps:"12",weight:"20kg",category:"Push"},
  ]},
  {id:"upper-3",tag:"STRENGTH",category:"UPPER",name:"Back & Biceps",exercises:[
    {name:"Pull Ups",sets:4,reps:"8",weight:"BW",category:"Pull"},
    {name:"Pendlay Row",sets:4,reps:"6",weight:"70kg",category:"Pull"},
    {name:"Lat Pulldown",sets:3,reps:"10",weight:"60kg",category:"Pull"},
    {name:"Barbell Curl",sets:3,reps:"10",weight:"35kg",category:"Pull"},
    {name:"Hammer Curl",sets:3,reps:"12",weight:"16kg",category:"Pull"},
  ]},
  {id:"upper-4",tag:"STRENGTH",category:"UPPER",name:"Shoulder Assault",exercises:[
    {name:"Overhead Press",sets:5,reps:"5",weight:"55kg",category:"Push"},
    {name:"Push Press",sets:3,reps:"6",weight:"65kg",category:"Push"},
    {name:"Lateral Raise",sets:4,reps:"15",weight:"10kg",category:"Push"},
    {name:"Face Pull",sets:3,reps:"15",weight:"25kg",category:"Pull"},
    {name:"Arnold Press",sets:3,reps:"10",weight:"20kg",category:"Push"},
  ]},
  // ── LOWER ──────────────────────────────────────────────────────────────
  {id:"lower-1",tag:"STRENGTH",category:"LOWER",name:"Squat Focus",exercises:[
    {name:"Back Squat",sets:5,reps:"5",weight:"90kg",category:"Legs"},
    {name:"Pause Squat",sets:3,reps:"3",weight:"70kg",category:"Legs"},
    {name:"Leg Press",sets:3,reps:"12",weight:"120kg",category:"Legs"},
    {name:"Leg Curl (Lying)",sets:3,reps:"12",weight:"40kg",category:"Legs"},
    {name:"Calf Raise",sets:4,reps:"15",weight:"60kg",category:"Legs"},
  ]},
  {id:"lower-2",tag:"STRENGTH",category:"LOWER",name:"Deadlift Day",exercises:[
    {name:"Conventional Deadlift",sets:4,reps:"5",weight:"100kg",category:"Legs"},
    {name:"Romanian Deadlift",sets:3,reps:"8",weight:"70kg",category:"Legs"},
    {name:"Good Morning",sets:3,reps:"10",weight:"40kg",category:"Legs"},
    {name:"Nordic Curl",sets:3,reps:"5",weight:"BW",category:"Legs"},
    {name:"Leg Curl (Seated)",sets:3,reps:"12",weight:"35kg",category:"Legs"},
  ]},
  {id:"lower-3",tag:"STRENGTH",category:"LOWER",name:"Glute & Hamstring",exercises:[
    {name:"Hip Thrust",sets:4,reps:"10",weight:"90kg",category:"Legs"},
    {name:"Romanian Deadlift",sets:4,reps:"10",weight:"65kg",category:"Legs"},
    {name:"Bulgarian Split Squat",sets:3,reps:"10",weight:"40kg",category:"Legs"},
    {name:"Glute Bridge",sets:3,reps:"15",weight:"60kg",category:"Legs"},
    {name:"Leg Curl (Lying)",sets:3,reps:"12",weight:"35kg",category:"Legs"},
  ]},
  {id:"lower-4",tag:"STRENGTH",category:"LOWER",name:"Leg Volume",exercises:[
    {name:"Front Squat",sets:4,reps:"8",weight:"60kg",category:"Legs"},
    {name:"Hack Squat",sets:3,reps:"10",weight:"80kg",category:"Legs"},
    {name:"Walking Lunges",sets:3,reps:"12",weight:"20kg",category:"Legs"},
    {name:"Leg Extension",sets:3,reps:"15",weight:"40kg",category:"Legs"},
    {name:"Step Ups",sets:3,reps:"12",weight:"20kg",category:"Legs"},
  ]},
  // ── CORE ───────────────────────────────────────────────────────────────
  {id:"core-1",tag:"STRENGTH",category:"CORE",name:"Core Stability",exercises:[
    {name:"Plank",sets:4,reps:"60",weight:"BW",category:"Core"},
    {name:"Dead Bug",sets:3,reps:"12",weight:"BW",category:"Core"},
    {name:"Pallof Press",sets:3,reps:"12",weight:"15kg",category:"Core"},
    {name:"Bird Dog",sets:3,reps:"10",weight:"BW",category:"Core"},
    {name:"Hollow Hold",sets:3,reps:"45",weight:"BW",category:"Core"},
  ]},
  {id:"core-2",tag:"STRENGTH",category:"CORE",name:"Ab Destroyer",exercises:[
    {name:"Hanging Leg Raise",sets:4,reps:"12",weight:"BW",category:"Core"},
    {name:"Ab Wheel Rollout",sets:3,reps:"10",weight:"BW",category:"Core"},
    {name:"Cable Crunch",sets:3,reps:"15",weight:"25kg",category:"Core"},
    {name:"Toes to Bar",sets:3,reps:"10",weight:"BW",category:"Core"},
    {name:"Russian Twist",sets:3,reps:"20",weight:"10kg",category:"Core"},
  ]},
  {id:"core-3",tag:"STRENGTH",category:"CORE",name:"Anti-Rotation Circuit",exercises:[
    {name:"Pallof Press",sets:4,reps:"12",weight:"20kg",category:"Core"},
    {name:"Suitcase Carry",sets:3,reps:"30m",weight:"24kg",category:"Core"},
    {name:"L-Sit",sets:3,reps:"20",weight:"BW",category:"Core"},
    {name:"Side Plank",sets:3,reps:"45",weight:"BW",category:"Core"},
    {name:"GHD Back Extension",sets:3,reps:"12",weight:"BW",category:"Core"},
  ]},
  // ── CARDIO ─────────────────────────────────────────────────────────────
  {id:"cardio-1",tag:"CARDIO",category:"CARDIO",name:"HIIT Circuit",exercises:[
    {name:"Burpees",sets:5,reps:"10",weight:"BW",category:"Cardio"},
    {name:"Box Jumps",sets:5,reps:"8",weight:"BW",category:"Cardio"},
    {name:"Battle Ropes",sets:5,reps:"30",weight:"BW",category:"Cardio"},
    {name:"Shuttle Runs",sets:5,reps:"20m",weight:"BW",category:"Cardio"},
  ]},
  {id:"cardio-2",tag:"CARDIO",category:"CARDIO",name:"Conditioning Blast",exercises:[
    {name:"Assault Bike",sets:6,reps:"15cal",weight:"BW",category:"Cardio"},
    {name:"Burpee Broad Jump",sets:4,reps:"10m",weight:"BW",category:"Hyrox"},
    {name:"Wall Balls",sets:4,reps:"15",weight:"9kg",category:"Hyrox"},
    {name:"Jump Rope",sets:5,reps:"60",weight:"BW",category:"Cardio"},
  ]},
  {id:"cardio-3",tag:"CARDIO",category:"CARDIO",name:"Engine Builder",exercises:[
    {name:"Rowing (Erg)",sets:4,reps:"500m",weight:"BW",category:"Hyrox"},
    {name:"Ski Erg",sets:4,reps:"250m",weight:"BW",category:"Hyrox"},
    {name:"Broad Jump",sets:4,reps:"5",weight:"BW",category:"Cardio"},
    {name:"Burpees",sets:4,reps:"10",weight:"BW",category:"Cardio"},
  ]},
  // ── HYBRID ─────────────────────────────────────────────────────────────
  {id:"hybrid-1",tag:"CUSTOM",category:"HYBRID",name:"Full Body Athletic",exercises:[
    {name:"Power Clean",sets:4,reps:"4",weight:"65kg",category:"Olympic"},
    {name:"Front Squat",sets:3,reps:"6",weight:"60kg",category:"Legs"},
    {name:"Push Press",sets:3,reps:"6",weight:"55kg",category:"Push"},
    {name:"Pull Ups",sets:3,reps:"8",weight:"BW",category:"Pull"},
    {name:"Farmers Carry",sets:3,reps:"40m",weight:"32kg",category:"Hyrox"},
  ]},
  {id:"hybrid-2",tag:"CUSTOM",category:"HYBRID",name:"Strength & Cardio Combo",exercises:[
    {name:"Back Squat",sets:4,reps:"6",weight:"80kg",category:"Legs"},
    {name:"Bench Press",sets:4,reps:"6",weight:"70kg",category:"Push"},
    {name:"Rowing (Erg)",sets:3,reps:"500m",weight:"BW",category:"Hyrox"},
    {name:"Bent Over Row",sets:3,reps:"8",weight:"60kg",category:"Pull"},
    {name:"Burpees",sets:3,reps:"10",weight:"BW",category:"Cardio"},
  ]},
  {id:"hybrid-3",tag:"CUSTOM",category:"HYBRID",name:"Push / Pull / Carry",exercises:[
    {name:"Overhead Press",sets:4,reps:"6",weight:"50kg",category:"Push"},
    {name:"Weighted Pull Ups",sets:4,reps:"5",weight:"10kg",category:"Pull"},
    {name:"Suitcase Carry",sets:4,reps:"30m",weight:"28kg",category:"Core"},
    {name:"Dips",sets:3,reps:"10",weight:"BW",category:"Push"},
    {name:"Farmers Carry",sets:3,reps:"40m",weight:"28kg",category:"Hyrox"},
  ]},
  {id:"hybrid-4",tag:"CUSTOM",category:"HYBRID",name:"Olympic + Strength",exercises:[
    {name:"Hang Power Clean",sets:5,reps:"3",weight:"70kg",category:"Olympic"},
    {name:"Back Squat",sets:4,reps:"5",weight:"85kg",category:"Legs"},
    {name:"Push Jerk",sets:4,reps:"3",weight:"60kg",category:"Olympic"},
    {name:"Romanian Deadlift",sets:3,reps:"8",weight:"70kg",category:"Legs"},
  ]},
  // ── HYROX ──────────────────────────────────────────────────────────────
  {id:"hyrox-s",tag:"HYROX",category:"HYROX",name:"Hyrox Strength",exercises:[
    {name:"Sled Push",sets:4,reps:"25m",weight:"80kg",category:"Hyrox"},
    {name:"Farmers Carry",sets:4,reps:"50m",weight:"32kg",category:"Hyrox"},
    {name:"Sandbag Lunges",sets:3,reps:"20m",weight:"20kg",category:"Hyrox"},
    {name:"Wall Balls",sets:4,reps:"15",weight:"9kg",category:"Hyrox"},
  ]},
  {id:"hyrox-2",tag:"HYROX",category:"HYROX",name:"Station Skills",exercises:[
    {name:"Ski Erg",sets:5,reps:"250m",weight:"BW",category:"Hyrox"},
    {name:"Sled Pull",sets:4,reps:"25m",weight:"78kg",category:"Hyrox"},
    {name:"Burpee Broad Jump",sets:4,reps:"15m",weight:"BW",category:"Hyrox"},
    {name:"Wall Balls",sets:5,reps:"20",weight:"9kg",category:"Hyrox"},
    {name:"Rowing (Erg)",sets:3,reps:"500m",weight:"BW",category:"Hyrox"},
  ]},
  {id:"hyrox-3",tag:"HYROX",category:"HYROX",name:"Run & Work Intervals",exercises:[
    {name:"Rowing (Erg)",sets:4,reps:"1000m",weight:"BW",category:"Hyrox"},
    {name:"Sled Push",sets:4,reps:"50m",weight:"60kg",category:"Hyrox"},
    {name:"Sandbag Lunges",sets:4,reps:"25m",weight:"20kg",category:"Hyrox"},
    {name:"Assault Bike",sets:4,reps:"30cal",weight:"BW",category:"Cardio"},
  ]},
];

const RUN_TYPES = [
  {id:"easy",   label:"Easy Run",  zone:"Z2",  color:T.green, bg:T.greenL, pace:"5:20–5:40",hr:"130–145"},
  {id:"tempo",  label:"Tempo",     zone:"Z3–4",color:T.orange,bg:T.orangeL,pace:"4:40–5:00",hr:"155–170"},
  {id:"interval",label:"Intervals",zone:"Z5",  color:T.red,   bg:T.redL,   pace:"4:00–4:20",hr:"175+"},
  {id:"hyrox",  label:"Hyrox Pace",zone:"Race",color:T.purple,bg:T.purpleL,pace:"5:00–5:15",hr:"160–175"},
];

const TAG_STYLE={HYROX:{bg:T.purpleL,color:T.purple},STRENGTH:{bg:T.orangeL,color:T.orange},RUN:{bg:T.greenL,color:T.green},CUSTOM:{bg:T.blueL,color:T.blue},CARDIO:{bg:T.redL,color:T.red}};
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const fmtMs=ms=>{const s=Math.floor(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;};
const today=()=>new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"});
const haversineKm=(a,b)=>{const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLon=(b.lon-a.lon)*Math.PI/180,x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────
const Pill=({label,type="STRENGTH"})=>{const c=TAG_STYLE[type]||TAG_STYLE.STRENGTH;return <span style={{background:c.bg,color:c.color,fontSize:10,fontWeight:700,letterSpacing:"0.07em",padding:"3px 9px",borderRadius:20}}>{label}</span>;};
const Divider=()=><div style={{height:"0.5px",background:T.border}}/>;
const SL=({children,mb=10})=><div style={{fontSize:11,fontWeight:700,color:T.text2,letterSpacing:"0.09em",marginBottom:mb}}>{children}</div>;
const Btn=({children,onClick,color=T.orange,style={}})=>{const isYellow=color===T.orange;return <button onClick={onClick} style={{background:color,color:isYellow?"#0D0F09":"#fff",border:"none",borderRadius:50,padding:"14px 0",fontWeight:800,fontSize:15,cursor:"pointer",letterSpacing:"0.04em",width:"100%",...style}}>{children}</button>;};
const GhostBtn=({children,onClick,style={}})=><button onClick={onClick} style={{background:T.card,color:T.text2,border:`1px solid ${T.borderM}`,borderRadius:50,padding:"13px 0",fontWeight:600,fontSize:13,cursor:"pointer",width:"100%",...style}}>{children}</button>;
const sBtn={width:32,height:32,borderRadius:10,border:`1px solid ${T.borderM}`,background:T.card,color:T.text1,cursor:"pointer",fontWeight:700,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"};
const sBtnStyle={width:32,height:32,borderRadius:10,border:`1px solid ${T.borderM}`,background:T.card,color:T.text1,cursor:"pointer",fontWeight:700,fontSize:15};

// ─── AI ANALYSIS ────────────────────────────────────────────────────────────
function AIAnalysis({workout,history}){
  const [data,setData]=useState(null);const [loading,setLoading]=useState(false);
  const run=async()=>{
    setLoading(true);
    const sets=workout.exercises?.map(ex=>`${ex.name}:\n${(ex.setLogs||[]).map((s,i)=>`  Set ${i+1}: ${s.reps} @ ${s.weight} — time ${fmtMs(s.duration||0)}, rest ${fmtMs(s.restAfter||0)}`).join("\n")||"  none"}`).join("\n\n")||"No set data";
    const prev=history.filter(h=>h.name===workout.name).slice(0,3).map(h=>`${h.date}: ${h.exercises?.map(e=>e.name+" "+e.setLogs?.map(s=>s.weight).join("/")).join(", ")}`).join("\n")||"No previous sessions";
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Expert S&C coach. Analyse this session. Return ONLY valid JSON.\n\nWorkout: ${workout.name}\nDuration: ${fmt(workout.duration||0)}\n\nSets:\n${sets}\n\nPrevious:\n${prev}\n\n{"summary":"2-3 sentences","strengths":["..."],"improvements":["..."],"nextSession":["...","...","..."],"progressionAdvice":"one paragraph","recoveryAdvice":"brief tip"}`}]})});
      const d=await res.json();
      const txt=d.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setData(JSON.parse(txt));
    }catch{setData({summary:"Could not connect to AI — check network.",strengths:[],improvements:[],nextSession:[],progressionAdvice:"",recoveryAdvice:""});}
    setLoading(false);
  };
  if(!data&&!loading)return <div style={{marginTop:14}}><Btn onClick={run} color={T.purple}>Get AI Analysis</Btn></div>;
  if(loading)return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:20,marginTop:14,textAlign:"center"}}><div style={{fontSize:13,color:T.text2}}>Analysing...</div></div>;
  return(
    <div style={{marginTop:14}}>
      <SL>AI ANALYSIS</SL>
      <div style={{background:T.card,border:`1px solid ${T.purpleL}`,borderRadius:14,padding:18}}>
        <div style={{fontSize:14,color:T.text1,lineHeight:1.65,marginBottom:16}}>{data.summary}</div>
        {[{t:"STRENGTHS",items:data.strengths,c:T.green},{t:"IMPROVE",items:data.improvements,c:T.orange},{t:"NEXT SESSION",items:data.nextSession,c:T.blue}].map(({t,items,c})=>items?.length>0&&(
          <div key={t} style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"0.08em",marginBottom:6}}>{t}</div>
            {items.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><div style={{width:4,height:4,borderRadius:"50%",background:c,marginTop:7,flexShrink:0}}/><div style={{fontSize:13,color:T.text1,lineHeight:1.5}}>{item}</div></div>)}
          </div>
        ))}
        {data.progressionAdvice&&<div style={{background:T.blueL,borderRadius:10,padding:"11px 14px",marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:T.blue,marginBottom:4}}>PROGRESSION</div><div style={{fontSize:13,color:T.text1,lineHeight:1.5}}>{data.progressionAdvice}</div></div>}
        {data.recoveryAdvice&&<div style={{background:T.greenL,borderRadius:10,padding:"11px 14px"}}><div style={{fontSize:10,fontWeight:700,color:T.green,marginBottom:4}}>RECOVERY</div><div style={{fontSize:13,color:T.text1,lineHeight:1.5}}>{data.recoveryAdvice}</div></div>}
      </div>
    </div>
  );
}

// ─── AI EXERCISE ADDER ───────────────────────────────────────────────────────
function AIExerciseAdder({onAdd,onClose}){
  const [q,setQ]=useState("");const [r,setR]=useState(null);const [loading,setLoading]=useState(false);
  const find=async()=>{
    if(!q.trim())return;setLoading(true);
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:`Return ONLY a JSON object for this exercise: "${q}". Keys: name, category (Legs/Push/Pull/Core/Hyrox/Olympic/Cardio), unit (kg/bw/m/sec/reps/cal), notes (one coaching cue). No other text.`}]})});
      const d=await res.json();const txt=d.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setR(JSON.parse(txt));
    }catch{setR({name:q,category:"Cardio",unit:"reps",notes:"Custom exercise"});}
    setLoading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
      <div style={{width:"100%",maxWidth:430,margin:"0 auto",background:T.surface,borderRadius:"20px 20px 0 0",padding:24,paddingBottom:40}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:17,fontWeight:800,color:T.text1}}>Add with AI</div>
          <button onClick={onClose} style={sBtnStyle}>✕</button>
        </div>
        <div style={{fontSize:13,color:T.text2,marginBottom:14,lineHeight:1.5}}>Type any exercise name — AI will fill in the details.</div>
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&find()} placeholder="e.g. Zercher Squat..." style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card,color:T.text1,fontSize:14}}/>
          <button onClick={find} style={{padding:"12px 18px",background:T.orange,color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer"}}>{loading?"...":"Find"}</button>
        </div>
        {r&&<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text1,marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:12,color:T.text2,marginBottom:3}}>{r.category} · {r.unit}</div>
          <div style={{fontSize:12,color:T.text2,lineHeight:1.5,marginBottom:12}}>{r.notes}</div>
          <Btn onClick={()=>{onAdd(r);onClose();}} color={T.green}>Add to Library</Btn>
        </div>}
      </div>
    </div>
  );
}

// ─── EXERCISE TUTORIAL MODAL (AI-powered) ────────────────────────────────────
function ExerciseGifModal({name,onClose}){
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [err,setErr]=useState(false);
  useEffect(()=>{
    fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      model:"claude-haiku-4-20250514",max_tokens:600,
      messages:[{role:"user",content:`Expert S&C coach. Give a tutorial for the exercise: "${name}". Return ONLY valid JSON with these exact keys:\n{"primaryMuscles":["muscle1","muscle2"],"secondaryMuscles":["muscle1"],"setup":"1-2 sentence setup position description","cues":["cue1","cue2","cue3","cue4"],"mistakes":["mistake1","mistake2","mistake3"],"proTip":"one actionable coaching tip"}`}]
    })})
    .then(r=>r.json())
    .then(d=>{
      const txt=d.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setData(JSON.parse(txt));setLoading(false);
    })
    .catch(()=>{setErr(true);setLoading(false);});
  },[name]);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:430,background:T.surface,borderRadius:"22px 22px 0 0",padding:"22px 20px 44px",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* Handle bar */}
        <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:"0 auto 18px"}}/>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em",marginBottom:2}}>{name.toUpperCase()}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.purple}}/>
              <span style={{fontSize:10,fontWeight:700,color:T.purple,letterSpacing:"0.08em"}}>AI COACHING GUIDE</span>
            </div>
          </div>
          <button onClick={onClose} style={sBtnStyle}>✕</button>
        </div>

        {/* Loading */}
        {loading&&(
          <div style={{textAlign:"center",padding:"44px 0"}}>
            <div style={{width:36,height:36,border:`3px solid ${T.border}`,borderTopColor:T.purple,borderRadius:"50%",margin:"0 auto 16px",animation:"spin 0.8s linear infinite"}}/>
            <div style={{fontSize:13,fontWeight:700,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif"}}>Loading tutorial…</div>
            <div style={{fontSize:11,color:T.text2}}>Asking your AI coach</div>
          </div>
        )}

        {/* Error */}
        {!loading&&err&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:13,color:T.text2}}>Could not load tutorial. Check your server is running.</div>
          </div>
        )}

        {/* Content */}
        {!loading&&!err&&data&&(<>

          {/* Muscles */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,fontWeight:700,color:T.text2,letterSpacing:"0.1em",marginBottom:8}}>PRIMARY MUSCLES</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {data.primaryMuscles?.map((m,i)=>(
                <span key={i} style={{background:T.orangeL,border:`1px solid ${T.orange}44`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:700,color:T.orange,textTransform:"capitalize"}}>{m}</span>
              ))}
            </div>
            {data.secondaryMuscles?.length>0&&<>
              <div style={{fontSize:9,fontWeight:700,color:T.text2,letterSpacing:"0.1em",marginBottom:8,marginTop:10}}>SECONDARY</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {data.secondaryMuscles.map((m,i)=>(
                  <span key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,color:T.text2,textTransform:"capitalize"}}>{m}</span>
                ))}
              </div>
            </>}
          </div>

          <div style={{height:"0.5px",background:T.border,marginBottom:16}}/>

          {/* Setup */}
          {data.setup&&(
            <div style={{background:T.card,borderRadius:14,padding:"14px 16px",marginBottom:16,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.blue}`}}>
              <div style={{fontSize:9,fontWeight:700,color:T.blue,letterSpacing:"0.1em",marginBottom:6}}>SETUP POSITION</div>
              <div style={{fontSize:13,color:T.text1,lineHeight:1.6}}>{data.setup}</div>
            </div>
          )}

          {/* Coaching cues */}
          {data.cues?.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,fontWeight:700,color:T.text2,letterSpacing:"0.1em",marginBottom:10}}>COACHING CUES</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {data.cues.map((cue,i)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:T.orangeL,border:`1px solid ${T.orange}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:T.orange,flexShrink:0,marginTop:1}}>{i+1}</div>
                    <div style={{fontSize:13,color:T.text1,lineHeight:1.55,flex:1}}>{cue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common mistakes */}
          {data.mistakes?.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,fontWeight:700,color:T.red,letterSpacing:"0.1em",marginBottom:10}}>COMMON MISTAKES</div>
              <div style={{background:T.redL,borderRadius:14,padding:"12px 14px",border:`1px solid ${T.red}33`}}>
                {data.mistakes.map((m,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<data.mistakes.length-1?8:0}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:T.red,flexShrink:0,marginTop:6}}/>
                    <div style={{fontSize:12,color:T.text1,lineHeight:1.5}}>{m}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro tip */}
          {data.proTip&&(
            <div style={{background:T.amberL,borderRadius:14,padding:"14px 16px",border:`1px solid ${T.amber}44`}}>
              <div style={{fontSize:9,fontWeight:700,color:T.amber,letterSpacing:"0.1em",marginBottom:6}}>PRO TIP</div>
              <div style={{fontSize:13,color:T.text1,lineHeight:1.6}}>{data.proTip}</div>
            </div>
          )}
        </>)}
      </div>
    </div>
  );
}

// ─── EXERCISE PICKER ─────────────────────────────────────────────────────────
function ExercisePicker({extraLibrary,onSelect,onClose}){
  const [search,setSearch]=useState("");const [cat,setCat]=useState("All");const [showAI,setShowAI]=useState(false);const [gifEx,setGifEx]=useState(null);
  const allLib=[...ALL_EXERCISES,...extraLibrary];
  const cats=["All",...Object.keys(EXERCISE_LIBRARY)];
  const filtered=allLib.filter(e=>(cat==="All"||e.category===cat)&&e.name.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
      <div style={{background:T.surface,padding:"18px 16px 12px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:17,fontWeight:800,color:T.text1}}>Exercise Library</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowAI(true)} style={{padding:"7px 12px",background:T.purpleL,color:T.purple,border:`1px solid rgba(107,92,231,0.3)`,borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ AI Add</button>
            <button onClick={onClose} style={sBtnStyle}>✕</button>
          </div>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card,color:T.text1,fontSize:14,marginBottom:10}}/>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{flexShrink:0,padding:"5px 13px",borderRadius:20,border:`1px solid ${cat===c?T.orange:T.border}`,background:cat===c?T.orangeL:T.card,color:cat===c?T.orange:T.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{c}</button>)}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"4px 16px 100px"}}>
        {filtered.map((ex,i)=>(
          <div key={i} onClick={()=>{onSelect(ex);onClose();}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:`0.5px solid ${T.border}`,cursor:"pointer"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text1}}>{ex.name}</div>
              <div style={{fontSize:11,color:T.text2,marginTop:2}}>{ex.category} · {ex.notes}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8}}>
              <button onClick={e=>{e.stopPropagation();setGifEx(ex.name);}} style={{width:26,height:26,borderRadius:"50%",background:T.purpleL,border:`1px solid ${T.purple}44`,color:T.purple,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>▶</button>
              <div style={{fontSize:20,color:T.text3}}>+</div>
            </div>
          </div>
        ))}
      </div>
      {showAI&&<AIExerciseAdder onAdd={ex=>extraLibrary.push({...ex,category:ex.category||"Cardio"})} onClose={()=>setShowAI(false)}/>}
      {gifEx&&<ExerciseGifModal name={gifEx} onClose={()=>setGifEx(null)}/>}
    </div>
  );
}

// ─── WORKOUT BUILDER ─────────────────────────────────────────────────────────
function WorkoutBuilder({extraLibrary,onSave,onClose}){
  const [name,setName]=useState("");const [exs,setExs]=useState([]);const [picker,setPicker]=useState(false);
  const addEx=ex=>setExs(p=>[...p,{...ex,sets:3,reps:"10",weight:""}]);
  const upd=(i,k,v)=>setExs(p=>{const n=[...p];n[i]={...n[i],[k]:v};return n;});
  const rem=i=>setExs(p=>p.filter((_,idx)=>idx!==i));
  const canSave=name.trim()&&exs.length>0;
  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:150,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>

      {/* ── Header ── */}
      <div style={{background:T.surface,padding:"16px 16px 18px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <button onClick={onClose} style={sBtnStyle}>←</button>
          <div style={{flex:1}}>
            <div style={{fontSize:22,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>BUILD WORKOUT</div>
            <div style={{fontSize:11,color:T.text2,marginTop:1}}>{exs.length>0?`${exs.length} exercise${exs.length>1?"s":""} added`:"Create a custom session"}</div>
          </div>
          {exs.length>0&&<div style={{background:T.orangeL,borderRadius:12,padding:"6px 12px",border:`1px solid ${T.orange}44`}}>
            <div style={{fontSize:18,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{exs.length}</div>
            <div style={{fontSize:8,color:T.orange,letterSpacing:"0.06em",marginTop:1}}>EX</div>
          </div>}
        </div>
        <div style={{position:"relative"}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name your workout…"
            style={{width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px solid ${name?T.orange:T.borderM}`,background:T.card,color:T.text1,fontSize:16,fontWeight:700,letterSpacing:"0.01em",transition:"border-color 0.2s"}}/>
          {name&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",width:8,height:8,borderRadius:"50%",background:T.orange}}/>}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 130px"}}>

        {/* Empty state */}
        {exs.length===0&&(
          <div style={{textAlign:"center",paddingTop:32,paddingBottom:24}}>
            <div style={{width:80,height:80,background:T.orangeL,borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",border:`1px solid ${T.orange}33`}}>
              <div style={{fontSize:34,color:T.orange,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif"}}>+</div>
            </div>
            <div style={{fontSize:18,fontWeight:800,color:T.text1,marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>No exercises yet</div>
            <div style={{fontSize:13,color:T.text2,lineHeight:1.65,marginBottom:28,maxWidth:260,margin:"0 auto 28px"}}>Tap "Add Exercise" below to start building. You can search from 130+ exercises or ask AI to add a custom one.</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:8}}>
              {["Upper","Lower","Core","Cardio","Olympic","Hyrox"].map(c=>(
                <button key={c} onClick={()=>setPicker(true)} style={{padding:"8px 16px",borderRadius:20,border:`1px solid ${T.border}`,background:T.card,color:T.text2,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.04em"}}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise cards */}
        {exs.map((ex,i)=>(
          <div key={i} className="card-enter" style={{background:T.card,border:`1px solid ${T.borderM}`,borderRadius:18,padding:"16px",marginBottom:12,borderLeft:`3px solid ${T.orange}`}}>
            {/* Exercise header row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <div style={{width:22,height:22,borderRadius:6,background:T.orangeL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:T.orange,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:15,fontWeight:800,color:T.text1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</div>
                </div>
                <div style={{fontSize:11,color:T.text2,marginLeft:30}}>{ex.category} · {ex.unit||"kg"}</div>
              </div>
              <button onClick={()=>rem(i)} style={{width:28,height:28,borderRadius:8,background:T.redL,border:`1px solid ${T.red}33`,color:T.red,cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}>✕</button>
            </div>
            {/* Sets / Reps / Weight inputs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["SETS","sets","3"],["REPS","reps","10"],["WEIGHT","weight","60kg"]].map(([label,key,ph])=>(
                <div key={key} style={{background:T.surface,borderRadius:12,padding:"10px 10px 8px",border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>{label}</div>
                  <input value={ex[key]} onChange={e=>upd(i,key,e.target.value)} placeholder={ph}
                    style={{width:"100%",background:"transparent",border:"none",color:T.text1,fontSize:16,fontWeight:900,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}/>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add more (when exercises exist) */}
        {exs.length>0&&(
          <button onClick={()=>setPicker(true)} style={{width:"100%",padding:"14px",border:`1.5px dashed ${T.orange}55`,borderRadius:16,background:T.orangeL,color:T.orange,fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.04em"}}>+ Add Another Exercise</button>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"14px 16px 32px",background:T.bg,borderTop:`1px solid ${T.border}`}}>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setPicker(true)} style={{flex:1,padding:"14px",background:T.card,border:`1.5px solid ${T.orange}66`,borderRadius:50,color:T.orange,fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.04em",fontFamily:"'Barlow Condensed',sans-serif"}}>+ ADD EXERCISE</button>
          <Btn onClick={()=>canSave&&onSave({id:`custom-${Date.now()}`,name:name.trim(),tag:"CUSTOM",exercises:exs})} color={T.green} style={{flex:1,opacity:canSave?1:0.35,fontSize:13,letterSpacing:"0.04em",fontFamily:"'Barlow Condensed',sans-serif"}}>SAVE ({exs.length})</Btn>
        </div>
      </div>

      {picker&&<ExercisePicker extraLibrary={extraLibrary} onSelect={addEx} onClose={()=>setPicker(false)}/>}
    </div>
  );
}

// ─── EXIT CONFIRM MODAL ──────────────────────────────────────────────────────
function ExitConfirmModal({onSave,onDiscard,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{width:"100%",maxWidth:360,background:T.surface,borderRadius:22,padding:"28px 24px",border:`1px solid ${T.border}`}}>
        <div style={{fontSize:18,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em",marginBottom:6}}>EXIT WORKOUT?</div>
        <div style={{fontSize:13,color:T.text2,lineHeight:1.55,marginBottom:24}}>You're mid-session. What would you like to do with the sets you've logged?</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Btn onClick={onSave} color={T.green}>Save Progress & Exit</Btn>
          <button onClick={onDiscard} style={{width:"100%",padding:"13px",background:T.redL,border:`1px solid ${T.red}44`,borderRadius:50,color:T.red,fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:"0.04em",fontFamily:"'Barlow Condensed',sans-serif"}}>Discard & Exit</button>
          <GhostBtn onClick={onCancel}>Continue Workout</GhostBtn>
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVE WORKOUT ──────────────────────────────────────────────────────────
function ActiveWorkout({workout,history,onDone,onBack}){
  const [phase,setPhase]=useState("ready");
  const [paused,setPaused]=useState(false);
  const [exIdx,setExIdx]=useState(0);
  const [gifEx,setGifEx]=useState(null);
  const [showExitModal,setShowExitModal]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [setLogs,setSetLogs]=useState(()=>workout.exercises.map(()=>[]));
  const [lastSetTime,setLastSetTime]=useState(null);
  const [weights,setWeights]=useState(()=>workout.exercises.map(e=>e.weight||""));
  const [reps,setReps]=useState(()=>workout.exercises.map(e=>String(e.reps)||""));
  const [restActive,setRestActive]=useState(false);
  const [restSecs,setRestSecs]=useState(0);
  const [restPreset,setRestPreset]=useState(90);
  const timerRef=useRef(null);const restRef=useRef(null);

  useEffect(()=>{if(phase==="active"&&!paused){timerRef.current=setInterval(()=>setElapsed(s=>s+1),1000);}else clearInterval(timerRef.current);return()=>clearInterval(timerRef.current);},[phase,paused]);
  useEffect(()=>{if(restActive&&restSecs>0)restRef.current=setInterval(()=>setRestSecs(s=>s-1),1000);else{clearInterval(restRef.current);if(restSecs===0&&restActive)setRestActive(false);}return()=>clearInterval(restRef.current);},[restActive,restSecs]);

  const logSet=()=>{
    const now=Date.now();const duration=lastSetTime?now-lastSetTime:0;
    setSetLogs(prev=>{const next=[...prev];next[exIdx]=[...next[exIdx],{reps:reps[exIdx],weight:weights[exIdx],duration,restAfter:0,timestamp:now}];return next;});
    setLastSetTime(now);setRestActive(true);setRestSecs(restPreset);
  };
  const deleteSet=(ei,si)=>setSetLogs(prev=>{const next=[...prev];next[ei]=next[ei].filter((_,idx)=>idx!==si);return next;});

  const totalSets=workout.exercises.reduce((a,e)=>a+e.sets,0);
  const doneSets=setLogs.reduce((a,l)=>a+l.length,0);
  const pct=Math.round(doneSets/totalSets*100);
  const curEx=workout.exercises[exIdx];
  const curLogs=setLogs[exIdx];
  const setsLeft=curEx?curEx.sets-curLogs.length:0;
  const restPct=restSecs/restPreset;
  const restCol=restSecs>restPreset*.5?T.green:restSecs>restPreset*.2?T.orange:T.red;

  if(phase==="done"){
    const doneW={...workout,duration:elapsed,exercises:workout.exercises.map((ex,i)=>({...ex,setLogs:setLogs[i]}))};
    return(
      <div style={{padding:"16px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
        <button onClick={onBack} style={{...sBtnStyle,marginBottom:20}}>←</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:44,marginBottom:8}}>🏁</div>
          <div style={{fontSize:28,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>Workout Complete</div>
          <div style={{fontSize:14,color:T.text2}}>{doneSets}/{totalSets} sets · {fmt(elapsed)}</div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
          {workout.exercises.map((ex,ei)=>(
            <div key={ei}>{ei>0&&<Divider/>}
              <div style={{padding:"13px 16px"}}>
                <div style={{fontSize:14,fontWeight:600,color:T.text1,marginBottom:8}}>{ex.name}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {setLogs[ei].map((s,si)=>(
                    <div key={si} style={{background:T.greenL,border:`1px solid rgba(29,158,117,0.2)`,borderRadius:10,padding:"8px 12px",position:"relative"}}>
                      <div style={{fontSize:11,fontWeight:700,color:T.green}}>Set {si+1}</div>
                      <div style={{fontSize:13,fontWeight:700,color:T.text1,marginTop:2}}>{s.reps}@{s.weight}</div>
                      {s.duration>0&&<div style={{fontSize:10,color:T.text3,marginTop:1}}>{fmtMs(s.duration)}</div>}
                    </div>
                  ))}
                  {setLogs[ei].length===0&&<div style={{fontSize:12,color:T.text3}}>No sets logged</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <AIAnalysis workout={doneW} history={history}/>
        <div style={{height:16}}/>
        <Btn onClick={()=>onDone(doneW)} color={T.green}>Save & Exit</Btn>
      </div>
    );
  }

  if(phase==="ready")return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",padding:"20px 20px 100px"}}>
      <button onClick={onBack} style={{...sBtnStyle,alignSelf:"flex-start",marginBottom:20}}>←</button>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,fontWeight:700,color:T.text2,letterSpacing:"0.12em",marginBottom:10}}>READY TO START</div>
          <div style={{fontSize:32,fontWeight:900,color:T.text1,marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>{workout.name}</div>
          <Pill label={workout.tag} type={workout.tag}/>
          <div style={{fontSize:13,color:T.text2,marginTop:12}}>{workout.exercises.length} exercises · {totalSets} total sets</div>
        </div>
        <div style={{background:T.card,borderRadius:20,padding:"6px 0",marginBottom:20,overflow:"hidden",border:`1px solid ${T.border}`}}>
          {workout.exercises.map((ex,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:i<workout.exercises.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{flex:1,fontSize:14,fontWeight:600,color:T.text1}}>{ex.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <div style={{fontSize:12,color:T.text2,background:T.surface,padding:"3px 10px",borderRadius:20}}>{ex.sets}×{ex.reps} {ex.weight&&`· ${ex.weight}`}</div>
                <button onClick={()=>setGifEx(ex.name)} style={{width:24,height:24,borderRadius:"50%",background:T.purpleL,border:`1px solid ${T.purple}44`,color:T.purple,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>▶</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,background:T.card,borderRadius:16,padding:"14px 16px",marginBottom:20,border:`1px solid ${T.border}`}}>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:T.text1}}>Rest between sets</div><div style={{fontSize:11,color:T.text2,marginTop:2}}>Adjust before starting</div></div>
          <button onClick={()=>setRestPreset(p=>Math.max(15,p-15))} style={sBtnStyle}>−</button>
          <span style={{fontSize:18,fontWeight:800,color:T.orange,minWidth:44,textAlign:"center"}}>{restPreset}s</span>
          <button onClick={()=>setRestPreset(p=>Math.min(300,p+15))} style={sBtnStyle}>+</button>
        </div>
      </div>
      <Btn onClick={()=>setPhase("active")} color={T.orange} style={{fontSize:16,padding:18,letterSpacing:"0.06em",fontFamily:"'Barlow Condensed',sans-serif"}}>START WORKOUT</Btn>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:T.surface,padding:"12px 16px 12px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setShowExitModal(true)} style={{...sBtnStyle,flexShrink:0}}>←</button>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.text2,letterSpacing:"0.12em",marginBottom:2}}>{paused?"⏸ PAUSED":"● ACTIVE"} · {workout.name}</div>
              <div className={paused?"":"timer-glow"} style={{fontSize:28,fontWeight:900,color:paused?T.text2:T.orange,fontFamily:"'Barlow Condensed',sans-serif",fontVariantNumeric:"tabular-nums",letterSpacing:"0.03em"}}>{fmt(elapsed)}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setPaused(p=>!p)} style={{background:paused?T.orangeL:T.card,border:`1px solid ${paused?T.orange:T.borderM}`,borderRadius:20,padding:"8px 16px",color:paused?T.orange:T.text2,fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"'Barlow Condensed',sans-serif"}}>{paused?"▶ RESUME":"⏸ PAUSE"}</button>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif"}}>{pct}%</div>
              <div style={{fontSize:10,color:T.text2}}>{doneSets}/{totalSets} sets</div>
            </div>
          </div>
        </div>
        <div style={{height:4,background:T.border,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:4,width:`${pct}%`,background:`linear-gradient(90deg,${T.green},${T.orange})`,borderRadius:4,transition:"width 0.4s ease"}}/>
        </div>
      </div>

      <div style={{flex:1,padding:"12px 16px 90px",overflowY:"auto"}}>
        {/* Exercise nav — asymmetric pill chips */}
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {workout.exercises.map((ex,i)=>{
            const done=setLogs[i].length>=ex.sets;const active=i===exIdx;
            return(
              <button key={i} onClick={()=>setExIdx(i)} style={{flexShrink:0,padding:"6px 14px",borderRadius:active?"6px 20px 20px 6px":"20px",border:`1.5px solid ${active?T.orange:done?T.green:T.border}`,background:active?T.orangeL:done?T.greenL:T.card,color:active?T.orange:done?T.green:T.text2,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s",letterSpacing:"0.04em"}}>
                {done?"✓ ":""}{ex.name.split(" ").slice(0,2).join(" ")}
                <span style={{opacity:0.7,marginLeft:4}}>{setLogs[i].length}/{ex.sets}</span>
              </button>
            );
          })}
        </div>

        {curEx&&<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"18px 16px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{fontSize:22,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em",flex:1,minWidth:0}}>{curEx.name}</div>
                <button onClick={()=>setGifEx(curEx.name)} style={{width:28,height:28,borderRadius:"50%",background:T.purpleL,border:`1px solid ${T.purple}44`,color:T.purple,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} title="Exercise tutorial">▶</button>
              </div>
              <div style={{fontSize:12,color:T.text2}}>{curLogs.length}/{curEx.sets} sets · <span style={{color:setsLeft>0?T.orange:T.green,fontWeight:700}}>{setsLeft>0?`${setsLeft} left`:"All done"}</span></div>
            </div>
            <Pill label={curEx.category||workout.tag} type={workout.tag}/>
          </div>
          {/* Previous session benchmark */}
          {(()=>{const prev=history.flatMap(h=>h.exercises||[]).filter(e=>e.name===curEx.name&&e.setLogs?.length>0).slice(-1)[0];const ps=prev?.setLogs?.slice(-1)[0];if(!ps)return null;const suggested=ps.weight&&ps.weight!=="BW"?Math.ceil((parseFloat(ps.weight)||0)*1.025/2.5)*2.5:null;return(<div style={{background:T.orangeL,border:`1px solid ${T.orange}33`,borderRadius:12,padding:"9px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:10,fontWeight:800,color:T.orange,letterSpacing:"0.08em",flexShrink:0}}>LAST</div>
            <div style={{flex:1,fontSize:13,color:T.text1,fontWeight:600}}>{ps.reps} reps × {ps.weight&&ps.weight!=="BW"?`${ps.weight}kg`:"bodyweight"}</div>
            {suggested&&<div style={{fontSize:11,fontWeight:700,color:T.green,flexShrink:0}}>Try {suggested}kg ↑</div>}
          </div>);})()}
          {/* Reps + Weight inputs */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["REPS",reps,setReps],["WEIGHT",weights,setWeights]].map(([label,arr,setter])=>(
              <div key={label} style={{background:T.surface,borderRadius:14,padding:"12px 14px",border:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.text2,fontWeight:700,marginBottom:8,letterSpacing:"0.08em"}}>{label}</div>
                <input value={arr[exIdx]} onChange={e=>{const n=[...arr];n[exIdx]=e.target.value;setter(n);}} style={{width:"100%",background:"transparent",border:"none",color:T.text1,fontSize:22,fontWeight:900,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}/>
              </div>
            ))}
          </div>
          {/* Log set button */}
          <button onClick={logSet} disabled={setsLeft<=0||paused} style={{width:"100%",padding:"15px",background:setsLeft<=0?T.greenL:restActive?T.greenL:T.orange,color:setsLeft<=0?T.green:restActive?T.green:"#0D0F09",border:"none",borderRadius:50,fontSize:15,fontWeight:800,cursor:setsLeft>0&&!paused?"pointer":"default",letterSpacing:"0.05em",fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>
            {paused?"⏸ PAUSED — RESUME TO LOG":setsLeft<=0?"✓ ALL SETS DONE":restActive?`⏱ REST ${fmt(restSecs)} — TAP TO LOG NEXT SET`:`LOG SET ${curLogs.length+1} / ${curEx.sets}`}
          </button>
          {/* Rest bar */}
          {restActive&&<div style={{marginTop:10}}>
            <div style={{height:5,background:T.border,borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${restPct*100}%`,background:restCol,borderRadius:4,transition:"width 1s linear, background 0.3s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
              <span style={{fontSize:11,color:T.text2,fontWeight:600,letterSpacing:"0.06em"}}>REST</span>
              <span style={{fontSize:11,fontWeight:700,color:restCol,fontVariantNumeric:"tabular-nums"}}>{fmt(restSecs)}</span>
            </div>
          </div>}
          {/* Sets logged — clean table rows */}
          {curLogs.length>0&&<div style={{marginTop:16}}>
            <div style={{fontSize:10,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>SETS LOGGED</div>
            <div style={{background:T.surface,borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`}}>
              {curLogs.map((s,si)=>(
                <div key={si} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:si<curLogs.length-1?`1px solid ${T.border}`:"none"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:T.greenL,border:`1px solid ${T.green}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:T.green,flexShrink:0,marginRight:12}}>{si+1}</div>
                  <div style={{flex:1,display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:15,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",minWidth:52}}>{s.reps} reps</span>
                    <span style={{fontSize:11,color:T.text3}}>·</span>
                    <span style={{fontSize:15,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.weight||"bw"}</span>
                    {s.duration>0&&<span style={{fontSize:10,color:T.text3,marginLeft:"auto"}}>{fmtMs(s.duration)}</span>}
                  </div>
                  <button onClick={()=>deleteSet(exIdx,si)} style={{width:22,height:22,borderRadius:"50%",background:T.redL,border:`1px solid ${T.red}44`,color:T.red,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0,marginLeft:8}}>✕</button>
                </div>
              ))}
            </div>
          </div>}
        </div>}

        {/* Prev / Next / Finish */}
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          {exIdx>0&&<GhostBtn onClick={()=>setExIdx(i=>i-1)} style={{flex:1}}>← Prev</GhostBtn>}
          {exIdx<workout.exercises.length-1
            ?<Btn onClick={()=>setExIdx(i=>i+1)} color={T.blue} style={{flex:1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.05em"}}>NEXT EXERCISE →</Btn>
            :<Btn onClick={()=>setPhase("done")} color={T.green} style={{flex:1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.05em"}}>FINISH WORKOUT</Btn>}
        </div>
      </div>
      {gifEx&&<ExerciseGifModal name={gifEx} onClose={()=>setGifEx(null)}/>}
      {showExitModal&&<ExitConfirmModal
        onSave={()=>{const doneW={...workout,duration:elapsed,exercises:workout.exercises.map((ex,i)=>({...ex,setLogs:setLogs[i]}))};onDone(doneW);}}
        onDiscard={()=>onBack()}
        onCancel={()=>setShowExitModal(false)}
      />}
    </div>
  );
}

// ─── HYROX CUSTOM WORKOUT BUILDER ────────────────────────────────────────────
function HyroxCustomBuilder({onSave,onClose}){
  const [name,setName]=useState("My Hyrox Custom");
  const [stations,setStations]=useState(HYROX_BASE_STATIONS.map(s=>({...s,weight:"",reps:s.detail,enabled:true})));
  const upd=(i,k,v)=>setStations(p=>{const n=[...p];n[i]={...n[i],[k]:v};return n;});
  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:150,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
      <div style={{background:T.surface,padding:"18px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:17,fontWeight:800,color:T.text1}}>Custom Hyrox</div>
          <button onClick={onClose} style={sBtnStyle}>✕</button>
        </div>
        <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card,color:T.text1,fontSize:14,fontWeight:600}}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px 100px"}}>
        <div style={{fontSize:13,color:T.text2,marginBottom:14,lineHeight:1.5}}>Customise weights and reps for each station. Toggle stations on/off.</div>
        {stations.map((s,i)=>(
          <div key={i} style={{background:T.card,borderRadius:16,marginBottom:8,overflow:"hidden",border:`1px solid ${s.enabled?T.borderM:T.border}`,opacity:s.enabled?1:0.5}}>
            {/* Station header row */}
            <div style={{display:"flex",alignItems:"center",padding:"12px 14px",gap:12}}>
              <div style={{width:28,height:28,borderRadius:8,background:s.enabled?T.orangeL:T.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:s.enabled?T.orange:T.text3,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif"}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                <div style={{fontSize:10,color:T.text2,marginTop:1}}>{s.detail}</div>
              </div>
              <button onClick={()=>upd(i,"enabled",!s.enabled)} style={{width:44,height:24,borderRadius:12,border:"none",background:s.enabled?T.orange:"transparent",border:`1px solid ${s.enabled?T.orange:T.border}`,cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,transition:"left 0.2s",left:s.enabled?24:4}}/>
              </button>
            </div>
            {/* Inputs inline when enabled */}
            {s.enabled&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,borderTop:`1px solid ${T.border}`}}>
              <div style={{padding:"10px 14px",borderRight:`1px solid ${T.border}`}}>
                <div style={{fontSize:9,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:4}}>DISTANCE / REPS</div>
                <input value={s.reps} onChange={e=>upd(i,"reps",e.target.value)} placeholder={s.detail} style={{width:"100%",background:"transparent",border:"none",color:T.text1,fontSize:15,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}/>
              </div>
              <div style={{padding:"10px 14px"}}>
                <div style={{fontSize:9,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:4}}>WEIGHT</div>
                <input value={s.weight} onChange={e=>upd(i,"weight",e.target.value)} placeholder="e.g. 80kg" style={{width:"100%",background:"transparent",border:"none",color:T.orange,fontSize:15,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}/>
              </div>
            </div>}
          </div>
        ))}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"12px 16px 28px",background:T.bg,borderTop:`1px solid ${T.border}`}}>
        <Btn onClick={()=>onSave({id:`hyrox-custom-${Date.now()}`,name,stations:stations.filter(s=>s.enabled)})} color={T.orange}>Save Custom Hyrox</Btn>
      </div>
    </div>
  );
}

// ─── HYROX SIMULATION DETAIL ─────────────────────────────────────────────────
function HyroxSimDetail({sim,onDelete,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:180,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
      <div style={{background:T.surface,padding:"18px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:17,fontWeight:800,color:T.text1}}>{sim.name}</div><div style={{fontSize:12,color:T.text2,marginTop:2}}>{sim.date} · {fmt(sim.duration||0)}</div></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{if(window.confirm("Delete this simulation?"))onDelete();}} style={{...sBtnStyle,background:T.redL,color:T.red}}>🗑</button>
            <button onClick={onClose} style={sBtnStyle}>✕</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
          {[{val:fmt(sim.duration||0),label:"Total Time"},{val:sim.mode||"Custom",label:"Mode"},{val:sim.detail||"8 stations",label:"Format"},{val:sim.date,label:"Date"}].map((m,i)=>(
            <div key={i} style={{background:T.card,borderRadius:12,padding:"13px 14px",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:18,fontWeight:800,color:T.text1}}>{m.val}</div>
              <div style={{fontSize:11,color:T.text2,marginTop:3}}>{m.label}</div>
            </div>
          ))}
        </div>
        {sim.stationLogs&&sim.stationLogs.length>0&&<>
          <SL>STATION BREAKDOWN</SL>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
            {sim.stationLogs.map((s,i)=>(
              <div key={i}>{i>0&&<Divider/>}
                <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:14,fontWeight:600,color:T.text1}}>{s.phase==="run"?`Run #${s.runNum||i+1}`:`${s.name}`}</div>{s.weight&&s.weight!=="—"&&<div style={{fontSize:11,color:T.orange,marginTop:2}}>{s.weight}</div>}</div>
                  <div style={{fontSize:16,fontWeight:700,color:T.purple,fontVariantNumeric:"tabular-nums"}}>{fmt(s.split||0)}</div>
                </div>
              </div>
            ))}
          </div>
        </>}
        {sim.notes&&<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",marginTop:14}}><div style={{fontSize:11,color:T.text2,fontWeight:600,marginBottom:6}}>NOTES</div><div style={{fontSize:14,color:T.text1,lineHeight:1.6}}>{sim.notes}</div></div>}
      </div>
    </div>
  );
}

// ─── HYROX TAB ───────────────────────────────────────────────────────────────
function HyroxTab({logs,addLog,deleteLog}){
  const [mode,setMode]=useState(null);
  const [simActive,setSimActive]=useState(false);
  const [simPaused,setSimPaused]=useState(false);
  const [showSimExit,setShowSimExit]=useState(false);
  const [station,setStation]=useState(0);
  const [phase,setPhase]=useState("run");
  const [elapsed,setElapsed]=useState(0);
  const [stationLogs,setStationLogs]=useState([]);
  const [lastSplit,setLastSplit]=useState(0);
  const [showBuilder,setShowBuilder]=useState(false);
  const [savedCustoms,setSavedCustoms]=useState([]);
  const [detailSim,setDetailSim]=useState(null);
  const timerRef=useRef(null);

  useEffect(()=>{if(simActive&&!simPaused)timerRef.current=setInterval(()=>setElapsed(s=>s+1),1000);else clearInterval(timerRef.current);return()=>clearInterval(timerRef.current);},[simActive,simPaused]);

  const startSim=()=>{setSimActive(true);setStation(0);setPhase("run");setElapsed(0);setStationLogs([]);setLastSplit(0);};
  const next=()=>{
    const split=elapsed-lastSplit;
    const stations=mode&&mode!=="Custom"?HYROX_MODES[mode]:null;
    const curStation=HYROX_BASE_STATIONS[station];
    const entry=phase==="run"?{phase:"run",runNum:station+1,split}:{phase:"station",name:curStation.name,weight:stations?HYROX_MODES[mode].weights[station]:"—",split};
    setStationLogs(p=>[...p,entry]);setLastSplit(elapsed);
    if(phase==="run"){setPhase("station");}
    else if(station<7){setStation(s=>s+1);setPhase("run");}
    else{
      setSimActive(false);
      const finalLogs=[...stationLogs,entry];
      addLog({type:"HYROX",name:`${mode} Simulation`,duration:elapsed,date:today(),detail:"8 stations completed",mode,stationLogs:finalLogs});
      setStation(0);setPhase("run");
    }
  };

  const hyroxLogs=logs.filter(l=>l.type==="HYROX");
  const modeColor=mode&&mode!=="Custom"?HYROX_MODES[mode].color:T.orange;
  const stations=HYROX_BASE_STATIONS;

  if(showBuilder)return <HyroxCustomBuilder onSave={c=>{setSavedCustoms(p=>[c,...p]);setShowBuilder(false);}} onClose={()=>setShowBuilder(false)}/>;
  if(detailSim)return <SessionDetail log={detailSim} onDelete={()=>{deleteLog(detailSim._id);setDetailSim(null);}} onClose={()=>setDetailSim(null)}/>;

  if(simActive&&mode){
    const st=HYROX_BASE_STATIONS[station];const isRun=phase==="run";
    const w=mode!=="Custom"?HYROX_MODES[mode].weights[station]:"—";
    const splitElapsed=elapsed-lastSplit;
    return(
      <>
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",padding:"16px 20px 0"}}>
        <button onClick={()=>setShowSimExit(true)} style={{...sBtnStyle,alignSelf:"flex-start",marginBottom:16}}>←</button>
        <div style={{textAlign:"center",marginBottom:4}}>
          <span style={{fontSize:11,fontWeight:700,color:T.text2,letterSpacing:"0.1em"}}>{isRun?`RUN ${station+1} OF 8`:`STATION ${station+1} OF 8`}</span>
        </div>
        <div style={{textAlign:"center",marginBottom:6}}>
          <div className="timer-glow" style={{fontSize:80,fontWeight:900,color:T.text1,fontVariantNumeric:"tabular-nums",lineHeight:1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.02em"}}>{fmt(elapsed)}</div>
          <div style={{fontSize:12,color:T.text2,marginTop:2}}>total time</div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.borderM}`,borderRadius:16,padding:"18px 20px",marginBottom:12,textAlign:"center",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.orange,letterSpacing:"0.08em",marginBottom:6}}>{isRun?"RUNNING":"STATION"}</div>
          <div style={{fontSize:30,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.01em"}}>{isRun?"1 KM":st.name.toUpperCase()}</div>
          {!isRun&&<div style={{fontSize:14,color:T.text2,marginBottom:4}}>{st.detail}{w!=="—"?` · ${w}`:""}</div>}
          <div style={{fontSize:12,color:T.text3,lineHeight:1.5,marginBottom:14}}>{isRun?"Settle into race pace":st.tip}</div>
          <div style={{background:T.surface,borderRadius:10,padding:"10px 16px",display:"inline-flex",gap:10,alignItems:"center",alignSelf:"center"}}>
            <div style={{fontSize:11,color:T.text2}}>split</div>
            <div style={{fontSize:20,fontWeight:900,color:T.orange,fontVariantNumeric:"tabular-nums",fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(splitElapsed)}</div>
          </div>
          <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:16}}>
            {stations.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i<station?T.orange:i===station?T.text1:T.border,transition:"all 0.3s"}}/>)}
          </div>
          {stationLogs.length>0&&(
            <div style={{marginTop:14,display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
              {stationLogs.slice(-6).map((l,i)=>(
                <div key={i} style={{background:T.surface,borderRadius:20,padding:"4px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{fontSize:9,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif"}}>{l.phase==="run"?`R${l.runNum||i+1}`:l.name?.split(" ")[0]}</span>
                  <span style={{fontSize:10,fontWeight:700,color:T.text2,fontVariantNumeric:"tabular-nums"}}>{fmt(l.split||0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{paddingBottom:90,paddingTop:10,display:"flex",flexDirection:"column",gap:10}}>
          <Btn onClick={next} disabled={simPaused} color={simPaused?T.text3:T.orange} style={{fontSize:15,padding:15,letterSpacing:"0.06em",fontFamily:"'Barlow Condensed',sans-serif"}}>{simPaused?"⏸ PAUSED":isRun?"RUN DONE →":station<7?"STATION DONE →":"FINISH RACE"}</Btn>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setSimPaused(p=>!p)} style={{flex:1,padding:"13px",background:simPaused?T.orangeL:T.card,border:`1px solid ${simPaused?T.orange:T.borderM}`,borderRadius:50,color:simPaused?T.orange:T.text2,fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"'Barlow Condensed',sans-serif"}}>{simPaused?"▶ RESUME":"⏸ PAUSE"}</button>
            <GhostBtn onClick={()=>setShowSimExit(true)} style={{flex:1}}>Quit</GhostBtn>
          </div>
        </div>
      </div>
      {showSimExit&&<ExitConfirmModal
        onSave={()=>{
          const finalLogs=[...stationLogs];
          addLog({type:"HYROX",name:`${mode} Simulation`,duration:elapsed,date:today(),detail:`${stationLogs.length} splits logged`,mode,stationLogs:finalLogs});
          setSimActive(false);setShowSimExit(false);setStation(0);setPhase("run");
        }}
        onDiscard={()=>{setSimActive(false);setShowSimExit(false);setStation(0);setPhase("run");}}
        onCancel={()=>setShowSimExit(false)}
      />}
      </>
    );
  }

  if(!mode)return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{marginBottom:0}}><div style={{fontSize:34,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>HYROX</div><div style={{fontSize:13,color:T.text2,marginBottom:14}}>Select your competition division</div></div>
      <div style={{borderRadius:18,overflow:"hidden",marginBottom:20,position:"relative",height:180}}>
        <img src="/hyrox.jpg" alt="Hyrox" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(13,15,9,0) 40%,rgba(13,15,9,0.7) 100%)"}}/>
      </div>
      {hyroxLogs.length>0&&<>
        <SL>MY HYROX SESSIONS</SL>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:20}}>
          {hyroxLogs.map((l,i)=>(
            <div key={i}>{i>0&&<Divider/>}
              <div onClick={()=>setDetailSim(l)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",cursor:"pointer"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:T.text1}}>{l.name}</div><div style={{fontSize:12,color:T.text2,marginTop:2}}>{l.date} · {l.detail}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:15,fontWeight:800,color:T.orange,fontVariantNumeric:"tabular-nums",fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(l.duration)}</div>
                  <div style={{fontSize:11,color:T.text3}}>›</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      <SL>COMPETITION DIVISIONS</SL>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {Object.entries(HYROX_MODES).map(([name,m])=>(
          <button key={name} onClick={()=>setMode(name)} style={{padding:"16px 18px",borderRadius:14,border:`1px solid ${T.borderM}`,background:T.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:16,fontWeight:700,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em",marginBottom:3}}>{name}</div>
              <div style={{fontSize:12,color:T.text2}}>{m.weights[1]} sled push · {m.weights[7]} wall balls</div>
            </div>
            <div style={{width:28,height:28,borderRadius:"50%",background:T.orangeL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.orange,flexShrink:0}}>›</div>
          </button>
        ))}
      </div>
      <button onClick={()=>{setShowBuilder(true);}} style={{width:"100%",padding:"15px",border:`1.5px dashed ${T.orange}55`,borderRadius:16,background:T.orangeL,color:T.orange,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:20}}>+ Create Custom Hyrox</button>
      {savedCustoms.length>0&&<>
        <SL>MY CUSTOM WORKOUTS</SL>
        {savedCustoms.map(c=>(
          <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:T.text1}}>{c.name}</div><div style={{fontSize:12,color:T.text2,marginTop:2}}>{c.stations.length} stations</div></div>
            <Btn onClick={()=>setMode(c.name)} color={T.orange} style={{width:"auto",padding:"8px 18px",fontSize:12}}>Start</Btn>
          </div>
        ))}
      </>}
    </div>
  );

  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setMode(null)} style={sBtnStyle}>←</button>
        <div><div style={{fontSize:24,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>{mode}</div><div style={{fontSize:13,color:T.text2}}>Race Simulation</div></div>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.borderM}`,borderRadius:16,padding:18,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:T.text2,letterSpacing:"0.09em",marginBottom:10}}>8 STATIONS · 8 × 1KM RUN</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
          {HYROX_BASE_STATIONS.map((s,i)=>(
            <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontSize:11,color:T.orange,fontWeight:700,marginBottom:3,fontFamily:"'Barlow Condensed',sans-serif"}}>{String(i+1).padStart(2,"0")}</div>
              <div style={{fontSize:9,color:T.text1,fontWeight:600,lineHeight:1.3}}>{s.name}</div>
              {mode!=="Custom"&&HYROX_MODES[mode].weights[i]!=="—"&&<div style={{fontSize:8,color:T.text2,marginTop:3}}>{HYROX_MODES[mode].weights[i]}</div>}
            </div>
          ))}
        </div>
        <Btn onClick={startSim} color={T.orange}>START SIMULATION</Btn>
      </div>
      <SL>STATION WEIGHTS</SL>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:16}}>
        {HYROX_BASE_STATIONS.map((s,i)=>(
          <div key={i}>{i>0&&<Divider/>}
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px"}}>
              <div style={{width:26,height:26,background:T.orangeL,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.orange,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif"}}>{i+1}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:T.text1}}>{s.name}</div><div style={{fontSize:11,color:T.text2,marginTop:1}}>{s.detail}</div></div>
              {mode!=="Custom"&&<div style={{fontSize:13,fontWeight:700,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif"}}>{HYROX_MODES[mode].weights[i]}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GPS RUN TRACKER ─────────────────────────────────────────────────────────
function RunMap({ points }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; polylineRef.current = null; dotRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || points.length === 0) return;
    const latLngs = points.map(p => [p.lat, p.lon]);
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    } else {
      polylineRef.current = L.polyline(latLngs, { color: "#D4E020", weight: 5, opacity: 0.9 }).addTo(map);
    }
    const last = latLngs[latLngs.length - 1];
    if (dotRef.current) {
      dotRef.current.setLatLng(last);
    } else {
      dotRef.current = L.circleMarker(last, { radius: 9, fillColor: "#D4E020", color: "#fff", weight: 2.5, fillOpacity: 1 }).addTo(map);
    }
    if (points.length === 1) map.setView(last, 17);
    else map.panTo(last);
  }, [points]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

function GPSRunTracker({onSave,onClose}){
  const [phase,setPhase]=useState("setup");
  const [runPaused,setRunPaused]=useState(false);
  const [showRunExit,setShowRunExit]=useState(false);
  const [runType,setRunType]=useState("easy");
  const [elapsed,setElapsed]=useState(0);
  const [distKm,setDistKm]=useState(0);
  const [gpsErr,setGpsErr]=useState(null);
  const [gpsReady,setGpsReady]=useState(false);
  const [paceArr,setPaceArr]=useState([]);
  const [kmSplits,setKmSplits]=useState([]);
  const [gpsPoints,setGpsPoints]=useState([]);
  const timerRef=useRef(null);const watchRef=useRef(null);const lastCoord=useRef(null);
  const elapsedRef=useRef(0);const lastKmRef=useRef(0);const gpsReadyRef=useRef(false);

  useEffect(()=>()=>{clearInterval(timerRef.current);if(navigator.geolocation&&watchRef.current!=null)navigator.geolocation.clearWatch(watchRef.current);},[]);

  const startRun=()=>{
    if(!navigator.geolocation){setGpsErr("Geolocation is not supported by this browser/device.");return;}
    setPhase("acquiring");setElapsed(0);setDistKm(0);setPaceArr([]);setRunPaused(false);setKmSplits([]);setGpsPoints([]);setGpsErr(null);setGpsReady(false);elapsedRef.current=0;lastKmRef.current=0;lastCoord.current=null;gpsReadyRef.current=false;
    watchRef.current=navigator.geolocation.watchPosition(
      pos=>{
        if(!gpsReadyRef.current){gpsReadyRef.current=true;setGpsReady(true);setPhase("active");timerRef.current=setInterval(()=>setElapsed(s=>{const n=s+1;elapsedRef.current=n;return n;}),1000);}
        const pt={lat:pos.coords.latitude,lon:pos.coords.longitude,t:Date.now()};
        setGpsPoints(prev=>[...prev,pt]);
        if(lastCoord.current){
          const d=haversineKm(lastCoord.current,pt);
          if(d>0.005&&d<0.3){
            setDistKm(prev=>{
              const tot=prev+d;
              const tMin=(pt.t-lastCoord.current.t)/60000;
              if(tMin>0)setPaceArr(p=>[...p,d/tMin]);
              const crossedKm=Math.floor(tot);
              if(crossedKm>lastKmRef.current){for(let k=lastKmRef.current+1;k<=crossedKm;k++)setKmSplits(p=>[...p,{km:k,time:elapsedRef.current}]);lastKmRef.current=crossedKm;}
              return tot;
            });
          }
        }
        lastCoord.current=pt;
      },
      err=>{
        const msg=err.code===1?"Location permission denied — tap your browser's address bar to allow location access":err.code===2?"GPS signal unavailable — try moving outdoors":"GPS timed out — weak signal, try moving to open sky";
        setGpsErr(msg);
        if(!gpsReadyRef.current)setPhase("setup");
      },
      {enableHighAccuracy:true,maximumAge:0,timeout:30000}
    );
  };
  const stopRun=()=>{clearInterval(timerRef.current);if(navigator.geolocation&&watchRef.current!=null)navigator.geolocation.clearWatch(watchRef.current);setPhase("done");};
  const togglePause=()=>{
    if(!runPaused){
      clearInterval(timerRef.current);
    }else{
      timerRef.current=setInterval(()=>setElapsed(s=>{const n=s+1;elapsedRef.current=n;return n;}),1000);
    }
    setRunPaused(p=>!p);
  };
  const avgPace=paceArr.length?paceArr.reduce((a,b)=>a+b,0)/paceArr.length:0;
  const paceStr=avgPace>0?`${Math.floor(1/avgPace)}:${String(Math.round((1/avgPace%1)*60)).padStart(2,"0")}`:"—";
  const rt=RUN_TYPES.find(r=>r.id===runType)||RUN_TYPES[0];

  if(phase==="acquiring")return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",gap:20}}>
      <div style={{width:64,height:64,border:`3px solid ${T.orangeL}`,borderTopColor:T.orange,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:18,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.05em",marginBottom:6}}>ACQUIRING GPS SIGNAL</div>
        <div style={{fontSize:13,color:T.text2,lineHeight:1.5}}>Move to an open area for faster signal.<br/>This can take up to 30 seconds.</div>
      </div>
      {gpsErr&&<div style={{background:"rgba(224,88,88,0.1)",border:"1px solid rgba(224,88,88,0.3)",borderRadius:14,padding:"14px 18px",fontSize:13,color:"#E05858",textAlign:"center",maxWidth:300,lineHeight:1.5}}>{gpsErr}</div>}
      <button onClick={()=>{if(navigator.geolocation&&watchRef.current!=null)navigator.geolocation.clearWatch(watchRef.current);setPhase("setup");}} style={{marginTop:8,padding:"12px 28px",borderRadius:50,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:T.text2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>Cancel</button>
    </div>
  );
  if(phase==="done")return(
    <div style={{padding:"16px 16px 100px",minHeight:"100vh"}}>
      <button onClick={onClose} style={{...sBtnStyle,marginBottom:20}}>←</button>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:44,marginBottom:8}}>🏃</div>
        <div style={{fontSize:28,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>Run Complete</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[{val:`${distKm.toFixed(2)}km`,label:"Distance"},{val:fmt(elapsed),label:"Duration"},{val:`${paceStr}/km`,label:"Avg Pace"},{val:rt.zone,label:"Zone"}].map((m,i)=>(
          <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px"}}>
            <div style={{fontSize:22,fontWeight:800,color:T.text1}}>{m.val}</div>
            <div style={{fontSize:12,color:T.text2,marginTop:3}}>{m.label}</div>
          </div>
        ))}
      </div>
      {gpsErr&&<div style={{background:T.card,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:T.text2,border:`1px solid ${T.border}`}}>{gpsErr}</div>}
      <Btn onClick={()=>onSave({type:"RUN",name:rt.label,zone:rt.zone,duration:elapsed,distKm:parseFloat(distKm.toFixed(2)),pace:paceStr,date:today(),detail:`${distKm.toFixed(2)}km · ${paceStr}/km`,splits:kmSplits})} color={T.orange}>Save Run</Btn>
    </div>
  );
  if(phase==="active")return(
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Live map — top ~45% */}
      <div style={{position:"relative",flex:"0 0 45vh",minHeight:0}}>
        <RunMap points={gpsPoints}/>
        <div style={{position:"absolute",top:16,left:16,zIndex:1000}}>
          <button onClick={()=>setShowRunExit(true)} style={{width:40,height:40,borderRadius:12,border:"none",background:"rgba(13,15,9,0.8)",color:T.text1,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>←</button>
        </div>
        <div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",zIndex:1000}}>
          <div style={{background:runPaused?"rgba(13,15,9,0.9)":"rgba(212,224,32,0.92)",borderRadius:20,padding:"7px 18px",fontSize:12,fontWeight:800,color:runPaused?"#D4E020":"#0D0F09",letterSpacing:"0.1em",backdropFilter:"blur(8px)",fontFamily:"'Barlow Condensed',sans-serif",whiteSpace:"nowrap"}}>
            {runPaused?"⏸ PAUSED":rt.label.toUpperCase()+" · "+rt.zone}
          </div>
        </div>
      </div>
      {/* Stats + controls panel — fixed bottom */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"14px 16px 90px",gap:10,minHeight:0}}>
        {/* Primary stats: big numbers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {val:fmt(elapsed),label:"TIME",color:T.text1},
            {val:`${distKm.toFixed(2)}km`,label:"DIST",color:T.orange},
            {val:paceStr+"/km",label:"PACE",color:T.text1},
          ].map((m,i)=>(
            <div key={i} style={{background:T.card,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontSize:i===1?28:24,fontWeight:900,color:m.color,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1,letterSpacing:"-0.01em"}}>{m.val}</div>
              <div style={{fontSize:10,color:T.text2,marginTop:4,letterSpacing:"0.08em",fontWeight:700}}>{m.label}</div>
            </div>
          ))}
        </div>
        {/* km splits */}
        {kmSplits.length>0&&(
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {kmSplits.map((s,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.borderM}`,borderRadius:20,padding:"5px 13px",display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:T.text2,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.km}KM</span>
                <span style={{fontSize:12,fontWeight:800,color:T.orange,fontVariantNumeric:"tabular-nums"}}>{fmt(s.time)}</span>
              </div>
            ))}
          </div>
        )}
        {gpsErr&&<div style={{fontSize:12,color:"#E05858",background:"rgba(224,88,88,0.1)",padding:"8px 14px",borderRadius:10,border:"1px solid rgba(224,88,88,0.2)"}}>{gpsErr}</div>}
        {/* Controls — always visible above nav */}
        <div style={{display:"flex",gap:10,marginTop:"auto",paddingBottom:2}}>
          <button onClick={togglePause} style={{flex:1,padding:"15px 0",background:runPaused?T.orangeL:T.card,border:`1px solid ${runPaused?T.orange:T.borderM}`,borderRadius:50,color:runPaused?T.orange:T.text1,fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"'Barlow Condensed',sans-serif"}}>{runPaused?"▶ RESUME":"⏸ PAUSE"}</button>
          <button onClick={stopRun} style={{flex:1,padding:"15px 0",background:"rgba(224,88,88,0.12)",color:"#E05858",border:"1px solid rgba(224,88,88,0.3)",borderRadius:50,fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:"0.06em",fontFamily:"'Barlow Condensed',sans-serif"}}>⏹ STOP</button>
        </div>
      </div>
      {showRunExit&&<ExitConfirmModal
        onSave={()=>{stopRun();onSave({type:"RUN",name:rt.label,zone:rt.zone,duration:elapsed,distKm:parseFloat(distKm.toFixed(2)),pace:paceStr,date:today(),detail:`${distKm.toFixed(2)}km · ${paceStr}/km`,splits:kmSplits});}}
        onDiscard={()=>{clearInterval(timerRef.current);if(navigator.geolocation&&watchRef.current!=null)navigator.geolocation.clearWatch(watchRef.current);onClose();}}
        onCancel={()=>setShowRunExit(false)}
      />}
    </div>
  );
  return(
    <div style={{padding:"16px 16px 100px",minHeight:"100vh"}}>
      <button onClick={onClose} style={{...sBtnStyle,marginBottom:16}}>←</button>
      <div style={{marginBottom:20}}><div style={{fontSize:28,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>GPS Run</div><div style={{fontSize:13,color:T.text2}}>Live distance tracking</div></div>
      <SL>RUN TYPE</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:22}}>
        {RUN_TYPES.map(r=><button key={r.id} onClick={()=>setRunType(r.id)} style={{padding:"13px 14px",borderRadius:14,border:`1.5px solid ${runType===r.id?T.orange:T.border}`,background:runType===r.id?T.orangeL:T.card,cursor:"pointer",textAlign:"left"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontSize:13,fontWeight:700,color:runType===r.id?T.orange:T.text1}}>{r.label}</div><span style={{fontSize:9,fontWeight:700,color:runType===r.id?T.orange:T.text3,letterSpacing:"0.06em"}}>{r.zone}</span></div><div style={{fontSize:11,color:T.text2}}>{r.pace}/km</div><div style={{fontSize:10,color:T.text3,marginTop:2}}>HR {r.hr}</div></button>)}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 16px",marginBottom:22,display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:T.orange,marginTop:4,flexShrink:0}}/>
        <div style={{fontSize:13,color:T.text2,lineHeight:1.5}}>GPS tracking starts automatically. Grant location permission when prompted.</div>
      </div>
      <Btn onClick={startRun} color={T.orange} style={{fontSize:15,padding:16}}>START GPS RUN</Btn>
    </div>
  );
}

// ─── RUN DETAIL ──────────────────────────────────────────────────────────────
function RunDetail({run,onDelete,onClose}){
  const rt=RUN_TYPES.find(r=>r.label===run.name)||RUN_TYPES[0];
  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:180,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
      <div style={{background:T.surface,padding:"18px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:17,fontWeight:800,color:T.text1}}>{run.name}</div><div style={{fontSize:12,color:T.text2,marginTop:2}}>{run.date}</div></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{if(window.confirm("Delete this run?"))onDelete();}} style={{...sBtnStyle,background:T.redL,color:T.red}}>🗑</button>
            <button onClick={onClose} style={sBtnStyle}>✕</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[{val:run.distKm?`${run.distKm}km`:run.detail?.split("·")[0]?.trim()||"—",label:"Distance"},{val:fmt(run.duration||0),label:"Duration"},{val:run.pace||"—",label:"Pace"},{val:run.zone||rt.zone,label:"Zone"}].map((m,i)=>(
            <div key={i} style={{background:T.card,borderRadius:12,padding:"13px 14px",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:20,fontWeight:800,color:T.text1}}>{m.val}</div>
              <div style={{fontSize:11,color:T.text2,marginTop:3}}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:rt.bg,borderRadius:14,padding:"14px 16px",border:`1px solid rgba(255,255,255,0.05)`}}>
          <div style={{fontSize:13,fontWeight:700,color:rt.color,marginBottom:4}}>{run.name} · {run.zone||rt.zone}</div>
          <div style={{fontSize:12,color:rt.color,opacity:0.8}}>Target pace: {rt.pace}/km · HR {rt.hr} bpm</div>
        </div>
        {run.gpsPoints&&<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 16px",marginTop:14}}><div style={{fontSize:11,color:T.text2,fontWeight:600,marginBottom:4}}>GPS DATA</div><div style={{fontSize:13,color:T.text1}}>{run.gpsPoints} location points recorded</div></div>}
      </div>
    </div>
  );
}

// ─── MANUAL RUN LOGGER ───────────────────────────────────────────────────────
function ManualRunLogger({onSave,onClose}){
  const [form,setForm]=useState({type:"easy",dist:"",pace:"",duration:"",date:today()});
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const rt=RUN_TYPES.find(r=>r.id===form.type)||RUN_TYPES[0];
  const durationSecs=()=>{const p=form.duration.split(":");return p.length===2?parseInt(p[0])*60+parseInt(p[1]):parseInt(form.duration||0)*60;};
  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:180,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
      <div style={{background:T.surface,padding:"18px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:17,fontWeight:800,color:T.text1}}>Log Run Manually</div>
          <button onClick={onClose} style={sBtnStyle}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 100px"}}>
        <SL mb={8}>RUN TYPE</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
          {RUN_TYPES.map(r=><button key={r.id} onClick={()=>setForm(f=>({...f,type:r.id}))} style={{padding:"11px",borderRadius:12,border:`1.5px solid ${form.type===r.id?r.color:T.border}`,background:form.type===r.id?r.bg:T.card,cursor:"pointer",textAlign:"left"}}><div style={{fontSize:12,fontWeight:700,color:form.type===r.id?r.color:T.text1}}>{r.label}</div><div style={{fontSize:10,color:T.text2,marginTop:2}}>{r.zone}</div></button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[["DISTANCE (km)","dist","number","8"],["PACE (min/km)","pace","text","5:10"],["DURATION (mm:ss)","duration","text","45:00"],["DATE","date","text",today()]].map(([label,key,type,ph])=>(
            <div key={key}><div style={{fontSize:10,color:T.text2,fontWeight:600,marginBottom:6,letterSpacing:"0.06em"}}>{label}</div><input type={type} placeholder={ph} value={form[key]} onChange={upd(key)} style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card,color:T.text1,fontSize:14,fontWeight:600}}/></div>
          ))}
        </div>
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"12px 16px 28px",background:T.bg,borderTop:`1px solid ${T.border}`}}>
        <Btn onClick={()=>{if(form.dist||form.duration){onSave({type:"RUN",name:rt.label,zone:rt.zone,duration:durationSecs(),distKm:parseFloat(form.dist||0),pace:form.pace||rt.pace,date:form.date||today(),detail:`${form.dist||"—"}km · ${form.pace||rt.pace}/km`});onClose();}}} color={T.green}>Save Run</Btn>
      </div>
    </div>
  );
}

// ─── RUNNING TAB ─────────────────────────────────────────────────────────────
function RunningTab({logs,addLog,deleteLog}){
  const [screen,setScreen]=useState("home");
  const [detailRun,setDetailRun]=useState(null);
  const runLogs=logs.filter(l=>l.type==="RUN");
  const totalKm=runLogs.reduce((a,l)=>a+(l.distKm||0),0);
  const bestPace=runLogs.reduce((best,l)=>{if(!l.pace||l.pace==="—")return best;const[m,s]=l.pace.split(":").map(Number);const t=m*60+(s||0);return best===0||t<best?t:best;},0);
  const bestPaceStr=bestPace>0?fmt(bestPace):"—";
  const rDAY=86400000;const rNow=Date.now();const rDow=new Date().getDay();const rMon=rDow===0?6:rDow-1;
  const weekKm=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);const t=d.getTime()-(rMon-i)*rDAY;return runLogs.filter(l=>(l._id||0)>=t&&(l._id||0)<t+rDAY).reduce((a,l)=>a+(l.distKm||0),0);});
  const thisWeekKm=weekKm.reduce((a,b)=>a+b,0);const maxKm=Math.max(...weekKm,1);const rTodayIdx=rMon;

  if(screen==="gps")return <GPSRunTracker onSave={r=>{addLog(r);setScreen("home");}} onClose={()=>setScreen("home")}/>;
  if(screen==="manual")return <ManualRunLogger onSave={r=>{addLog(r);setScreen("home");}} onClose={()=>setScreen("home")}/>;
  if(detailRun)return <SessionDetail log={detailRun} onDelete={()=>{deleteLog(detailRun._id);setDetailRun(null);}} onClose={()=>setDetailRun(null)}/>;

  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{marginBottom:20}}><div style={{fontSize:34,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>Running</div><div style={{fontSize:13,color:T.text2}}>GPS tracking · pace · zones</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[{val:totalKm>0?`${totalKm.toFixed(1)}km`:"0km",sub:"Distance"},{val:`${runLogs.length}`,sub:"Runs"},{val:bestPaceStr,sub:"Best Pace"}].map((m,i)=>(
          <div key={i} style={{background:T.card,borderRadius:14,padding:"13px 14px",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:20,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.val}</div>
            <div style={{fontSize:10,color:T.text2,marginTop:3,letterSpacing:"0.04em"}}>{m.sub.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 18px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:13,fontWeight:700,color:T.text1}}>Weekly mileage</div><div style={{fontSize:14,fontWeight:800,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{thisWeekKm>0?`${thisWeekKm.toFixed(1)}km`:"0km"}</div></div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:64}}>
          {["M","T","W","T","F","S","S"].map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,height:"100%"}}>
              <div style={{flex:1,display:"flex",alignItems:"flex-end",width:"100%"}}><div style={{width:"100%",background:weekKm[i]>0?T.orange:T.border,borderRadius:"3px 3px 0 0",height:`${Math.max((weekKm[i]/maxKm)*100,weekKm[i]>0?6:2)}%`,opacity:i===rTodayIdx?1:0.55}}/></div>
              <span style={{fontSize:10,color:i===rTodayIdx?T.text1:T.text2,fontWeight:i===rTodayIdx?700:500}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      {runLogs.length>0&&<>
        <SL>MY RUNS</SL>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:20}}>
          {runLogs.map((l,i)=>{
            const rt=RUN_TYPES.find(r=>r.label===l.name)||RUN_TYPES[0];
            return(
              <div key={i}>{i>0&&<Divider/>}
                <div onClick={()=>setDetailRun(l)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",cursor:"pointer"}}>
                  <div><div style={{fontSize:14,fontWeight:600,color:T.text1}}>{l.name}</div><div style={{fontSize:12,color:T.text2,marginTop:2}}>{l.date} · {l.detail}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {l.distKm&&<div style={{fontSize:12,fontWeight:700,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif"}}>{l.distKm}km</div>}
                    <span style={{background:T.orangeL,color:T.orange,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,letterSpacing:"0.03em"}}>{l.zone||rt.zone}</span>
                    <div style={{fontSize:11,color:T.text3}}>›</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <Btn onClick={()=>setScreen("gps")} color={T.orange} style={{flex:1}}>GPS Run</Btn>
        <Btn onClick={()=>setScreen("manual")} color={T.surface} style={{flex:1,border:`1px solid ${T.border}`,color:T.text1}}>Log Manually</Btn>
      </div>
      <SL>ZONE GUIDE</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {RUN_TYPES.map(r=><div key={r.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><div style={{width:5,height:5,borderRadius:"50%",background:T.orange,flexShrink:0}}/><div style={{fontSize:12,fontWeight:700,color:T.text1}}>{r.label}</div><span style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:T.orange,background:T.orangeL,padding:"2px 7px",borderRadius:20,letterSpacing:"0.04em"}}>{r.zone}</span></div><div style={{fontSize:11,color:T.text2}}>{r.pace}/km</div><div style={{fontSize:10,color:T.text3,marginTop:2}}>HR {r.hr}</div></div>)}
      </div>
    </div>
  );
}

// ─── TRAINING TAB ────────────────────────────────────────────────────────────
function PRScreen({logs,onBack}){
  const prs={};
  logs.filter(l=>l.exercises).forEach(log=>{
    log.exercises.forEach(ex=>{
      if(!ex.setLogs||ex.setLogs.length===0)return;
      const isBW=!ex.weight||ex.weight==="BW"||ex.weight==="bw"||parseFloat(ex.weight)===0;
      ex.setLogs.forEach(s=>{
        if(!prs[ex.name])prs[ex.name]={name:ex.name,category:ex.category||"",isBW,maxWeight:0,repsAtMax:0,maxReps:0};
        if(isBW){const r=parseInt(s.reps)||0;if(r>prs[ex.name].maxReps)prs[ex.name].maxReps=r;}
        else{const w=parseFloat(s.weight)||0;const r=parseInt(s.reps)||0;if(w>prs[ex.name].maxWeight||(w===prs[ex.name].maxWeight&&r>prs[ex.name].repsAtMax)){prs[ex.name].maxWeight=w;prs[ex.name].repsAtMax=r;}}
      });
    });
  });
  const prList=Object.values(prs).sort((a,b)=>a.name.localeCompare(b.name));
  const cats=[...new Set(prList.map(p=>p.category))].filter(Boolean);
  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={sBtnStyle}>←</button>
        <div>
          <div style={{fontSize:28,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>PERSONAL RECORDS</div>
          <div style={{fontSize:12,color:T.text2,marginTop:2}}>Best lifts from all logged sessions</div>
        </div>
      </div>
      {prList.length===0&&(
        <div style={{background:T.card,borderRadius:20,padding:"40px 20px",textAlign:"center",border:`1px solid ${T.border}`}}>
          <div style={{fontSize:36,marginBottom:12}}>🏆</div>
          <div style={{fontSize:16,fontWeight:700,color:T.text1,marginBottom:6}}>No PRs yet</div>
          <div style={{fontSize:13,color:T.text2}}>Complete a workout and log your sets to track personal records.</div>
        </div>
      )}
      {cats.map(cat=>{
        const catPrs=prList.filter(p=>p.category===cat);
        if(!catPrs.length)return null;
        return(
          <div key={cat} style={{marginBottom:20}}>
            <SL>{cat.toUpperCase()}</SL>
            <div style={{background:T.card,borderRadius:18,overflow:"hidden",border:`1px solid ${T.border}`}}>
              {catPrs.map((pr,i)=>(
                <div key={pr.name} style={{display:"flex",alignItems:"center",padding:"13px 16px",borderBottom:i<catPrs.length-1?`1px solid ${T.border}`:"none"}}>
                  <div style={{width:32,height:32,borderRadius:10,background:T.orangeL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:12,flexShrink:0}}>🏆</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:T.text1}}>{pr.name}</div>
                    <div style={{fontSize:11,color:T.text2,marginTop:2}}>{pr.isBW?"Bodyweight":"Weighted"}</div>
                  </div>
                  {pr.isBW
                    ?<div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{pr.maxReps}<span style={{fontSize:12,color:T.text2,fontWeight:500}}> reps</span></div></div>
                    :<div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{pr.maxWeight}<span style={{fontSize:12,color:T.text2,fontWeight:500}}>kg</span></div><div style={{fontSize:11,color:T.text2}}>× {pr.repsAtMax} reps</div></div>
                  }
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {prList.length>0&&cats.length===0&&(
        <div style={{background:T.card,borderRadius:18,overflow:"hidden",border:`1px solid ${T.border}`}}>
          {prList.map((pr,i)=>(
            <div key={pr.name} style={{display:"flex",alignItems:"center",padding:"13px 16px",borderBottom:i<prList.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:T.text1}}>{pr.name}</div></div>
              {pr.isBW
                ?<div style={{fontSize:20,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{pr.maxReps}<span style={{fontSize:12,color:T.text2}}> reps</span></div>
                :<div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{pr.maxWeight}<span style={{fontSize:12,color:T.text2}}>kg</span></div><div style={{fontSize:11,color:T.text2}}>× {pr.repsAtMax} reps</div></div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainingTab({logs,addLog,deleteLog}){
  const [screen,setScreen]=useState("home");
  const [active,setActive]=useState(null);
  const [customs,setCustoms]=useState([]);
  const [extraLib,setExtraLib]=useState([]);
  const [catFilter,setCatFilter]=useState("ALL");
  const [selectedSession,setSelectedSession]=useState(null);

  const saveCustom=w=>{setCustoms(p=>[w,...p]);setScreen("home");};
  const startWorkout=t=>{setActive({...t,exercises:t.exercises.map(e=>({...e}))});setScreen("active");};
  const complete=result=>{addLog({type:result.tag==="CUSTOM"?"CUSTOM":result.tag==="CARDIO"?"CARDIO":"STRENGTH",name:result.name,duration:result.duration,date:today(),detail:`${result.doneSets||0}/${result.totalSets||0} sets`,exercises:result.exercises});setScreen("home");};

  if(selectedSession)return <SessionDetail log={selectedSession} onDelete={()=>{deleteLog(selectedSession._id);setSelectedSession(null);}} onClose={()=>setSelectedSession(null)}/>;
  if(screen==="active"&&active)return <ActiveWorkout workout={active} history={logs} onDone={complete} onBack={()=>setScreen("home")}/>;
  if(screen==="builder")return <WorkoutBuilder extraLibrary={extraLib} onSave={saveCustom} onClose={()=>setScreen("home")}/>;
  if(screen==="prs")return <PRScreen logs={logs} onBack={()=>setScreen("home")}/>;

  const sLogs=logs.filter(l=>["STRENGTH","CUSTOM","HYROX","CARDIO"].includes(l.type));
  const allTemplates=[...customs,...WORKOUT_TEMPLATES];
  const cats=["ALL","UPPER","LOWER","CORE","CARDIO","HYBRID","HYROX"];
  const filtered=catFilter==="ALL"?allTemplates:allTemplates.filter(t=>t.category===catFilter||(catFilter==="UPPER"&&!t.category&&t.tag==="STRENGTH"));

  const getLastSession=name=>logs.filter(l=>l.name===name&&l.exercises&&l.exercises.length>0).slice(-1)[0]||null;

  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:34,fontWeight:900,color:T.text1,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>Training</div>
        <div style={{fontSize:13,color:T.text2}}>Strength, conditioning & workouts</div>
      </div>

      {/* Top action buttons */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:10,marginBottom:16}}>
        <button onClick={()=>setScreen("builder")} style={{background:T.orangeL,border:`1.5px solid ${T.orange}55`,borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:22,marginBottom:8}}>✚</div>
          <div style={{fontSize:16,fontWeight:800,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>BUILD WORKOUT</div>
          <div style={{fontSize:11,color:T.text2,marginTop:3}}>Custom from scratch</div>
        </button>
        <button onClick={()=>setScreen("prs")} style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:22,marginBottom:8}}>🏆</div>
          <div style={{fontSize:16,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>MY PRs</div>
          <div style={{fontSize:11,color:T.text2,marginTop:3}}>Personal records</div>
        </button>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
        {[{val:sLogs.length,label:"Sessions"},{val:sLogs.length?fmt(Math.round(sLogs.reduce((a,l)=>a+(l.duration||2700),0)/sLogs.length)):"—",label:"Avg time"},{val:sLogs.reduce((a,l)=>a+parseInt(l.detail?.split("/")[0]||0),0),label:"Total sets"}].map((m,i)=>(
          <div key={i} style={{background:T.card,borderRadius:14,padding:"13px 14px",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:20,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.val}</div>
            <div style={{fontSize:10,color:T.text2,marginTop:3,letterSpacing:"0.05em"}}>{m.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {sLogs.length>0&&(
        <>
          <SL>MY SESSIONS</SL>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden",marginBottom:20}}>
            {sLogs.slice(0,6).map((l,i)=>(
              <div key={l._id||i}>{i>0&&<Divider/>}
                <button onClick={()=>setSelectedSession(l)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                  <div><div style={{fontSize:14,fontWeight:700,color:T.text1}}>{l.name}</div><div style={{fontSize:11,color:T.text2,marginTop:2}}>{l.date} · {l.detail}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(l.duration||0)}</div>
                    <span style={{fontSize:14,color:T.text3}}>›</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category filter chips */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)} style={{flexShrink:0,padding:"7px 16px",borderRadius:catFilter===c?"6px 20px 20px 6px":"20px",background:catFilter===c?T.orange:T.card,border:`1.5px solid ${catFilter===c?T.orange:T.border}`,color:catFilter===c?"#0D0F09":T.text2,fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:"0.05em",transition:"all 0.2s",fontFamily:"'Barlow Condensed',sans-serif"}}>{c}</button>
        ))}
      </div>

      {/* Workout cards */}
      {filtered.map(t=>{
        const last=getLastSession(t.name);
        const lastLine=last?last.exercises.slice(0,2).map(e=>{
          const topSet=e.setLogs?.slice(-1)[0];
          return topSet?`${e.name.split(" ")[0]} ${topSet.weight&&topSet.weight!=="BW"?topSet.weight+"kg":"BW"}×${topSet.reps}`:null;
        }).filter(Boolean).join(" · "):null;
        return(
          <div key={t.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"16px 18px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Pill label={t.tag} type={t.tag}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:T.text2}}>{t.exercises.length} exercises</span>
                {t.id.startsWith("custom")&&<button onClick={()=>deleteLog(t.id)} style={{...sBtnStyle,background:T.redL,color:T.red,width:22,height:22,fontSize:10}}>🗑</button>}
              </div>
            </div>
            <div style={{fontSize:18,fontWeight:800,color:T.text1,marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em"}}>{t.name}</div>
            {/* Last session benchmark */}
            {last&&lastLine&&(
              <div style={{background:T.surface,borderRadius:10,padding:"7px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:10,fontWeight:700,color:T.text3,letterSpacing:"0.06em",flexShrink:0}}>LAST</div>
                <div style={{fontSize:11,color:T.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last.date} · {lastLine}</div>
              </div>
            )}
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {t.exercises.map((e,i)=>(
                <div key={i} style={{background:T.surface,borderRadius:20,padding:"4px 10px",fontSize:11,color:T.text2,border:`1px solid ${T.border}`}}>
                  {e.name.split(" ").slice(0,2).join(" ")} <span style={{color:T.text1,fontWeight:700}}>{e.sets}×{e.reps}</span>
                </div>
              ))}
            </div>
            <Btn onClick={()=>startWorkout(t)} color={T.orange} style={{fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.05em"}}>START WORKOUT</Btn>
          </div>
        );
      })}

    </div>
  );
}

// ─── DELETE CONFIRM MODAL ────────────────────────────────────────────────────
function DeleteConfirmModal({onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:T.card,borderRadius:22,padding:"28px 24px",width:"100%",maxWidth:360,border:`1px solid ${T.borderM}`}}>
        <div style={{fontSize:20,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em",marginBottom:8}}>DELETE SESSION</div>
        <div style={{fontSize:13,color:T.text2,lineHeight:1.6,marginBottom:24}}>Are you sure? This session will be permanently deleted and cannot be recovered.</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"15px",borderRadius:50,border:`1px solid ${T.borderM}`,background:"rgba(255,255,255,0.04)",color:T.text1,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"15px",borderRadius:50,border:"none",background:T.red,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.06em"}}>DELETE</button>
        </div>
      </div>
    </div>
  );
}

// ─── SESSION DETAIL ──────────────────────────────────────────────────────────
function SessionDetail({log,onClose,onDelete}){
  const [showDel,setShowDel]=useState(false);
  const typeColor={HYROX:T.purple,STRENGTH:T.orange,CUSTOM:T.blue,RUN:T.green,CARDIO:T.red};
  const tc=typeColor[log.type]||T.orange;
  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      {showDel&&<DeleteConfirmModal onConfirm={()=>{onDelete&&onDelete();setShowDel(false);}} onCancel={()=>setShowDel(false)}/>}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onClose} style={sBtnStyle}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:26,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em",lineHeight:1}}>{log.name}</div>
          <div style={{fontSize:12,color:T.text2,marginTop:4}}>{log.date} · {fmt(log.duration||0)}</div>
        </div>
        <div style={{background:`rgba(${tc===T.orange?"212,224,32":tc===T.green?"61,191,130":tc===T.purple?"139,127,240":tc===T.blue?"91,156,246":"224,88,88"},0.15)`,border:`1px solid ${tc}55`,borderRadius:10,padding:"5px 12px",fontSize:11,fontWeight:800,color:tc,letterSpacing:"0.06em"}}>{log.type}</div>
        {onDelete&&<button onClick={()=>setShowDel(true)} style={{...sBtnStyle,background:T.redL,color:T.red,flexShrink:0}}>🗑</button>}
      </div>

      {/* Run stats */}
      {log.type==="RUN"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
          {[{val:log.distKm?`${log.distKm}km`:"—",label:"Distance"},{val:log.pace||"—",label:"Pace / km"},{val:log.zone||"—",label:"Zone"}].map((m,i)=>(
            <div key={i} style={{background:T.card,borderRadius:14,padding:"14px 12px",textAlign:"center",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:22,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{m.val}</div>
              <div style={{fontSize:10,color:T.text2,marginTop:6,letterSpacing:"0.05em"}}>{m.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per-km splits */}
      {log.type==="RUN"&&log.splits&&log.splits.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:800,color:T.text2,letterSpacing:"0.08em",marginBottom:10}}>KM SPLITS</div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
            {log.splits.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:i<log.splits.length-1?`1px solid ${T.border}`:"none",gap:12}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:T.orangeL,border:`1px solid ${T.orange}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.orange,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.km}</div>
                <div style={{flex:1,fontSize:12,color:T.text2}}>Kilometre {s.km}</div>
                <div style={{fontSize:17,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",fontVariantNumeric:"tabular-nums"}}>{fmt(s.time)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strength/custom exercises */}
      {log.exercises&&log.exercises.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {log.exercises.map((ex,ei)=>(
            <div key={ei} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"13px 16px",background:T.surface,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text1}}>{ex.name}</div>
                <div style={{fontSize:11,color:T.text2}}>{ex.setLogs?.length||0} sets logged</div>
              </div>
              {ex.setLogs&&ex.setLogs.length>0?(
                <div>
                  {ex.setLogs.map((s,si)=>(
                    <div key={si} style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:si<ex.setLogs.length-1?`1px solid ${T.border}`:"none",gap:12}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:T.greenL,border:`1px solid ${T.green}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:T.green,flexShrink:0}}>{si+1}</div>
                      <div style={{flex:1,display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:16,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",minWidth:52}}>{s.reps} reps</span>
                        <span style={{fontSize:10,color:T.text3}}>·</span>
                        <span style={{fontSize:16,fontWeight:800,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.weight&&s.weight!=="BW"?`${s.weight} kg`:"Bodyweight"}</span>
                      </div>
                      {s.duration>0&&<span style={{fontSize:10,color:T.text3,flexShrink:0}}>{fmtMs(s.duration)}</span>}
                    </div>
                  ))}
                </div>
              ):(
                <div style={{padding:"12px 16px",fontSize:12,color:T.text3}}>No sets recorded for this exercise</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hyrox station logs */}
      {log.stationLogs&&log.stationLogs.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {log.stationLogs.map((st,i)=>(
            <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text1}}>{st.name}</div>
                {st.weight&&<div style={{fontSize:11,color:T.text2,marginTop:2}}>{st.weight}kg</div>}
              </div>
              {st.split&&<div style={{fontSize:16,fontWeight:800,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif"}}>{st.split}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOME TAB ────────────────────────────────────────────────────────────────
const SecHead=({children,accent=T.orange})=>(
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,marginTop:32}}>
    <div style={{width:4,height:20,background:accent,borderRadius:3,flexShrink:0}}/>
    <span style={{fontSize:14,fontWeight:800,color:T.text1,letterSpacing:"0.07em"}}>{children}</span>
  </div>
);
const TypeBadge=({type})=>{
  const map={HYROX:{emoji:"🏁",bc:T.purple},STRENGTH:{emoji:"🏋️",bc:T.orange},CUSTOM:{emoji:"⚙️",bc:T.blue},RUN:{emoji:"🏃",bc:T.green},CARDIO:{emoji:"⚡",bc:T.red}};
  const s=map[type]||map.STRENGTH;
  return <div style={{width:40,height:40,background:T.surface,border:`1px solid ${T.borderM}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,filter:"grayscale(1) brightness(1.5)"}}>{s.emoji}</div>;
};

function HomeTab({logs,setTab,profile,user,deleteLog}){
  const [insightScreen,setInsightScreen]=useState(false);
  const [period,setPeriod]=useState("week");
  const [aiData,setAiData]=useState(null);const [aiLoading,setAiLoading]=useState(false);
  const [selectedSession,setSelectedSession]=useState(null);
  const [showAllSessions,setShowAllSessions]=useState(false);

  const DAY=86400000;
  const now=Date.now();
  const weekAgo=now-7*DAY;

  const feed=logs.slice(0,6);
  const runLogs=logs.filter(l=>l.type==="RUN");
  const trainLogs=logs.filter(l=>["STRENGTH","CUSTOM"].includes(l.type));
  const hyroxLogs=logs.filter(l=>l.type==="HYROX");
  const totalKm=runLogs.reduce((a,l)=>a+(l.distKm||0),0);
  const sLogs=logs.filter(l=>["STRENGTH","CUSTOM","HYROX"].includes(l.type));
  const totalSets=sLogs.reduce((a,l)=>a+parseInt(l.detail?.split("/")[0]||0),0);
  const thisWeekLogs=logs.filter(l=>(l._id||0)>weekAgo);
  const weeklySessions=thisWeekLogs.length;
  const restDays=Math.max(0,7-Math.min(weeklySessions,7));

  const streak=(()=>{
    if(!logs.length)return 0;
    const today=new Date();today.setHours(0,0,0,0);
    const logDays=new Set(logs.map(l=>{const d=new Date(l._id||0);d.setHours(0,0,0,0);return d.getTime();}));
    let c=0,d=today.getTime();
    while(logDays.has(d)){c++;d-=DAY;}
    return c;
  })();

  const bestRun=runLogs.length>0?runLogs.reduce((best,l)=>{
    if(!l.pace)return best;
    const[m,s]=l.pace.split(":").map(Number);const secs=m*60+s;
    if(!best||secs<best.secs)return{pace:l.pace,secs};return best;
  },null):null;

  // Week bars — Mon–Sun, this calendar week
  const todayDow=new Date().getDay();
  const monOffset=todayDow===0?6:todayDow-1;
  const WEEK_SHORT=["M","T","W","T","F","S","S"];
  const todayBarIdx=monOffset;
  const WEEK_BARS=Array.from({length:7},(_,i)=>{
    const dayTs=new Date();dayTs.setHours(0,0,0,0);
    const targetTs=dayTs.getTime()-(monOffset-i)*DAY;
    const dayLogs=logs.filter(l=>(l._id||0)>=targetTs&&(l._id||0)<targetTs+DAY);
    return{short:WEEK_SHORT[i],duration:dayLogs.reduce((a,l)=>a+(l.duration||0),0)};
  });

  // Month bars — last 4 rolling weeks
  const MONTH_BARS=Array.from({length:4},(_,i)=>{
    const wStart=now-(3-i)*7*DAY;const wEnd=wStart+7*DAY;
    const wLogs=logs.filter(l=>(l._id||0)>=wStart&&(l._id||0)<wEnd);
    return{label:i===3?"This week":`Week -${3-i}`,sessions:wLogs.length,total:wLogs.reduce((a,l)=>a+(l.duration||0),0),current:i===3};
  });

  const wMaxDur=Math.max(...WEEK_BARS.map(d=>d.duration),1);
  const mMaxTotal=Math.max(...MONTH_BARS.map(d=>d.total),1);

  const improving=[
    bestRun&&{icon:"🏃",label:"Running pace",detail:`Best: ${bestRun.pace}/km across ${runLogs.length} logged run${runLogs.length!==1?"s":""}`,delta:bestRun.pace,c:T.green},
    weeklySessions>=3&&{icon:"📈",label:"Weekly consistency",detail:`${weeklySessions} sessions in the last 7 days`,delta:`${weeklySessions} sessions`,c:T.green},
    streak>0&&{icon:"🔥",label:"Day streak",detail:`${streak} consecutive active day${streak!==1?"s":""}`,delta:`${streak} day${streak!==1?"s":""}`,c:T.orange},
    totalKm>0&&{icon:"📍",label:"Distance covered",detail:`${totalKm.toFixed(1)}km total across all logged runs`,delta:`${totalKm.toFixed(0)}km`,c:T.blue},
  ].filter(Boolean);

  const needsWork=[
    {icon:"⚡",label:"High intensity runs",detail:runLogs.filter(l=>l.zone==="Z4"||l.zone==="Z5").length===0?"No Zone 4–5 runs logged yet":"Good intensity mix — keep it up",action:"Add a tempo or interval run"},
    {icon:"😴",label:"Recovery days",detail:restDays===0?"No rest days this week — your body needs recovery":"Rest days in check this week",action:"Aim for 1–2 rest days per week"},
    {icon:"🏁",label:"Hyrox station work",detail:hyroxLogs.length===0?"No Hyrox simulations logged yet":"Keep drilling your weakest stations",action:"Run a Hyrox simulation"},
  ];

  const fetchAI=async()=>{
    if(aiData)return;setAiLoading(true);
    try{
      const summary=`Total sessions: ${logs.length}, runs: ${runLogs.length}, strength: ${trainLogs.length}, hyrox: ${hyroxLogs.length}. Total km: ${totalKm.toFixed(1)}. Total sets: ${totalSets}. Streak: ${streak} days.`;
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`You are an elite S&C and endurance coach. Give a concise performance review.\n\n${summary}\n\nReturn ONLY valid JSON:\n{"overview":"2-3 sentences","runningInsights":["...","..."],"strengthInsights":["...","..."],"hyroxReadiness":"paragraph","weeklyFocus":["...","...","..."],"longTermGoals":["...","..."]}`}]})});
      const d=await res.json();const txt=d.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setAiData(JSON.parse(txt));
    }catch{setAiData({overview:"Add your API key to unlock AI coaching.",runningInsights:[],strengthInsights:[],hyroxReadiness:"",weeklyFocus:[],longTermGoals:[]});}
    setAiLoading(false);
  };

  if(selectedSession)return <SessionDetail log={selectedSession} onDelete={()=>{deleteLog&&deleteLog(selectedSession._id);setSelectedSession(null);}} onClose={()=>setSelectedSession(null)}/>;
  if(showAllSessions)return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={()=>setShowAllSessions(false)} style={sBtnStyle}>←</button>
        <div>
          <div style={{fontSize:26,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>MY SESSIONS</div>
          <div style={{fontSize:12,color:T.text2,marginTop:2}}>{logs.length} total logged</div>
        </div>
      </div>
      {logs.length===0?(
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"40px 20px",textAlign:"center"}}>
          <div style={{fontSize:14,color:T.text2}}>No sessions logged yet</div>
          <div style={{fontSize:12,color:T.text3,marginTop:6}}>Start a workout or log a run to see it here</div>
        </div>
      ):(
        <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          {logs.map((l,i)=>(
            <div key={l._id||i}>{i>0&&<Divider/>}
              <button onClick={()=>setSelectedSession(l)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                <TypeBadge type={l.type}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
                  <div style={{fontSize:11,color:T.text2,marginTop:2}}>{l.date} · {l.detail}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:800,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(l.duration||0)}</div>
                  <span style={{fontSize:14,color:T.text3}}>›</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── INSIGHTS SCREEN ──────────────────────────────────────────────────────────
  if(insightScreen)return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setInsightScreen(false)} style={sBtnStyle}>←</button>
        <div>
          <div style={{fontSize:34,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em",lineHeight:1}}>PERFORMANCE</div>
          <div style={{fontSize:12,color:T.text2,marginTop:3}}>Full analysis · based on your logged data</div>
        </div>
      </div>

      {/* Period toggle */}
      <div style={{display:"flex",background:T.card,borderRadius:50,padding:4,border:`1px solid ${T.border}`,marginBottom:24}}>
        {["This Week","This Month"].map((p,i)=>{
          const active=period===(i===0?"week":"month");
          return <button key={p} onClick={()=>setPeriod(i===0?"week":"month")} style={{flex:1,padding:"11px",borderRadius:50,border:"none",background:active?T.orange:"transparent",color:active?"#0D0F09":T.text2,fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.03em",fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>{p}</button>;
        })}
      </div>

      {/* Summary strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:4}}>
        {[{v:weeklySessions||0,l:"Sessions",c:T.orange},{v:totalKm>0?`${totalKm.toFixed(0)}km`:"0km",l:"Distance",c:T.green},{v:streak>0?`${streak}d`:"0d",l:"Streak",c:T.purple}].map((m,i)=>(
          <div key={i} style={{background:T.card,borderRadius:16,padding:"16px 12px",textAlign:"center",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:28,fontWeight:900,color:m.c,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{m.v}</div>
            <div style={{fontSize:11,color:T.text1,marginTop:6,fontWeight:600}}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* ACTIVITY CHART */}
      <SecHead>ACTIVITY CHART 📊</SecHead>
      <div style={{background:T.card,borderRadius:18,padding:"18px 16px 14px",border:`1px solid ${T.border}`,marginBottom:4}}>
        {period==="week"?(
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:110,marginBottom:10}}>
            {WEEK_BARS.map((d,i)=>{
              const h=d.duration>0?Math.max((d.duration/wMaxDur)*100,12):3;
              const isToday=i===todayBarIdx;
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,height:"100%"}}>
                  {d.duration>0
                    ?<div style={{fontSize:9,color:isToday?T.orange:T.text2,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{Math.round(d.duration/60)}m</div>
                    :<div style={{fontSize:9,color:T.text3}}>·</div>}
                  <div style={{flex:1,width:"100%",display:"flex",alignItems:"flex-end"}}>
                    <div style={{width:"100%",height:`${h}%`,background:T.orange,borderRadius:"5px 5px 0 0",opacity:d.duration>0?(isToday?1:0.4):0.12,transition:"height 0.4s ease"}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:isToday?800:600,color:isToday?T.text1:T.text2,fontFamily:"'Barlow Condensed',sans-serif"}}>{d.short}</span>
                </div>
              );
            })}
          </div>
        ):(
          <div style={{display:"flex",gap:10,alignItems:"flex-end",height:110,marginBottom:10}}>
            {MONTH_BARS.map((d,i)=>{
              const h=Math.max((d.total/mMaxTotal)*100,8);
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,height:"100%"}}>
                  <div style={{fontSize:9,fontWeight:700,color:d.current?T.orange:T.text2,fontFamily:"'Barlow Condensed',sans-serif"}}>{d.sessions} sessions</div>
                  <div style={{flex:1,width:"100%",display:"flex",alignItems:"flex-end"}}>
                    <div style={{width:"100%",height:`${h}%`,background:T.orange,borderRadius:"5px 5px 0 0",opacity:d.current?1:0.35}}/>
                  </div>
                  <span style={{fontSize:10,fontWeight:d.current?700:500,color:d.current?T.text1:T.text2,textAlign:"center",lineHeight:1.2,fontFamily:"'Barlow Condensed',sans-serif"}}>{d.label}</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{display:"flex",gap:16,borderTop:`1px solid ${T.border}`,paddingTop:12,alignItems:"center"}}>
          <div style={{width:10,height:10,borderRadius:3,background:T.orange,opacity:1}}/>
          <span style={{fontSize:12,color:T.text2,fontWeight:600}}>Active days</span>
          <div style={{width:10,height:10,borderRadius:3,background:T.orange,opacity:0.15,marginLeft:8}}/>
          <span style={{fontSize:12,color:T.text2,fontWeight:600}}>Rest days</span>
        </div>
      </div>

      {/* TIME PER DISCIPLINE */}
      <SecHead accent={T.green}>TIME PER DISCIPLINE ⏱️</SecHead>
      <div style={{background:T.card,borderRadius:18,padding:"18px 16px",border:`1px solid ${T.border}`,marginBottom:4}}>
        {(()=>{
          const disciplines=[
            {label:"Strength Training",emoji:"🏋️",duration:logs.filter(l=>["STRENGTH","CUSTOM"].includes(l.type)).reduce((a,l)=>a+(l.duration||0),0),color:T.orange},
            {label:"Running",emoji:"🏃",duration:runLogs.reduce((a,l)=>a+(l.duration||0),0),color:T.green},
            {label:"Hyrox Training",emoji:"🏁",duration:hyroxLogs.reduce((a,l)=>a+(l.duration||0),0),color:T.purple},
          ];
          const total=disciplines.reduce((s,x)=>s+x.duration,0)||1;
          return disciplines;
        })().map((d,i,arr)=>{
          const total=arr.reduce((s,x)=>s+x.duration,0)||1;
          const pct=Math.round(d.duration/total*100);
          return(
            <div key={i} style={{marginBottom:i<arr.length-1?18:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{d.emoji}</span>
                  <span style={{fontSize:14,fontWeight:700,color:T.text1}}>{d.label}</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:800,color:d.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(d.duration)}</span>
                  <span style={{fontSize:10,color:T.text2,background:T.surface,padding:"3px 8px",borderRadius:20,border:`1px solid ${T.border}`}}>{pct}%</span>
                </div>
              </div>
              <div style={{height:8,background:T.border,borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:d.color,borderRadius:4,transition:"width 0.6s ease"}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* WHERE YOU'RE IMPROVING */}
      <SecHead accent={T.green}>WHERE YOU'RE IMPROVING 📈</SecHead>
      <div style={{background:T.card,borderRadius:18,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:4}}>
        {improving.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"14px 16px",borderBottom:i<improving.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:12,background:T.greenL,border:`1px solid ${T.green}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{m.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text1,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:12,color:T.text2,lineHeight:1.4}}>{m.detail}</div>
            </div>
            <div style={{background:T.greenL,borderRadius:10,padding:"5px 10px",flexShrink:0,border:`1px solid ${T.green}33`}}>
              <div style={{fontSize:12,fontWeight:800,color:T.green,fontFamily:"'Barlow Condensed',sans-serif",whiteSpace:"nowrap"}}>↑ {m.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* WHERE TO FOCUS */}
      <SecHead accent={T.amber}>WHERE TO FOCUS 🎯</SecHead>
      <div style={{background:T.card,borderRadius:18,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:4}}>
        {needsWork.map((m,i)=>(
          <div key={i} style={{padding:"14px 16px",borderBottom:i<needsWork.length-1?`1px solid ${T.border}`:"none"}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:40,height:40,borderRadius:12,background:T.amberL,border:`1px solid ${T.amber}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{m.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:T.text1,marginBottom:3}}>{m.label}</div>
                <div style={{fontSize:12,color:T.text2,lineHeight:1.4,marginBottom:8}}>{m.detail}</div>
                <div style={{background:T.amberL,borderRadius:8,padding:"5px 12px",display:"inline-block",border:`1px solid ${T.amber}33`}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.amber}}>→ {m.action}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI COACHING */}
      <SecHead accent={T.purple}>AI COACHING ✨</SecHead>
      {!aiData&&!aiLoading&&(
        <button onClick={fetchAI} style={{width:"100%",padding:"18px",background:T.card,border:`1px solid ${T.borderM}`,borderRadius:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:16,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>Generate AI Analysis</div>
            <div style={{fontSize:12,color:T.text2,marginTop:3}}>Deep coaching insights · personalised recommendations</div>
          </div>
          <div style={{width:36,height:36,background:T.purple,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,flexShrink:0}}>→</div>
        </button>
      )}
      {aiLoading&&(
        <div style={{background:T.card,borderRadius:18,padding:"28px",textAlign:"center",border:`1px solid ${T.border}`}}>
          <div style={{width:30,height:30,border:`2.5px solid ${T.border}`,borderTopColor:T.purple,borderRadius:"50%",margin:"0 auto 12px",animation:"spin 0.8s linear infinite"}}/>
          <div style={{fontSize:13,color:T.text2}}>Analysing your training data…</div>
        </div>
      )}
      {aiData&&!aiLoading&&(
        <div style={{background:T.card,border:`1px solid rgba(139,127,240,0.3)`,borderRadius:18,padding:18}}>
          <div style={{fontSize:13,color:T.text1,lineHeight:1.65,marginBottom:16,padding:"13px 15px",background:T.purpleL,borderRadius:12}}>{aiData.overview}</div>
          {[{t:"Running",items:aiData.runningInsights,c:T.green},{t:"Strength",items:aiData.strengthInsights,c:T.orange},{t:"Weekly Focus",items:aiData.weeklyFocus,c:T.blue},{t:"Long Term Goals",items:aiData.longTermGoals,c:T.purple}].map(({t,items,c})=>items?.length>0&&(
            <div key={t} style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:c,letterSpacing:"0.07em",marginBottom:8}}>{t.toUpperCase()}</div>
              {items.map((item,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:6}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0,marginTop:5}}/>
                  <div style={{fontSize:13,color:T.text1,lineHeight:1.5}}>{item}</div>
                </div>
              ))}
            </div>
          ))}
          {aiData.hyroxReadiness&&<div style={{background:T.orangeL,borderRadius:12,padding:"13px 15px"}}><div style={{fontSize:11,fontWeight:800,color:T.orange,marginBottom:5}}>HYROX READINESS</div><div style={{fontSize:13,color:T.text1,lineHeight:1.5}}>{aiData.hyroxReadiness}</div></div>}
        </div>
      )}
    </div>
  );

  // ── MAIN HOME ────────────────────────────────────────────────────────────────
  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:40,height:40,background:T.orange,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:"#0D0F09",flexShrink:0}}>
            {(profile?.name||user?.email||"F").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"FX"}
          </div>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:T.text1,letterSpacing:"0.06em",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>
              {profile?.name?`HEY, ${profile.name.split(" ")[0].toUpperCase()}`:"FORGE"}
            </div>
            <div style={{fontSize:11,color:T.text2,marginTop:3}}>Hyrox & Fitness Tracker</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,background:streak>0?T.orangeL:"rgba(255,255,255,0.04)",borderRadius:20,padding:"8px 14px",border:`1px solid ${streak>0?T.orange+"44":T.border}`}}>
          <span style={{fontSize:15,lineHeight:1}}>🔥</span>
          <span style={{fontSize:20,fontWeight:900,color:streak>0?T.orange:T.text2,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{streak}</span>
          <span style={{fontSize:10,color:streak>0?T.orange:T.text2,opacity:0.8,letterSpacing:"0.06em"}}>STREAK</span>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{background:T.card,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:4}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
          {[
            {val:weeklySessions||0,sub:"Sessions",color:T.green},
            {val:totalKm>0?`${totalKm.toFixed(1)}km`:"0km",sub:"Distance",color:T.orange},
            {val:bestRun?bestRun.pace:"—",sub:"Best pace",color:T.purple},
            {val:hyroxLogs.length,sub:"Hyrox",color:T.blue},
          ].map((m,i)=>(
            <div key={i} style={{padding:"16px 6px 14px",textAlign:"center",borderRight:i<3?`1px solid ${T.border}`:"none",position:"relative"}}>
              <div style={{fontSize:22,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{m.val}</div>
              <div style={{fontSize:9,color:T.text2,marginTop:5,letterSpacing:"0.05em",lineHeight:1.3}}>{m.sub.toUpperCase()}</div>
              <div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:2,background:m.color,borderRadius:"2px 2px 0 0"}}/>
            </div>
          ))}
        </div>
      </div>

      {/* PERFORMANCE INSIGHTS — compact bar chart */}
      <SecHead accent={T.orange}>PERFORMANCE INSIGHTS</SecHead>
      <button onClick={()=>setInsightScreen(true)} style={{width:"100%",background:T.card,border:`1px solid ${T.borderM}`,borderRadius:18,padding:"16px 16px 0",cursor:"pointer",textAlign:"left",marginBottom:10,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>This Week</div>
            <div style={{fontSize:12,color:T.text2,marginTop:3}}>Tap to open full analysis →</div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{weeklySessions}</div>
              <div style={{fontSize:10,color:T.text2,letterSpacing:"0.05em",marginTop:3}}>SESSIONS</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{totalKm.toFixed(0)}km</div>
              <div style={{fontSize:10,color:T.text2,letterSpacing:"0.05em",marginTop:3}}>DISTANCE</div>
            </div>
            <div style={{width:30,height:30,background:T.orangeL,border:`1px solid ${T.orange}44`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:T.orange,fontSize:14,fontWeight:700,flexShrink:0}}>→</div>
          </div>
        </div>
        {/* Compact weekly bar chart — single accent color */}
        <div style={{display:"flex",gap:5,alignItems:"flex-end",height:52,borderTop:`1px solid ${T.border}`,paddingTop:10,paddingBottom:14}}>
          {WEEK_BARS.map((d,i)=>{
            const h=d.duration>0?Math.max((d.duration/wMaxDur)*100,14):3;
            const isToday=i===todayBarIdx;
            return(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,height:"100%"}}>
                <div style={{flex:1,width:"100%",display:"flex",alignItems:"flex-end"}}>
                  <div style={{width:"100%",height:`${h}%`,background:d.duration>0?T.orange:T.border,borderRadius:"3px 3px 0 0",opacity:d.duration>0?(isToday?1:0.5):0.2,transition:"height 0.3s"}}/>
                </div>
                <span style={{fontSize:9,color:isToday?T.text1:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:isToday?800:600}}>{d.short}</span>
              </div>
            );
          })}
        </div>
      </button>

      {/* ACTIVITY BREAKDOWN */}
      <SecHead accent={T.text2}>ACTIVITY BREAKDOWN</SecHead>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        {[
          {label:"Running",count:runLogs.length,unit:"runs",emoji:"🏃",c:T.text1,action:()=>setTab("running")},
          {label:"Training",count:trainLogs.length,unit:"sessions",emoji:"🏋️",c:T.text1,action:()=>setTab("training")},
          {label:"Hyrox",count:hyroxLogs.length,unit:"simulations",emoji:"🏁",c:T.text1,action:()=>setTab("hyrox")},
        ].map((m,i)=>(
          <button key={i} onClick={m.action} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 12px",cursor:"pointer",textAlign:"left"}}>
            <div style={{width:36,height:36,background:T.surface,border:`1px solid ${T.borderM}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:12,filter:"grayscale(1) brightness(1.4)"}}>{m.emoji}</div>
            <div style={{fontSize:26,fontWeight:900,color:T.orange,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{m.count}</div>
            <div style={{fontSize:12,color:T.text1,marginTop:7,fontWeight:600,opacity:0.7}}>{m.unit}</div>
            <div style={{fontSize:11,color:T.text2,marginTop:3,letterSpacing:"0.03em"}}>{m.label}</div>
          </button>
        ))}
      </div>

      {/* MY SESSIONS */}
      <button onClick={()=>setShowAllSessions(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",background:T.card,border:`1px solid ${T.border}`,borderRadius:16,cursor:"pointer",marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:T.orangeL,border:`1px solid ${T.orange}44`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>📋</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:15,fontWeight:800,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>MY SESSIONS</div>
            <div style={{fontSize:11,color:T.text2,marginTop:2}}>{logs.length} workout{logs.length!==1?"s":""} logged</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {logs.length>0&&<div style={{background:T.orange,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:800,color:"#0D0F09",fontFamily:"'Barlow Condensed',sans-serif"}}>{logs.length}</div>}
          <span style={{fontSize:18,color:T.text3}}>›</span>
        </div>
      </button>
    </div>
  );
}

// ─── ACCOUNT TAB ─────────────────────────────────────────────────────────────
function AccountTab({user,profile,onProfileUpdate}){
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(profile?.name||"");
  const [age,setAge]=useState(String(profile?.age||""));
  const [weightKg,setWeightKg]=useState(String(profile?.weight_kg||""));
  const [heightCm,setHeightCm]=useState(String(profile?.height_cm||""));
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");

  useEffect(()=>{
    setName(profile?.name||"");setAge(String(profile?.age||""));
    setWeightKg(String(profile?.weight_kg||""));setHeightCm(String(profile?.height_cm||""));
  },[profile]);

  const initials=(profile?.name||user?.email||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  const save=async()=>{
    setSaving(true);setErr("");
    const{error}=await supabase.from("profiles").update({
      name:name.trim()||null,
      age:parseInt(age)||null,
      weight_kg:parseFloat(weightKg)||null,
      height_cm:parseFloat(heightCm)||null,
    }).eq("id",user.id);
    setSaving(false);
    if(error){setErr(error.message);}
    else{onProfileUpdate({...profile,name:name.trim(),age:parseInt(age)||null,weight_kg:parseFloat(weightKg)||null,height_cm:parseFloat(heightCm)||null});setEditing(false);}
  };

  const inpStyle={width:"100%",background:T.surface,border:`1px solid ${T.borderM}`,borderRadius:12,padding:"14px 16px",color:T.text1,fontSize:15,fontFamily:"'Barlow',sans-serif",outline:"none",boxSizing:"border-box"};

  return(
    <div style={{padding:"20px 16px 100px",overflowY:"auto",minHeight:"100vh"}}>

      {/* Avatar + name */}
      <div style={{textAlign:"center",paddingTop:12,marginBottom:32}}>
        <div style={{width:80,height:80,borderRadius:24,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:30,fontWeight:900,color:"#0D0F09",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>
          {initials}
        </div>
        <div style={{fontSize:26,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.03em"}}>{profile?.name||"Athlete"}</div>
        <div style={{fontSize:13,color:T.text2,marginTop:5}}>{user?.email}</div>
      </div>

      {/* Stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:4}}>
        {[
          {label:"Age",val:profile?.age?`${profile.age}y`:"—"},
          {label:"Weight",val:profile?.weight_kg?`${profile.weight_kg}kg`:"—"},
          {label:"Height",val:profile?.height_cm?`${profile.height_cm}cm`:"—"},
        ].map((m,i)=>(
          <div key={i} style={{background:T.card,borderRadius:16,padding:"16px 12px",textAlign:"center",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:22,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{m.val}</div>
            <div style={{fontSize:11,color:T.text2,marginTop:6,fontWeight:600,letterSpacing:"0.04em"}}>{m.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Profile details */}
      <SecHead>PROFILE</SecHead>
      {!editing?(
        <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:14}}>
          {[
            {label:"Full Name",val:profile?.name||"—"},
            {label:"Age",val:profile?.age?`${profile.age} years`:"—"},
            {label:"Weight",val:profile?.weight_kg?`${profile.weight_kg} kg`:"—"},
            {label:"Height",val:profile?.height_cm?`${profile.height_cm} cm`:"—"},
            {label:"Lifting level",val:profile?.lifting_level?profile.lifting_level.charAt(0).toUpperCase()+profile.lifting_level.slice(1):"—"},
            {label:"Running level",val:profile?.running_level?profile.running_level.charAt(0).toUpperCase()+profile.running_level.slice(1):"—"},
            profile?.jog_pace&&{label:"Easy jog pace",val:`${profile.jog_pace}/km`},
            profile?.jog_distance_km&&{label:"Comfortable distance",val:`${profile.jog_distance_km} km`},
          ].filter(Boolean).map((row,i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:13,color:T.text2,fontWeight:600}}>{row.label}</span>
              <span style={{fontSize:14,color:T.text1,fontWeight:700}}>{row.val}</span>
            </div>
          ))}
        </div>
      ):(
        <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"18px 16px",marginBottom:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div><div style={{fontSize:11,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>FULL NAME</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inpStyle}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div><div style={{fontSize:11,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>AGE</div><input value={age} onChange={e=>setAge(e.target.value)} type="number" placeholder="25" style={inpStyle}/></div>
              <div><div style={{fontSize:11,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>WEIGHT (kg)</div><input value={weightKg} onChange={e=>setWeightKg(e.target.value)} type="number" placeholder="75" style={inpStyle}/></div>
              <div><div style={{fontSize:11,color:T.text2,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>HEIGHT (cm)</div><input value={heightCm} onChange={e=>setHeightCm(e.target.value)} type="number" placeholder="175" style={inpStyle}/></div>
            </div>
          </div>
          {err&&<div style={{color:T.red,fontSize:12,marginTop:10,padding:"8px 12px",background:T.redL,borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>{setEditing(false);setErr("");}} style={{flex:1,padding:"13px",background:"none",border:`1px solid ${T.borderM}`,borderRadius:50,color:T.text2,fontSize:13,fontWeight:700,cursor:"pointer"}}>Cancel</button>
            <Btn onClick={save} color={T.orange} style={{flex:1}}>{saving?"Saving…":"Save Changes"}</Btn>
          </div>
        </div>
      )}

      {!editing&&<GhostBtn onClick={()=>setEditing(true)} style={{marginBottom:14}}>Edit Profile</GhostBtn>}

      {/* Sign out */}
      <SecHead accent={T.red}>ACCOUNT</SecHead>
      <button onClick={()=>supabase.auth.signOut()} style={{width:"100%",padding:"16px",background:T.redL,border:`1px solid ${T.red}44`,borderRadius:50,color:T.red,fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:"0.05em",fontFamily:"'Barlow Condensed',sans-serif"}}>
        Sign Out
      </button>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
function MainApp({ user }) {
  const [tab,setTab]=useState(()=>localStorage.getItem("forge_tab")||"home");
  useEffect(()=>{localStorage.setItem("forge_tab",tab);},[tab]);
  const [logs,setLogs]=useState(()=>{
    try{const s=localStorage.getItem("forge_logs");return s?JSON.parse(s):[];}catch{return[];}
  });
  const [profile,setProfile]=useState(null);

  // Keep localStorage as offline cache
  useEffect(()=>{try{localStorage.setItem("forge_logs",JSON.stringify(logs));}catch{};},[logs]);

  useEffect(()=>{
    if(!user?.id)return;
    supabase.from("profiles").select("*").eq("id",user.id).single()
      .then(({data})=>{ if(data) setProfile(data); });
  },[user?.id]);

  // On mount: fetch logs from Supabase and merge with any offline-only localStorage entries
  useEffect(()=>{
    if(!user?.id)return;
    supabase.from("workout_logs").select("id,data").eq("user_id",user.id).order("id",{ascending:false})
      .then(({data,error})=>{
        if(error||!data)return;
        const remoteIds=new Set(data.map(r=>r.id));
        const local=JSON.parse(localStorage.getItem("forge_logs")||"[]");
        const offline=local.filter(l=>!remoteIds.has(l._id));
        // Upload offline entries captured while not connected
        offline.forEach(entry=>{
          supabase.from("workout_logs").insert({id:entry._id,user_id:user.id,data:entry}).then();
        });
        setLogs([...data.map(r=>r.data),...offline]);
      });
  },[user?.id]);

  const addLog=useCallback(e=>{
    const entry={...e,_id:Date.now()};
    setLogs(p=>[entry,...p]);
    supabase.from("workout_logs").insert({id:entry._id,user_id:user.id,data:entry}).then();
  },[user?.id]);

  const deleteLog=useCallback(id=>{
    setLogs(p=>p.filter(l=>l._id!==id&&l.id!==id));
    supabase.from("workout_logs").delete().eq("id",id).eq("user_id",user.id).then();
  },[user?.id]);

  const initials=(profile?.name||user?.email||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const NAV=[
    {id:"home",label:"Home",icon:"⚡"},
    {id:"hyrox",label:"Hyrox",icon:"🏁"},
    {id:"training",label:"Training",icon:"🏋️"},
    {id:"running",label:"Running",icon:"🏃"},
    {id:"account",label:"Account",icon:null},
  ];

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.bg,fontFamily:"'Barlow', sans-serif",color:T.text1}}>
      {tab==="home"    &&<HomeTab     logs={logs} setTab={setTab} profile={profile} user={user} deleteLog={deleteLog}/>}
      {tab==="hyrox"   &&<HyroxTab    logs={logs} addLog={addLog} deleteLog={deleteLog}/>}
      {tab==="training"&&<TrainingTab logs={logs} addLog={addLog} deleteLog={deleteLog}/>}
      {tab==="running" &&<RunningTab  logs={logs} addLog={addLog} deleteLog={deleteLog}/>}
      {tab==="account" &&<AccountTab  user={user} profile={profile} onProfileUpdate={setProfile}/>}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(18,20,13,0.96)",borderRadius:"22px 22px 0 0",boxShadow:"0 -1px 0 rgba(255,255,255,0.06), 0 -8px 32px rgba(0,0,0,0.4)",display:"flex",zIndex:100,paddingBottom:16,paddingTop:10,backdropFilter:"blur(20px)"}}>
        {NAV.map((n,idx)=>{const active=tab===n.id;return(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,padding:"2px 4px 0",background:"none",border:"none",borderLeft:idx>0?"1px solid rgba(255,255,255,0.07)":"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {n.id==="account"?(
              <div style={{width:38,height:38,borderRadius:"50%",background:active?T.orange:T.card,border:`1px solid ${active?T.orange:T.borderM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:active?"#0D0F09":T.text2,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em",transition:"all 0.2s"}}>
                {initials}
              </div>
            ):(
              <div style={{width:38,height:38,borderRadius:"50%",background:active?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all 0.2s"}}>
                <span style={{filter:active?"brightness(0)":"grayscale(1) brightness(1.6)",transition:"filter 0.2s"}}>{n.icon}</span>
              </div>
            )}
            <span style={{fontSize:9,fontWeight:active?700:400,color:active?T.orange:"rgba(255,255,255,0.5)",letterSpacing:"0.04em",transition:"color 0.2s"}}>{n.label}</span>
          </button>
        );})}
      </div>
    </div>
  );
}

const DEV_USER = {id:"dev-preview",email:"dev@forge.local"};

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("forge_profile")); } catch { return null; }
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [devOnboard, setDevOnboard] = useState(false);
  const [devApp, setDevApp] = useState(
    new URLSearchParams(window.location.search).has("dev") ||
    window.location.hostname === "localhost"
  );
  const [cachedUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("forge_user_cache")); } catch { return null; }
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        localStorage.removeItem("forge_user_cache");
        localStorage.removeItem("forge_profile");
      } else if (session?.user) {
        localStorage.setItem("forge_user_cache", JSON.stringify({ id: session.user.id, email: session.user.email }));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Persist profile so returning users skip the spinner
  useEffect(() => {
    try { if (profile) localStorage.setItem("forge_profile", JSON.stringify(profile)); } catch {}
  }, [profile]);

  // Only refetch when user actually changes — NOT on every token refresh
  useEffect(() => {
    if (session === undefined) return;
    if (!session) { setProfile(null); return; }
    setProfileLoading(true);
    supabase.from("profiles").select("onboarded").eq("id", session.user.id).single()
      .then(({ data }) => { if (data) setProfile(data); setProfileLoading(false); });
  }, [session?.user?.id]);

  if (devApp) return <MainApp user={DEV_USER}/>;

  // Returning authenticated user: render immediately from cache, no spinner
  if (session === undefined && cachedUser && profile?.onboarded) {
    return <MainApp user={cachedUser}/>;
  }

  if (session === undefined || (profileLoading && !profile)) {
    return (
      <div style={{minHeight:"100vh",background:"#0D0F09",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:40,height:40,border:"3px solid rgba(212,224,32,0.2)",borderTopColor:"#D4E020",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (devOnboard) return <Onboarding user={DEV_USER} onComplete={()=>setDevOnboard(false)}/>;
  if (!session) return <Auth onDevMode={()=>setDevOnboard(true)}/>;
  if (!profile?.onboarded) return <Onboarding user={session.user} onComplete={() => setProfile({ onboarded: true })} />;
  return <MainApp user={session.user} />;
}
