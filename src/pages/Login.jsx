import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo } from "./Home";

export default function Login() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [mode, setMode] = useState(sp.get("mode")==="register" ? "register" : "login");
  const [form, setForm] = useState({ email:"", password:"", prenom:"", nom:"" });
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState(null); const [ok, setOk] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading("email"); setErr(null);
    try {
      if (mode === "register") { await UserAuth.register(form.email, form.password, { full_name:`${form.prenom} ${form.nom}`.trim() }); setOk("Compte créé — vérifiez votre email."); setMode("login"); setLoading(null); }
      else if (mode === "login") { await UserAuth.login(form.email, form.password); navigate("/Feed"); }
      else { await UserAuth.resetPassword(form.email); setOk("Lien de réinitialisation envoyé."); setLoading(null); }
    } catch(e) { setErr(e.message || "Erreur."); setLoading(null); }
  };
  const google = async () => { setLoading("google"); try { await UserAuth.loginWithGoogle(); navigate("/Feed"); } catch(e) { setErr(e.message); setLoading(null); } };
  const apple  = async () => { setLoading("apple");  try { await UserAuth.loginWithApple();  navigate("/Feed"); } catch(e) { setErr(e.message); setLoading(null); } };

  const inp = { width:"100%", border:`1.5px solid ${DS.ink10}`, borderRadius:DS.md, padding:"13px 14px", fontSize:14, outline:"none", boxSizing:"border-box", background:DS.ink05, fontFamily:DS.font, color:DS.ink, transition:"border-color .2s" };

  return (
    <div style={{ minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:DS.font, background:DS.white, display:"flex", flexDirection:"column" }}>

      {/* Haut sobre */}
      <div style={{ background:DS.ink, padding:"72px 32px 40px", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <CPLogo size={52} inverted/>
        <div style={{ color:DS.white, fontSize:24, fontWeight:800, marginTop:18, letterSpacing:-0.6 }}>
          {mode==="login" ? "Bon retour" : mode==="register" ? "Créer un compte" : "Mot de passe oublié"}
        </div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:14, marginTop:6 }}>
          {mode==="login" ? "Connectez-vous pour continuer" : mode==="register" ? "Gratuit et sans engagement" : "Recevez un lien par email"}
        </div>
      </div>

      <div style={{ flex:1, padding:"28px 24px 40px", overflowY:"auto" }}>

        {/* Tabs */}
        {mode !== "forgot" && (
          <div style={{ display:"flex", background:DS.ink05, borderRadius:DS.md, padding:4, marginBottom:24, gap:4 }}>
            {[{k:"login",l:"Connexion"},{k:"register",l:"Inscription"}].map(t => (
              <button key={t.k} onClick={() => { setMode(t.k); setErr(null); setOk(null); }} style={{ flex:1, background:mode===t.k?DS.white:"transparent", color:mode===t.k?DS.ink:DS.ink40, border:"none", borderRadius:DS.sm, padding:"11px", fontSize:14, fontWeight:mode===t.k?700:500, cursor:"pointer", boxShadow:mode===t.k?DS.e1:"none", transition:"all .2s" }}>{t.l}</button>
            ))}
          </div>
        )}

        {ok && <div style={{ background:"#F0FFF9", border:`1px solid ${DS.success}`, borderRadius:DS.md, padding:"12px 14px", marginBottom:14, color:DS.success, fontSize:13, display:"flex", alignItems:"center", gap:8 }}>{Ic.check(DS.success,14)}{ok}</div>}
        {err && <div style={{ background:"#FEF2F2", border:`1px solid ${DS.danger}`, borderRadius:DS.md, padding:"12px 14px", marginBottom:14, color:DS.danger, fontSize:13 }}>{err}</div>}

        <form onSubmit={submit}>
          {mode === "register" && (
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form,prenom:e.target.value})} required style={{...inp,flex:1}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
              <input placeholder="Nom" value={form.nom} onChange={e => setForm({...form,nom:e.target.value})} style={{...inp,flex:1}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <input type="email" placeholder="Adresse email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required style={inp} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
          </div>
          {mode !== "forgot" && (
            <div style={{ marginBottom:20, position:"relative" }}>
              <input type={showPw?"text":"password"} placeholder="Mot de passe" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required minLength={6} style={{...inp,paddingRight:46}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex" }}>
                {Ic.eye(DS.ink20, 18)}
              </button>
            </div>
          )}
          <button type="submit" disabled={!!loading} style={{ width:"100%", background:loading==="email"?DS.ink10:DS.brand, color:loading==="email"?DS.ink40:DS.white, border:"none", borderRadius:DS.lg, padding:"15px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":DS.eBrand, marginBottom:12, transition:"all .2s" }}>
            {loading==="email" ? "Chargement…" : mode==="login" ? "Se connecter" : mode==="register" ? "Créer mon compte" : "Envoyer le lien"}
          </button>
        </form>

        {mode==="login" && <div style={{ textAlign:"center", marginBottom:20 }}><button onClick={() => {setMode("forgot");setErr(null);setOk(null);}} style={{ background:"none", border:"none", color:DS.brand, fontSize:13, cursor:"pointer", fontWeight:600 }}>Mot de passe oublié ?</button></div>}
        {mode==="forgot" && <div style={{ textAlign:"center", marginBottom:20 }}><button onClick={() => {setMode("login");setErr(null);setOk(null);}} style={{ background:"none", border:"none", color:DS.ink40, fontSize:13, cursor:"pointer" }}>← Retour</button></div>}

        {mode !== "forgot" && (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{ flex:1, height:1, background:DS.ink10 }}/><span style={{ color:DS.ink20, fontSize:12 }}>ou</span><div style={{ flex:1, height:1, background:DS.ink10 }}/>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              <button onClick={google} disabled={!!loading} style={{ flex:1, background:DS.white, border:`1.5px solid ${DS.ink10}`, borderRadius:DS.md, padding:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14, fontWeight:600, color:DS.ink, boxShadow:DS.e1 }}>
                {loading==="google"?"…":<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                Google
              </button>
              <button onClick={apple} disabled={!!loading} style={{ flex:1, background:DS.ink, border:"none", borderRadius:DS.md, padding:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14, fontWeight:600, color:DS.white, boxShadow:DS.e1 }}>
                {loading==="apple"?"…":<svg width="14" height="17" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.2-151.2-100.8C27.1 742.2 1 636.1 1 530.4c0-171.8 111.3-262.5 220.6-262.5 83.5 0 152.9 55.3 203.1 55.3 47.8 0 126.6-58.3 222.4-58.3zm-181-127.3c-38.6 45.7-101.5 81.5-162.2 81.5-.6 0-1.3-.1-1.9-.1 0-62.1 33.7-124.3 75.3-165.5 44.1-44.5 109.7-78.3 167.9-83.5.7 0 1.3-.1 2-.1 0 66.8-33.2 124-80.5 167.7z"/></svg>}
                Apple
              </button>
            </div>
          </>
        )}

        {mode === "register" && <div style={{ textAlign:"center", color:DS.ink20, fontSize:11, lineHeight:1.7 }}>En créant un compte, vous acceptez nos <a href="/PrivacyPolicy" style={{ color:DS.brand, textDecoration:"none" }}>CGU</a></div>}
        <div style={{ textAlign:"center", marginTop:14 }}>
          <button onClick={() => { localStorage.setItem("cp_skip","1"); navigate("/Feed"); }} style={{ background:"none", border:"none", color:DS.ink20, fontSize:13, cursor:"pointer" }}>Continuer sans compte</button>
        </div>
      </div>
    </div>
  );
}
