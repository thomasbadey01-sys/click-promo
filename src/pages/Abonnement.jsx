import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo, getTheme } from "./theme";
import { base44 } from "@/api/base44Client";

const PLANS_USER = [
  {
    id: "gratuit",
    nom: "Gratuit",
    prix: 0,
    tag: null,
    col: "#888",
    avantages: [
      "✅ Accès aux offres",
      "✅ Favoris illimités",
      "✅ Carte interactive",
      "❌ Flash deals exclusifs",
      "❌ Alertes personnalisées",
      "❌ Gains de points x2",
    ],
  },
  {
    id: "premium_user",
    nom: "Premium",
    prix: 9.99,
    tag: "⭐ POPULAIRE",
    col: DS.brand,
    avantages: [
      "✅ Accès à toutes les offres",
      "✅ Flash deals exclusifs",
      "✅ Alertes de proximité",
      "✅ Points x2",
      "✅ Badge Premium",
      "✅ Sans publicité",
    ],
  },
];

const PLANS_MARCHANDS = [
  {
    id: "starter",
    nom: "Starter",
    prix: 29,
    tag: null,
    col: "#10B981",
    avantages: ["1 offre active", "Stats de base", "Badge vérifié", "Support email"],
  },
  {
    id: "pro",
    nom: "Pro",
    prix: 59,
    tag: "⭐ RECOMMANDÉ",
    col: DS.brand,
    avantages: ["5 offres actives", "Flash deals", "Stats avancées", "Push notifications", "🎬 Vidéos IA (10/mois)", "Support prioritaire"],
  },
  {
    id: "business",
    nom: "Business",
    prix: 99,
    tag: "💎 PREMIUM",
    col: "#F59E0B",
    avantages: ["Offres illimitées", "QR codes dynamiques", "Export CSV", "🎬 Vidéos IA illimitées", "API access", "Account manager dédié"],
  },
];

export default function Abonnement() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("user");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const t = getTheme();

  const subscribe = async (plan) => {
    if (plan.prix === 0) { navigate("/Feed"); return; }
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a Stripe checkout URL for plan ${plan.nom} at ${plan.prix}€/month for user ${user.email}`,
      });
      alert("Redirection vers le paiement Stripe…\n(Configurez votre clé Stripe dans les fonctions backend)");
    } catch {
      alert("Connexion requise pour souscrire à un plan.");
      navigate("/Login");
    } finally { setLoading(false); }
  };

  const plans = mode === "user" ? PLANS_USER : PLANS_MARCHANDS;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 60%, ${DS.brand2} 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 28px`,
        textAlign: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <CPLogo size={32} />
          <div style={{ width: 36 }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.5, marginBottom: 8 }}>
          Choisissez votre plan
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", marginBottom: 20 }}>
          Débloquez toutes les fonctionnalités
        </div>

        {/* Toggle user / marchand */}
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,.15)", borderRadius: 100, padding: 3 }}>
          {[{id:"user",label:"👤 Utilisateur"},{id:"marchand",label:"🏪 Commerçant"}].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setSelected(null); }} style={{
              padding: "9px 18px", borderRadius: 100, border: "none", cursor: "pointer",
              background: mode === m.id ? "#fff" : "transparent",
              color: mode === m.id ? DS.brand : "rgba(255,255,255,.8)",
              fontWeight: 700, fontSize: 13, fontFamily: DS.fontBase, transition: "all .2s",
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding: "20px 16px 100px" }}>

        {/* Garantie */}
        <div style={{ background: t.isDark ? DS.darkCard : "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>Garantie 30 jours</div>
            <div style={{ fontSize: 12, color: t.text2 }}>Remboursement intégral si vous n'êtes pas satisfait</div>
          </div>
        </div>

        {plans.map(plan => {
          const isSelected = selected === plan.id;
          const isFree = plan.prix === 0;
          return (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              style={{
                background: t.isDark ? DS.darkCard : "#fff",
                borderRadius: 20, padding: 20, marginBottom: 14,
                border: `2px solid ${isSelected ? plan.col : t.border}`,
                cursor: "pointer", position: "relative", overflow: "hidden",
                boxShadow: isSelected ? `0 4px 20px ${plan.col}30` : DS.e1,
                transition: "border-color .2s, box-shadow .2s",
              }}
            >
              {plan.tag && (
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: plan.col, color: "#fff", borderRadius: 20,
                  padding: "4px 12px", fontSize: 11, fontWeight: 800,
                }}>{plan.tag}</div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: t.text, marginBottom: 2 }}>{plan.nom}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    {plan.prix === 0 ? (
                      <span style={{ fontSize: 28, fontWeight: 900, color: t.text }}>Gratuit</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 32, fontWeight: 900, color: plan.col, letterSpacing: -1 }}>{plan.prix}€</span>
                        <span style={{ fontSize: 13, color: t.text2 }}>/mois</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: `2.5px solid ${isSelected ? plan.col : t.border}`,
                  background: isSelected ? plan.col : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .2s", flexShrink: 0,
                }}>
                  {isSelected && Ic.check("#fff", 14)}
                </div>
              </div>

              {/* Avantages */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {plan.avantages.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: a.startsWith("❌") ? t.text2 : t.text, fontWeight: a.startsWith("✅") ? 600 : 400 }}>{a}</div>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <button
          onClick={() => {
            const plan = plans.find(p => p.id === selected);
            if (plan) subscribe(plan);
          }}
          disabled={!selected || loading}
          style={{
            width: "100%", background: selected ? DS.brand : "#ccc",
            color: "#fff", border: "none", borderRadius: DS.pill,
            padding: "18px", fontSize: 16, fontWeight: 800,
            cursor: selected ? "pointer" : "not-allowed",
            boxShadow: selected ? DS.eBrand : "none",
            transition: "all .2s",
          }}
        >
          {loading ? "Redirection…" : selected ? `Choisir ${plans.find(p=>p.id===selected)?.nom} ${plans.find(p=>p.id===selected)?.prix === 0 ? "— Gratuit" : `— ${plans.find(p=>p.id===selected)?.prix}€/mois`}` : "Sélectionnez un plan"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: t.text2, marginTop: 14 }}>
          Paiement sécurisé par Stripe · Annulation à tout moment
        </p>
      </div>
    </div>
  );
}