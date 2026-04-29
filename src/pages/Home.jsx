import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS } from "./theme";

const STATS = [
  { val: "10 000+", label: "Offres actives" },
  { val: "500+",    label: "Commerçants" },
  { val: "4.8★",    label: "Note App Store" },
];

const FEATURES = [
  { emoji: "📍", text: "Offres géolocalisées autour de vous" },
  { emoji: "⚡", text: "Flash deals jusqu'à -70%" },
  { emoji: "🏆", text: "Gagnez des points à chaque promo" },
  { emoji: "🔔", text: "Alertes en temps réel" },
];

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(() => navigate("/Feed", { replace: true }))
      .catch(() => setChecking(false));
  }, []);

  if (checking) return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #2D1B8E 0%, ${DS.brand} 55%, ${DS.brand2} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: DS.fontBase,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>C&P</span>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #2D1B8E 0%, ${DS.brand} 55%, ${DS.brand2} 100%)`,
      fontFamily: DS.fontBase,
      display: "flex", flexDirection: "column",
      padding: `calc(${DS.safeTop} + 40px) 24px calc(${DS.safeBottom} + 32px)`,
      overflowX: "hidden",
    }}>

      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <div style={{
          width: 90, height: 90, borderRadius: 26,
          background: "rgba(255,255,255,.15)",
          border: "1.5px solid rgba(255,255,255,.3)",
          backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,.25)",
        }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>C&P</span>
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{
          color: "#fff", fontSize: 34, fontWeight: 900,
          margin: "0 0 12px", letterSpacing: -0.8, lineHeight: 1.15,
        }}>
          Les meilleures promos<br />près de chez vous
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 16, margin: 0, lineHeight: 1.6 }}>
          Géolocalisées · Exclusives · Gratuites
        </p>
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,.1)", borderRadius: 14, padding: "12px 16px",
            animation: `fadeUp .4s ${i * 0.08}s both`,
          }}>
            <span style={{ fontSize: 22 }}>{f.emoji}</span>
            <span style={{ color: "rgba(255,255,255,.9)", fontSize: 14, fontWeight: 600 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 36 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,.1)", borderRadius: 14, padding: "14px 8px" }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{s.val}</div>
            <div style={{ color: "rgba(255,255,255,.55)", fontSize: 10, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => base44.auth.redirectToLogin("/Feed")} style={{
          width: "100%", background: "#fff", color: DS.brand,
          border: "none", borderRadius: 100, padding: "18px 24px",
          fontSize: 17, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        }}>
          🚀 Commencer gratuitement
        </button>
        <button onClick={() => base44.auth.redirectToLogin("/Feed")} style={{
          width: "100%", background: "transparent",
          border: "1.5px solid rgba(255,255,255,.35)",
          borderRadius: 100, padding: "16px 24px",
          fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.8)", cursor: "pointer",
        }}>
          Se connecter
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 20 }}>
        En continuant, vous acceptez nos{" "}
        <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/PrivacyPolicy")}>
          conditions d'utilisation
        </span>
      </p>
    </div>
  );
}