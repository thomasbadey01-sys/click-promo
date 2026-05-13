import { useNavigate } from "react-router-dom";
import { DS, NavBar, CPLogo } from "./theme";

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F7F7FB", minHeight: "100vh", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        padding: "52px 24px 24px",
        borderBottom: "1px solid #EDEDF5",
        textAlign: "center",
      }}>
        <CPLogo size={40} />
        <h1 style={{ fontSize: 28, fontWeight: 900, color: DS.ink, marginTop: 12, marginBottom: 8 }}>
          À propos de Click &amp; Promo
        </h1>
        <p style={{ fontSize: 15, color: "#666", maxWidth: 480, margin: "0 auto" }}>
          La plateforme qui connecte les consommateurs aux meilleures offres locales
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 120px" }}>

        {/* What is Click & Promo */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: DS.ink, marginBottom: 12 }}>🎯 Qu'est-ce que Click &amp; Promo ?</h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: 0 }}>
            Click &amp; Promo est une application mobile et web dédiée à la découverte des meilleures promotions,
            réductions et offres flash proposées par les commerces de votre quartier et de votre ville.
            Notre mission est simple : vous faire économiser de l'argent au quotidien en vous connectant
            aux bonnes affaires au bon moment, exactement là où vous vous trouvez.
          </p>
        </div>

        {/* Who is it for */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: DS.ink, marginBottom: 12 }}>👥 Pour qui ?</h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, marginBottom: 12 }}>
            <strong>Pour les consommateurs</strong> : que vous soyez étudiant, famille, actif ou retraité,
            Click &amp; Promo vous permet de trouver en quelques secondes les promotions actives autour de vous —
            restaurants, boutiques de mode, salons de beauté, épiceries, pharmacies, centres de fitness et bien plus encore.
            Grâce à la géolocalisation et à notre moteur de recherche intelligent basé sur l'IA, vous obtenez des
            recommandations personnalisées selon vos préférences et votre position.
          </p>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: 0 }}>
            <strong>Pour les commerçants</strong> : Click &amp; Promo offre aux enseignes locales un outil puissant
            pour diffuser leurs offres, attirer de nouveaux clients et fidéliser leur clientèle existante.
            Les commerçants peuvent créer des offres flash, des réductions en pourcentage ou en montant fixe,
            et suivre leurs performances en temps réel via un tableau de bord dédié.
          </p>
        </div>

        {/* Who builds it */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: DS.ink, marginBottom: 12 }}>🚀 Qui développe Click &amp; Promo ?</h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: 0 }}>
            Click &amp; Promo est développé par une équipe passionnée par le commerce local et les nouvelles technologies.
            Nous croyons que les petits commerçants méritent les mêmes outils de visibilité que les grandes enseignes nationales.
            Notre plateforme est pensée pour être simple, rapide et efficace, aussi bien pour les utilisateurs
            que pour les professionnels. Nous travaillons en continu à améliorer l'expérience, ajouter de nouvelles
            fonctionnalités et étendre notre couverture géographique dans toute la France.
          </p>
        </div>

        {/* Key features */}
        <div style={{ background: `linear-gradient(135deg, ${DS.brand}10, ${DS.brand2}10)`, borderRadius: 20, padding: "24px 24px", marginBottom: 20, border: `1px solid ${DS.brand}20` }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: DS.ink, marginBottom: 16 }}>✨ Fonctionnalités clés</h2>
          {[
            { emoji: "📍", text: "Offres géolocalisées triées par distance" },
            { emoji: "⚡", text: "Alertes offres flash en temps réel" },
            { emoji: "🤖", text: "Recherche intelligente par IA" },
            { emoji: "❤️", text: "Sauvegarde de vos offres favorites" },
            { emoji: "🏆", text: "Programme de fidélité et gamification" },
            { emoji: "🗺️", text: "Carte interactive des offres autour de vous" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{f.emoji}</span>
              <span style={{ fontSize: 14, color: DS.ink, fontWeight: 600 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <button onClick={() => navigate("/Feed")} style={{
            background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
            color: "#fff", border: "none", borderRadius: 100,
            padding: "16px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: DS.eBrand, marginRight: 12,
          }}>
            Découvrir les offres →
          </button>
          <button onClick={() => navigate("/Contact")} style={{
            background: "#fff", color: DS.brand, border: `2px solid ${DS.brand}`,
            borderRadius: 100, padding: "14px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            Nous contacter
          </button>
        </div>
      </div>

      <NavBar active="" />
    </div>
  );
}