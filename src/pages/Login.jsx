import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { UserAuth } from "@/api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [form, setForm] = useState({ email: "", password: "", prenom: "", nom: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        await UserAuth.register(form.email, form.password, {
          full_name: `${form.prenom} ${form.nom}`.trim()
        });
        setSuccess("Compte créé ! Vérifiez votre email pour activer votre compte.");
        setMode("login");
      } else if (mode === "login") {
        await UserAuth.login(form.email, form.password);
        navigate("/Feed");
      } else if (mode === "forgot") {
        await UserAuth.resetPassword(form.email);
        setSuccess("Email de réinitialisation envoyé !");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await UserAuth.loginWithGoogle();
      navigate("/Feed");
    } catch (err) {
      setError(err.message || "Connexion Google échouée.");
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    setError(null);
    try {
      await UserAuth.loginWithApple();
      navigate("/Feed");
    } catch (err) {
      setError(err.message || "Connexion Apple échouée.");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 14,
    padding: "14px 16px", fontSize: 15, outline: "none",
    boxSizing: "border-box", background: "white", fontFamily: "inherit",
    transition: "border-color 0.2s"
  };

  return (
    <div style={{
      minHeight: "100vh", maxWidth: 430, margin: "0 auto",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      background: "white", display: "flex", flexDirection: "column"
    }}>
      {/* Header gradient */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
        padding: "60px 32px 48px",
        borderRadius: "0 0 32px 32px",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏷️</div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>Click & Promo</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 6 }}>
          {mode === "login" ? "Bon retour parmi nous 👋" : mode === "register" ? "Rejoignez la communauté !" : "Réinitialiser le mot de passe"}
        </div>
      </div>

      <div style={{ flex: 1, padding: "32px 24px 40px", overflowY: "auto" }}>

        {/* Tabs login/register */}
        {mode !== "forgot" && (
          <div style={{ display: "flex", background: "#f5f5f7", borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {[{ key: "login", label: "Se connecter" }, { key: "register", label: "S'inscrire" }].map(t => (
              <button key={t.key} onClick={() => { setMode(t.key); setError(null); setSuccess(null); }} style={{
                flex: 1, background: mode === t.key ? "white" : "transparent",
                color: mode === t.key ? "#1a1a1a" : "#888",
                border: "none", borderRadius: 10, padding: "10px",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: mode === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s"
              }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Succès */}
        {success && (
          <div style={{ background: "#F0FFF4", border: "1px solid #34C759", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#1a7a3c", fontSize: 14 }}>
            ✅ {success}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ background: "#FFF0F0", border: "1px solid #FF3B30", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#c0392b", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <input
                placeholder="Prénom"
                value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })}
                required
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                placeholder="Nom"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                required
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="Adresse email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          {mode !== "forgot" && (
            <div style={{ marginBottom: 20, position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Mot de passe"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa"
              }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%",
            background: loading ? "#e0e0e0" : "linear-gradient(135deg, #FF6B00, #FF3B30)",
            color: loading ? "#aaa" : "white",
            border: "none", borderRadius: 14, padding: "16px",
            fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(255,107,0,0.35)",
            transition: "all 0.2s", marginBottom: 12
          }}>
            {loading ? "⏳ Chargement..." : mode === "login" ? "🚀 Se connecter" : mode === "register" ? "✨ Créer mon compte" : "📧 Envoyer le lien"}
          </button>
        </form>

        {/* Mot de passe oublié */}
        {mode === "login" && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <button onClick={() => { setMode("forgot"); setError(null); setSuccess(null); }} style={{
              background: "none", border: "none", color: "#FF6B00",
              fontSize: 13, cursor: "pointer", fontWeight: 600
            }}>
              Mot de passe oublié ?
            </button>
          </div>
        )}
        {mode === "forgot" && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <button onClick={() => { setMode("login"); setError(null); setSuccess(null); }} style={{
              background: "none", border: "none", color: "#888",
              fontSize: 13, cursor: "pointer"
            }}>
              ← Retour à la connexion
            </button>
          </div>
        )}

        {/* Séparateur */}
        {mode !== "forgot" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
              <span style={{ color: "#aaa", fontSize: 13 }}>ou continuer avec</span>
              <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
            </div>

            {/* OAuth */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button onClick={handleGoogle} disabled={loading} style={{
                flex: 1, background: "white", border: "1.5px solid #e8e8e8",
                borderRadius: 14, padding: "14px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 14, fontWeight: 600, color: "#333",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.2s"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button onClick={handleApple} disabled={loading} style={{
                flex: 1, background: "#1a1a1a", border: "1.5px solid #1a1a1a",
                borderRadius: 14, padding: "14px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 14, fontWeight: 600, color: "white",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "all 0.2s"
              }}>
                <svg width="16" height="18" viewBox="0 0 814 1000" fill="white">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.2-151.2-100.8C27.1 742.2 1 636.1 1 530.4c0-171.8 111.3-262.5 220.6-262.5 83.5 0 152.9 55.3 203.1 55.3 47.8 0 126.6-58.3 222.4-58.3zm-181 -127.3c-38.6 45.7-101.5 81.5-162.2 81.5-0.6 0-1.3-0.1-1.9-0.1 0-62.1 33.7-124.3 75.3-165.5 44.1-44.5 109.7-78.3 167.9-83.5 0.7 0 1.3-0.1 2-0.1 0 66.8-33.2 124-80.5 167.7z"/>
                </svg>
                Apple
              </button>
            </div>
          </>
        )}

        {/* CGU */}
        {mode === "register" && (
          <div style={{ textAlign: "center", color: "#aaa", fontSize: 11, lineHeight: 1.6 }}>
            En créant un compte, vous acceptez nos{" "}
            <a href="/PrivacyPolicy" style={{ color: "#FF6B00", textDecoration: "none" }}>
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="/PrivacyPolicy" style={{ color: "#FF6B00", textDecoration: "none" }}>
              Politique de confidentialité
            </a>
          </div>
        )}

        {/* Continuer sans compte */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={() => { localStorage.setItem("cp_onboarded", "1"); window.location.href = "/Feed"; }}
            style={{ background: "none", border: "none", color: "#bbb", fontSize: 13, cursor: "pointer" }}
          >
            Continuer sans compte →
          </button>
        </div>
      </div>
    </div>
  );
}
