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
      position: "fixed", bottom: 70, left: 0, right: 0, zIndex: 200,
      animation: "slideUp .3s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{
        margin: "0 12px", background: "#fff", borderRadius: 24,
        boxShadow: "0 -4px 32px rgba(0,0,0,.18)", overflow: "hidden",
      }}>
        {/* Photo */}
        <div style={{ position: "relative", height: 160 }}>
          <img src={offre.image_url} alt={offre.titre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.5),transparent)" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(0,0,0,.4)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          {offre.valeur_reduction > 0 && (
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              background: DS.brand, color: "#fff", borderRadius: 20,
              padding: "4px 12px", fontSize: 14, fontWeight: 800,
            }}>-{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}</div>
          )}
        </div>

        {/* Infos */}
        <div style={{ padding: "14px 16px 16px" }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: DS.ink, marginBottom: 4 }}>{offre.commercant_nom}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
            {offre.titre}
            {dist !== null && <span> · 📍 {formatDist(dist)}</span>}
          </div>
          {offre.prix_promo > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: DS.brand }}>{offre.prix_promo}€</span>
              {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
                <span style={{ fontSize: 15, color: "#ccc", textDecoration: "line-through" }}>{offre.prix_original}€</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate(`/OffreDetail?id=${offre.id}`)} style={{
              flex: 1, background: DS.brand, color: "#fff", border: "none",
              borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 800, cursor: "pointer",
              boxShadow: DS.eBrand,
            }}>Voir l'offre</button>
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
  const [rayon, setRayon] = useState(10);
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const t = getTheme();

  useEffect(() => {
    Offre.filter({ est_active: true }).then(data => {
      const now = new Date();
      setOffres(data.filter(o => !o.date_fin || new Date(o.date_fin) > now));
    });
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos({ lat: 48.8566, lon: 2.3522 })
    );
  }, []);

  // Init Leaflet
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
      const center = userPos ? [userPos.lat, userPos.lon] : [48.8566, 2.3522];
      const map = L.map(mapRef.current, { zoomControl: false }).setView(center, 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "©CartoDB",
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      mapInstance.current = map;
      setMapReady(true);
    };
    document.head.appendChild(script);
  }, [mapRef.current]);

  // Marqueurs
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.L) return;
    const L = window.L;
    const map = mapInstance.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = offres.filter(o => {
      if (!o.latitude || !o.longitude) return false;
      if (cat !== "Tout" && o.categorie !== cat) return false;
      if (userPos) {
        const d = haversine(userPos.lat, userPos.lon, o.latitude, o.longitude);
        if (d > rayon) return false;
      }
      return true;
    });

    filtered.forEach(o => {
      const emoji = CAT_EMOJI[o.categorie] || "🏷️";
      const badge = o.valeur_reduction > 0 ? `-${o.valeur_reduction}${o.type_reduction === "pourcentage" ? "%" : "€"}` : "";
      const icon = L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg,#6C3BFF,#8B5CF6);
          color:#fff; border-radius:20px; padding:5px 10px;
          font-size:12px; font-weight:800; white-space:nowrap;
          font-family:-apple-system,sans-serif;
          box-shadow:0 2px 8px rgba(108,59,255,.4);
          border:2px solid rgba(255,255,255,.8);
          display:inline-flex; align-items:center; gap:4px;
        ">${emoji} ${badge}</div>`,
        className: "",
        iconAnchor: [40, 20],
      });
      const marker = L.marker([o.latitude, o.longitude], { icon }).addTo(map);
      marker.on("click", () => setSelected(o));
      markersRef.current.push(marker);
    });

    // Marqueur utilisateur
    if (userPos) {
      const userIcon = L.divIcon({
        html: `<div style="
          width:16px; height:16px; background:#6C3BFF; border-radius:50%;
          border:3px solid white; box-shadow:0 0 0 3px rgba(108,59,255,.3);
        "></div>`,
        className: "",
        iconAnchor: [8, 8],
      });
      const m = L.marker([userPos.lat, userPos.lon], { icon: userIcon }).addTo(map);
      markersRef.current.push(m);
    }
  }, [mapReady, offres, cat, rayon, userPos]);

  const centerOnUser = () => {
    if (userPos && mapInstance.current) {
      mapInstance.current.setView([userPos.lat, userPos.lon], 14, { animate: true });
    }
  };

  const filteredCount = offres.filter(o => {
    if (!o.latitude || !o.longitude) return false;
    if (cat !== "Tout" && o.categorie !== cat) return false;
    if (userPos) return haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) <= rayon;
    return true;
  }).length;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: DS.fontBase, position: "relative" }}>
      {/* Overlay controls */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
        padding: `calc(${DS.safeTop} + 8px) 12px 10px`,
        background: "linear-gradient(to bottom, rgba(255,255,255,.95) 0%, rgba(255,255,255,.7) 80%, transparent 100%)",
        backdropFilter: "blur(4px)",
      }}>
        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", marginBottom: 8 }}>
          {CATS_MAP.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: 100, padding: "7px 14px",
              fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
              background: cat === c ? DS.brand : "rgba(255,255,255,.9)",
              color: cat === c ? "#fff" : DS.ink,
              boxShadow: cat === c ? DS.eBrand : "0 2px 8px rgba(0,0,0,.1)",
              backdropFilter: "blur(8px)",
            }}>
              {c !== "Tout" ? CAT_EMOJI[c] + " " : ""}{c}
            </button>
          ))}
        </div>

        {/* Rayon + compteur */}
        <div style={{
          background: "rgba(255,255,255,.95)", borderRadius: 14, padding: "10px 14px",
          boxShadow: "0 2px 12px rgba(0,0,0,.1)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, flexShrink: 0 }}>📍 Rayon</span>
          <input type="range" min={1} max={20} value={rayon} onChange={e => setRayon(Number(e.target.value))}
            style={{ flex: 1, accentColor: DS.brand }} />
          <span style={{
            background: DS.brand, color: "#fff", borderRadius: 10, padding: "4px 10px",
            fontSize: 12, fontWeight: 800, flexShrink: 0,
          }}>{rayon}km</span>
          <span style={{ fontSize: 12, color: DS.ink40, flexShrink: 0 }}>{filteredCount} offres</span>
        </div>
      </div>

      {/* Carte */}
      <div ref={mapRef} style={{ flex: 1 }} />

      {/* Bouton GPS */}
      <button onClick={centerOnUser} style={{
        position: "absolute", bottom: selected ? 320 : 90, right: 16, zIndex: 150,
        width: 48, height: 48, borderRadius: "50%",
        background: "#fff", border: "none", cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "bottom .3s",
      }}>
        {Ic.location(DS.brand, 22)}
      </button>

      {/* Bottom sheet offre */}
      <BottomSheet offre={selected} userPos={userPos} onClose={() => setSelected(null)} navigate={navigate} />

      <NavBar active="Carte" />
    </div>
  );
}