import { useState, useEffect, useCallback } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo, NavBar, SkeletonCard } from "./theme";

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

const CATS = [
  { id: "tout",             label: "Tout",    emoji: "🏠" },
  { id: "Restaurant",       label: "Restos",  emoji: "🍽️" },
  { id: "Boutique",         label: "Mode",    emoji: "👗" },
  { id: "Beauté & Coiffure",label: "Beauté",  emoji: "💅" },
  { id: "Fitness & Sport",  label: "Sport",   emoji: "🏋️" },
  { id: "Épicerie",         label: "Épicerie",emoji: "🥐" },
];

const SECTIONS = [
  { id: "Restaurant",        label: "Restaurants",      emoji: "🍽️" },
  { id: "Boutique",          label: "Mode & Boutiques",  emoji: "👗" },
  { id: "Beauté & Coiffure", label: "Beauté & Coiffure", emoji: "💅" },
  { id: "Fitness & Sport",   label: "Sport & Fitness",   emoji: "🏋️" },
  { id: "Épicerie",          label: "Épicerie",           emoji: "🥐" },
  { id: "Services",          label: "Services",           emoji: "🏠" },
];

// Petite card scroll horizontal (Flash Deals / Près de vous)
function HScrollCard({ o, isFav, onFav, onPress, userPos }) {
  const dist = userPos && o.latitude && o.longitude
    ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
  return (
    <div onClick={onPress} style={{
      width: 160, flexShrink: 0, background: "#fff",
      borderRadius: 16, overflow: "hidden", cursor: "pointer",
      boxShadow: "0 2px 12px rgba(0,0,0,.08)",
    }}>
      <div style={{ position: "relative", height: 110 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"} />
        {(o.valeur_reduction > 0) && (
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: DS.brand, color: "#fff",
            borderRadius: 20, padding: "3px 8px",
            fontSize: 11, fontWeight: 800,
          }}>-{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}</div>
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {o.commercant_nom || o.titre}
        </div>
        {o.prix_promo > 0 && (
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A2E" }}>{o.prix_promo} €</div>
        )}
        {dist !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#888", fontSize: 11, marginTop: 2 }}>
            <span>✈</span> {formatDist(dist)}
          </div>
        )}
      </div>
    </div>
  );
}

// Card grille 2 colonnes
function GridCard({ o, onPress, userPos }) {
  const dist = userPos && o.latitude && o.longitude
    ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
  return (
    <div onClick={onPress} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,.07)",
    }}>
      <div style={{ position: "relative", height: 120 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"} />
        {(o.valeur_reduction > 0) && (
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: DS.brand, color: "#fff",
            borderRadius: 20, padding: "3px 8px",
            fontSize: 11, fontWeight: 800,
          }}>-{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}</div>
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {o.commercant_nom || o.titre}
        </div>
        {o.prix_promo > 0 && (
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A2E" }}>{o.prix_promo} €</div>
        )}
        {dist !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#888", fontSize: 11, marginTop: 2 }}>
            <span>✈</span> {formatDist(dist)}
          </div>
        )}
      </div>
    </div>
  );
}

