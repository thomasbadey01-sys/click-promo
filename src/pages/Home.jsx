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
      background: "linear-gradient(160deg, #5B21B6 0%, #6C3BFF 50%, #7C3AED 100%)",
      fontFamily: DS.fontBase,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `calc(${DS.safeTop} + 60px) 32px calc(${DS.safeBottom} + 48px)`,
    }}>

      {/* Centre : logo + titre */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* Icône app */}
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #6C3BFF 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
          boxShadow: "0 8px 32px rgba(0,0,0,.25)",
        }}>
          <span style={{ color: "rgba(255,255,255,.9)", fontWeight: 900, fontSize: 32, letterSpacing: -1 }}>C&P</span>
        </div>

        <h1 style={{
          color: "#fff", fontSize: 36, fontWeight: 900,
          margin: 0, marginBottom: 10, textAlign: "center",
          letterSpacing: -0.5,
        }}>
          Click & Promo
        </h1>

        <p style={{
          color: "rgba(255,255,255,.65)", fontSize: 16,
          margin: 0, textAlign: "center", fontWeight: 400,
        }}>
          Promos géo-localisées
        </p>
      </div>

      {/* Bouton unique en bas */}
      <button onClick={() => navigate("/Feed")} style={{
        width: "100%",
        background: "#fff",
        color: DS.brand,
        border: "none",
        borderRadius: 100,
        padding: "18px 24px",
        fontSize: 17, fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,.15)",
      }}>
        Découvrir les offres →
      </button>
    </div>
  );
}