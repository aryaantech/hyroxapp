import { useState } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#0D0F09", surface:"#161810", card:"#1E2118",
  border:"rgba(255,255,255,0.06)", borderM:"rgba(255,255,255,0.11)",
  orange:"#D4E020", orangeL:"rgba(212,224,32,0.13)",
  text1:"#F5F5F0", text2:"#6B6D5C",
};

const inp = {
  width:"100%", background:T.surface, border:`1px solid ${T.borderM}`,
  borderRadius:14, padding:"16px 18px", color:T.text1, fontSize:16,
  fontFamily:"'Barlow',sans-serif", outline:"none", boxSizing:"border-box",
};

const btn = (bg, color) => ({
  width:"100%", padding:"17px", borderRadius:14, border:"none",
  background:bg, color:color, fontSize:16, fontWeight:700,
  fontFamily:"'Barlow',sans-serif", cursor:"pointer", letterSpacing:"0.04em",
});

export default function Auth() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
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
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'Barlow',sans-serif"}}>
      <div style={{width:"100%",maxWidth:390}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,background:T.orange,borderRadius:20,marginBottom:20}}>
            <span style={{fontSize:32,filter:"brightness(0)"}}>⚡</span>
          </div>
          <div style={{fontSize:36,fontWeight:900,color:T.text1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em",lineHeight:1}}>FORGE</div>
          <div style={{fontSize:13,color:T.text2,marginTop:8,letterSpacing:"0.08em"}}>HYROX TRAINING</div>
        </div>

        {/* Tab toggle */}
        <div style={{display:"flex",background:T.surface,borderRadius:14,padding:4,marginBottom:28,border:`1px solid ${T.border}`}}>
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
            {loading ? "..." : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
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
      </div>
    </div>
  );
}
