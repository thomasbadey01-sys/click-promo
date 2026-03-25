import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { DS, Icon, CPLogo } from "./Home";
import { haversine, formatDist } from "./Feed";

const CAT_COLORS = {
  "Restaurant": DS.red, "Boutique": DS.purple, "Beauté & Coiffure": "#EC4899",
  "Fitness & Sport": DS.green, "Services": DS.blue, "Épicerie": "#F59E0B",
  "Pharmacie": "#06B6D4", "Autre": DS.gray500
};

export default function Carte() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [offres, setOffres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [rayon, setRayon] = useState(5);
  const [catFilter, setCatFilter] = useState("Tout");

  useEffect(() => {
    Offre.list().then(data => {
      setOffres(data.filter(o => o.est_active && o.latitude && o.longitude));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (mapReady) return;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [48.8566, 2.3522], zoom: 13, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "© OSM © CARTO", maxZoom: 19
    }).addTo(map);
    leafletMap.current = map;
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const L = window.L;
    const map = leafletMap.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = offres.filter(o => {
      if (catFilter !== "Tout" && o.categorie !== catFilter) return false;
      if (userPos) return haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) <= rayon;
      return true;
    });

    filtered.forEach(offre => {
      const color = CAT_COLORS[offre.categorie] || DS.orange;
      const dist = userPos ? formatDist(haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude)) : "";
      const customIcon = L.divIcon({
        html: `<div style="
          background:${color};color:white;border-radius:20px;
          padding:5px 11px;font-size:11px;font-weight:800;
          white-space:nowrap;box-shadow:0 4px 14px ${color}66;
          border:2px solid white;cursor:pointer;font-family:Inter,-apple-system,sans-serif;
          ${offre.est_urgente ? "animation:mapPulse 1.5s infinite;" : ""}
        ">-${offre.valeur_reduction}${offre.type_reduction === "pourcentage" ? "%" : "€"}${dist ? " · " + dist : ""}${offre.est_urgente ? " ⚡" : ""}</div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};margin:0 auto;"></div>`,
        className: "", iconAnchor: [36, 34]
      });
      const marker = L.marker([offre.latitude, offre.longitude], { icon: customIcon })
        .addTo(map)
        .on("click", () => { setSelected(offre); map.panTo([offre.latitude, offre.longitude]); });
      markersRef.current.push(marker);
    });

    if (userPos) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:${DS.blue};border-radius:50%;border:3px solid white;box-shadow:0 0 0 10px rgba(59,130,246,0.18);"></div>`,
        className: "", iconAnchor: [8, 8]
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map);
      map.setView([userPos.lat, userPos.lng], 14);
    }
  }, [offres, userPos, mapReady, rayon, catFilter]);

  const getLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      p => { setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoLoading(false); },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const offresProches = offres.filter(o => {
    if (catFilter !== "Tout" && o.categorie !== catFilter) return false;
    if (userPos) return haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) <= rayon;
    return true;
  }).sort((a, b) => {
    if (!userPos) return 0;
    return haversine(userPos.lat, userPos.lng, a.latitude, a.longitude) - haversine(userPos.lat, userPos.lng, b.latitude, b.longitude);
  });

  const cats = ["Tout", "Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Pharmacie", "Services"];

  return (
    <div style={{ background: DS.gray50, minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "white", padding: "50px 16px 0", position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${DS.gray100}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CPLogo size={32} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: DS.black, letterSpacing: -0.4 }}>Carte des offres</div>
              <div style={{ fontSize: 11, color: DS.gray500, display: "flex", alignItems: "center", gap: 3 }}>
                {Icon.pin(10, userPos ? DS.green : DS.gray400)}
                {offresProches.length} offre{offresProches.length !== 1 ? "s" : ""} {userPos ? `dans ${rayon}km` : "disponibles"}
              </div>
            </div>
          </div>
          <button onClick={getLocation} disabled={geoLoading} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: userPos ? `${DS.green}15` : DS.gray100,
            color: userPos ? DS.green : DS.gray700,
            border: `1.5px solid ${userPos ? `${DS.green}44` : DS.gray200}`,
            borderRadius: DS.r99, padding: "8px 13px",
            fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
          }}>
            <span style={{ display: "flex" }}>{Icon.pin(13, userPos ? DS.green : DS.gray500)}</span>
            {geoLoading ? "..." : userPos ? "Localisé" : "Me localiser"}
          </button>
        </div>

        {/* Rayon */}
        {userPos && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: DS.gray500 }}>Rayon de recherche</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: DS.orange }}>{rayon} km</span>
            </div>
            <input type="range" min={1} max={25} value={rayon} onChange={e => setRayon(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: DS.orange, height: 3 }} />
          </div>
        )}

        {/* Filtres catégories */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {cats.map(cat => {
            const on = catFilter === cat;
            const col = CAT_COLORS[cat] || DS.orange;
            return (
              <button key={cat} onClick={() => setCatFilter(cat)} style={{
                flexShrink: 0, border: `1.5px solid ${on ? col : DS.gray200}`,
                borderRadius: DS.r99, padding: "6px 12px", fontFamily: DS.font,
                background: on ? col : "white",
                color: on ? "white" : DS.gray700,
                fontSize: 11, fontWeight: on ? 700 : 500, cursor: "pointer",
                boxShadow: on ? `0 4px 10px ${col}44` : "none",
                transition: "all 0.2s"
              }}>{cat}</button>
            );
          })}
        </div>
      </div>

      {/* Carte */}
      <div ref={mapRef} style={{ height: selected ? "36vh" : "50vh", width: "100%", position: "relative" }}>
        {!mapReady && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F0F4F0", gap: 12 }}>
            <CPLogo size={40} />
            <div style={{ color: DS.gray400, fontSize: 13 }}>Chargement de la carte...</div>
          </div>
        )}
      </div>

      {/* Offre sélectionnée */}
      {selected && (
        <div style={{ padding: "10px 14px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.gray400, textTransform: "uppercase", letterSpacing: 0.8 }}>Offre sélectionnée</span>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: DS.gray400, display: "flex", padding: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div onClick={() => navigate(`/OffreDetail?id=${selected.id}`)} style={{
            background: "white", borderRadius: DS.r16, padding: 13,
            display: "flex", gap: 12, boxShadow: DS.s2,
            border: `2px solid ${DS.orange}`, cursor: "pointer"
          }}>
            <img src={selected.image_url} alt={selected.titre}
              style={{ width: 68, height: 68, borderRadius: DS.r12, objectFit: "cover", flexShrink: 0 }}
              onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: DS.black, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{selected.titre}</div>
              <div style={{ fontSize: 12, color: DS.gray500, marginBottom: 7, display: "flex", alignItems: "center", gap: 4 }}>
                {Icon.store(11, DS.gray400)}{selected.commercant_nom}
                {userPos && ` · ${formatDist(haversine(userPos.lat, userPos.lng, selected.latitude, selected.longitude))}`}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: selected.valeur_reduction >= 40 ? DS.red : DS.orange, color: "white", borderRadius: DS.r8, padding: "3px 9px", fontSize: 12, fontWeight: 800 }}>
                  -{selected.valeur_reduction}{selected.type_reduction === "pourcentage" ? "%" : "€"}
                </span>
                {selected.prix_promo > 0 && <span style={{ fontSize: 14, fontWeight: 900, color: DS.orange }}>{selected.prix_promo}€</span>}
                {selected.est_urgente && <span style={{ fontSize: 11, color: DS.red, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>{Icon.flash(11, DS.red)}Flash</span>}
              </div>
            </div>
            <div style={{ alignSelf: "center", color: DS.gray300 }}>{Icon.chevronR(16, DS.gray300)}</div>
          </div>
        </div>
      )}

      {/* Liste */}
      <div style={{ padding: "12px 14px 100px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray400, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
          {offresProches.length} offre{offresProches.length !== 1 ? "s" : ""} {userPos ? `à moins de ${rayon}km` : "disponibles"}
        </div>

        {loading && [1, 2, 3].map(i => (
          <div key={i} style={{ background: "white", borderRadius: DS.r12, height: 68, marginBottom: 8, boxShadow: DS.s1, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#f3f4f6 25%,#fafafa 50%,#f3f4f6 75%)", backgroundSize: "400% 100%", animation: "shimmer 1.4s infinite" }} />
          </div>
        ))}

        {offresProches.slice(0, 20).map(o => {
          const d = userPos && o.latitude ? haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) : null;
          const col = CAT_COLORS[o.categorie] || DS.orange;
          const isSelected = selected?.id === o.id;
          return (
            <div key={o.id}
              onClick={() => { setSelected(o); leafletMap.current?.panTo([o.latitude, o.longitude]); }}
              style={{
                background: "white", borderRadius: DS.r12, padding: "11px 13px", marginBottom: 7,
                display: "flex", alignItems: "center", gap: 11, cursor: "pointer",
                boxShadow: isSelected ? DS.s2 : DS.s1,
                border: `1.5px solid ${isSelected ? DS.orange : "transparent"}`,
                transition: "all 0.2s"
              }}
            >
              <img src={o.image_url} alt={o.titre} loading="lazy"
                style={{ width: 50, height: 50, borderRadius: DS.r8, objectFit: "cover", flexShrink: 0 }}
                onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: DS.black, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                <div style={{ fontSize: 11, color: DS.gray500, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  {Icon.store(10, DS.gray400)}{o.commercant_nom}{d ? ` · ${formatDist(d)}` : ""}
                </div>
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <span style={{ background: `${col}15`, color: col, borderRadius: DS.r8, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>
                  -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
                </span>
                {o.prix_promo > 0 && <span style={{ fontSize: 12, fontWeight: 800, color: DS.orange }}>{o.prix_promo}€</span>}
              </div>
            </div>
          );
        })}
      </div>

      <NavBar active="carte" />

      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes mapPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
