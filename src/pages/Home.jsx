import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS } from "./theme";

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    base44.auth.me().then(() => navigate("/Feed")).catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #2D1B8E 0%, #6C3BFF 55%, #8B5CF6 100%)",
      fontFamily: DS.fontBase,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "space-between",
      padding: `calc(${DS.safeTop} + 60px) 32px calc(${DS.safeBottom} + 48px)`,
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* Logo */}
        <div style={{
          width: 110, height: 110, borderRadius: 30,
          background: "linear-gradient(135deg, rgba(255,255,255,.25) 0%, rgba(255,255,255,.1) 100%)",
          border: "1px solid rgba(255,255,255,.3)",
          backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32, boxShadow: "0 8px 32px rgba(0,0,0,.2)",
        }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 34, letterSpacing: -1 }}>C&P</span>
        </div>

        <h1 style={{
          color: "#fff", fontSize: 32, fontWeight: 900,
          margin: 0, marginBottom: 12, textAlign: "center", letterSpacing: -0.5, lineHeight: 1.2,
        }}>
          Les meilleures promos<br />près de chez vous
        </h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: 16, margin: 0, textAlign: "center", fontWeight: 400 }}>
          Géo-localisées · Exclusives · Gratuites
        </p>
      </div>

      <button onClick={() => navigate("/Feed")} style={{
        width: "100%", background: "#fff", color: DS.brand,
        border: "none", borderRadius: 100, padding: "18px 24px",
        fontSize: 17, fontWeight: 800, cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        🚀 Découvrir les offres
      </button>
    </div>
  );
}