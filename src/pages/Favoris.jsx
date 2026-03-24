import { useState, useEffect } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

function CountdownBadge({ dateFin }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = new Date(dateFin) - new Date();
      if (diff <= 0) { setLabel("Expirée"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h > 24) setLabel(`${Math.floor(h/24)}j restants`);
      else if (h > 0) setLabel(`${h}h ${m}m`);
      else setLabel(`${m}m`);
    };
    update();
    const t = setInterval(update, 10000);
    return () => clearInterval(t);
  }, [dateFin]);

  if (!label) return null;
  const isExpired = label === "Expirée";
  const isUrgent = label.includes("m") && !label.includes("h") && !label.includes("j");
  return (
    <span style={{
      background: isExpired ? "#f0f0f0" : isUrgent ? "#FF3B30" : "#FF6B00",
      color: isExpired ? "#aaa" : "white",
      borderRadius: 8, padding: "2px 7px",
      fontSize: 11, fontWeight: 700
    }}>
      {isExpired ? "Expirée" : `⏱ ${label}`}
    </span>
  );
}

export default function Favoris() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState([]);
  const [tri, setTri] = useState("all"); // all | actives | urgentes

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

  const filtered = offres.filter(o => {
    if (tri === "actives") return o.est_active;
    if (tri === "urgentes") return o.est_urgente && o.est_active;
    return true;
  });

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #FF6B00, #FF3B30)", padding: "52px 20px 20px" }}>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>❤️ Mes Favoris</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
          {offres.length} offre{offres.length > 1 ? "s" : ""} sauvegardée{offres.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Filtres */}
      {offres.length > 0 && (
        <div style={{ background: "white", padding: "10px 16px", display: "flex", gap: 8, borderBottom: "1px solid #f0f0f0" }}>
          {[
            { key: "all", label: `Tout (${offres.length})` },
            { key: "actives", label: `Actives (${offres.filter(o => o.est_active).length})` },
            { key: "urgentes", label: `🔥 Urgentes (${offres.filter(o => o.est_urgente && o.est_active).length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTri(t.key)} style={{
              background: tri === t.key ? "#FF6B00" : "#f2f2f7",
              color: tri === t.key ? "white" : "#555",
              border: "none", borderRadius: 20, padding: "6px 12px",
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>{t.label}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "14px 16px 100px" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Chargement...</div>}

        {!loading && offres.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>Aucun favori</div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
              Appuyez sur le ❤️ d'une offre pour la sauvegarder ici
            </div>
            <Link to="/Feed" style={{ textDecoration: "none" }}>
              <div style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                color: "white", borderRadius: 14,
                padding: "13px 28px", fontWeight: 700, fontSize: 15,
                boxShadow: "0 4px 14px rgba(255,107,0,0.35)"
              }}>
                Découvrir les offres
              </div>
            </Link>
          </div>
        )}

        {!loading && offres.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div style={{ color: "#666" }}>Aucune offre dans ce filtre</div>
          </div>
        )}

        {filtered.map(offre => {
          const isExpired = offre.date_fin && new Date(offre.date_fin) < new Date();
          return (
            <div key={offre.id} style={{
              background: "white", borderRadius: 16, overflow: "hidden",
              marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              opacity: isExpired ? 0.6 : 1
            }}>
              <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex" }}>
                  <div style={{ position: "relative", width: 110, flexShrink: 0 }}>
                    <img src={offre.image_url} alt={offre.titre}
                      style={{ width: "100%", height: 110, objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", top: 8, left: 8,
                      background: "#FF3B30", color: "white",
                      borderRadius: 10, padding: "2px 8px",
                      fontSize: 12, fontWeight: 800
                    }}>
                      -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                    </div>
                  </div>
                  <div style={{ padding: "12px", flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 3, lineHeight: 1.3,
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                    }}>
                      {offre.titre}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{offre.commercant_nom}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      {offre.prix_promo > 0 && (
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#FF3B30" }}>{offre.prix_promo}€</span>
                      )}
                      {offre.prix_original > 0 && (
                        <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>{offre.prix_original}€</span>
                      )}
                      {offre.date_fin && <CountdownBadge dateFin={offre.date_fin} />}
                    </div>
                  </div>
                </div>
              </Link>

              <div style={{
                borderTop: "1px solid #f5f5f5", padding: "9px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ fontSize: 12, color: isExpired ? "#FF3B30" : offre.est_active ? "#34C759" : "#FF9500", fontWeight: 600 }}>
                  {isExpired ? "⚠️ Expirée" : offre.est_active ? "✅ Disponible" : "⏸ Inactive"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ color: "#FF6B00", fontSize: 13, fontWeight: 600 }}>Voir →</div>
                  </Link>
                  <button onClick={() => removeFav(offre.id)} style={{
                    background: "none", border: "none", color: "#ccc",
                    fontSize: 16, cursor: "pointer", padding: "0 4px"
                  }}>🗑</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NavBar active="favoris" />
    </div>
  );
}
