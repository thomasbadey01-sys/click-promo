import { useState, useEffect, useCallback } from "react";
import { Offre, ProfilUtilisateur, FavoriUtilisateur } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo, NavBar, SkeletonCard, NotificationBadge, getTheme } from "./theme";
import SmartSearch from "@/components/SmartSearch";
import AppFooterLinks from "@/components/AppFooterLinks";
import { useAuth } from "@/lib/AuthContext";

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
  { id: "tout",              label: "Tout",     emoji: "🏠" },
  { id: "Restaurant",        label: "Restos",   emoji: "🍽️" },
  { id: "Boutique",          label: "Mode",     emoji: "👗" },
  { id: "Beauté & Coiffure", label: "Beauté",   emoji: "💅" },
  { id: "Fitness & Sport",   label: "Sport",    emoji: "🏋️" },
  { id: "Épicerie",          label: "Épicerie", emoji: "🥐" },
  { id: "Services",          label: "Services", emoji: "🛠️" },
  { id: "Pharmacie",         label: "Santé",    emoji: "💊" },
];

// Enseignes avec logo/couleur
const ENSEIGNES = [
  { id: "Carrefour",    label: "Carrefour",    emoji: "🛒", color: "#004F9F" },
  { id: "IKEA",         label: "IKEA",         emoji: "🪑", color: "#0058A3" },
  { id: "Lidl",         label: "Lidl",         emoji: "🏪", color: "#FFD700" },
  { id: "Decathlon",    label: "Decathlon",    emoji: "⚽", color: "#007DC5" },
  { id: "Leroy Merlin", label: "Leroy Merlin", emoji: "🔨", color: "#78BE20" },
  { id: "Zara",         label: "Zara",         emoji: "👗", color: "#1A1A1A" },
  { id: "H&M",          label: "H&M",          emoji: "👕", color: "#E50010" },
  { id: "Sephora",      label: "Sephora",      emoji: "💄", color: "#000000" },
  { id: "Fnac",         label: "Fnac",         emoji: "📺", color: "#F0A500" },
  { id: "McDonald's",   label: "McDonald's",   emoji: "🍔", color: "#FFC72C" },
  { id: "Monoprix",     label: "Monoprix",     emoji: "🛍️", color: "#E4002B" },
  { id: "Picard",       label: "Picard",       emoji: "❄️", color: "#6A1F7A" },
  { id: "Go Sport",     label: "Go Sport",     emoji: "🏃", color: "#E30613" },
  { id: "Intermarché",  label: "Intermarché",  emoji: "🥩", color: "#E30613" },
];

const SECTIONS = [
  { id: "Restaurant",        label: "Restaurants",       emoji: "🍽️" },
  { id: "Boutique",          label: "Mode & Boutiques",  emoji: "👗" },
  { id: "Beauté & Coiffure", label: "Beauté & Coiffure", emoji: "💅" },
  { id: "Fitness & Sport",   label: "Sport & Fitness",   emoji: "🏋️" },
  { id: "Épicerie",          label: "Épicerie & Bio",    emoji: "🥐" },
  { id: "Services",          label: "Services",          emoji: "🛠️" },
  { id: "Pharmacie",         label: "Pharmacie & Santé", emoji: "💊" },
  { id: "Autre",             label: "Autres bons plans", emoji: "🎁" },
];

