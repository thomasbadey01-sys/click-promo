import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo } from "./theme";

const PLANS = [
  {
    id: "premium_user",
    label: "Premium",
    price: "9,99",
    period: "mois",
    emoji: "⭐",
    color: DS.brand,
    features: [
      "Offres exclusives Premium",
      "Alertes avant tout le monde",
      "Filtres avancés",
      "Sans publicité",
      "Support prioritaire",
    ],
    popular: true,
  },
  {
    id: "starter",
    label: "Commerçant Starter",
    price: "29",
    period: "mois",
    emoji: "🏪",
    color: "#10B981",
    features: [
      "5 offres simultanées",
      "Dashboard basique",
      "Stats en temps réel",
      "Badge vérifié",
    ],
  },
  {
    id: "pro",
    label: "Commerçant Pro",
    price: "79",
    period: "mois",
    emoji: "🚀",
    color: "#F59E0B",
    features: [
      "Offres illimitées",
      "Analyses avancées",
      "Offres sponsorisées",
      "Export CSV",
      "Support dédié",
    ],
  },
];

export default function Abonnement() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("premium_user");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const user = await UserAuth.me();
      const plan = PLANS.find(p => p.id === selected);
      const res = await fetch("/functions/createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selected,
          email: user.email,
          successUrl: window.location.origin + "/Profil",
          cancelUrl: window.location.origin + "/Abonnement",
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.bg, fontFamily: DS.fontBase }}>

      {/* Header gradient */}
      <div style={{
        background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 60%, #A855F7 100%)`,
        padding: "52px 20px 36px",
        textAlign: "center",
      }}>
        <button onClick={() => navigate(-1)} style={{
          position: "absolute", top: 52, left: 16,
          background: "rgba(255,255,255,.2)", border: "none",
          borderRadius: DS.pill, width: 38, height: 38,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          {Ic.back(DS.white, 20)}
        </button>

        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Click & Promo
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: DS.white, lineHeight: 1.1, marginBottom: 10, letterSpacing: -0.8 }}>
          Passez au niveau<br />supérieur ✨
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,.75)" }}>
          Économisez plus, profitez plus
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding: "20px 16px 120px" }}>

        {PLANS.map(plan => {
          const isSelected = selected === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              style={{
                background: DS.white,
                borderRadius: DS.xl,
                padding: "20px",
                marginBottom: 14,
                border: `2px solid ${isSelected ? plan.color : DS.ink10}`,
                boxShadow: isSelected ? `0 4px 20px ${plan.color}30` : DS.e1,
                cursor: "pointer",
                position: "relative",
                transition: "all .2s",
              }}
            >
              {/* Badge "Populaire" */}
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: DS.brand, color: DS.white,
                  borderRadius: DS.pill, padding: "4px 16px",
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.5, whiteSpace: "nowrap",
                }}>
                  ⭐ Le plus populaire
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Sélecteur radio */}
                  <div style={{
                    width: 22, height: 22, borderRadius: DS.pill,
                    border: `2px solid ${isSelected ? plan.color : DS.ink20}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isSelected ? plan.color : DS.white,
                    flexShrink: 0, transition: "all .2s",
                  }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: DS.pill, background: DS.white }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: DS.ink40, marginBottom: 2 }}>{plan.emoji}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: DS.ink }}>{plan.label}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: plan.color, letterSpacing: -1, lineHeight: 1 }}>
                    {plan.price}€
                  </div>
                  <div style={{ fontSize: 12, color: DS.ink40 }}>/{plan.period}</div>
                </div>
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: DS.pill,
                      background: `${plan.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {Ic.check(plan.color, 12)}
                    </div>
                    <span style={{ fontSize: 14, color: DS.ink80, fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Garantie */}
        <div style={{
          background: DS.white, borderRadius: DS.xl, padding: "16px 20px",
          marginBottom: 16, border: `1px solid ${DS.ink10}`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 2 }}>Satisfait ou remboursé</div>
            <div style={{ fontSize: 12, color: DS.ink40 }}>14 jours d'essai gratuit · Sans engagement · Résiliable à tout moment</div>
          </div>
        </div>

        {/* Logos paiement */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: DS.ink40 }}>🔒 Paiement sécurisé</div>
          <div style={{ fontSize: 12, color: DS.ink40, fontWeight: 700 }}>STRIPE</div>
          <div style={{ fontSize: 12, color: DS.ink40 }}>VISA · MASTERCARD</div>
        </div>
      </div>

      {/* CTA fixe en bas */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: DS.white, borderTop: `1px solid ${DS.ink10}`,
        padding: "16px 20px calc(env(safe-area-inset-bottom, 12px) + 16px)",
        boxShadow: "0 -4px 20px rgba(0,0,0,.06)",
      }}>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? DS.ink10 : DS.brand,
            color: loading ? DS.ink40 : DS.white,
            border: "none", borderRadius: DS.pill,
            padding: "18px", fontSize: 17, fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : DS.eBrand,
            letterSpacing: -0.3,
          }}
        >
          {loading ? "Redirection…" : `S'abonner — ${PLANS.find(p=>p.id===selected)?.price}€/mois`}
        </button>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: DS.ink40 }}>
          Sans engagement · Annulable à tout moment
        </div>
      </div>
    </div>
  );
}
