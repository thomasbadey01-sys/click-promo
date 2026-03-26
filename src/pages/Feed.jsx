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
  { id: "tout", label: "Tout", emoji: "🏠" },
  { id: "Restaurant", label: "Restos", emoji: "🍽️" },
  { id: "Boutique", label: "Mode", emoji: "👗" },
  { id: "Beauté & Coiffure", label: "Beauté", emoji: "💄" },
  { id: "Épicerie", label: "Courses", emoji: "🛒" },
  { id: "Services", label: "Maison", emoji: "🏡" },
];

function FlashBadge() {
  return (
    <div style={{
      position: "absolute", top: 10, left: 10, zIndex: 2,
      background: "#EF4444", color: "#fff",
      borderRadius: 20, padding: "4px 10px",
      fontSize: 11, fontWeight: 800,
      display: "flex", alignItems: "center", gap: 4,
    }}>
      ⚡ Flash
    </div>
  );
}

function DiscountCircle({ valeur, type }) {
  if (!valeur) return null;
  return (
    <div style={{
      position: "absolute", bottom: 10, right: 10, zIndex: 2,
      background: DS.brand, color: "#fff",
      borderRadius: "50%", width: 48, height: 48,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 900,
      boxShadow: `0 2px 8px ${DS.brand}80`,
    }}>
      -{valeur}{type === "pourcentage" ? "%" : "€"}
    </div>
  );
}

function SavingsPill({ original, promo }) {
  if (!original || !promo || original <= promo) return null;
  const saved = (original - promo).toFixed(0);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: "#D1FAE5", color: "#059669",
      borderRadius: 20, padding: "3px 8px",
      fontSize: 11, fontWeight: 700,
    }}>
      -{saved}€ économisés
    </div>
  );
}

