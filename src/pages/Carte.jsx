import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, Ic, NavBar, getTheme } from "./theme";
import { haversine, formatDist } from "./Feed";

const CAT_EMOJI = {
  "Restaurant": "🍽️", "Boutique": "👗", "Beauté & Coiffure": "💅",
  "Fitness & Sport": "🏋️", "Épicerie": "🥐", "Services": "🛠️",
  "Pharmacie": "💊", "Autre": "🎁",
};

const CATS_MAP = ["Tout", "Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Pharmacie"];

function BottomSheet({ offre, userPos, onClose, navigate }) {
  if (!offre) return null;
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lon, offre.latitude, offre.longitude) : null;
  return (
    <div style={{
      position: "fixed", bottom: 80, left: 0, right: 0, zIndex: 500,
      animation: "slideUp .3s cubic-bezier(.34,1.56,.64,1)",
      pointerEvents: "all",
    }}>
      <div style={{
        margin: "0 12px",
        background: "rgba(255,255,255,.97)",
        backdropFilter: "blur(20px)",
        borderRadius: 28,
        boxShadow: "0 -4px 40px rgba(0,0,0,.22), 0 0 0 1px rgba(255,255,255,.5)",
        overflow: "hidden",
      }}>
        {/* Photo */}
        <div style={{ position: "relative", height: 150 }}>
          <img src={offre.image_url} alt={offre.titre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.6),transparent 60%)" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
            border: "none", borderRadius: "50%",
            width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10,
          }}>✕</button>
          {offre.valeur_reduction > 0 && (
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              background: DS.brand, color: "#fff", borderRadius: 20,
              padding: "5px 13px", fontSize: 15, fontWeight: 900,
              boxShadow: DS.eBrand,
            }}>-{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}</div>
          )}
          {offre.est_urgente && (
            <div style={{
              position: "absolute", top: 12, left: 12,
              background: DS.danger, color: "#fff", borderRadius: 20,
              padding: "3px 10px", fontSize: 11, fontWeight: 800,
            }}>⚡ FLASH</div>
          )}
        </div>

        {/* Infos */}
        <div style={{ padding: "14px 16px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: DS.ink, flex: 1 }}>{offre.commercant_nom}</div>
            {dist !== null && (
              <div style={{ background: DS.brandLight, color: DS.brand, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>
                📍 {formatDist(dist)}
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>{offre.titre}</div>

          {offre.prix_promo > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: DS.brand }}>{offre.prix_promo}€</span>
              {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
                <span style={{ fontSize: 15, color: "#ccc", textDecoration: "line-through" }}>{offre.prix_original}€</span>
              )}
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
                {Ic.nav("#fff", 14)} Itinéraire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Carte() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [offres, setOffres] = useState([]);
  const [cat, setCat] = useState("Tout");
  const [rayon, setRayon] = useState(20);
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Offre.filter({ est_active: true }).then(data => {
      const now = new Date();
      setOffres(data.filter(o => !o.date_fin || new Date(o.date_fin) > now));
    });
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos({ lat: 45.764, lon: 4.8357 })
    );
  }, []);

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
      const center = userPos ? [userPos.lat, userPos.lon] : [45.764, 4.8357];
      const map = L.map(mapRef.current, { zoomControl: false }).setView(center, 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "©CartoDB", maxZoom: 19,
      }).addTo(map);
      mapInstance.current = map;
      setMapReady(true);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.L) return;
    const L = window.L;
    const map = mapInstance.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = offres.filter(o => {
      if (!o.latitude || !o.longitude) return false;
      if (cat !== "Tout" && o.categorie !== cat) return false;
      return true;
    });

    filtered.forEach(o => {
      const emoji = CAT_EMOJI[o.categorie] || "🏷️";
      const badge = o.valeur_reduction > 0 ? `-${o.valeur_reduction}${o.type_reduction === "pourcentage" ? "%" : "€"}` : "";
      const isFlash = o.est_urgente;
      const icon = L.divIcon({
        html: `<div style="
          background: ${isFlash ? "linear-gradient(135deg,#EF4444,#F97316)" : "linear-gradient(135deg,#6C3BFF,#8B5CF6)"};
          color:#fff; border-radius:20px; padding:6px 12px;
          font-size:12px; font-weight:900; white-space:nowrap;
          font-family:-apple-system,sans-serif;
          box-shadow:0 4px 12px ${isFlash ? "rgba(239,68,68,.5)" : "rgba(108,59,255,.45)"};
          border:2px solid rgba(255,255,255,.9);
          display:inline-flex; align-items:center; gap:4px;
          transform: scale(1);
          transition: transform 0.15s;
          cursor: pointer;
        ">${emoji} ${badge}</div>`,
        className: "",
        iconAnchor: [40, 20],
      });
      const marker = L.marker([o.latitude, o.longitude], { icon }).addTo(map);
      marker.on("click", () => setSelected(o));
      markersRef.current.push(marker);
    });

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
  }, [mapReady, offres, cat, rayon, userPos]);

  const centerOnUser = () => {
    if (userPos && mapInstance.current) {
      mapInstance.current.setView([userPos.lat, userPos.lon], 15, { animate: true });
    }
  };

  const filteredCount = offres.filter(o => {
    if (!o.latitude || !o.longitude) return false;
    if (cat !== "Tout" && o.categorie !== cat) return false;
    return true;
  }).length;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative", fontFamily: DS.fontBase, overflow: "hidden" }}>

      {/* Carte plein écran */}
      <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {/* === HEADER IMMERSIF === */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 400,
        padding: `calc(${DS.safeTop} + 10px) 14px 14px`,
        background: "linear-gradient(to bottom, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 70%, transparent 100%)",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, pointerEvents: "all" }}>
          {/* Bouton retour */}
          <button onClick={() => navigate(-1)} style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "rgba(0,0,0,.45)", backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,.25)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {Ic.back("#fff", 18)}
          </button>

          {/* Titre */}
          <div style={{
            flex: 1,
            background: "rgba(0,0,0,.4)", backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,.2)",
            borderRadius: 100, padding: "10px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🗺️</span>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Carte des offres</span>
            </div>
            <div style={{
              background: DS.brand, color: "#fff", borderRadius: 100,
              padding: "3px 10px", fontSize: 12, fontWeight: 800,
            }}>{filteredCount} offre{filteredCount > 1 ? "s" : ""}</div>
          </div>

          {/* Bouton filtre */}
          <button onClick={() => setShowFilters(v => !v)} style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: showFilters ? DS.brand : "rgba(0,0,0,.45)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,.25)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18 }}>⚙️</span>
          </button>
        </div>

        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", pointerEvents: "all" }}>
          {CATS_MAP.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: 100, padding: "7px 14px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
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
      </div>

      {/* Panneau filtre rayon */}
      {showFilters && (
        <div style={{
          position: "absolute", top: `calc(${DS.safeTop} + 110px)`, left: 14, right: 14, zIndex: 400,
          background: "rgba(10,10,20,.85)", backdropFilter: "blur(20px)",
          borderRadius: 20, padding: "16px 18px",
          border: "1.5px solid rgba(255,255,255,.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          animation: "popIn .2s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>📍 Rayon de recherche</span>
            <div style={{ background: DS.brand, color: "#fff", borderRadius: 100, padding: "4px 12px", fontSize: 13, fontWeight: 900 }}>
              {rayon} km
            </div>
          </div>
          <input type="range" min={1} max={200} value={rayon} onChange={e => setRayon(Number(e.target.value))}
            style={{ width: "100%", accentColor: DS.brand, height: 4 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>1 km</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>200 km</span>
          </div>
        </div>
      )}

      {/* Bouton GPS */}
      <button onClick={centerOnUser} style={{
        position: "absolute",
        bottom: selected ? 330 : 100,
        right: 16, zIndex: 400,
        width: 52, height: 52, borderRadius: "50%",
        background: "rgba(255,255,255,.95)", backdropFilter: "blur(10px)",
        border: "none", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "bottom .3s ease",
      }}>
        {Ic.location(DS.brand, 24)}
      </button>

      {/* Bouton zoom + */}
      <button onClick={() => mapInstance.current?.zoomIn()} style={{
        position: "absolute", bottom: selected ? 395 : 165, right: 16, zIndex: 400,
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(255,255,255,.9)", backdropFilter: "blur(10px)",
        border: "none", cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, fontWeight: 800, color: DS.ink,
        transition: "bottom .3s ease",
      }}>+</button>

      {/* Bouton zoom - */}
      <button onClick={() => mapInstance.current?.zoomOut()} style={{
        position: "absolute", bottom: selected ? 450 : 220, right: 16, zIndex: 400,
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(255,255,255,.9)", backdropFilter: "blur(10px)",
        border: "none", cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, fontWeight: 800, color: DS.ink,
        transition: "bottom .3s ease",
      }}>−</button>

      {/* Bottom sheet offre sélectionnée */}
      <BottomSheet offre={selected} userPos={userPos} onClose={() => setSelected(null)} navigate={navigate} />

      {/* NavBar avec z-index élevé */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 600 }}>
        <NavBar active="Carte" />
      </div>
    </div>
  );
}