function HScrollCard({ o, onPress, userPos, isFav, onFav }) {
  const dist = userPos && o.latitude && o.longitude
    ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
  const hasRealAddress = !!(o.adresse && o.adresse.trim());
  return (
    <div style={{ width: 155, flexShrink: 0, background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,.08)", position: "relative" }}>
      <div onClick={onPress} style={{ position: "relative", height: 105 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"} />
        {o.valeur_reduction > 0 && (
          <div style={{ position: "absolute", bottom: 7, right: 7, background: DS.brand, color: "#fff", borderRadius: 20, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>
            -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
          </div>
        )}
        {o.est_urgente && (
          <div style={{ position: "absolute", top: 7, left: 7, background: DS.danger, color: "#fff", borderRadius: 20, padding: "2px 7px", fontSize: 10, fontWeight: 800 }}>⚡ FLASH</div>
        )}
        {hasRealAddress && !o.est_urgente && (
          <div style={{ position: "absolute", top: 7, left: 7, background: "#10B981", color: "#fff", borderRadius: 20, padding: "2px 7px", fontSize: 9, fontWeight: 800 }}>✓ Adresse</div>
        )}
      </div>
      <button onClick={e => { e.stopPropagation(); onFav && onFav(); }} style={{
        position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
        background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
      }}>
        <span style={{ fontSize: 14 }}>{isFav ? "❤️" : "🤍"}</span>
      </button>
      <div onClick={onPress} style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DS.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {o.commercant_nom || o.titre}
        </div>
        {o.adresse && (
          <div style={{ fontSize: 9, color: "#10B981", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📍 {o.adresse}
          </div>
        )}
        {o.prix_promo > 0 && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: DS.brand }}>{o.prix_promo}€</span>
            {o.prix_original > 0 && o.prix_original !== o.prix_promo && (
              <span style={{ fontSize: 10, color: "#ccc", textDecoration: "line-through" }}>{o.prix_original}€</span>
            )}
          </div>
        )}
        {dist !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#aaa", fontSize: 10, marginTop: 2 }}>
            {formatDist(dist)}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({ o, onPress, userPos, isFav, onFav }) {
  const dist = userPos && o.latitude && o.longitude
    ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
  const hasRealAddress = !!(o.adresse && o.adresse.trim());
  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,.07)", position: "relative" }}>
      <div onClick={onPress} style={{ position: "relative", height: 115 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"} />
        {o.valeur_reduction > 0 && (
          <div style={{ position: "absolute", bottom: 7, right: 7, background: DS.brand, color: "#fff", borderRadius: 20, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>
            -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
          </div>
        )}
        {hasRealAddress && (
          <div style={{ position: "absolute", top: 7, left: 7, background: "#10B981", color: "#fff", borderRadius: 20, padding: "2px 6px", fontSize: 9, fontWeight: 800 }}>✓ Adresse vérifiée</div>
        )}
      </div>
      <button onClick={e => { e.stopPropagation(); onFav && onFav(); }} style={{
        position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
        background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
      }}>
        <span style={{ fontSize: 14 }}>{isFav ? "❤️" : "🤍"}</span>
      </button>
      <div onClick={onPress} style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: DS.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {o.commercant_nom || o.titre}
        </div>
        {hasRealAddress && (
          <div style={{ fontSize: 9, color: "#10B981", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {o.adresse}
          </div>
        )}
        {o.prix_promo > 0 && (
          <span style={{ fontSize: 13, fontWeight: 800, color: DS.brand }}>{o.prix_promo}€</span>
        )}
        {dist !== null && (
          <div style={{ color: "#aaa", fontSize: 10, marginTop: 2 }}>📍 {formatDist(dist)}</div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ emoji, label, onSeeAll }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: DS.ink }}>{emoji} {label}</div>
      <button onClick={onSeeAll} style={{
        background: "none", border: "none", color: DS.brand,
        fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0,
      }}>Voir tout →</button>
    </div>
  );
}

// Panneau notifications
function NotifPanel({ notifs, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        position: "absolute", top: 70, right: 12, width: 310,
        background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,.16)",
        overflow: "hidden", animation: "popIn .25s ease",
      }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: DS.ink }}>🔔 Notifications</div>
        </div>
        {notifs.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#aaa", fontSize: 13 }}>Aucune nouvelle notification</div>
        ) : notifs.map((n, i) => (
          <div key={i} style={{ padding: "12px 16px", borderBottom: i < notifs.length - 1 ? "1px solid #f5f5f5" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{n.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: DS.ink, marginBottom: 2 }}>{n.titre}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offres, setOffres] = useState([]);
  const [cat, setCat] = useState("tout");
  const [enseigne, setEnseigne] = useState(null);
  const [search, setSearch] = useState("");
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [rayonKm, setRayonKm] = useState(5);
  const [favs, setFavs] = useState({});
  const t = getTheme();

  // Charger favs + rayon quand l'user est connu
  useEffect(() => {
    if (!user) return;
    FavoriUtilisateur.filter({ user_id: user.id }).then(list => {
      const map = {};
      list.forEach(f => { map[f.offre_id] = f.id; });
      setFavs(map);
    }).catch(() => {});
    ProfilUtilisateur.filter({ user_id: user.id }).then(profils => {
      if (profils.length > 0 && profils[0].rayon_recherche_km) {
        setRayonKm(profils[0].rayon_recherche_km);
      }
    }).catch(() => {});
  }, [user?.id]);

  const toggleFav = async (offreId) => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (favs[offreId]) {
      await FavoriUtilisateur.delete(favs[offreId]);
      setFavs(prev => { const n = { ...prev }; delete n[offreId]; return n; });
    } else {
      const f = await FavoriUtilisateur.create({ offre_id: offreId, user_id: user.id });
      setFavs(prev => ({ ...prev, [offreId]: f.id }));
    }
  };

  const load = useCallback(async () => {
    const data = await base44.entities.Offre.list('-created_date', 200);
    const now = new Date();
    setOffres(data.filter(o => o.est_active && (!o.date_fin || new Date(o.date_fin) > now)));
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

  const allWithDist = offres.map(o => ({
    ...o,
    _dist: userPos && o.latitude && o.longitude ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null,
  })).sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999));

  const filtered = allWithDist.filter(o => {
    if (cat === "tout_flash") return o.est_urgente;
    if (cat === "tout_nearby") return o._dist !== null && o._dist < rayonKm;
    if (cat === "tout_geo") return !!(o.adresse && o.adresse.trim() && o.latitude && o.longitude);
    if (cat !== "tout" && o.categorie !== cat) return false;
    if (enseigne && o.enseigne !== enseigne) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (o.titre?.toLowerCase().includes(q) || o.commercant_nom?.toLowerCase().includes(q) || o.ville?.toLowerCase().includes(q));
    }
    return true;
  });

  const flashDeals = allWithDist.filter(o => o.est_urgente);
  const nearby = userPos ? allWithDist.filter(o => o._dist !== null && o._dist < rayonKm) : [];

  // Notifications intelligentes
  const notifs = [
    ...offres.filter(o => o.est_urgente && o.stock_restant <= 5 && o.stock_restant > 0).slice(0, 2).map(o => ({
      emoji: "⚡",
      titre: `${o.commercant_nom} — Stock critique !`,
      message: `Plus que ${o.stock_restant} place(s) pour -${o.valeur_reduction}${o.type_reduction === "pourcentage" ? "%" : "€"}`,
    })),
    ...offres.filter(o => {
      if (!userPos || !o.latitude) return false;
      const d = haversine(userPos.lat, userPos.lon, o.latitude, o.longitude);
      return d < 1 && o.valeur_reduction >= 30;
    }).slice(0, 2).map(o => ({
      emoji: "📍",
      titre: `Super deal à ${formatDist(haversine(userPos?.lat || 0, userPos?.lon || 0, o.latitude, o.longitude))} !`,
      message: `${o.commercant_nom} · -${o.valeur_reduction}%`,
    })),
    ...offres.filter(o => (o.nb_vues || 0) > 50).slice(0, 1).map(o => ({
      emoji: "🔥",
      titre: "Tendance du moment",
      message: `${o.titre} — ${o.nb_vues} personnes l'ont vu aujourd'hui`,
    })),
  ];

  if (loading) return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>
      <div style={{ background: t.card, padding: `calc(${DS.safeTop} + 8px) 16px 12px` }}>
        <div className={t.shimmer} style={{ height: 40, borderRadius: 100, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 80, 70, 90, 75, 85].map((w, i) => <div key={i} className={t.shimmer} style={{ height: 32, width: w, borderRadius: 100 }} />)}
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {[1, 2].map(i => <SkeletonCard key={i} dark={t.isDark} />)}
      </div>
    </div>
  );

  return (
    <div
      style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      {showSmartSearch && <SmartSearch onClose={() => setShowSmartSearch(false)} />}
      {/* Header */}
      <div style={{
        background: t.card, padding: `calc(${DS.safeTop} + 8px) 16px 10px`,
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${t.border}`,
        boxShadow: "0 1px 8px rgba(0,0,0,.04)",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              {Ic.search("#aaa", 15)}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une offre, un commerce..."
              style={{
                width: "100%", boxSizing: "border-box",
                background: t.isDark ? DS.dark3 : "#F5F5F7",
                border: `1px solid ${t.border}`, borderRadius: 100,
                padding: "10px 14px 10px 36px", fontSize: 14, color: t.text,
                fontFamily: DS.fontBase, outline: "none",
              }} />
          </div>
          {/* Bouton IA */}
          <button onClick={() => setShowSmartSearch(true)} style={{
            flexShrink: 0, width: 42, height: 42, borderRadius: "50%",
            background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: DS.eBrand,
            fontSize: 18,
          }} title="Recherche intelligente IA">✨</button>
          {/* Cloche */}
          <button onClick={() => setShowNotifs(v => !v)} style={{
            position: "relative", background: "none", border: "none", cursor: "pointer",
            width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {Ic.bell(t.isDark ? "rgba(255,255,255,.6)" : DS.ink60, 22)}
            <NotificationBadge count={notifs.length} />
          </button>
        </div>

        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", marginBottom: enseigne ? 8 : 0 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => { setCat(c.id); setEnseigne(null); }} style={{
              flexShrink: 0, borderRadius: 100, padding: "6px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: cat === c.id && !enseigne ? DS.brand : (t.isDark ? DS.dark3 : "#fff"),
              color: cat === c.id && !enseigne ? "#fff" : t.text,
              border: `1.5px solid ${cat === c.id && !enseigne ? DS.brand : t.border}`,
              whiteSpace: "nowrap", fontFamily: DS.fontBase, minHeight: 34,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        {/* Badge enseigne active */}
        {enseigne && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <div style={{ background: DS.brand, color: "#fff", borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              {ENSEIGNES.find(e => e.id === enseigne)?.emoji} {enseigne}
              <button onClick={() => setEnseigne(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1, marginLeft: 2 }}>✕</button>
            </div>
            <span style={{ fontSize: 12, color: t.text2 }}>{filtered.length} offre{filtered.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Panneau notifications */}
      {showNotifs && <NotifPanel notifs={notifs} onClose={() => setShowNotifs(false)} />}

      {/* Contenu */}
      <div style={{ padding: "16px 0 100px" }}>
        {refreshing && (
          <div style={{ textAlign: "center", padding: "8px 0", color: t.text2, fontSize: 13 }}>Actualisation…</div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize: 13, color: t.text2 }}>Essayez d'ajuster vos filtres</div>
          </div>
        ) : cat === "tout" && !search.trim() && !refreshing ? (
          <>
            {/* ⚡ Flash Deals */}
            {flashDeals.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ padding: "0 16px", marginBottom: 12 }}>
                  <SectionHeader emoji="⚡" label="Flash Deals" onSeeAll={() => setCat("tout_flash")} />
                </div>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
                  {flashDeals.map(o => (
                    <HScrollCard key={o.id} o={o}
                      onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                      userPos={userPos}
                      isFav={!!favs[o.id]}
                      onFav={() => toggleFav(o.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* 📍 Près de vous */}
            {nearby.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ padding: "0 16px", marginBottom: 12 }}>
                  <SectionHeader emoji="📍" label="Près de vous" onSeeAll={() => setCat("tout_nearby")} />
                </div>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
                  {nearby.slice(0, 10).map(o => (
                    <HScrollCard key={o.id} o={o}
                      onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                      userPos={userPos}
                      isFav={!!favs[o.id]}
                      onFav={() => toggleFav(o.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* 🗺️ Offres géolocalisées (adresse réelle) */}
            {(() => {
              const geoOffres = allWithDist.filter(o => o.adresse && o.adresse.trim() && o.latitude && o.longitude);
              if (geoOffres.length === 0) return null;
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ padding: "0 16px", marginBottom: 12 }}>
                    <SectionHeader emoji="🗺️" label="Adresses vérifiées" onSeeAll={() => setCat("tout_geo")} />
                    <div style={{ fontSize: 11, color: t.text2, marginTop: -6 }}>Offres avec adresse réelle géolocalisée</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
                    {geoOffres.slice(0, 12).map(o => (
                      <HScrollCard key={o.id} o={o}
                        onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                        userPos={userPos}
                        isFav={!!favs[o.id]}
                        onFav={() => toggleFav(o.id)} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 🏪 Par Enseigne */}
            {(() => {
              const enseignesPresentes = ENSEIGNES.filter(e => allWithDist.some(o => o.enseigne === e.id));
              if (enseignesPresentes.length === 0) return null;
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ padding: "0 16px", marginBottom: 12 }}>
                    <SectionHeader emoji="🏪" label="Par enseigne" onSeeAll={() => {}} />
                  </div>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
                    {enseignesPresentes.map(e => {
                      const count = allWithDist.filter(o => o.enseigne === e.id).length;
                      const isActive = enseigne === e.id;
                      return (
                        <button key={e.id} onClick={() => setEnseigne(isActive ? null : e.id)} style={{
                          flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                          background: isActive ? DS.brand : (t.isDark ? DS.dark3 : "#fff"),
                          border: `2px solid ${isActive ? DS.brand : t.border}`,
                          borderRadius: 16, padding: "12px 14px", cursor: "pointer",
                          minWidth: 80, boxShadow: isActive ? DS.eBrand : "0 2px 8px rgba(0,0,0,.06)",
                          transition: "all .15s",
                        }}>
                          <span style={{ fontSize: 22 }}>{e.emoji}</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? "#fff" : t.text, textAlign: "center", lineHeight: 1.2 }}>{e.label}</span>
                          <span style={{ fontSize: 10, color: isActive ? "rgba(255,255,255,.8)" : t.text2, fontWeight: 600 }}>{count} offre{count > 1 ? "s" : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Sections par catégorie */}
            {SECTIONS.map(sec => {
              const items = filtered.filter(o => o.categorie === sec.id);
              if (items.length === 0) return null;
              return (
                <div key={sec.id} style={{ marginBottom: 28 }}>
                  <div style={{ padding: "0 16px", marginBottom: 12 }}>
                    <SectionHeader emoji={sec.emoji} label={sec.label} onSeeAll={() => setCat(sec.id)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
                    {items.slice(0, 6).map(o => (
                      <GridCard key={o.id} o={o}
                        onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                        userPos={userPos}
                        isFav={!!favs[o.id]}
                        onFav={() => toggleFav(o.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          // Vue filtrée
          <div style={{ padding: "0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                {enseigne && (
                  <div style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 2 }}>
                    {ENSEIGNES.find(e => e.id === enseigne)?.emoji} {enseigne}
                  </div>
                )}
                {!enseigne && cat !== "tout_flash" && cat !== "tout_nearby" && cat !== "tout" && (
                  <div style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 2 }}>
                    {CATS.find(c => c.id === cat)?.emoji} {CATS.find(c => c.id === cat)?.label}
                  </div>
                )}
                {cat === "tout_flash" && <div style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 2 }}>⚡ Flash Deals</div>}
                {cat === "tout_nearby" && <div style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 2 }}>📍 Près de vous</div>}
                <div style={{ fontSize: 13, color: t.text2, fontWeight: 600 }}>
                  {filtered.length} offre{filtered.length > 1 ? "s" : ""}
                  {userPos && cat !== "tout_flash" ? " · triées par distance" : ""}
                </div>
              </div>
              <button onClick={() => { setCat("tout"); setSearch(""); setEnseigne(null); }} style={{ background: "none", border: "none", color: DS.brand, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ← Retour
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filtered.map(o => (
                <GridCard key={o.id} o={o}
                  onPress={() => navigate(`/OffreDetail?id=${o.id}`)}
                  userPos={userPos}
                  isFav={!!favs[o.id]}
                  onFav={() => toggleFav(o.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <NavBar active="Feed" />
    </div>
  );
}