import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";
import { DS, CPLogo } from "./theme";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        await UserAuth.login(email, password);
      } else {
        await UserAuth.register(email, password, name);
      }
      navigate("/Feed");
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 50%, #A855F7 100%)`,
      display: "flex", flexDirection: "column",
      fontFamily: DS.fontBase,
    }}>
      {/* Top */}
      <div style={{ padding: "52px 24px 32px", textAlign: "center" }}>
        <CPLogo size={48} />
        <div style={{ fontSize: 26, fontWeight: 900, color: DS.white, marginTop: 12, letterSpacing: -0.8 }}>
          {mode === "login" ? "Bon retour 👋" : "Créer un compte"}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", marginTop: 6 }}>
          {mode === "login" ? "Connectez-vous pour voir vos offres" : "Rejoignez Click & Promo gratuitement"}
        </div>
      </div>

      {/* Formulaire */}
      <div style={{
        flex: 1,
        background: DS.white,
        borderRadius: "28px 28px 0 0",
        padding: "32px 24px 40px",
      }}>
        {/* Toggle */}
        <div style={{ display: "flex", background: DS.bg, borderRadius: DS.pill, padding: 4, marginBottom: 28 }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "10px", borderRadius: DS.pill,
              background: mode === m ? DS.white : "transparent",
              border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14, color: mode === m ? DS.ink : DS.ink40,
              boxShadow: mode === m ? DS.e1 : "none",
              transition: "all .2s",
            }}>
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 8 }}>
                Prénom
              </label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Votre prénom"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com" required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: `1px solid ${DS.danger}30`, borderRadius: DS.md, padding: "12px 14px", color: DS.danger, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: DS.brand, color: DS.white,
            border: "none", borderRadius: DS.pill,
            padding: "18px", fontSize: 16, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: DS.eBrand, marginBottom: 14,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Connexion…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        {/* OAuth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: DS.ink10 }} />
          <span style={{ fontSize: 13, color: DS.ink40 }}>ou</span>
          <div style={{ flex: 1, height: 1, background: DS.ink10 }} />
        </div>

        <button onClick={() => UserAuth.loginWithGoogle?.().then(() => navigate("/Feed")).catch(e => setError(e.message))} style={{
          width: "100%", background: DS.white, color: DS.ink,
          border: `1.5px solid ${DS.ink10}`, borderRadius: DS.pill,
          padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => navigate("/Feed")} style={{ background: "none", border: "none", color: DS.ink40, fontSize: 14, cursor: "pointer" }}>
            Continuer sans compte →
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 700, color: "#1A1A2E99",
  textTransform: "uppercase", letterSpacing: .8,
  display: "block", marginBottom: 8,
};
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#F5F5F7", border: "1.5px solid transparent",
  borderRadius: 12, padding: "14px 16px",
  fontSize: 15, color: "#1A1A2E",
  fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  outline: "none",
};
