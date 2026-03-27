import { useNavigate } from "react-router-dom";
import { DS, Ic, getTheme } from "./theme";

const SECTIONS = [
  {
    title: "📋 Données collectées",
    content: "Nous collectons votre email, prénom, et données de localisation (optionnel) pour personnaliser vos offres. Aucune donnée bancaire n'est stockée sur nos serveurs.",
  },
  {
    title: "🎯 Utilisation des données",
    content: "Vos données servent uniquement à vous proposer des offres géolocalisées pertinentes, calculer vos points de fidélité et envoyer des notifications si vous y avez consenti.",
  },
  {
    title: "🤝 Partage des données",
    content: "Nous ne vendons jamais vos données. Seuls les commerçants partenaires reçoivent des statistiques anonymisées (nombre de clics, vues) sur leurs offres.",
  },
  {
    title: "💳 Sécurité des paiements",
    content: "Tous les paiements sont traités par Stripe, certifié PCI DSS niveau 1. Nous n'avons jamais accès à vos coordonnées bancaires.",
  },
  {
    title: "⚖️ Vos droits (RGPD)",
    content: "Conformément au RGPD, vous pouvez accéder, modifier ou supprimer vos données à tout moment depuis votre profil ou en nous contactant à privacy@clicketpromo.fr.",
  },
  {
    title: "🍪 Cookies",
    content: "Nous utilisons uniquement des cookies essentiels au fonctionnement de l'application (session, préférences). Aucun cookie publicitaire tiers.",
  },
  {
    title: "🕐 Conservation",
    content: "Vos données sont conservées 3 ans après la dernière activité sur votre compte. Les données de commandes sont conservées 10 ans (obligation légale).",
  },
  {
    title: "📬 Contact",
    content: "Pour toute question sur vos données personnelles : privacy@clicketpromo.fr — Réponse sous 72h ouvrées.",
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const t = getTheme();

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${DS.brandDark} 0%, ${DS.brand} 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 24px`,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          {Ic.back("#fff", 18)}
        </button>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -0.5, marginBottom: 6 }}>
          Politique de Confidentialité
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>
          Dernière mise à jour : mars 2026 · RGPD conforme
        </div>
      </div>

      {/* Intro */}
      <div style={{ margin: "16px 16px 0", background: t.isDark ? DS.darkCard : "#fff", borderRadius: DS.xl, padding: 18, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 14, color: t.text2, lineHeight: 1.8 }}>
          Chez <strong style={{ color: t.text }}>Click & Promo</strong>, la protection de vos données personnelles est une priorité. Cette politique explique de manière transparente comment nous collectons, utilisons et protégeons vos informations.
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: "14px 16px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ background: t.isDark ? DS.darkCard : "#fff", borderRadius: DS.lg, padding: "16px 18px", boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 14, color: t.text2, lineHeight: 1.8 }}>{s.content}</div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{ background: DS.brandLight, borderRadius: DS.xl, padding: 20, border: `1px solid ${DS.brand}30`, marginTop: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: DS.brand, marginBottom: 8 }}>📬 Une question ?</div>
          <div style={{ fontSize: 14, color: DS.ink60, lineHeight: 1.7, marginBottom: 14 }}>
            Notre DPO (Délégué à la Protection des Données) répond sous 72h.
          </div>
          <a href="mailto:privacy@clicketpromo.fr" style={{ display: "inline-block", background: DS.brand, color: "#fff", borderRadius: 100, padding: "12px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: DS.eBrand }}>
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}