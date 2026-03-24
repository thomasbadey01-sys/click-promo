import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div style={{
      background: "#F2F2F7", minHeight: "100vh",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      maxWidth: 430, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #FF6B00, #FF3B30)", padding: "52px 20px 20px" }}>
        <Link to="/Profil" style={{ textDecoration: "none" }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 8 }}>← Retour</div>
        </Link>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>🔒 Politique de confidentialité</div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 }}>Dernière mise à jour : Mars 2026</div>
      </div>

      <div style={{ padding: "20px 16px 60px" }}>
        {[
          {
            title: "1. Collecte des données",
            content: `Click & Promo collecte les données suivantes :\n\n• Données de localisation (GPS) : utilisées uniquement pour afficher les offres proches de vous. Elles ne sont jamais stockées de façon permanente.\n\n• Données de profil (prénom, ville, email) : renseignées volontairement par l'utilisateur et stockées localement sur l'appareil.\n\n• Données d'utilisation anonymisées : comptage des vues et clics sur les offres (sans identification personnelle).`
          },
          {
            title: "2. Utilisation des données",
            content: `Vos données sont utilisées exclusivement pour :\n\n• Vous afficher les offres les plus pertinentes selon votre localisation\n• Personnaliser votre expérience selon vos catégories préférées\n• Améliorer l'application grâce à des statistiques anonymes\n\nVos données ne sont jamais vendues à des tiers.`
          },
          {
            title: "3. Géolocalisation",
            content: `L'accès à votre position GPS est toujours demandé explicitement. Vous pouvez refuser ou révoquer cet accès à tout moment dans les paramètres de votre appareil. Sans localisation, l'app fonctionne en mode dégradé (offres non triées par distance).`
          },
          {
            title: "4. Stockage local",
            content: `Vos favoris, votre profil et vos préférences sont stockés localement sur votre appareil via le stockage local (localStorage). Ces données ne quittent pas votre appareil sauf si vous les saisissez explicitement.`
          },
          {
            title: "5. Cookies et traceurs",
            content: `Click & Promo n'utilise pas de cookies publicitaires ni de traceurs tiers. Seul un identifiant de session technique est utilisé pour le bon fonctionnement de l'application.`
          },
          {
            title: "6. Droits des utilisateurs",
            content: `Conformément au RGPD, vous disposez des droits suivants :\n\n• Droit d'accès à vos données\n• Droit de rectification\n• Droit à l'effacement (suppression du compte)\n• Droit à la portabilité\n\nPour exercer ces droits : contact@clicketpromo.fr`
          },
          {
            title: "7. Sécurité",
            content: `Toutes les communications entre l'application et nos serveurs sont chiffrées via HTTPS/TLS. Nous appliquons les meilleures pratiques de sécurité pour protéger vos données.`
          },
          {
            title: "8. Contact",
            content: `Pour toute question relative à vos données personnelles :\n\nClick & Promo SAS\nEmail : contact@clicketpromo.fr\nAdresse : Paris, France`
          },
        ].map((section, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 14, padding: 16,
            marginBottom: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 10 }}>
              {section.title}
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {section.content}
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <div style={{ fontSize: 12, color: "#aaa" }}>Click & Promo © 2026 — Tous droits réservés</div>
        </div>
      </div>
    </div>
  );
}
