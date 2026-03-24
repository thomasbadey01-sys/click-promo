import { useState, useEffect } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

export default function Favoris() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("cp_favs") || "[]");
    setFavIds(ids);
    if (ids.length === 0) { setLoading(false); return; }
    Offre.list().then(all => {
      setOffres(all.filter(o => ids.includes(o.id)));
      setLoading(false);
    });
  }, []);

  const removeFav = (id) => {
    const newFavs = favIds.filter(f => f !== id);
    setFavIds(newFavs);
    setOffres(prev => prev.filter(o => o.id !== id));
    localStorage.setItem("cp_favs", JSON.stringify(newFavs));
  };

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
        padding: "50px 20px 20px"
      }}>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>❤️ Mes Favoris</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
          {offres.length} offre{offres.length > 1 ? "s" : ""} sauvegardée{offres.length > 1 ? "s" : ""}
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Chargement...</div>
        )}

        {!loading && offres.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🤍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
              Aucun favori pour l'instant
            </div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
              Appuyez sur le cœur d'une offre pour la sauvegarder
            </div>
            <Link to="/Feed" style={{ textDecoration: "none" }}>
              <div style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                color: "white", borderRadius: 12,
                padding: "12px 24px", fontWeight: 700, fontSize: 15
              }}>
                Découvrir les offres
              </div>
            </Link>
          </div>
        )}

        {offres.map(offre => (
          <div key={offre.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", gap: 0 }}>
                <img src={offre.image_url} alt={offre.titre} style={{ width: 110, height: 110, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ padding: "12px", flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.3 }}>
                    {offre.titre}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{offre.commercant_nom}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: "#FF3B30", color: "white", borderRadius: 10, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>
                      -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                    </span>
                    {offre.est_urgente && <span style={{ fontSize: 12, color: "#FF3B30" }}>🔥</span>}
                  </div>
                </div>
              </div>
            </Link>
            <div style={{ borderTop: "1px solid #f5f5f5", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
              <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none", color: "#FF6B00", fontSize: 13, fontWeight: 600 }}>
                Voir l'offre →
              </Link>
              <button
                onClick={() => removeFav(offre.id)}
                style={{ background: "none", border: "none", color: "#aaa", fontSize: 13, cursor: "pointer" }}
              >
                🗑 Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      <NavBar active="favoris" />
    </div>
  );
}
