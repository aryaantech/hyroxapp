import { useState } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#0D0F09", surface:"#161810", card:"#1E2118",
  border:"rgba(255,255,255,0.06)", borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020", orangeL:"rgba(212,224,32,0.13)",
  text1:"#F5F5F0", text2:"#6B6D5C",
};

const inp = {
  width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:16, padding:"18px 20px", color:T.text1, fontSize:16,
  fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box",
};

const primaryBtn = {
  width:"100%", padding:"18px", borderRadius:50, border:"none",
  background:T.orange, color:"#0D0F09", fontSize:14, fontWeight:800,
  fontFamily:"'Barlow Condensed',sans-serif", cursor:"pointer", letterSpacing:"0.08em",
};

const ghostBtn = {
  width:"100%", padding:"17px", borderRadius:50, border:"1px solid rgba(255,255,255,0.1)",
  background:"rgba(255,255,255,0.04)", color:T.text1, fontSize:14, fontWeight:700,
  fontFamily:"'Barlow',sans-serif", cursor:"pointer", letterSpacing:"0.04em",
  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
};

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width:38, height:38, borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
      background:"rgba(255,255,255,0.04)", color:T.text1, cursor:"pointer",
      fontSize:18, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center",
    }}>←</button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function HeroImage({ compact }) {
  return (
    <div style={{ position:"relative", height: compact ? "32vh" : "46vh", minHeight: compact ? 180 : 260, flexShrink:0, overflow:"hidden" }}>
      <img src="/gym.jpg" alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", display:"block" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(13,15,9,0.3) 0%,rgba(13,15,9,0.15) 40%,rgba(13,15,9,0.85) 80%,#0D0F09 100%)" }}/>
      {!compact && (
        <div style={{ position:"absolute", bottom:28, left:24, right:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, background:T.orange, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:24, filter:"brightness(0)" }}>⚡</span>
            </div>
            <div>
              <div style={{ fontSize:34, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.06em", lineHeight:1 }}>FORGE</div>
              <div style={{ fontSize:11, color:"rgba(245,245,240,0.55)", marginTop:3, letterSpacing:"0.1em", fontWeight:600 }}>HYROX & FITNESS TRACKER</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Auth({ onDevMode }) {
  const [screen, setScreen] = useState("landing"); // landing | signin | signup
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [message, setMessage]   = useState("");

  function reset() { setError(""); setMessage(""); }
  function goSignIn() { reset(); setScreen("signin"); }
  function goSignUp() { reset(); setScreen("signup"); }
  function goLanding() { reset(); setScreen("landing"); }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{ redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleSignIn(e) {
    e.preventDefault(); setLoading(true); reset();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleSignUp(e) {
    e.preventDefault(); setLoading(true); reset();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setMessage("Check your email to confirm your account.");
    setLoading(false);
  }

  // ── LANDING ───────────────────────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto", fontFamily:"'Barlow',sans-serif", animation:"fadeInUp 0.35s ease both" }}>
      <HeroImage compact={false}/>
      <div style={{ flex:1, padding:"32px 24px 44px", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:26, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.03em", lineHeight:1.1, marginBottom:8 }}>
            Train like a competitor.
          </div>
          <div style={{ fontSize:14, color:T.text2, lineHeight:1.6 }}>
            Track every rep, run, and race. Built for Hyrox athletes who take their training seriously.
          </div>
        </div>
        <button onClick={goSignUp} style={primaryBtn}>GET STARTED</button>
        <button onClick={goSignIn} style={ghostBtn}>SIGN IN</button>
        <div style={{ marginTop:"auto", textAlign:"center" }}>
          <span style={{ fontSize:11, color:T.text2, letterSpacing:"0.04em" }}>Built for Hyrox competitors</span>
          {onDevMode && (
            <div style={{ marginTop:16 }}>
              <button onClick={onDevMode} style={{ background:"none", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 14px", color:T.text2, fontSize:11, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>
                Dev: Preview Onboarding →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── SIGN IN ───────────────────────────────────────────────────────────────
  if (screen === "signin") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto", fontFamily:"'Barlow',sans-serif", animation:"fadeInUp 0.3s ease both" }}>
      <HeroImage compact/>
      <div style={{ flex:1, padding:"28px 24px 44px", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
          <BackBtn onClick={goLanding}/>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.03em" }}>Welcome back</div>
            <div style={{ fontSize:13, color:T.text2, marginTop:2 }}>Sign in to continue your training</div>
          </div>
        </div>
        <form onSubmit={handleSignIn} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          {error && <div style={{ color:"#E05858", fontSize:13, textAlign:"center", padding:"10px 14px", background:"rgba(224,88,88,0.1)", borderRadius:12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ ...primaryBtn, marginTop:4, opacity:loading?0.6:1 }}>
            {loading ? "…" : "SIGN IN"}
          </button>
        </form>
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:T.border }}/>
          <span style={{ color:T.text2, fontSize:12, letterSpacing:"0.06em" }}>OR</span>
          <div style={{ flex:1, height:1, background:T.border }}/>
        </div>
        <button onClick={handleGoogle} disabled={loading} style={ghostBtn}><GoogleIcon/>CONTINUE WITH GOOGLE</button>
        <div style={{ marginTop:"auto", paddingTop:24, textAlign:"center" }}>
          <span style={{ fontSize:13, color:T.text2 }}>No account? </span>
          <button onClick={goSignUp} style={{ background:"none", border:"none", color:T.orange, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>Sign up</button>
        </div>
      </div>
    </div>
  );

  // ── SIGN UP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto", fontFamily:"'Barlow',sans-serif", animation:"fadeInUp 0.3s ease both" }}>
      <HeroImage compact/>
      <div style={{ flex:1, padding:"28px 24px 44px", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
          <BackBtn onClick={goLanding}/>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:T.text1, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.03em" }}>Create your account</div>
            <div style={{ fontSize:13, color:T.text2, marginTop:2 }}>Free forever. Start training smarter.</div>
          </div>
        </div>
        <form onSubmit={handleSignUp} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input style={inp} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} required/>
          {error && <div style={{ color:"#E05858", fontSize:13, textAlign:"center", padding:"10px 14px", background:"rgba(224,88,88,0.1)", borderRadius:12 }}>{error}</div>}
          {message && <div style={{ color:T.orange, fontSize:13, textAlign:"center", padding:"10px 14px", background:T.orangeL, borderRadius:12 }}>{message}</div>}
          <button type="submit" disabled={loading} style={{ ...primaryBtn, marginTop:4, opacity:loading?0.6:1 }}>
            {loading ? "…" : "CREATE ACCOUNT"}
          </button>
        </form>
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:T.border }}/>
          <span style={{ color:T.text2, fontSize:12, letterSpacing:"0.06em" }}>OR</span>
          <div style={{ flex:1, height:1, background:T.border }}/>
        </div>
        <button onClick={handleGoogle} disabled={loading} style={ghostBtn}><GoogleIcon/>CONTINUE WITH GOOGLE</button>
        <div style={{ marginTop:"auto", paddingTop:24, textAlign:"center" }}>
          <span style={{ fontSize:13, color:T.text2 }}>Already have an account? </span>
          <button onClick={goSignIn} style={{ background:"none", border:"none", color:T.orange, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
