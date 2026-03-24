import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";
import { DS, CPLogo } from "./Home";
import { haversine, formatDist } from "./Feed";

const CAT_COLORS = {
  "Restaurant":"#FF6B00","Boutique":"#AF52DE","Beauté & Coiffure":"#FF2D55",
  "Fitness & Sport":"#34C759","Services":"#007AFF","Épicerie":"#FF9500",
  "Pharmacie":"#30B0C7","Autre":"#8E8E93"
};
const CAT_ICONS = {
  "Restaurant":"🍽️","Boutique":"🛍️","Beauté & Coiffure":"💇",
  "Fitness & Sport":"💪","Services":"🔧","Épicerie":"🥖","Pharmacie":"💊","Autre":"📦"
};

export default function Carte() {
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
    css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center:[48.8566,2.3522], zoom:13, zoomControl:false });
    L.control.zoom({ position:"bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:"© OSM © CARTO", maxZoom:19
    }).addTo(map);
    leafletMap.current = map;
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const L = window.L;
    const map = leafletMap.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const offresFiltered = offres.filter(o => {
      if (catFilter !== "Tout" && o.categorie !== catFilter) return false;
      if (userPos) return haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) <= rayon;
      return true;
    });

    offresFiltered.forEach(offre => {
      const color = CAT_COLORS[offre.categorie] || DS.primary;
      const icon = CAT_ICONS[offre.categorie] || "🏷️";
      const isUrgente = offre.est_urgente;

      const customIcon = L.divIcon({
        html: `<div style="
          background:${color};color:white;border-radius:20px;
          padding:5px 11px;font-size:12px;font-weight:800;
          white-space:nowrap;box-shadow:0 3px 12px ${color}88;
          border:2px solid white;cursor:pointer;
          ${isUrgente ? `animation:mapPulse 1.5s infinite;` : ""}
        ">${icon} -${offre.valeur_reduction}${offre.type_reduction==="pourcentage"?"%":"€"}${isUrgente?" ⚡":""}</div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid ${color};margin:0 auto;"></div>`,
        className:"", iconAnchor:[40,38]
      });

      const marker = L.marker([offre.latitude, offre.longitude], { icon: customIcon })
        .addTo(map).on("click", () => { setSelected(offre); map.panTo([offre.latitude, offre.longitude]); });
      markersRef.current.push(marker);
    });

    if (userPos) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#007AFF;border-radius:50%;border:3px solid white;box-shadow:0 0 0 10px rgba(0,122,255,0.18);"></div>`,
        className:"", iconAnchor:[9,9]
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon:userIcon }).addTo(map);
      map.setView([userPos.lat, userPos.lng], 14);
    }
  }, [offres, userPos, mapReady, rayon, catFilter]);

  const getLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      p => { setUserPos({ lat:p.coords.latitude, lng:p.coords.longitude }); setGeoLoading(false); },
      () => setGeoLoading(false),
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  const offresProches = userPos
    ? offres.filter(o => {
        if (catFilter!=="Tout" && o.categorie!==catFilter) return false;
        return haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) <= rayon;
      }).sort((a,b) => haversine(userPos.lat,userPos.lng,a.latitude,a.longitude)-haversine(userPos.lat,userPos.lng,b.latitude,b.longitude))
    : offres.filter(o => catFilter==="Tout" || o.categorie===catFilter);

  const cats = ["Tout", ...Object.keys(CAT_COLORS)];

  return (
    <div style={{ background:DS.bg, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ background:DS.gradient, padding:"50px 16px 14px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <CPLogo size={32} white />
            <div>
              <div style={{ color:"white", fontSize:17, fontWeight:800, letterSpacing:-0.3 }}>Carte des offres</div>
              <div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>
                {offresProches.length} offre{offresProches.length>1?"s":""} {userPos?`dans ${rayon}km`:"en France"}
              </div>
            </div>
          </div>
          <button onClick={getLocation} disabled={geoLoading} style={{
            background: userPos ? "rgba(52,199,89,0.25)" : "rgba(255,255,255,0.18)",
            border:`1.5px solid ${userPos?"rgba(52,199,89,0.5)":"rgba(255,255,255,0.3)"}`,
            borderRadius:DS.radius.full, padding:"8px 14px",
            color:"white", fontSize:12, fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", gap:5
          }}>
            {geoLoading ? "⏳" : userPos ? "✅" : "📍"} {geoLoading ? "..." : userPos ? "Localisé" : "Me localiser"}
          </button>
        </div>

        {/* Rayon slider */}
        {userPos && (
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>Rayon de recherche</span>
              <span style={{ color:"white", fontSize:11, fontWeight:700 }}>{rayon} km</span>
            </div>
            <input type="range" min={1} max={25} value={rayon} onChange={e=>setRayon(parseInt(e.target.value))}
              style={{ width:"100%", accentColor:"white", height:3 }} />
          </div>
        )}

        {/* Filtres catégories */}
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none" }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              flexShrink:0, background: catFilter===cat ? "white" : "rgba(255,255,255,0.16)",
              color: catFilter===cat ? (CAT_COLORS[cat]||DS.primary) : "rgba(255,255,255,0.85)",
              border:"none", borderRadius:DS.radius.full, padding:"7px 13px",
              fontSize:11, fontWeight: catFilter===cat ? 800 : 500, cursor:"pointer",
              transition:"all 0.2s",
              boxShadow: catFilter===cat ? DS.shadow.sm : "none"
            }}>
              {cat==="Tout" ? "🏷️ Tout" : `${CAT_ICONS[cat]} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div ref={mapRef} style={{ height: selected ? "38vh" : "52vh", width:"100%", position:"relative" }}>
        {!mapReady && (
          <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#EEF2F0", gap:12 }}>
            <CPLogo size={44} />
            <div style={{ color:DS.textSub, fontSize:14 }}>Chargement de la carte...</div>
          </div>
        )}
      </div>

      {/* Offre sélectionnée */}
      {selected && (
        <div style={{ padding:"12px 16px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:12, fontWeight:700, color:DS.textSub, textTransform:"uppercase", letterSpacing:0.8 }}>Offre sélectionnée</div>
            <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", color:DS.textMuted, fontSize:18 }}>✕</button>
          </div>
          <Link to={`/OffreDetail?id=${selected.id}`} style={{ textDecoration:"none" }}>
            <div style={{
              background:"white", borderRadius:DS.radius.lg, padding:14,
              display:"flex", gap:12, boxShadow:DS.shadow.md,
              border:`2px solid ${DS.primary}`, transition:"transform 0.15s"
            }}>
              <img src={selected.image_url} alt={selected.titre}
                style={{ width:72, height:72, borderRadius:DS.radius.md, objectFit:"cover", flexShrink:0 }}
                onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}
              />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15, color:DS.text, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selected.titre}</div>
                <div style={{ fontSize:12, color:DS.textSub, marginBottom:6 }}>
                  {selected.commercant_nom}
                  {userPos && ` · 📍 ${formatDist(haversine(userPos.lat,userPos.lng,selected.latitude,selected.longitude))}`}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ background:selected.valeur_reduction>=40?DS.danger:DS.primary, color:"white", borderRadius:DS.radius.full, padding:"4px 11px", fontSize:13, fontWeight:800 }}>
                    -{selected.valeur_reduction}{selected.type_reduction==="pourcentage"?"%":"€"}
                  </span>
                  {selected.est_urgente && <span style={{ fontSize:12, color:DS.danger, fontWeight:700 }}>⚡ Flash</span>}
                  {selected.prix_promo > 0 && (
                    <span style={{ fontSize:14, fontWeight:800, color:DS.primary, marginLeft:"auto" }}>{selected.prix_promo}€</span>
                  )}
                </div>
              </div>
              <div style={{ alignSelf:"center", color:DS.textMuted, fontSize:20 }}>›</div>
            </div>
          </Link>
        </div>
      )}

      {/* Liste des offres proches */}
      <div style={{ padding:"14px 16px 100px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:DS.textSub, marginBottom:10, textTransform:"uppercase", letterSpacing:0.8 }}>
          {offresProches.length} offre{offresProches.length>1?"s":""} {userPos?`à moins de ${rayon}km`:"disponibles"}
        </div>
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ background:"white", borderRadius:DS.radius.md, height:72, marginBottom:10, boxShadow:DS.shadow.sm, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }} />
          </div>
        ))}
        {!loading && offresProches.slice(0,15).map(o => {
          const d = userPos && o.latitude ? haversine(userPos.lat,userPos.lng,o.latitude,o.longitude) : null;
          return (
            <Link key={o.id} to={`/OffreDetail?id=${o.id}`} style={{ textDecoration:"none", display:"block" }}>
              <div
                onClick={() => { setSelected(o); leafletMap.current?.panTo([o.latitude, o.longitude]); }}
                style={{
                  background: selected?.id===o.id ? "#FFF5EE" : "white",
                  borderRadius:DS.radius.md, padding:"12px 14px", marginBottom:8,
                  display:"flex", alignItems:"center", gap:12,
                  boxShadow: selected?.id===o.id ? `0 2px 12px ${DS.primary}33` : DS.shadow.sm,
                  border: selected?.id===o.id ? `1.5px solid ${DS.primary}` : `1.5px solid transparent`,
                  transition:"all 0.2s"
                }}
              >
                <img src={o.image_url} alt={o.titre} loading="lazy"
                  style={{ width:54, height:54, borderRadius:DS.radius.md, objectFit:"cover", flexShrink:0 }}
                  onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}
                />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:DS.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
                  <div style={{ fontSize:11, color:DS.textSub, marginTop:2 }}>{o.commercant_nom} {d?`· 📍${formatDist(d)}`:""}</div>
                </div>
                <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                  <span style={{ background:o.valeur_reduction>=40?DS.danger:DS.primary, color:"white", borderRadius:DS.radius.full, padding:"3px 9px", fontSize:12, fontWeight:800 }}>
                    -{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}
                  </span>
                  {o.prix_promo>0 && <span style={{ fontSize:13, fontWeight:800, color:DS.primary }}>{o.prix_promo}€</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <NavBar active="carte" />

      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes mapPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
