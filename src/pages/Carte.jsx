import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { DS, Ic, NavBar, BadgeReduction } from "./theme";
import { haversine, formatDist } from "./Feed.jsx";
import { useNavigate } from "react-router-dom";


const CATS = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Services"];

export default function Carte() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const [offres, setOffres] = useState([]);
  const [cat, setCat] = useState("Tout");
  const [rayon, setRayon] = useState(5);
  const [ouvertNow, setOuvertNow] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    Offre.filter({ est_active: true }).then(d => {
      const now = new Date();
      setOffres(d.filter(o => !o.date_fin || new Date(o.date_fin) > now));
    });
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos({ lat: 48.8566, lon: 2.3522 })
    );
  }, []);

  // Init Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const script = document.getElementById("leaflet-script");
    const link = document.getElementById("leaflet-css");
    const init = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([48.8566, 2.3522], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletRef.current = map;
      setMapReady(true);
    };
    if (!link) {
      const l = document.createElement("link");
      l.id = "leaflet-css"; l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    if (!script) {
      const s = document.createElement("script");
      s.id = "leaflet-script"; s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = init; document.head.appendChild(s);
    } else if (window.L) { init(); }
  }, []);

  // Marqueurs
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !offres.length) return;
    const L = window.L;
    const map = leafletRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    let filtered = offres.filter(o => o.latitude && o.longitude && (cat === "Tout" || o.categorie === cat));
    if (userPos) filtered = filtered.filter(o => haversine(userPos.lat, userPos.lon, o.latitude, o.longitude) <= rayon);
    filtered.forEach(o => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${DS.brand};color:#fff;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 2px 8px rgba(108,59,255,.4);border:2px solid #fff">-${o.valeur_reduction}${o.type_reduction==="pourcentage"?"%":"€"}</div>`,
        iconAnchor: [30, 16],
      });
      const m = L.marker([o.latitude, o.longitude], { icon }).addTo(map);
      m.on("click", () => setSelected(o));
      markersRef.current.push(m);
    });
    if (userPos && filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map(o => [o.latitude, o.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mapReady, offres, cat, rayon, userPos, ouvertNow]);

  return (
    <div style={{ background: "#0F0F1A", minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Filtres en overlay */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: `calc(${DS.safeTop} + 8px) 16px 12px`,
        background: "#0F0F1A",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}>
        {/* Chips catégories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", marginBottom: 10 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: DS.pill, padding: "7px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: cat === c ? DS.brand : "rgba(255,255,255,.1)",
              color: cat === c ? "#fff" : "rgba(255,255,255,.7)",
              border: `1.5px solid ${cat === c ? DS.brand : "rgba(255,255,255,.15)"}`,
              fontFamily: DS.fontBase, minHeight: 34,
            }}>{c}</button>
          ))}
        </div>

        {/* Rayon + Ouvert */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            {Ic.pin(DS.brand, 14)}
            <span style={{ fontSize: 13, color: DS.ink60, fontWeight: 600 }}>{rayon} km</span>
            <input type="range" min={1} max={20} value={rayon} onChange={e => setRayon(+e.target.value)}
              style={{ flex: 1, accentColor: DS.brand }} />
          </div>
          <button onClick={() => setOuvertNow(!ouvertNow)} style={{
            background: ouvertNow ? DS.success : DS.white,
            color: ouvertNow ? DS.white : DS.ink60,
            border: `1.5px solid ${ouvertNow ? DS.success : DS.ink10}`,
            borderRadius: DS.pill, padding: "7px 12px",
            fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
          }}>🟢 Ouvert</button>
        </div>
      </div>

      {/* Carte */}
      <div ref={mapRef} style={{ position: "fixed", top: 130, left: 0, right: 0, bottom: selected ? 200 : 68, zIndex: 1 }} />

      {/* Bouton centrer */}
      {userPos && (
        <button
          onClick={() => leafletRef.current?.setView([userPos.lat, userPos.lon], 14)}
          style={{
            position: "fixed", bottom: selected ? 220 : 90, right: 16, zIndex: 60,
            width: 44, height: 44, borderRadius: DS.pill,
            background: DS.white, border: `1px solid ${DS.ink10}`,
            boxShadow: DS.e2, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {Ic.nav(DS.brand, 18)}
        </button>
      )}

      {/* Carte offre sélectionnée */}
      {selected && (
        <div style={{
          position: "fixed", bottom: 68, left: 0, right: 0, zIndex: 60,
          background: "#1A1A2E", padding: "16px 16px 12px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 -4px 20px rgba(0,0,0,.08)",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 70, height: 64, borderRadius: DS.md, overflow: "hidden", flexShrink: 0 }}>
              <img src={selected.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 2 }}>{selected.titre}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{selected.commercant_nom} · {selected.ville}</div>
                </div>
                <BadgeReduction valeur={selected.valeur_reduction} type={selected.type_reduction} />
              </div>
              {userPos && selected.latitude && (
                <div style={{ fontSize: 12, color: DS.ink60, marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
                  {Ic.pin(DS.brand, 11)}
                  {formatDist(haversine(userPos.lat, userPos.lon, selected.latitude, selected.longitude))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => navigate(`/OffreDetail?id=${selected.id}`)} style={{
              flex: 1, background: DS.brand, color: DS.white, border: "none",
              borderRadius: DS.lg, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: DS.eBrand,
            }}>Voir l'offre</button>
            <button onClick={() => window.open(`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`, "_blank")} style={{
              background: "rgba(255,255,255,.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,.2)",
              borderRadius: DS.lg, padding: "12px 16px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
            }}>
              {Ic.nav(DS.ink, 14)} Y aller
            </button>
            <button onClick={() => setSelected(null)} style={{
              background: "rgba(255,255,255,.08)", border: "none", borderRadius: DS.lg,
              padding: "12px 16px", cursor: "pointer", fontSize: 18, color: "rgba(255,255,255,.5)",
            }}>✕</button>
          </div>
        </div>
      )}

      <NavBar active="Carte" />
    </div>
  );
}