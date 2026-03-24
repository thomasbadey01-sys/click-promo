import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const PLANS_COMMERCANT = [
  {
    id: "starter",
    nom: "Starter",
    prix: "29",
    periode: "mois",
    couleur: "#34C759",
    gradient: "linear-gradient(135deg, #34C759, #30D158)",
    emoji: "🌱",
    cible: "Parfait pour démarrer",
    features: [
      { ok: true, label: "3 offres actives simultanément" },
      { ok: true, label: "Stats de base (vues, clics)" },
      { ok: true, label: "Géolocalisation sur la carte" },
      { ok: true, label: "Support par email" },
      { ok: false, label: "Offres urgentes prioritaires" },
      { ok: false, label: "Export CSV des stats" },
      { ok: false, label: "Badge commerce vérifié ✓" },
    ]
  },
  {
    id: "pro",
    nom: "Pro",
    prix: "79",
    periode: "mois",
    couleur: "#FF6B00",
    gradient: "linear-gradient(135deg, #FF6B00, #FF3B30)",
    emoji: "🚀",
    cible: "Pour les commerçants actifs",
    badge: "⭐ Populaire",
    features: [
      { ok: true, label: "15 offres actives simultanément" },
      { ok: true, label: "Stats avancées + export CSV" },
      { ok: true, label: "Offres urgentes prioritaires" },
      { ok: true, label: "Mise en avant dans le Feed" },
      { ok: true, label: "Support prioritaire" },
      { ok: false, label: "Badge commerce vérifié ✓" },
      { ok: false, label: "Account manager dédié" },
    ]
  },
  {
    id: "business",
    nom: "Business",
    prix: "149",
    periode: "mois",
    couleur: "#AF52DE",
    gradient: "linear-gradient(135deg, #AF52DE, #7B2FBE)",
    emoji: "💎",
    cible: "Multi-établissements & franchises",
    features: [
      { ok: true, label: "Offres illimitées" },
      { ok: true, label: "Dashboard ROI complet" },
      { ok: true, label: "Badge commerce vérifié ✓" },
      { ok: true, label: "Mise en avant prioritaire" },
      { ok: true, label: "Account manager dédié" },
      { ok: true, label: "API accès données" },
      { ok: true, label: "Intégration caisse possible" },
    ]
  }
];

const PLAN_PREMIUM_USER = {
  id: "premium",
  nom: "Premium",
  prix: "9,99",
  periode: "mois",
  couleur: "#FFD700",
  gradient: "linear-gradient(135deg, #FF9500, #FF6B00)",
  emoji: "✨",
  features: [
    "Accès anticipé aux offres flash (avant tout le monde)",
    "Alertes push personnalisées en temps réel",
    "Sans publicité",
    "Offres exclusives réservées aux membres Premium",
    "Tri prioritaire par distance ultra-précis",
    "Badge Premium sur votre profil",
  ]
};

function PlanCard({ plan, onChoose, loading }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 16,
      boxShadow: plan.badge ? "0 6px 24px rgba(255,107,0,0.2)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: plan.badge ? "2px solid #FF6B00" : "2px solid transparent",
      position: "relative"
    }}>
      {plan.badge && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "#FF6B00", color: "white",
          borderRadius: 20, padding: "3px 10px",
          fontSize: 11, fontWeight: 700
        }}>
          {plan.badge}
        </div>
      )}

      {/* Header coloré */}
      <div style={{ background: plan.gradient, padding: "20px 20px 16px" }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{plan.emoji}</div>
        <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>{plan.nom}</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{plan.cible}</div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ color: "white", fontSize: 38, fontWeight: 900 }}>{plan.prix}€</span>
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>/{plan.periode}</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "16px 20px 20px" }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{f.ok ? "✅" : "❌"}</span>
            <span style={{ fontSize: 13, color: f.ok ? "#1a1a1a" : "#bbb" }}>{f.label}</span>
          </div>
        ))}

        <button
          onClick={() => onChoose(plan.id)}
          disabled={loading === plan.id}
          style={{
            width: "100%", marginTop: 6,
            background: loading === plan.id ? "#e0e0e0" : plan.gradient,
            color: "white", border: "none", borderRadius: 14,
            padding: "14px", fontSize: 15, fontWeight: 700,
            cursor: loading === plan.id ? "not-allowed" : "pointer",
            boxShadow: loading === plan.id ? "none" : `0 4px 16px ${plan.couleur}50`,
            transition: "all 0.2s"
          }}
        >
          {loading === plan.id ? "⏳ Redirection..." : `Choisir ${plan.nom}`}
        </button>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#aaa" }}>
          Sans engagement • Résiliable à tout moment
        </div>
      </div>
    </div>
  );
}

