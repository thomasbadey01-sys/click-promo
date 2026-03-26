import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, CPLogo } from "./theme";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(() => navigate("/Feed")).catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #3B0FA0 0%, #5C1FD4 40%, #6C3BFF 70%, #4C1D95 100%)",
      fontFamily: DS.fontBase,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Blobs décoratifs */}
      <div style={{ position: "absolute", top: -60, left: -80, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", top: 100, right: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", bottom: 200, left: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", bottom: 100, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />

      <div style={{ position: "relative", zIndex: 1, padding: `calc(${DS.safeTop} + 20px) 24px 40px`, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Nav top */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Click & Promo</span>
          <div style={{ width: 36 }} />
        </div>

        {/* Hero text */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 40, fontWeight: 900, color: "#fff",
            lineHeight: 1.15, letterSpacing: -1, margin: 0, marginBottom: 16,
          }}>
            Les meilleures promos près de chez vous
          </h1>
        </div>

        {/* CTA principal */}
        <button onClick={() => navigate("/Feed")} style={{
          background: "rgba(255,255,255,.2)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255,255,255,.3)",
          borderRadius: 16, padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", marginBottom: 12, width: "100%", boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Découvrir les offres</span>
          </div>
          <span style={{ fontSize: 20 }}>🎯</span>
        </button>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[
            { val: "930+", label: "Offres" },
            { val: "4.8★", label: "Note" },
            { val: "50k+", label: "Utilisateurs" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "rgba(255,255,255,.15)",
              borderRadius: 14, padding: "12px 8px", textAlign: "center",
              border: "1px solid rgba(255,255,255,.2)",
            }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "📍", label: "Localisation instantanée" },
            { icon: "⚡", label: "Alertes personnalisées", right: "🎮" },
            { icon: "🏆", label: "Défis exclusifs" },
          ].map((f, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 14, padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{f.label}</span>
              </div>
              {f.right && <span style={{ fontSize: 20 }}>{f.right}</span>}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom actions */}
        <div style={{ paddingBottom: `calc(${DS.safeBottom} + 16px)` }}>
          <button onClick={() => navigate("/Feed")} style={{
            width: "100%", background: "#fff", color: DS.brand,
            border: "none", borderRadius: 100, padding: "18px",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,.15)",
          }}>
            Commencer gratuitement
          </button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => navigate("/Feed")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", fontSize: 14, cursor: "pointer" }}>
              Explorer sans compte →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}