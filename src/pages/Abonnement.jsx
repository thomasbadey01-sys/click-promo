import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DS, CPLogo } from "./Home";

const PLANS_COMMERCANT = [
  {
    id: "starter", nom: "Starter", prix: "29", couleur: "#34C759",
    gradient: "linear-gradient(135deg, #34C759, #30D158)", emoji: "🌱",
    cible: "Parfait pour démarrer",
    features: [
      { ok: true, label: "3 offres actives simultanément" },
      { ok: true, label: "Stats de base (vues, clics)" },
      { ok: true, label: "Géolocalisation sur la carte" },
      { ok: true, label: "Support par email" },
      { ok: false, label: "Offres urgentes prioritaires" },
      { ok: false, label: "Badge commerce vérifié ✓" },
    ]
  },
  {
    id: "pro", nom: "Pro", prix: "79", couleur: DS.primary,
    gradient: DS.gradient, emoji: "🚀",
    cible: "Pour les commerçants actifs", badge: "⭐ Populaire",
    features: [
      { ok: true, label: "15 offres actives simultanément" },
      { ok: true, label: "Stats avancées + export CSV" },
      { ok: true, label: "Offres urgentes prioritaires" },
      { ok: true, label: "Mise en avant dans le Feed" },
      { ok: true, label: "Support prioritaire 7j/7" },
      { ok: false, label: "Badge vérifié ✓ + account manager" },
    ]
  },
  {
    id: "business", nom: "Business", prix: "149", couleur: "#AF52DE",
    gradient: "linear-gradient(135deg, #AF52DE, #7B2FBE)", emoji: "💎",
    cible: "Multi-établissements & franchises",
    features: [
      { ok: true, label: "Offres illimitées" },
      { ok: true, label: "Dashboard ROI complet" },
      { ok: true, label: "Badge commerce vérifié ✓" },
      { ok: true, label: "Mise en avant prioritaire" },
      { ok: true, label: "Account manager dédié" },
      { ok: true, label: "API + intégration caisse" },
    ]
  }
];

const PLAN_PREMIUM = {
  id: "premium", nom: "Premium", prix: "9,99", couleur: "#FF9500",
  gradient: "linear-gradient(135deg, #FF9500, #FF6B00)", emoji: "✨",
  features: [
    "Accès anticipé aux offres flash (avant tout le monde)",
    "Alertes push personnalisées en temps réel",
    "Offres exclusives réservées aux membres Premium",
    "Sans publicité",
    "Tri prioritaire par distance ultra-précis",
    "Badge ✨ Premium visible sur votre profil",
  ]
};

function PlanCard({ plan, onChoose, loading, highlighted }) {
  return (
    <div style={{
      background: DS.card, borderRadius: DS.radius.xl, overflow: "hidden",
      marginBottom: 14, boxShadow: highlighted ? `0 8px 32px ${plan.couleur}33` : DS.shadow.sm,
      border: highlighted ? `2px solid ${plan.couleur}` : `2px solid transparent`,
      position: "relative", transition: "transform 0.2s",
    }}>
      {plan.badge && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: DS.primary, color: "white", borderRadius: DS.radius.full,
          padding: "4px 12px", fontSize: 11, fontWeight: 800,
          boxShadow: `0 2px 8px ${DS.primary}55`
        }}>{plan.badge}</div>
      )}

      {/* Header coloré */}
      <div style={{ background: plan.gradient, padding: "22px 20px 18px" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{plan.emoji}</div>
        <div style={{ color: "white", fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{plan.nom}</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 12 }}>{plan.cible}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ color: "white", fontSize: 42, fontWeight: 900, letterSpacing: -1 }}>{plan.prix}€</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>/mois</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "16px 20px 20px" }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{f.ok ? "✅" : "❌"}</span>
            <span style={{ fontSize: 13, color: f.ok ? DS.text : DS.textMuted, lineHeight: 1.4 }}>{f.label}</span>
          </div>
        ))}

        <button onClick={() => onChoose(plan.id)} disabled={loading === plan.id} style={{
          width: "100%", marginTop: 8,
          background: loading === plan.id ? "#e8e8e8" : plan.gradient,
          color: loading === plan.id ? DS.textMuted : "white",
          border: "none", borderRadius: DS.radius.lg, padding: "15px",
          fontSize: 15, fontWeight: 700,
          cursor: loading === plan.id ? "not-allowed" : "pointer",
          boxShadow: loading === plan.id ? "none" : `0 6px 20px ${plan.couleur}44`,
          transition: "all 0.2s", letterSpacing: 0.2
        }}>
          {loading === plan.id ? "⏳ Redirection Stripe..." : `Choisir ${plan.nom}`}
        </button>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: DS.textMuted }}>
          Sans engagement · Résiliable à tout moment
        </div>
      </div>
    </div>
  );
}

