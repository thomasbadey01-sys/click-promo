import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DS, CPLogo } from "./theme";

const PREMIUM_FEATURES = [
  { emoji: "⚡", title: "Flash Deals exclusifs", desc: "Accédez aux offres -50% avant tout le monde" },
  { emoji: "📍", title: "Alertes de proximité", desc: "Notification dès qu'une promo apparaît près de vous" },
  { emoji: "⭐", title: "Points x2", desc: "Doublez vos gains de fidélité sur chaque offre" },
  { emoji: "🚫", title: "Sans publicité", desc: "Une expérience fluide, 100% sans pub" },
  { emoji: "🏆", title: "Badge Premium", desc: "Profil mis en avant auprès des commerçants" },
  { emoji: "🔔", title: "Alertes personnalisées", desc: "Notifs sur vos catégories et commerçants favoris" },
];

export default function Accueil() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"

  const price = billing === "monthly" ? "4,99€" : "3,99€";
  const billingLabel = billing === "monthly" ? "/mois" : "/mois · facturé annuellement";
  const savings = billing === "yearly" ? "Économisez 12€/an" : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 50%, #9D5CF7 100%)`,
      fontFamily: DS.fontBase,
      display: "flex", flexDirection: "column",
      overflowX: "hidden",
    }}>

      {/* Hero */}
      <div style={{ padding: `calc(${DS.safeTop} + 16px) 24px 0`, textAlign: "center", flex: "0 0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <CPLogo size={64} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 10 }}>
          Click &amp; Promo<br />
          <span style={{ color: "rgba(255,255,255,.85)" }}>Premium</span>
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,.65)", marginBottom: 24 }}>
          Les meilleures promos, sans limites
        </div>

        {/* Toggle mensuel / annuel */}
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,.15)", borderRadius: 100, padding: 4, marginBottom: 28 }}>
          {[
            { id: "monthly", label: "Mensuel" },
            { id: "yearly",  label: "Annuel  🔥" },
          ].map(b => (
            <button key={b.id} onClick={() => setBilling(b.id)} style={{
              padding: "9px 22px", borderRadius: 100, border: "none", cursor: "pointer",
              background: billing === b.id ? "#fff" : "transparent",
              color: billing === b.id ? DS.brand : "rgba(255,255,255,.8)",
              fontWeight: 800, fontSize: 13, fontFamily: DS.fontBase, transition: "all .2s",
            }}>{b.label}</button>
          ))}
        </div>
      </div>

      {/* Sheet blanc */}
      <div style={{
        flex: 1,
        background: "#fff",
        borderRadius: "28px 28px 0 0",
        padding: "28px 20px 40px",
        overflowY: "auto",
      }}>

        {/* Prix */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: DS.ink, marginTop: 8 }}>€</span>
            <span style={{ fontSize: 56, fontWeight: 900, color: DS.brand, letterSpacing: -3, lineHeight: 1 }}>
              {billing === "monthly" ? "4,99" : "3,99"}
            </span>
          </div>
          <div style={{ fontSize: 14, color: DS.ink60, marginTop: 4, fontWeight: 500 }}>{billingLabel}</div>
          {savings && (
            <div style={{ display: "inline-block", background: "#D1FAE5", color: "#065F46", borderRadius: 100, padding: "4px 14px", fontSize: 12, fontWeight: 800, marginTop: 8 }}>
              🎁 {savings}
            </div>
          )}
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {PREMIUM_FEATURES.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              background: DS.bg, borderRadius: 14, padding: "13px 14px",
              border: `1px solid ${DS.ink05}`,
              animation: `fadeUp .4s ${i * 0.05}s both`,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${DS.brandLight}, #f0e9ff)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{f.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: DS.ink60, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          ))}
        </div>

        {/* Garantie */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E" }}>Garantie 30 jours</div>
            <div style={{ fontSize: 12, color: "#78350F" }}>Remboursement intégral si vous n'êtes pas satisfait</div>
          </div>
        </div>

        {/* CTA Principal */}
        <button
          onClick={() => navigate("/Abonnement")}
          style={{
            width: "100%", background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
            color: "#fff", border: "none", borderRadius: 100,
            padding: "18px", fontSize: 17, fontWeight: 900, cursor: "pointer",
            boxShadow: DS.eBrand, marginBottom: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          ⭐ Commencer Premium — {price}{billing === "yearly" ? "/mois" : ""}
        </button>

        {/* Essayer sans payer */}
        <button
          onClick={() => navigate("/Feed")}
          style={{
            width: "100%", background: "transparent", border: "none",
            color: DS.ink40, fontSize: 14, fontWeight: 600, cursor: "pointer",
            padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          Continuer gratuitement →
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: DS.ink20, marginTop: 8 }}>
          Paiement sécurisé · Annulation à tout moment
        </p>
      </div>
    </div>
  );
}