// Section titre avec "Voir tout"
function SectionHeader({ emoji, label, onSeeAll }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>
        {emoji} {label}
      </div>
      <button onClick={onSeeAll} style={{
        background: "none", border: "none", color: DS.brand,
        fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0,
      }}>Voir tout →</button>
    </div>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [cat, setCat] = useState("tout");
  const [search, setSearch] = useState("");
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cp_favs") || "[]"); } catch { return []; }
  });

  const toggleFav = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("cp_favs", JSON.stringify(next));
      return next;
    });
  };

  const load = useCallback(async () => {
    const data = await Offre.filter({ est_active: true });
    const now = new Date();
    setOffres(data.filter(o => !o.date_fin || new Date(o.date_fin) > now));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos({ lat: 48.8566, lon: 2.3522 })
    );
  }, []);

  // Pull-to-refresh
  const [startY, setStartY] = useState(null);
  const onTouchStart = e => setStartY(e.touches[0].clientY);
  const onTouchEnd = e => {
    if (startY && e.changedTouches[0].clientY - startY > 80 && window.scrollY === 0) {
      setRefreshing(true); load();
    }
    setStartY(null);
  };

  // Filtrage
  const filtered = offres.filter(o => {
    if (cat !== "tout" && o.categorie !== cat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (o.titre?.toLowerCase().includes(q) || o.commercant_nom?.toLowerCase().includes(q) || o.ville?.toLowerCase().includes(q));
    }
    return true;
  }).map(o => ({
    ...o,
    _dist: userPos && o.latitude && o.longitude ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null,
  })).sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999));

  // Flash deals = offres urgentes
  const flashDeals = filtered.filter(o => o.est_urgente);
  // Près de vous = < 2km
  const nearby = userPos ? filtered.filter(o => o._dist !== null && o._dist < 2) : [];

  if (loading) return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}>
      <div style={{ background: "#fff", padding: `calc(${DS.safeTop} + 8px) 16px 12px` }}>
        <div className="shimmer-card" style={{ height: 40, borderRadius: 100, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 80, 70, 90, 75, 85].map((w, i) => <div key={i} className="shimmer-card" style={{ height: 32, width: w, borderRadius: 100 }} />)}
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {[1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div
      style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      {/* Header sticky */}
      <div style={{
        background: "#fff",
        padding: `calc(${DS.safeTop} + 8px) 16px 10px`,
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 1px 8px rgba(0,0,0,.04)",
      }}>
        {/* Barre de recherche */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            {Ic.search("#aaa", 15)}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#F5F5F7", border: "none", borderRadius: 100,
              padding: "10px 14px 10px 36px", fontSize: 15, color: "#1A1A2E",
              fontFamily: DS.fontBase, outline: "none",
            }} />
        </div>

        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              flexShrink: 0, borderRadius: 100,
              padding: "6px 14px", fontSize: 13, fontWeight: 600,
              background: cat === c.id ? DS.brand : "#fff",
              color: cat === c.id ? "#fff" : "#1A1A2E",
              border: `1.5px solid ${cat === c.id ? DS.brand : "#e8e8e8"}`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              whiteSpace: "nowrap", fontFamily: DS.fontBase, minHeight: 34,
            }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div style={{ padding: "16px 0 100px" }}>

        {refreshing && (
          <div style={{ textAlign: "center", padding: "8px 0", color: DS.ink40, fontSize: 13 }}>Actualisation…</div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: DS.ink, marginBottom: 8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize: 13, color: DS.ink40 }}>Essayez d'ajuster vos filtres</div>
          </div>
        ) : (
          <>
            {/* ⚡ Flash Deals */}
            {flashDeals.length > 0 && cat === "tout" && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ padding: "0 16px", marginBottom: 12 }}>
                  <SectionHeader emoji="🔥" label="Flash Deals" onSeeAll={() => {}} />
                </div>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
                  {flashDeals.map(o => (
                    <HScrollCard key={o.id} o={o}
                      isFav={favs.includes(o.id)}
                      onFav={() => toggleFav(o.id)}
                      onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                      userPos={userPos} />
                  ))}
                </div>
              </div>
            )}

            {/* 📍 Près de vous */}
            {nearby.length > 0 && cat === "tout" && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ padding: "0 16px", marginBottom: 12 }}>
                  <SectionHeader emoji="📍" label="Près de vous" onSeeAll={() => {}} />
                </div>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
                  {nearby.slice(0, 10).map(o => (
                    <HScrollCard key={o.id} o={o}
                      isFav={favs.includes(o.id)}
                      onFav={() => toggleFav(o.id)}
                      onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                      userPos={userPos} />
                  ))}
                </div>
              </div>
            )}

            {/* Sections par catégorie */}
            {cat === "tout" ? (
              SECTIONS.map(sec => {
                const items = filtered.filter(o => o.categorie === sec.id);
                if (items.length === 0) return null;
                return (
                  <div key={sec.id} style={{ marginBottom: 28 }}>
                    <div style={{ padding: "0 16px", marginBottom: 12 }}>
                      <SectionHeader emoji={sec.emoji} label={sec.label} onSeeAll={() => setCat(sec.id)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
                      {items.slice(0, 4).map(o => (
                        <GridCard key={o.id} o={o}
                          onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                          userPos={userPos} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Vue filtrée par catégorie
              <div style={{ padding: "0 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {filtered.map(o => (
                    <GridCard key={o.id} o={o}
                      onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                      userPos={userPos} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <NavBar active="Feed" />
    </div>
  );
}