export default function Abonnement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get("success");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(searchParams.get("tab") === "user" ? "user" : "commercant");

  const subscribe = async (planId) => {
    setLoading(planId); setError(null);
    try {
      const res = await fetch("/functions/createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          successUrl: window.location.origin + "/Feed?subscribed=1",
          cancelUrl: window.location.origin + "/Abonnement"
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setError(data.error || "Erreur inattendue."); setLoading(null); }
    } catch {
      setError("Impossible de contacter le serveur de paiement.");
      setLoading(null);
    }
  };

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>

      {/* Header sombre */}
      <div style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a0a00 60%, #2d1200 100%)", padding: "52px 16px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `${DS.primary}18` }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(175,82,222,0.1)" }} />

        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", marginBottom: 14, padding: 0 }}>← Retour</button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <CPLogo size={38} white />
          <div style={{ color: "white", fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Abonnements</div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
          Choisissez le plan adapté à votre situation
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: DS.radius.md, padding: 4, gap: 4 }}>
          {[{ key: "commercant", label: "🏪 Commerçants" }, { key: "user", label: "✨ Utilisateurs" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, background: tab === t.key ? "white" : "transparent",
              color: tab === t.key ? DS.text : "rgba(255,255,255,0.65)",
              border: "none", borderRadius: DS.radius.sm, padding: "11px 8px",
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: "pointer", transition: "all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px 60px" }}>

        {/* Succès */}
        {success && (
          <div style={{ background: `linear-gradient(135deg, ${DS.success}, #30D158)`, borderRadius: DS.radius.xl, padding: 24, marginBottom: 20, textAlign: "center", boxShadow: `0 8px 28px ${DS.success}44` }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Abonnement activé !</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Votre accès est actif. Bienvenue dans Click & Promo.</div>
            <button onClick={() => navigate("/Feed")} style={{ marginTop: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: DS.radius.lg, padding: "11px 24px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              Découvrir les offres →
            </button>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ background: "#FFF0F0", border: `1.5px solid ${DS.danger}44`, borderRadius: DS.radius.md, padding: "12px 14px", marginBottom: 16, color: DS.danger, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Plans commerçants */}
        {tab === "commercant" && (
          <>
            {/* Stats sociales */}
            <div style={{ background: DS.card, borderRadius: DS.radius.lg, padding: 16, marginBottom: 18, boxShadow: DS.shadow.sm }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: DS.text, marginBottom: 12 }}>💡 Nos commerçants en moyenne :</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { stat: "+40%", label: "clients/mois", color: DS.success },
                  { stat: "3.2x", label: "ROI vs pub", color: DS.primary },
                  { stat: "< 48h", label: "1ères conv.", color: "#AF52DE" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", background: DS.bg, borderRadius: DS.radius.md, padding: "10px 4px" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.stat}</div>
                    <div style={{ fontSize: 10, color: DS.textMuted, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {PLANS_COMMERCANT.map(plan => (
              <PlanCard key={plan.id} plan={plan} onChoose={subscribe} loading={loading} highlighted={plan.id === "pro"} />
            ))}

            {/* Essai gratuit */}
            <div style={{ background: `linear-gradient(135deg, ${DS.primary}15, ${DS.secondary}10)`, borderRadius: DS.radius.lg, padding: 16, textAlign: "center", border: `1.5px solid ${DS.primary}22` }}>
              <div style={{ fontWeight: 700, color: DS.primary, marginBottom: 4 }}>🎁 14 jours d'essai gratuit</div>
              <div style={{ fontSize: 12, color: DS.textSub }}>Testez sans engagement. Aucune CB requise pour démarrer.</div>
            </div>
          </>
        )}

        {/* Plan Premium utilisateur */}
        {tab === "user" && (
          <>
            <div style={{ background: PLAN_PREMIUM.gradient, borderRadius: DS.radius.xl, padding: "28px 24px", marginBottom: 16, textAlign: "center", boxShadow: `0 8px 32px ${PLAN_PREMIUM.couleur}44` }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>{PLAN_PREMIUM.emoji}</div>
              <div style={{ color: "white", fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 6 }}>Premium</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 16 }}>L'expérience Click & Promo sans limites</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 48, fontWeight: 900, letterSpacing: -1 }}>9,99€</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>/mois</span>
              </div>
            </div>

            <div style={{ background: DS.card, borderRadius: DS.radius.lg, padding: 20, marginBottom: 14, boxShadow: DS.shadow.sm }}>
              {PLAN_PREMIUM.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: DS.radius.sm, background: `${DS.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>✨</span>
                  </div>
                  <span style={{ fontSize: 14, color: DS.text, lineHeight: 1.5, paddingTop: 4 }}>{f}</span>
                </div>
              ))}
            </div>

            <button onClick={() => subscribe("premium")} disabled={loading === "premium"} style={{
              width: "100%", background: loading === "premium" ? "#e8e8e8" : PLAN_PREMIUM.gradient,
              color: loading === "premium" ? DS.textMuted : "white",
              border: "none", borderRadius: DS.radius.lg, padding: "17px",
              fontSize: 16, fontWeight: 800, cursor: loading === "premium" ? "not-allowed" : "pointer",
              boxShadow: loading === "premium" ? "none" : `0 8px 28px ${PLAN_PREMIUM.couleur}55`,
              marginBottom: 10, letterSpacing: 0.2
            }}>
              {loading === "premium" ? "⏳ Redirection..." : "✨ Passer Premium — 9,99€/mois"}
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: DS.textMuted }}>
              Sans engagement · Résiliable quand vous voulez
            </div>

            {/* Comparaison */}
            <div style={{ marginTop: 20, background: DS.card, borderRadius: DS.radius.lg, padding: 16, boxShadow: DS.shadow.sm }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: DS.text, marginBottom: 12 }}>Gratuit vs Premium</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderRadius: DS.radius.md, overflow: "hidden", border: `1px solid ${DS.border}` }}>
                {[
                  { label: "", free: "Gratuit", premium: "Premium ✨" },
                  { label: "Flash deals", free: "après 1h", premium: "En premier" },
                  { label: "Alertes", free: "❌", premium: "✅ Temps réel" },
                  { label: "Offres exclu.", free: "❌", premium: "✅" },
                  { label: "Pub", free: "Oui", premium: "Non" },
                ].map((row, i) => (
                  [row.label, row.free, row.premium].map((cell, j) => (
                    <div key={`${i}-${j}`} style={{
                      padding: "9px 8px", textAlign: "center", fontSize: 11,
                      fontWeight: i === 0 ? 700 : j === 2 ? 700 : 400,
                      color: i === 0 ? DS.textSub : j === 2 ? DS.primary : DS.text,
                      background: i === 0 ? DS.bg : j === 2 ? `${DS.primary}08` : "white",
                      borderBottom: i < 4 ? `1px solid ${DS.border}` : "none",
                      borderRight: j < 2 ? `1px solid ${DS.border}` : "none"
                    }}>{cell}</div>
                  ))
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
