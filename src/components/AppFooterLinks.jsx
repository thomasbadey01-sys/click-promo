import { useNavigate } from "react-router-dom";
import { DS } from "@/pages/theme";

export default function AppFooterLinks() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: 20,
      padding: "10px 0 16px",
      fontFamily: DS.fontBase,
    }}>
      <button onClick={() => navigate("/About")} style={{ background: "none", border: "none", fontSize: 11, color: "#bbb", cursor: "pointer", fontFamily: DS.fontBase, fontWeight: 500 }}>À propos</button>
      <span style={{ color: "#ddd", fontSize: 11 }}>·</span>
      <button onClick={() => navigate("/Contact")} style={{ background: "none", border: "none", fontSize: 11, color: "#bbb", cursor: "pointer", fontFamily: DS.fontBase, fontWeight: 500 }}>Contact</button>
      <span style={{ color: "#ddd", fontSize: 11 }}>·</span>
      <button onClick={() => navigate("/PrivacyPolicy")} style={{ background: "none", border: "none", fontSize: 11, color: "#bbb", cursor: "pointer", fontFamily: DS.fontBase, fontWeight: 500 }}>Confidentialité</button>
    </div>
  );
}