export default function Abonnement() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("commercant"); // commercant | user

  const subscribe = async (planId) => {
    setLoading(planId);
    setError(null);
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
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur inattendue");
        setLoading(null);
      }
    } catch (e) {
      setError("Impossible de contacter le serveur de paiement.");
      setLoading(null);
    }
  };

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,107,0,0.12)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(175,82,222,0.1)" }} />
        <Link to="/Feed">
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 12 }}>← Retour</div>
        </Link>
        <div style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>💳 Abonnements</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.5 }}>
          Choisissez le plan adapté à votre situation
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 20, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 4 }}>
          {[
            { key: "commercant", label: "🏪 Commerçants" },
            { key: "user", label: "👤 Utilisateurs" }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, background: tab === t.key ? "white" : "transparent",
              color: tab === t.key ? "#1a1a2e" : "rgba(255,255,255,0.7)",
              border: "none", borderRadius: 10,
              padding: "10px 8px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s"
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px 100px" }}>

        {/* Succès */}
        {success && (
          <div style={{ background: "linear-gradient(135deg, #34C759, #30D158)", borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Abonnement activé !</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Votre accès est actif. Bienvenue dans Click & Promo.</div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ background: "#FFF3F0", border: "1px solid #FFD0C8", borderRadius: 12, padding: "12px 14px", marginBottom: 16, color: "#FF3B30", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Plans commerçants */}
        {tab === "commercant" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 6 }}>Pour les commerçants</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 18, lineHeight: 1.5 }}>
              Publiez vos offres, attirez des clients locaux, et suivez vos performances en temps réel.
            </div>

            {/* Comparatif économique */}
            <div style={{ background: "white", borderRadius: 14, padding: 14, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>💡 En moyenne, nos commerçants :</div>
              {[
                { stat: "+40%", label: "de nouveaux clients par mois" },
                { stat: "3,2x", label: "ROI vs publicité classique" },
                { stat: "< 48h", label: "pour voir les premières conversions" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < 2 ? 8 : 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#FF6B00", minWidth: 50 }}>{s.stat}</span>
                  <span style={{ fontSize: 13, color: "#555" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {PLANS_COMMERCANT.map(plan => (
              <PlanCard key={plan.id} plan={plan} onChoose={subscribe} loading={loading} />
            ))}

            {/* Essai gratuit */}
            <div style={{ background: "white", borderRadius: 14, padding: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>14 jours d'essai gratuit</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                Tous les plans incluent 14 jours d'essai. Pas de carte bancaire requise pour démarrer.
              </div>
            </div>
          </>
        )}

        {/* Plan utilisateur Premium */}
        {tab === "user" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 6 }}>Pour les utilisateurs</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>
              L'app est gratuite pour les utilisateurs. Le Premium vous donne un accès exclusif et prioritaire.
            </div>

            {/* Card Premium */}
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", borderRadius: 20, padding: 24, marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,215,0,0.1)" }} />
              <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
              <div style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Premium</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                <span style={{ color: "#FFD700", fontSize: 36, fontWeight: 900 }}>9,99€</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>/mois</span>
              </div>

              {PLAN_PREMIUM_USER.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: "#FFD700", fontSize: 16, flexShrink: 0 }}>★</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{f}</span>
                </div>
              ))}

              <button
                onClick={() => subscribe("premium")}
                disabled={loading === "premium"}
                style={{
                  width: "100%", marginTop: 16,
                  background: loading === "premium" ? "#555" : "linear-gradient(135deg, #FF9500, #FF6B00)",
                  color: "white", border: "none", borderRadius: 14,
                  padding: "15px", fontSize: 15, fontWeight: 700,
                  cursor: loading === "premium" ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(255,149,0,0.4)"
                }}
              >
                {loading === "premium" ? "⏳ Redirection..." : "✨ Passer en Premium"}
              </button>
              <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                7 jours d'essai gratuit • Sans engagement
              </div>
            </div>

            {/* Gratuit vs Premium */}
            <div style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Gratuit vs Premium</div>
              <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                {["Fonctionnalité", "Gratuit", "Premium"].map((h, i) => (
                  <div key={i} style={{ flex: i === 0 ? 2 : 1, padding: "8px 10px", background: i === 2 ? "#FF6B00" : i === 1 ? "#f8f8f8" : "white", fontWeight: 700, fontSize: 12, color: i === 2 ? "white" : "#888", textAlign: i > 0 ? "center" : "left", borderRight: i < 2 ? "1px solid #f0f0f0" : "none" }}>
                    {h}
                  </div>
                ))}
              </div>
              {[
                ["Feed d'offres", "✅", "✅"],
                ["Carte & GPS", "✅", "✅"],
                ["Favoris", "✅", "✅"],
                ["Accès anticipé offres flash", "❌", "✅"],
                ["Alertes push prioritaires", "❌", "✅"],
                ["Sans publicité", "❌", "✅"],
                ["Offres exclusives", "❌", "✅"],
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", borderTop: "1px solid #f5f5f5" }}>
                  {row.map((cell, j) => (
                    <div key={j} style={{ flex: j === 0 ? 2 : 1, padding: "9px 10px", fontSize: 12, color: j === 0 ? "#333" : "#555", textAlign: j > 0 ? "center" : "left", background: j === 2 ? "#FFF8F0" : "white", borderRight: j < 2 ? "1px solid #f5f5f5" : "none" }}>
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paiement sécurisé */}
        <div style={{ textAlign: "center", marginTop: 20, color: "#aaa", fontSize: 12 }}>
          <div style={{ marginBottom: 4 }}>🔒 Paiement sécurisé par Stripe</div>
          <div>Visa • Mastercard • Apple Pay • Google Pay</div>
        </div>
      </div>
    </div>
  );
}
