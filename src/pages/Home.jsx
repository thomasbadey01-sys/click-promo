import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, CPLogo } from "./theme";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(() => navigate("/Feed"))
      .catch(() => {});
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 50%, #A855F7 100%)`,
      display: "flex", flexDirection: "column",
      fontFamily: DS.fontBase,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Cercles décoratifs */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "rgba(255,255,255,.06)",
      }}/>
      <div style={{
        position: "absolute", bottom: 100, left: -60,
        width: 200, height: 200, borderRadius: "50%",
        background: "rgba(255,255,255,.04)",
      }}/>

      {/* Contenu principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 24, background: "rgba(255,255,255,.15)",
            backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,.2)",
          }}>
            <span style={{ color: DS.white, fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>C&P</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: DS.white, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
            Click & Promo
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,.75)", fontWeight: 500 }}>
            Les meilleures promos près de chez toi
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360, marginBottom: 40 }}>
          {[
            { emoji: "📍", title: "Géolocalisé", desc: "Offres à portée de main" },
            { emoji: "⚡", title: "En temps réel", desc: "Promos flash limitées" },
            { emoji: "🏆", title: "Gagnez des points", desc: "Badges & récompenses" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,.1)",
              backdropFilter: "blur(8px)",
              borderRadius: DS.lg, padding: "14px 16px",
              border: "1px solid rgba(255,255,255,.15)",
              textAlign: "left",
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{f.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: DS.white }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ width: "100%", maxWidth: 360 }}>
          <button
            onClick={() => navigate("/Login")}
            style={{
              width: "100%",
              background: DS.white,
              color: DS.brand,
              border: "none",
              borderRadius: DS.pill,
              padding: "18px",
              fontSize: 17,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,.25)",
              marginBottom: 14,
              letterSpacing: -0.3,
            }}
          >
            Commencer gratuitement
          </button>
          <button
            onClick={() => navigate("/Feed")}
            style={{
              width: "100%",
              background: "transparent",
              color: "rgba(255,255,255,.85)",
              border: "2px solid rgba(255,255,255,.35)",
              borderRadius: DS.pill,
              padding: "16px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Explorer sans compte
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "0 24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
          En continuant, vous acceptez nos{" "}
          <a href="/PrivacyPolicy" style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>
            Conditions d'utilisation
          </a>
        </div>
      </div>
    </div>
  );
}