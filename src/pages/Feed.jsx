import { useState, useEffect, useRef } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";

const CATEGORIES = ["Tout", "Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Services", "Épicerie", "Pharmacie"];
const CAT_ICONS = {
  "Tout": "🏷️", "Restaurant": "🍽️", "Boutique": "🛍️",
  "Beauté & Coiffure": "💇", "Fitness & Sport": "💪",
  "Services": "🔧", "Épicerie": "🥖", "Pharmacie": "💊", "Autre": "📦"
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function CountdownTimer({ dateFin }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(dateFin);
      const diff = end - now;
      if (diff <= 0) { setTimeLeft("Expirée"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(diff < 3600000);
      if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [dateFin]);

  return (
    <span style={{
      background: isUrgent ? "#FF3B30" : "#FF6B00",
      color: "white", padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 3
    }}>
      ⏱ {timeLeft}
    </span>
  );
}

function OffreCard({ offre, favs, onToggleFav, userPos }) {
  const isFav = favs.includes(offre.id);
  const stockPct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial) * 100 : 100;
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;

  return (
    <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "white", borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 16
      }}>
        <div style={{ position: "relative", height: 175 }}>
          <img src={offre.image_url} alt={offre.titre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "#FF3B30", color: "white",
            borderRadius: 20, padding: "4px 12px",
            fontWeight: 800, fontSize: 15
          }}>
            -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onToggleFav(offre.id); }}
            style={{
              position: "absolute", top: 10, right: 12,
              background: "rgba(255,255,255,0.92)", border: "none",
              borderRadius: "50%", width: 36, height: 36,
              fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
            }}
          >
            {isFav ? "❤️" : "🤍"}
          </button>
          {offre.est_urgente && (
            <div style={{ position: "absolute", bottom: 10, left: 12 }}>
              <CountdownTimer dateFin={offre.date_fin} />
            </div>
          )}
          {dist !== null && (
            <div style={{
              position: "absolute", bottom: 10, right: 12,
              background: "rgba(0,0,0,0.55)", color: "white",
              borderRadius: 10, padding: "3px 8px", fontSize: 11, fontWeight: 600
            }}>
              📍 {formatDist(dist)}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 13 }}>{CAT_ICONS[offre.categorie] || "🏷️"}</span>
            <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{offre.categorie}</span>
            {!dist && offre.ville && (
              <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>📍 {offre.ville}</span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 3, lineHeight: 1.3 }}>
            {offre.titre}
          </div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>{offre.commercant_nom}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              {offre.prix_promo > 0 && (
                <span style={{ fontSize: 20, fontWeight: 800, color: "#FF3B30" }}>{offre.prix_promo}€</span>
              )}
              {offre.prix_original > 0 && (
                <span style={{ fontSize: 14, color: "#aaa", textDecoration: "line-through" }}>{offre.prix_original}€</span>
              )}
            </div>
            {offre.stock_restant !== undefined && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: stockPct < 30 ? "#FF3B30" : "#888", fontWeight: 600 }}>
                  {offre.stock_restant} restant{offre.stock_restant > 1 ? "s" : ""}
                </div>
                <div style={{ background: "#f0f0f0", borderRadius: 4, height: 4, width: 70, marginTop: 3 }}>
                  <div style={{
                    background: stockPct < 30 ? "#FF3B30" : "#34C759",
                    height: "100%", borderRadius: 4,
                    width: `${Math.min(stockPct, 100)}%`
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Feed() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState("Tout");
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cp_favs") || "[]"); } catch { return []; }
  });
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState("proximite");
  const [userPos, setUserPos] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [geoStatus, setGeoStatus] = useState("idle");
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  // Géolocalisation
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ok");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    Offre.list().then(data => {
      setOffres(data.filter(o => o.est_active));
      setLoading(false);
    });
  }, []);

  // Pull-to-refresh
  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current?.scrollTop === 0 && e.touches[0].clientY > touchStartY.current + 60) {
      handleRefresh();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await Offre.list();
      setOffres(data.filter(o => o.est_active));
      setTimeout(() => setRefreshing(false), 500);
    } catch {
      setRefreshing(false);
    }
  };

  const toggleFav = (id) => {
    const newFavs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavs(newFavs);
    localStorage.setItem("cp_favs", JSON.stringify(newFavs));
    
    // Historique des vues
    const historique = JSON.parse(localStorage.getItem("cp_historique") || "[]");
    const offre = offres.find(o => o.id === id);
    if (offre && !historique.some(h => h.id === id)) {
      historique.push({ id, titre: offre.titre, commerce: offre.commercant_nom, date: new Date().toLocaleDateString() });
      localStorage.setItem("cp_historique", JSON.stringify(historique.slice(-50)));
    }
  };

  // Enrichir offres avec distance
  const offresAvecDist = offres.map(o => ({
    ...o,
    dist: userPos && o.latitude ? haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) : null
  }));

  let filtered = offresAvecDist.filter(o => {
    if (categorie !== "Tout" && o.categorie !== categorie) return false;
    if (recherche && !o.titre.toLowerCase().includes(recherche.toLowerCase()) &&
        !o.commercant_nom?.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  // Tri
  if (tri === "proximite" && userPos) filtered = [...filtered].sort((a, b) => (a.dist || 99) - (b.dist || 99));
  else if (tri === "reduction") filtered = [...filtered].sort((a, b) => b.valeur_reduction - a.valeur_reduction);
  else if (tri === "urgence") filtered = [...filtered].sort((a, b) => (b.est_urgente ? 1 : 0) - (a.est_urgente ? 1 : 0));

  // Grouper par commerce
  const parCommerce = {};
  filtered.forEach(o => {
    if (!parCommerce[o.commercant_nom]) parCommerce[o.commercant_nom] = [];
    parCommerce[o.commercant_nom].push(o);
  });

  const offresUrgentes = filtered.filter(o => o.est_urgente);
  const offresNormales = filtered.filter(o => !o.est_urgente);

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header sticky */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
        padding: "50px 20px 16px",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
              {geoStatus === "ok" && userPos ? (
                <span>📍 Près de vous</span>
              ) : geoStatus === "loading" ? (
                <span>⏳ Localisation...</span>
              ) : (
                <span>📍 Paris, France</span>
              )}
            </div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>Click & Promo</div>
          </div>
          <Link to="/Profil" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.25)", borderRadius: "50%",
              width: 40, height: 40, display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontSize: 20
            }}>👤</div>
          </Link>
        </div>

        {/* Recherche */}
        <div style={{
          background: "rgba(255,255,255,0.95)", borderRadius: 14,
          display: "flex", alignItems: "center", padding: "10px 14px", gap: 8
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Chercher une offre ou un commerce..."
            style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent", color: "#333" }}
          />
          {recherche && (
            <button onClick={() => setRecherche("")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 16 }}>✕</button>
          )}
        </div>
      </div>

      <div ref={scrollRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} style={{ padding: "0 16px 100px", overflow: "auto" }}>

        {/* Pull-to-refresh indicator */}
        {refreshing && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#FF6B00" }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>🔄</span> Actualisé
          </div>
        )}

        {/* Catégories */}
        <div style={{ overflowX: "auto", display: "flex", gap: 8, padding: "14px 0 10px", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              style={{
                flexShrink: 0,
                background: categorie === cat ? "#FF6B00" : "white",
                color: categorie === cat ? "white" : "#444",
                border: categorie === cat ? "none" : "1px solid #e0e0e0",
                borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: categorie === cat ? "0 2px 8px rgba(255,107,0,0.35)" : "none"
              }}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Tri + compteur */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>
            {filtered.length} offre{filtered.length > 1 ? "s" : ""}
          </span>
          <select
            value={tri}
            onChange={e => setTri(e.target.value)}
            style={{
              border: "1px solid #e0e0e0", borderRadius: 10,
              padding: "6px 10px", fontSize: 13, background: "white",
              color: "#444", cursor: "pointer", outline: "none"
            }}
          >
            <option value="proximite">📍 Plus proches</option>
            <option value="reduction">🔥 Meilleures réductions</option>
            <option value="urgence">⏱ Plus urgentes</option>
          </select>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Chargement...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
            <div style={{ color: "#666", fontSize: 15 }}>Aucune offre dans cette catégorie</div>
          </div>
        )}

        {/* Offres urgentes */}
        {offresUrgentes.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>Offres urgentes</span>
            </div>
            {offresUrgentes.map(o => (
              <OffreCard key={o.id} offre={o} favs={favs} onToggleFav={toggleFav} userPos={userPos} />
            ))}
          </div>
        )}

        {/* Toutes les offres groupées par commerce */}
        {offresNormales.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>Toutes les offres</span>
            </div>

            {Object.entries(parCommerce).map(([commerce, offresComm]) => {
              const offresCommNormales = offresComm.filter(o => !o.est_urgente);
              if (offresCommNormales.length === 0) return null;

              return (
                <div key={commerce} style={{ marginBottom: 20 }}>
                  {offresComm.length > 1 && (
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: "#FF6B00",
                      padding: "8px 0", textTransform: "uppercase", letterSpacing: 0.5
                    }}>
                      {commerce} ({offresCommNormales.length})
                    </div>
                  )}
                  {offresCommNormales.map(o => (
                    <OffreCard key={o.id} offre={o} favs={favs} onToggleFav={toggleFav} userPos={userPos} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NavBar active="feed" />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes criticalPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}

export function NavBar({ active }) {
  const tabs = [
    { key: "feed", icon: "🏷️", label: "Offres", to: "/Feed" },
    { key: "carte", icon: "🗺️", label: "Carte", to: "/Carte" },
    { key: "favoris", icon: "❤️", label: "Favoris", to: "/Favoris" },
    { key: "dashboard", icon: "📊", label: "Mon Shop", to: "/Dashboard" },
    { key: "profil", icon: "👤", label: "Profil", to: "/Profil" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "white", borderTop: "1px solid #f0f0f0",
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 20px",
      boxShadow: "0 -2px 16px rgba(0,0,0,0.06)", zIndex: 200
    }}>
      {tabs.map(t => (
        <Link key={t.key} to={t.to} style={{ textDecoration: "none", flex: 1 }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: active === t.key ? 700 : 500,
              color: active === t.key ? "#FF6B00" : "#999"
            }}>{t.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
