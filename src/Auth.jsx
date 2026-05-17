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
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
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
        <img
          src="/gym.jpg"
          alt=""
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",display:"block"}}
        />
        {/* Dark gradient overlay — stronger at bottom so form blends in */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(13,15,9,0.3) 0%, rgba(13,15,9,0.15) 40%, rgba(13,15,9,0.85) 80%, #0D0F09 100%)"}}/>

        {/* FORGE branding over image */}
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

        {/* Tab toggle */}
        <div style={{display:"flex",background:T.surface,borderRadius:14,padding:4,marginBottom:24,border:`1px solid ${T.border}`}}>
          {["signin","signup"].map(m => (
            <button key={m} onClick={()=>{setMode(m);setError("");setMessage("");}} style={{
              flex:1,padding:"11px",borderRadius:11,border:"none",cursor:"pointer",
              background:mode===m?T.card:"transparent",
              color:mode===m?T.text1:T.text2,
              fontFamily:"'Barlow',sans-serif",fontSize:14,fontWeight:700,
              letterSpacing:"0.04em",transition:"all 0.2s",
            }}>
              {m === "signin" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>
          <input
            style={inp} type="email" placeholder="Email address"
            value={email} onChange={e=>setEmail(e.target.value)} required
          />
          <input
            style={inp} type="password" placeholder="Password"
            value={password} onChange={e=>setPassword(e.target.value)} required
          />

          {error && <div style={{color:"#E05858",fontSize:13,textAlign:"center",padding:"10px",background:"rgba(224,88,88,0.1)",borderRadius:10}}>{error}</div>}
          {message && <div style={{color:T.orange,fontSize:13,textAlign:"center",padding:"10px",background:T.orangeL,borderRadius:10}}>{message}</div>}

          <button type="submit" disabled={loading} style={{...btn(T.orange,"#0D0F09"),marginTop:4,opacity:loading?0.6:1}}>
            {loading ? "…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
          <div style={{flex:1,height:1,background:T.border}}/>
          <span style={{color:T.text2,fontSize:12,letterSpacing:"0.06em"}}>OR</span>
          <div style={{flex:1,height:1,background:T.border}}/>
        </div>

        {/* Google */}
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
