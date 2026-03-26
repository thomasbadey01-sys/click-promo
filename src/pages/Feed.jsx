import { useState, useEffect, useCallback } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo, NavBar, BadgeReduction, SkeletonCard, NotificationBadge } from "./theme";

// ── Utilitaires géo ──────────────────────────────────────────
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

// ── Catégories avec emojis (style screenshots) ───────────────
const CATS = [
  { id: "tout",        label: "Tout",        emoji: "" },
  { id: "Restaurant",  label: "Restaurants", emoji: "🍽️" },
  { id: "Boutique",    label: "Mode",        emoji: "🛍️" },
  { id: "Beauté & Coiffure", label: "Beauté", emoji: "💄" },
  { id: "Fitness & Sport",   label: "Sport",  emoji: "💪" },
  { id: "Épicerie",    label: "Boulangerie", emoji: "🥐" },
  { id: "Services",    label: "Loisirs",     emoji: "🎭" },
];

export default function Feed() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cat, setCat] = useState("tout");
  const [search, setSearch] = useState("");
  const [postalCode, setPostalCode] = useState("");
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
    const valid = data.filter(o => !o.date_fin || new Date(o.date_fin) > now);
    setOffres(valid);
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
    // Postal code filter
    if (postalCode.trim()) {
      list = list.filter(o => o.code_postal && o.code_postal.toString().startsWith(postalCode));
    }
    if (userPos) {
      list = list.map(o => ({
        ...o,
        _dist: o.latitude && o.longitude ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null,
      })).sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999));
    }
    setFiltered(list);
  }, [offres, cat, search, postalCode, userPos]);

  // Pull-to-refresh touch
  const [startY, setStartY] = useState(null);
  const onTouchStart = e => setStartY(e.touches[0].clientY);
  const onTouchEnd = e => {
    if (startY && e.changedTouches[0].clientY - startY > 80 && window.scrollY === 0) {
      setRefreshing(true); load();
    }
    setStartY(null);
  };

  if (loading) return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.fontBase, paddingTop: DS.safeTop }}>
      <div style={{ background: DS.white, padding: "16px 16px 12px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <CPLogo size={30} />
          <span style={{ fontSize: 18, fontWeight: 800, color: DS.brand }}>Click & Promo</span>
        </div>
        <div className="shimmer-card" style={{ height: 42, borderRadius: DS.pill, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[80, 100, 90, 110, 85].map((w, i) => <div key={i} className="shimmer-card" style={{ height: 34, width: w, borderRadius: DS.pill, flexShrink: 0 }} />)}
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.fontBase }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Header */}
      <div style={{ background: DS.white, padding: `calc(${DS.safeTop} + 8px) 16px 12px`, position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${DS.ink10}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ic.menu(DS.ink, 22)}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CPLogo size={30} />
              <span style={{ fontSize: 18, fontWeight: 800, color: DS.brand, fontFamily: DS.fontBase, letterSpacing: -0.5 }}>Click & Promo</span>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ic.bell(DS.ink, 22)}
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            {Ic.search(DS.ink40, 16)}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une offre, un commerce..."
            style={{
              width: "100%", boxSizing: "border-box",
              background: DS.bg,
              border: `1px solid ${DS.ink10}`,
              borderRadius: DS.pill,
              padding: "11px 14px 11px 40px",
              fontSize: 14, color: DS.ink,
              fontFamily: DS.fontBase,
              outline: "none",
            }}
          />
        </div>

        {/* Postal Code Filter */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            {Ic.location(DS.ink40, 16)}
          </div>
          <input
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            placeholder="Filtrer par code postal (ex: 75...)"
            type="number"
            maxLength="5"
            style={{
              width: "100%", boxSizing: "border-box",
              background: DS.bg,
              border: `1px solid ${DS.ink10}`,
              borderRadius: DS.pill,
              padding: "11px 14px 11px 40px",
              fontSize: 13, color: DS.ink,
              fontFamily: DS.fontBase,
              outline: "none",
            }}
          />
          {postalCode && (
            <button onClick={() => setPostalCode("")} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: DS.ink40,
            }}>
              ✕
            </button>
          )}
        </div>

        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              flexShrink: 0,
              background: cat === c.id ? DS.brand : DS.white,
              color: cat === c.id ? DS.white : DS.ink,
              border: `1.5px solid ${cat === c.id ? DS.brand : DS.ink10}`,
              borderRadius: DS.pill,
              padding: "7px 14px",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: DS.fontBase,
              display: "flex", alignItems: "center", gap: 5,
              whiteSpace: "nowrap",
            }}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des offres */}
      <div style={{ padding: "14px 16px 100px" }}>
        {refreshing && (
          <div style={{ textAlign: "center", padding: "20px 0", color: DS.ink40, fontSize: 13 }}>
            Actualisation en cours…
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: DS.ink, marginBottom: 8 }}>
              Aucune offre trouvée
            </div>
            <div style={{ fontSize: 13, color: DS.ink40 }}>
              Essayez d'ajuster vos filtres ou votre recherche
            </div>
          </div>
        ) : filtered.map((o, idx) => {
          const expired = o.date_fin && new Date(o.date_fin) < new Date();
          const lowStock = o.stock_initial > 0 && (o.stock_restant / o.stock_initial) < 0.2;
          const isFav = favs.includes(o.id);
          return (
            <div key={o.id} className="fade-up" style={{
              background: DS.white, borderRadius: DS.xl, marginBottom: 12,
              overflow: "hidden", cursor: "pointer", boxShadow: DS.e1,
              border: `1px solid ${DS.ink10}`, opacity: expired ? 0.6 : 1,
              animationDelay: `${idx * 0.04}s`,
            }}>
              <div style={{ position: "relative", height: 160 }}>
                <img src={o.image_url} alt={o.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"} />
                <div style={{ position: "absolute", bottom: 10, right: 10 }}>
                  <BadgeReduction valeur={o.valeur_reduction} type={o.type_reduction} />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleFav(o.id); }}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,255,255,.85)", border: "none",
                    borderRadius: DS.pill, width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", backdropFilter: "blur(4px)",
                  }}
                >
                  {Ic.heart(isFav ? DS.danger : DS.ink40, 16, isFav)}
                </button>
                {expired && (
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,.6)", color: DS.white, borderRadius: DS.pill, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                    Expirée
                  </div>
                )}
                {lowStock && !expired && (
                  <div style={{ position: "absolute", top: 10, left: 10, background: DS.warning, color: DS.white, borderRadius: DS.pill, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                    ⚠️ Stock faible
                  </div>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: DS.ink, marginBottom: 2 }}>
                  {o.titre}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, color: DS.ink60 }}>
                    {o.commercant_nom}
                  </div>
                  {o._dist !== null && (
                    <div style={{ fontSize: 12, color: DS.brand, fontWeight: 700 }}>
                      {formatDist(o._dist)}
                    </div>
                  )}
                </div>
                {o.categorie && (
                  <div style={{ fontSize: 12, color: DS.ink40, marginTop: 4 }}>
                    {o.categorie}
                  </div>
                )}
                {o.prix_promo > 0 && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 18, color: DS.brand }}>
                      {o.prix_promo}€
                    </span>
                    {o.prix_original > 0 && (
                      <span style={{ fontSize: 13, color: DS.ink40, textDecoration: "line-through" }}>
                        {o.prix_original}€
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NavBar active="Feed" />
    </div>
  );
}