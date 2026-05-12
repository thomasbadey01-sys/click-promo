import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, Ic, NavBar } from "./theme";
import { haversine, formatDist } from "./Feed";

const CAT_EMOJI = {
  "Restaurant": "🍽️", "Boutique": "👗", "Beauté & Coiffure": "💅",
  "Fitness & Sport": "🏋️", "Épicerie": "🥐", "Services": "🛠️",
  "Pharmacie": "💊", "Autre": "🎁",
};

const CATS_MAP = ["Tout", "Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Pharmacie"];

const LYON = { lat: 45.764, lon: 4.8357 };

// ── Bottom sheet ───────────────────────────────────────────────────────────────
function BottomSheet({ offre, userPos, onClose, navigate }) {
  if (!offre) return null;
  const dist = userPos && offre.latitude
    ? haversine(userPos.lat, userPos.lon, offre.latitude, offre.longitude)
    : null;

  return (
    <div style={{
      position: "fixed", bottom: 76, left: 0, right: 0, zIndex: 500,
      animation: "slideUp .3s cubic-bezier(.34,1.56,.64,1)",
      pointerEvents: "all",
    }}>
      <div style={{
        margin: "0 12px",
        background: "rgba(255,255,255,.98)",
        backdropFilter: "blur(24px)",
        borderRadius: 28,
        boxShadow: "0 -4px 40px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.6)",
        overflow: "hidden",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{ width: 36, height: 4, background: "#ddd", borderRadius: 4 }} />
        </div>

        {/* Photo */}
        <div style={{ position: "relative", height: 140, margin: "8px 12px 0", borderRadius: 18, overflow: "hidden" }}>
          <img src={offre.image_url} alt={offre.titre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.55),transparent 55%)" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)",
            border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          {offre.valeur_reduction > 0 && (
            <div style={{
              position: "absolute", bottom: 10, left: 10,
              background: DS.brand, color: "#fff", borderRadius: 20,
              padding: "4px 12px", fontSize: 14, fontWeight: 900, boxShadow: DS.eBrand,
            }}>-{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}</div>
          )}
          {offre.est_urgente && (
            <div style={{
              position: "absolute", top: 10, left: 10,
              background: DS.danger, color: "#fff", borderRadius: 20,
              padding: "3px 10px", fontSize: 11, fontWeight: 800,
            }}>⚡ FLASH</div>
          )}
        </div>

        {/* Infos */}
        <div style={{ padding: "12px 16px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: DS.ink, flex: 1 }}>{offre.commercant_nom}</div>
            {dist !== null && (
              <div style={{ background: DS.brandLight, color: DS.brand, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>
                📍 {formatDist(dist)}
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#777", marginBottom: 8 }}>{offre.titre}</div>

          {offre.adresse && (
            <div style={{ fontSize: 12, color: "#999", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
              <span>📍</span> {offre.adresse}{offre.ville ? `, ${offre.ville}` : ""}
            </div>
          )}

          {offre.prix_promo > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: DS.brand }}>{offre.prix_promo}€</span>
              {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
                <span style={{ fontSize: 15, color: "#ccc", textDecoration: "line-through" }}>{offre.prix_original}€</span>
              )}
              {offre.prix_original > 0 && offre.prix_promo > 0 && (
                <span style={{ fontSize: 12, color: DS.success, fontWeight: 700 }}>
                  {Math.round(((offre.prix_original - offre.prix_promo) / offre.prix_original) * 100)}% économisé
                </span>
              )}
            </div>
          )}

          {/* Stock */}
          {offre.stock_initial > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: offre.stock_restant < 5 ? DS.danger : "#888", fontWeight: 700 }}>
                  {offre.stock_restant < 5 ? "⚠️ " : ""}Stock : {offre.stock_restant}/{offre.stock_initial}
                </span>
              </div>
              <div style={{ height: 4, background: "#eee", borderRadius: 4 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: offre.stock_restant < 5 ? DS.danger : DS.success,
                  width: `${Math.min(100, Math.round((offre.stock_restant / offre.stock_initial) * 100))}%`,
                }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate(`/OffreDetail?id=${offre.id}`)} style={{
              flex: 1, background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
              color: "#fff", border: "none",
              borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 800, cursor: "pointer",
              boxShadow: DS.eBrand,
            }}>🎫 Voir l'offre</button>
            {offre.latitude && offre.longitude && (
              <button onClick={() => window.open(`https://maps.google.com/?q=${offre.latitude},${offre.longitude}`, "_blank")} style={{
                background: DS.ink, color: "#fff", border: "none",
                borderRadius: 14, padding: "13px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {Ic.nav("#fff", 14)} Y aller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Liste des offres (swipe up) ────────────────────────────────────────────────
function OffreListPanel({ offres, userPos, navigate, onSelect }) {
  return (
    <div style={{
      position: "fixed", bottom: 76, left: 0, right: 0, zIndex: 490,
      background: "rgba(255,255,255,.98)", backdropFilter: "blur(20px)",
      borderRadius: "24px 24px 0 0",
      boxShadow: "0 -4px 30px rgba(0,0,0,.2)",
      maxHeight: "55vh", display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px" }}>
        <div style={{ width: 36, height: 4, background: "#ddd", borderRadius: 4 }} />
      </div>
      <div style={{ padding: "0 16px 8px", fontWeight: 800, fontSize: 14, color: DS.ink }}>
        {offres.length} offre{offres.length > 1 ? "s" : ""} trouvée{offres.length > 1 ? "s" : ""}
      </div>
      <div style={{ overflowY: "auto", padding: "0 12px 16px", flex: 1 }}>
        {offres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#888" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div>Aucune offre dans cette zone</div>
          </div>
        ) : offres.map(o => {
          const dist = userPos && o.latitude ? haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) : null;
          return (
            <div key={o.id} onClick={() => onSelect(o)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 16, marginBottom: 8,
              background: "#F7F7FB", cursor: "pointer",
              border: "1px solid #EDEDF5",
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                <img src={o.image_url} alt={o.titre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: DS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.commercant_nom}</div>
                <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                {dist !== null && <div style={{ fontSize: 11, color: DS.brand, fontWeight: 700, marginTop: 2 }}>📍 {formatDist(dist)}</div>}
              </div>
              {o.valeur_reduction > 0 && (
                <div style={{ background: DS.brand, color: "#fff", borderRadius: 12, padding: "4px 10px", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                  -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function Carte() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);

  const [offres, setOffres] = useState([]);
  const [cat, setCat] = useState("Tout");
  const [rayon, setRayon] = useState(200);
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [flashOnly, setFlashOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chargement des offres
  useEffect(() => {
    Offre.filter({ est_active: true }).then(data => {
      const now = new Date();
      setOffres(data.filter(o => !o.date_fin || new Date(o.date_fin) > now));
      setLoading(false);
    });
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos(LYON)
    );
  }, []);

  // Init carte Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([LYON.lat, LYON.lon], 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "©CartoDB", maxZoom: 19,
      }).addTo(map);
      mapInstance.current = map;
      setMapReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // Mise à jour des marqueurs
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.L) return;
    const L = window.L;
    const map = mapInstance.current;

    // Supprimer anciens marqueurs et cercle
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }

    const center = userPos || LYON;

    // Cercle de rayon
    circleRef.current = L.circle([center.lat, center.lon], {
      radius: rayon * 1000,
      color: DS.brand,
      fillColor: DS.brand,
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: "6 4",
    }).addTo(map);

    const filtered = getFiltered();

    filtered.forEach(o => {
      const emoji = CAT_EMOJI[o.categorie] || "🏷️";
      const badge = o.valeur_reduction > 0
        ? `-${o.valeur_reduction}${o.type_reduction === "pourcentage" ? "%" : "€"}`
        : "";
      const isFlash = o.est_urgente;
      const isSelected = selected?.id === o.id;

      const icon = L.divIcon({
        html: `<div style="
          background: ${isFlash ? "linear-gradient(135deg,#EF4444,#F97316)" : "linear-gradient(135deg,#6C3BFF,#8B5CF6)"};
          color:#fff; border-radius:20px; padding:6px 12px;
          font-size:12px; font-weight:900; white-space:nowrap;
          font-family:-apple-system,sans-serif;
          box-shadow:0 4px 14px ${isFlash ? "rgba(239,68,68,.5)" : "rgba(108,59,255,.45)"};
          border:2px solid rgba(255,255,255,.9);
          display:inline-flex; align-items:center; gap:4px;
          transform: scale(${isSelected ? 1.2 : 1});
          cursor: pointer;
          transition: transform 0.15s;
        ">${emoji}${badge ? " " + badge : ""}</div>`,
        className: "",
        iconAnchor: [40, 20],
      });
      const marker = L.marker([o.latitude, o.longitude], { icon }).addTo(map);
      marker.on("click", () => { setSelected(o); setShowList(false); });
      markersRef.current.push(marker);
    });

    // Marqueur utilisateur
    if (userPos) {
      const userIcon = L.divIcon({
        html: `<div style="
          width:18px; height:18px; background:${DS.brand}; border-radius:50%;
          border:3px solid white; box-shadow:0 0 0 5px rgba(108,59,255,.2), 0 2px 8px rgba(108,59,255,.4);
        "></div>`,
        className: "",
        iconAnchor: [9, 9],
      });
      const m = L.marker([userPos.lat, userPos.lon], { icon: userIcon }).addTo(map);
      markersRef.current.push(m);
    }
  }, [mapReady, offres, cat, rayon, userPos, flashOnly, search, selected]);

  const getFiltered = () => {
    const center = userPos || LYON;
    return offres.filter(o => {
      if (!o.latitude || !o.longitude) return false;
      if (cat !== "Tout" && o.categorie !== cat) return false;
      if (flashOnly && !o.est_urgente) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!o.titre?.toLowerCase().includes(q) && !o.commercant_nom?.toLowerCase().includes(q)) return false;
      }
      const dist = haversine(center.lat, center.lon, o.latitude, o.longitude);
      if (dist > rayon) return false;
      return true;
    });
  };

  const centerOnUser = () => {
    if (userPos && mapInstance.current) {
      mapInstance.current.setView([userPos.lat, userPos.lon], 14, { animate: true });
    }
  };

  const centerOnLyon = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([LYON.lat, LYON.lon], 12, { animate: true });
    }
  };

  const filtered = getFiltered();
  const flashCount = offres.filter(o => o.est_urgente && o.latitude).length;

  const hasActiveFilters = cat !== "Tout" || flashOnly || search.trim();

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative", fontFamily: DS.fontBase, overflow: "hidden" }}>

      {/* Carte */}
      <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {/* Loading */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 800,
          background: "rgba(255,255,255,.85)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12,
        }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${DS.brandLight}`, borderTopColor: DS.brand, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <div style={{ color: DS.brand, fontWeight: 700, fontSize: 14 }}>Chargement des offres…</div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 400,
        padding: `calc(${DS.safeTop} + 10px) 14px 12px`,
        background: "linear-gradient(to bottom, rgba(0,0,0,.6) 0%, rgba(0,0,0,.2) 75%, transparent 100%)",
        pointerEvents: "none",
      }}>
        {/* Ligne 1 : retour + titre + filtres */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, pointerEvents: "all" }}>
          <button onClick={() => navigate(-1)} style={fabStyle("rgba(0,0,0,.45)", 44)}>
            {Ic.back("#fff", 18)}
          </button>

          {showSearch ? (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une offre ou un commerce…"
              onBlur={() => { if (!search) setShowSearch(false); }}
              style={{
                flex: 1, height: 44, borderRadius: 100,
                background: "rgba(255,255,255,.95)", backdropFilter: "blur(12px)",
                border: "none", padding: "0 16px", fontSize: 14, color: DS.ink,
                outline: "none", fontFamily: DS.fontBase,
              }}
            />
          ) : (
            <div style={{
              flex: 1, background: "rgba(0,0,0,.4)", backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 100, padding: "10px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>🗺️</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Carte des offres</span>
              </div>
              <div style={{ background: DS.brand, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 12, fontWeight: 800 }}>
                {filtered.length} offre{filtered.length > 1 ? "s" : ""}
              </div>
            </div>
          )}

          <button onClick={() => setShowSearch(v => !v)} style={fabStyle("rgba(0,0,0,.45)", 44)}>
            <span style={{ fontSize: 18 }}>🔍</span>
          </button>

          <button onClick={() => { setShowFilters(v => !v); setShowList(false); setSelected(null); }} style={fabStyle(showFilters ? DS.brand : "rgba(0,0,0,.45)", 44)}>
            <span style={{ fontSize: 18 }}>⚙️</span>
          </button>
        </div>

        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", pointerEvents: "all" }}>
          {flashCount > 0 && (
            <button onClick={() => setFlashOnly(v => !v)} style={{
              flexShrink: 0, borderRadius: 100, padding: "6px 13px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: flashOnly ? DS.danger : "rgba(0,0,0,.4)",
              color: "#fff",
              boxShadow: flashOnly ? "0 4px 12px rgba(239,68,68,.4)" : "0 2px 8px rgba(0,0,0,.2)",
              backdropFilter: "blur(10px)",
              border: `1.5px solid ${flashOnly ? DS.danger : "rgba(255,255,255,.2)"}`,
              whiteSpace: "nowrap",
            }}>
              ⚡ Flash ({flashCount})
            </button>
          )}
          {CATS_MAP.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: 100, padding: "6px 13px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: cat === c ? DS.brand : "rgba(0,0,0,.4)",
              color: "#fff",
              boxShadow: cat === c ? DS.eBrand : "0 2px 8px rgba(0,0,0,.2)",
              backdropFilter: "blur(10px)",
              border: `1.5px solid ${cat === c ? DS.brand : "rgba(255,255,255,.2)"}`,
              whiteSpace: "nowrap",
            }}>
              {c !== "Tout" ? CAT_EMOJI[c] + " " : "🏠 "}{c}
            </button>
          ))}
        </div>

        {/* Indicateur de filtres actifs */}
        {hasActiveFilters && (
          <div style={{ pointerEvents: "all", marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cat !== "Tout" && (
              <div style={{ background: DS.brand, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                {CAT_EMOJI[cat]} {cat}
                <button onClick={() => setCat("Tout")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>✕</button>
              </div>
            )}
            {flashOnly && (
              <div style={{ background: DS.danger, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                ⚡ Flash seulement
                <button onClick={() => setFlashOnly(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>✕</button>
              </div>
            )}
            {search.trim() && (
              <div style={{ background: DS.ink, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                🔍 "{search}"
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>✕</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PANNEAU FILTRES ── */}
      {showFilters && (
        <div style={{
          position: "absolute", top: `calc(${DS.safeTop} + 108px)`, left: 14, right: 14, zIndex: 450,
          background: "rgba(10,10,20,.9)", backdropFilter: "blur(24px)",
          borderRadius: 22, padding: "18px 18px",
          border: "1.5px solid rgba(255,255,255,.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,.45)",
          animation: "popIn .2s ease",
        }}>
          {/* Rayon */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>📍 Rayon de recherche</span>
              <div style={{ background: DS.brand, color: "#fff", borderRadius: 100, padding: "4px 12px", fontSize: 13, fontWeight: 900 }}>
                {rayon} km
              </div>
            </div>
            <input type="range" min={1} max={200} value={rayon} onChange={e => setRayon(Number(e.target.value))}
              style={{ width: "100%", accentColor: DS.brand }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>1 km</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>200 km</span>
            </div>
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: "rgba(255,255,255,.1)", marginBottom: 14 }} />

          {/* Options rapides rayon */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Raccourcis</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[5, 10, 20, 50, 100, 200].map(r => (
                <button key={r} onClick={() => setRayon(r)} style={{
                  background: rayon === r ? DS.brand : "rgba(255,255,255,.1)",
                  color: "#fff", border: "none", borderRadius: 100,
                  padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Bouton recentrer */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { centerOnUser(); setShowFilters(false); }} style={{
              flex: 1, background: "rgba(255,255,255,.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,.2)", borderRadius: 14, padding: "11px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              📍 Ma position
            </button>
            <button onClick={() => { centerOnLyon(); setShowFilters(false); }} style={{
              flex: 1, background: "rgba(255,255,255,.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,.2)", borderRadius: 14, padding: "11px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              🏙️ Lyon
            </button>
            <button onClick={() => {
              setCat("Tout"); setFlashOnly(false); setSearch(""); setRayon(200); setShowFilters(false);
            }} style={{
              flex: 1, background: "rgba(255,0,80,.2)", color: "#fff",
              border: "1px solid rgba(255,80,80,.3)", borderRadius: 14, padding: "11px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              🗑 Reset
            </button>
          </div>
        </div>
      )}

      {/* ── BOUTONS DROITE ── */}
      <div style={{ position: "absolute", right: 14, zIndex: 400, display: "flex", flexDirection: "column", gap: 10, bottom: selected ? 370 : showList ? "60vh" : 100, transition: "bottom .3s ease" }}>
        <button onClick={centerOnUser} style={fabStyle("rgba(255,255,255,.95)", 52, true)}>
          {Ic.location(DS.brand, 24)}
        </button>
        <button onClick={() => mapInstance.current?.zoomIn()} style={fabStyle("rgba(255,255,255,.9)", 44, true)}>
          <span style={{ fontSize: 20, fontWeight: 800, color: DS.ink }}>+</span>
        </button>
        <button onClick={() => mapInstance.current?.zoomOut()} style={fabStyle("rgba(255,255,255,.9)", 44, true)}>
          <span style={{ fontSize: 20, fontWeight: 800, color: DS.ink }}>−</span>
        </button>
      </div>

      {/* ── BOUTON LISTE ── */}
      {!selected && (
        <button onClick={() => { setShowList(v => !v); setShowFilters(false); }} style={{
          position: "absolute", bottom: 88, left: "50%", transform: "translateX(-50%)",
          zIndex: 400,
          background: showList ? DS.ink : "rgba(255,255,255,.96)",
          backdropFilter: "blur(12px)",
          color: showList ? "#fff" : DS.ink,
          border: "none", borderRadius: 100,
          padding: "12px 22px",
          fontSize: 13, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,.25)",
          display: "flex", alignItems: "center", gap: 8,
          transition: "all .2s",
        }}>
          <span>{showList ? "🗺️ Carte" : "📋 Liste"}</span>
          <div style={{ background: DS.brand, color: "#fff", borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 900 }}>
            {filtered.length}
          </div>
        </button>
      )}

      {/* ── BOTTOM SHEET offre ── */}
      {selected && !showList && (
        <BottomSheet offre={selected} userPos={userPos} onClose={() => setSelected(null)} navigate={navigate} />
      )}

      {/* ── LISTE DES OFFRES ── */}
      {showList && !selected && (
        <OffreListPanel
          offres={filtered}
          userPos={userPos}
          navigate={navigate}
          onSelect={o => { setSelected(o); setShowList(false); }}
        />
      )}

      {/* NavBar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 600 }}>
        <NavBar active="Carte" />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );
}

function fabStyle(bg, size, shadow = false) {
  return {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: bg,
    backdropFilter: "blur(12px)",
    border: bg.includes("255,255,255") ? "none" : "1.5px solid rgba(255,255,255,.25)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: shadow ? "0 4px 16px rgba(0,0,0,.2)" : "none",
  };
}