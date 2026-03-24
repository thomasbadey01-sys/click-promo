import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/Feed");
  }, []);
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🏷️</div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 800 }}>Click & Promo</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 6 }}>Chargement...</div>
      </div>
    </div>
  );
}
