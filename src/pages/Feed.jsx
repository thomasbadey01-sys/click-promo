import { useState, useEffect, useCallback } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo, NavBar, BadgeReduction } from "./theme";

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
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    if (userPos) {
      list = list.map(o => ({
        ...o,
        _dist: o.latitude && o.longitude ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null,
      })).sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999));
    }
    setFiltered(list);
  }, [offres, cat, search, userPos]);

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
    <div style={{ background: DS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <CPLogo size={48} />
        <div style={{ marginTop: 16, color: DS.ink40, fontSize: 14 }}>Chargement des offres…</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.fontBase }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Header */}
      <div style={{ background: DS.white, padding: "52px 16px 12px", position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${DS.ink10}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ic.menu(DS.ink, 22)}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CPLogo size={30} />
              <span style={{ fontSize: 18, fontWeight: 800, color: DS.brand, fontFamily: DS.fontBase, letterSpacing: -0.5 }}>Click & Promo</span>
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            {Ic.bell(DS.ink, 22)}
          </button>
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
              {c.emoji && <span>{c.emoji}</span>}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div style={{ textAlign: "center", padding: "12px", fontSize: 13, color: DS.brand, fontWeight: 600 }}>
          Actualisation…
        </div>
      )}

      {/* Liste offres */}
      <div style={{ padding: "12px 16px 100px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: DS.ink40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: DS.ink, marginBottom: 6 }}>Aucune offre trouvée</div>
            <div style={{ fontSize: 14 }}>Essayez d'autres filtres</div>
          </div>
        ) : filtered.map(o => <OffreCard key={o.id} offre={o} navigate={navigate} />)}
      </div>

      <NavBar active="Feed" />
    </div>
  );
}

function OffreCard({ offre, navigate }) {
  const dist = offre._dist;
  const isUrgente = offre.est_urgente;
  const pct = offre.stock_initial > 0 ? Math.round((offre.stock_restant / offre.stock_initial) * 100) : null;

  return (
    <div
      onClick={() => navigate(`/OffreDetail?id=${offre.id}`)}
      style={{
        background: DS.white,
        borderRadius: DS.xl,
        marginBottom: 14,
        overflow: "hidden",
        boxShadow: DS.e1,
        cursor: "pointer",
        border: `1px solid ${DS.ink10}`,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200 }}>
        <img
          src={offre.image_url}
          alt={offre.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"}
          loading="lazy"
        />
        {/* Badge urgence */}
        {isUrgente && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: DS.danger, color: DS.white,
            borderRadius: DS.pill, padding: "3px 10px",
            fontSize: 11, fontWeight: 700,
          }}>⚡ Flash</div>
        )}
        {/* Badge réduction — en bas à droite sur l'image */}
        <div style={{ position: "absolute", bottom: 10, right: 10 }}>
          <BadgeReduction valeur={offre.valeur_reduction} type={offre.type_reduction} />
        </div>
      </div>

      {/* Infos */}
      <div style={{ padding: "14px 14px 12px" }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: DS.ink, marginBottom: 3, letterSpacing: -0.3 }}>
          {offre.commercant_nom || offre.titre}
        </div>
        <div style={{ fontSize: 13, color: DS.ink60, marginBottom: 4 }}>
          {offre.categorie}
          {offre.ville ? ` | ${offre.ville}` : ""}
          {offre.date_fin ? ` · Valable jusqu'au ${new Date(offre.date_fin).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : ""}
        </div>
        <div style={{ fontSize: 13, color: DS.ink60, marginBottom: 8 }}>{offre.titre}</div>

        {/* Distance */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {offre.prix_promo > 0 && (
              <span style={{ fontWeight: 800, fontSize: 16, color: DS.brand }}>{offre.prix_promo}€</span>
            )}
            {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
              <span style={{ fontSize: 13, color: DS.ink40, textDecoration: "line-through" }}>{offre.prix_original}€</span>
            )}
          </div>
          {dist !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: DS.ink60, fontSize: 13 }}>
              {Ic.pin(DS.brand, 13)}
              <span style={{ fontWeight: 600 }}>{formatDist(dist)}</span>
            </div>
          )}
        </div>

        {/* Barre stock */}
        {pct !== null && pct < 40 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ background: DS.ink10, borderRadius: DS.pill, height: 3 }}>
              <div style={{ background: pct < 20 ? DS.danger : DS.warning, height: "100%", borderRadius: DS.pill, width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 10, color: pct < 20 ? DS.danger : DS.ink40, marginTop: 3, fontWeight: 600 }}>
              {offre.stock_restant} restant{offre.stock_restant > 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
