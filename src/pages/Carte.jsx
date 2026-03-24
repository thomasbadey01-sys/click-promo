import { useState, useEffect } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

const CAT_COLORS = {
  "Restaurant": "#FF6B00",
  "Boutique": "#AF52DE",
  "Beauté & Coiffure": "#FF2D55",
  "Fitness & Sport": "#34C759",
  "Services": "#007AFF",
  "Épicerie": "#FF9500",
  "Pharmacie": "#30B0C7",
  "Autre": "#8E8E93"
};

const CAT_ICONS = {
  "Restaurant": "🍽️",
  "Boutique": "🛍️",
  "Beauté & Coiffure": "💇",
  "Fitness & Sport": "💪",
  "Services": "🔧",
  "Épicerie": "🥖",
  "Pharmacie": "💊",
  "Autre": "📦"
};

export default function Carte() {
  const [offres, setOffres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Offre.list().then(data => {
      setOffres(data.filter(o => o.est_active && o.latitude && o.longitude));
      setLoading(false);
    });
  }, []);

  // Calcul de la position relative sur la carte simulée
  const getPos = (lat, lng) => {
    const latMin = 48.84, latMax = 48.875;
    const lngMin = 2.34, lngMax = 2.39;
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = ((latMax - lat) / (latMax - latMin)) * 100;
    return { x: Math.max(5, Math.min(92, x)), y: Math.max(5, Math.min(90, y)) };
  };

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
        padding: "50px 20px 20px"
      }}>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>🗺️ Carte des offres</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
          {offres.length} offre{offres.length > 1 ? "s" : ""} près de vous
        </div>
      </div>

      {/* Carte interactive simulée */}
      <div style={{
        position: "relative",
        height: selected ? "45vh" : "60vh",
        background: "#E8F0E8",
        overflow: "hidden",
        transition: "height 0.3s"
      }}>
        {/* Fond carte stylisé */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #e8f4e8 0%, #ddeedd 50%, #e4eee4 100%)"
        }} />

        {/* Routes simulées */}
        {[
          { top: "30%", left: 0, width: "100%", height: 2 },
          { top: "55%", left: 0, width: "100%", height: 2 },
          { top: 0, left: "40%", width: 2, height: "100%" },
          { top: 0, left: "70%", width: 2, height: "100%" },
          { top: "20%", left: "20%", width: "50%", height: 1.5, transform: "rotate(-15deg)" },
        ].map((r, i) => (
          <div key={i} style={{ position: "absolute", background: "rgba(255,255,255,0.7)", ...r }} />
        ))}

        {/* Label Paris */}
        <div style={{ position: "absolute", top: "45%", left: "45%", transform: "translate(-50%,-50%)", color: "rgba(0,0,0,0.15)", fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>
          PARIS
        </div>

        {/* Marqueurs offres */}
        {offres.map(offre => {
          const pos = getPos(offre.latitude, offre.longitude);
          const isSelected = selected?.id === offre.id;
          const color = CAT_COLORS[offre.categorie] || "#FF6B00";

          return (
            <div
              key={offre.id}
              onClick={() => setSelected(isSelected ? null : offre)}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -100%)",
                cursor: "pointer",
                zIndex: isSelected ? 10 : 1,
                transition: "transform 0.2s"
              }}
            >
              <div style={{
                background: color,
                color: "white",
                borderRadius: isSelected ? 20 : 20,
                padding: isSelected ? "6px 12px" : "5px 10px",
                fontSize: isSelected ? 13 : 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: `0 3px 12px ${color}60`,
                transform: isSelected ? "scale(1.15)" : "scale(1)",
                border: isSelected ? "2px solid white" : "none"
              }}>
                {CAT_ICONS[offre.categorie]} -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
              </div>
              {/* Épingle */}
              <div style={{
                width: 0, height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `8px solid ${color}`,
                margin: "0 auto"
              }} />
            </div>
          );
        })}

        {/* Position utilisateur */}
        <div style={{
          position: "absolute", top: "52%", left: "55%",
          width: 14, height: 14,
          background: "#007AFF",
          borderRadius: "50%",
          border: "3px solid white",
          boxShadow: "0 0 0 6px rgba(0,122,255,0.2)"
        }} />
      </div>

      {/* Offre sélectionnée */}
      {selected && (
        <Link to={`/OffreDetail?id=${selected.id}`} style={{ textDecoration: "none" }}>
          <div style={{
            background: "white",
            margin: "12px 16px",
            borderRadius: 16,
            padding: 16,
            display: "flex",
            gap: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: "2px solid #FF6B00"
          }}>
            <img
              src={selected.image_url}
              alt={selected.titre}
              style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 3 }}>{selected.titre}</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>{selected.commercant_nom} • {selected.adresse}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#FF3B30", color: "white", borderRadius: 10, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>
                  -{selected.valeur_reduction}{selected.type_reduction === "pourcentage" ? "%" : "€"}
                </span>
                {selected.est_urgente && (
                  <span style={{ fontSize: 12, color: "#FF3B30", fontWeight: 600 }}>🔥 Urgente</span>
                )}
                <span style={{ fontSize: 12, color: "#007AFF", marginLeft: "auto" }}>Voir →</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Liste rapide */}
      {!selected && (
        <div style={{ padding: "12px 16px 100px" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#1a1a1a" }}>
            📍 Offres à proximité
          </div>
          {offres.map(offre => (
            <Link key={offre.id} to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${CAT_COLORS[offre.categorie]}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0
                }}>
                  {CAT_ICONS[offre.categorie]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{offre.titre}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{offre.commercant_nom}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#FF3B30" }}>
                    -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>~500m</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Chargement...</div>}

      <NavBar active="carte" />
    </div>
  );
}