// Hero card (première offre, pleine largeur)
function HeroCard({ o, isFav, onFav, onPress, userPos }) {
  const dist = userPos && o.latitude && o.longitude
    ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
  return (
    <div onClick={onPress} style={{
      background: "#fff", borderRadius: 20, overflow: "hidden",
      marginBottom: 14, cursor: "pointer",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    }}>
      <div style={{ position: "relative", height: 220 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"} />
        {o.est_urgente && <FlashBadge />}
        <DiscountCircle valeur={o.valeur_reduction} type={o.type_reduction} />
        <button onClick={e => { e.stopPropagation(); onFav(); }} style={{
          position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,.9)",
          border: "none", borderRadius: "50%", width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          {Ic.heart(isFav ? "#EF4444" : "#ccc", 16, isFav)}
        </button>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            {o.prix_promo > 0 && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#1A1A2E" }}>{o.prix_promo}€</span>
                {o.prix_original > 0 && (
                  <span style={{ fontSize: 14, color: "#aaa", textDecoration: "line-through" }}>{o.prix_original}€ ttc</span>
                )}
              </div>
            )}
            {!o.prix_promo && (
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A2E", marginBottom: 4 }}>{o.titre}</div>
            )}
          </div>
          {dist !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: DS.brand, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              📍 {formatDist(dist)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {dist !== null && (
            <div style={{ background: "#F3F0FF", color: DS.brand, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              📍 {formatDist(dist)}
            </div>
          )}
          <SavingsPill original={o.prix_original} promo={o.prix_promo} />
        </div>
      </div>
    </div>
  );
}

// Mini card (grille 2 colonnes)
function MiniCard({ o, isFav, onFav, onPress, userPos }) {
  const dist = userPos && o.latitude && o.longitude
    ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
  return (
    <div onClick={onPress} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    }}>
      <div style={{ position: "relative", height: 140 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"} />
        {o.est_urgente && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "#EF4444", color: "#fff",
            borderRadius: 20, padding: "3px 8px",
            fontSize: 10, fontWeight: 800,
          }}>⚡ Flash</div>
        )}
        <DiscountCircle valeur={o.valeur_reduction} type={o.type_reduction} />
      </div>
      <div style={{ padding: "10px 10px 12px" }}>
        {o.prix_promo > 0 ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#1A1A2E" }}>{o.prix_promo}€</span>
            {o.prix_original > 0 && (
              <span style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>{o.prix_original}€</span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>{o.titre}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <SavingsPill original={o.prix_original} promo={o.prix_promo} />
          {dist !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: DS.brand, fontSize: 10, fontWeight: 700 }}>
              📍 {formatDist(dist)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [filtered, setFiltered] = useState([]);
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

  useEffect(() => {
    let list = [...offres];
    if (cat !== "tout") list = list.filter(o => o.categorie === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.titre?.toLowerCase().includes(q) ||
        o.commercant_nom?.toLowerCase().includes(q) ||
        o.ville?.toLowerCase().includes(q)
      );
    }
    if (userPos) {
      list = list.map(o => ({
        ...o,
        _dist: o.latitude && o.longitude ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null,
      })).sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999));
    }
    setFiltered(list);
  }, [offres, cat, search, userPos]);

  // Pull-to-refresh
  const [startY, setStartY] = useState(null);
  const onTouchStart = e => setStartY(e.touches[0].clientY);
  const onTouchEnd = e => {
    if (startY && e.changedTouches[0].clientY - startY > 80 && window.scrollY === 0) {
      setRefreshing(true); load();
    }
    setStartY(null);
  };

  if (loading) return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}>
      <div style={{ background: "#fff", padding: `calc(${DS.safeTop} + 8px) 16px 12px`, marginBottom: 8 }}>
        <div className="shimmer-card" style={{ height: 40, borderRadius: 100, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 80, 70, 90, 75].map((w, i) => <div key={i} className="shimmer-card" style={{ height: 32, width: w, borderRadius: 100 }} />)}
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        <SkeletonCard />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>
              <div className="shimmer-card" style={{ height: 130 }} />
              <div style={{ padding: 10 }}><div className="shimmer-card" style={{ height: 16, width: "60%", marginBottom: 6 }} /><div className="shimmer-card" style={{ height: 12, width: "40%" }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Header */}
      <div style={{
        background: "#fff",
        padding: `calc(${DS.safeTop} + 8px) 16px 10px`,
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #f0f0f0",
      }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <CPLogo size={28} />
          <span style={{ flex: 1, fontSize: 17, fontWeight: 800, color: "#1A1A2E" }}>Click & Promo</span>
          <button style={{ background: DS.brandLight, border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            🔔
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            {Ic.search("#aaa", 15)}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une offre, un commerce..."
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#F5F5F7", border: "none", borderRadius: 100,
              padding: "10px 14px 10px 36px", fontSize: 14, color: "#1A1A2E",
              fontFamily: DS.fontBase, outline: "none",
            }} />
        </div>

        {/* Catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              flexShrink: 0, borderRadius: 100,
              padding: "6px 14px", fontSize: 13, fontWeight: 600,
              background: cat === c.id ? DS.brand : "#fff",
              color: cat === c.id ? "#fff" : "#1A1A2E",
              border: `1.5px solid ${cat === c.id ? DS.brand : "#e8e8e8"}`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              whiteSpace: "nowrap", fontFamily: DS.fontBase,
              minHeight: 34,
            }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: "14px 16px 100px" }}>
        {refreshing && (
          <div style={{ textAlign: "center", padding: "12px 0", color: DS.ink40, fontSize: 13 }}>Actualisation…</div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: DS.ink, marginBottom: 8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize: 13, color: DS.ink40 }}>Essayez d'ajuster vos filtres</div>
          </div>
        ) : (
          <>
            {/* Hero card */}
            {hero && (
              <HeroCard o={hero} isFav={favs.includes(hero.id)}
                onFav={() => toggleFav(hero.id)}
                onPress={() => navigate(`/OffreDetail?id=${hero.id}`)}
                userPos={userPos} />
            )}

            {/* Grille 2 colonnes */}
            {rest.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {rest.map(o => (
                  <MiniCard key={o.id} o={o}
                    isFav={favs.includes(o.id)}
                    onFav={() => toggleFav(o.id)}
                    onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                    userPos={userPos} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <NavBar active="Feed" />
    </div>
  );
}