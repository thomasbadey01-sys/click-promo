import { useState, useEffect, useRef } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

const CAT_COLORS = {
  "Restaurant": "#FF6B00",
  "Boutique": "#AF52DE",
  "Beauté & Coiffure": "#FF2D55",
  "Fitness & Sport": "#34C759",
  "Services": "#007AFF",
  "Épicerie": "#FF9500",
  "Pharmacie": "#30B0C7",
  "Autre": "#8E8E93"
};

const CAT_ICONS = {
  "Restaurant": "🍽️",
  "Boutique": "🛍️",
  "Beauté & Coiffure": "💇",
  "Fitness & Sport": "💪",
  "Services": "🔧",
  "Épicerie": "🥖",
  "Pharmacie": "💊",
  "Autre": "📦"
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function Carte() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [offres, setOffres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [rayon, setRayon] = useState(5);

  // Charger les offres
  useEffect(() => {
    Offre.list().then(data => {
      setOffres(data.filter(o => o.est_active && o.latitude && o.longitude));
      setLoading(false);
    });
  }, []);

  // Charger Leaflet dynamiquement
  useEffect(() => {
    if (mapReady) return;

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // Initialiser la carte une fois Leaflet + DOM prêts
  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [48.8566, 2.3522],
      zoom: 14,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    leafletMap.current = map;
  }, [mapReady]);

  // Mettre à jour les marqueurs quand offres ou userPos change
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const L = window.L;
    const map = leafletMap.current;

    // Supprimer anciens marqueurs
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Filtrer par rayon si on a la position
    const offresFiltered = userPos
      ? offres.filter(o => haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) <= rayon)
      : offres;

    offresFiltered.forEach(offre => {
      const color = CAT_COLORS[offre.categorie] || "#FF6B00";
      const icon = CAT_ICONS[offre.categorie] || "🏷️";
      const dist = userPos
        ? formatDist(haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude))
        : "";

      const customIcon = L.divIcon({
        html: `<div style="
          background:${color};color:white;border-radius:20px;
          padding:5px 10px;font-size:12px;font-weight:700;
          white-space:nowrap;box-shadow:0 3px 10px ${color}80;
          border:2px solid white;cursor:pointer;
        ">${icon} -${offre.valeur_reduction}${offre.type_reduction === "pourcentage" ? "%" : "€"}${dist ? ` · ${dist}` : ""}</div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};margin:0 auto;"></div>`,
        className: "",
        iconAnchor: [40, 36],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([offre.latitude, offre.longitude], { icon: customIcon })
        .addTo(map)
        .on("click", () => setSelected(offre));

      markersRef.current.push(marker);
    });

    // Marqueur utilisateur
    if (userPos) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const userIcon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;background:#007AFF;border-radius:50%;
          border:3px solid white;box-shadow:0 0 0 8px rgba(0,122,255,0.2);
        "></div>`,
        className: "",
        iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map);
      map.setView([userPos.lat, userPos.lng], 14);
    }
  }, [offres, userPos, mapReady, rayon]);

  const getLocation = () => {
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError("Localisation refusée. Activez le GPS pour voir les offres proches.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const offresProches = userPos
    ? [...offres]
        .map(o => ({ ...o, dist: haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) }))
        .filter(o => o.dist <= rayon)
        .sort((a, b) => a.dist - b.dist)
    : offres;

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #FF6B00, #FF3B30)", padding: "50px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>🗺️ Carte des offres</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
              {offresProches.length} offre{offresProches.length > 1 ? "s" : ""} {userPos ? `dans un rayon de ${rayon}km` : "disponibles"}
            </div>
          </div>
          <button
            onClick={getLocation}
            disabled={geoLoading}
            style={{
              background: userPos ? "rgba(52,199,89,0.3)" : "rgba(255,255,255,0.2)",
              border: "none", borderRadius: 12, padding: "8px 14px",
              color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            {geoLoading ? "⏳" : userPos ? "✅" : "📍"} {geoLoading ? "..." : userPos ? "Localisé" : "Me localiser"}
          </button>
        </div>

        {/* Slider rayon */}
        {userPos && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>
              Rayon : <strong style={{ color: "white" }}>{rayon} km</strong>
            </div>
            <input
              type="range" min={1} max={20} value={rayon}
              onChange={e => setRayon(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "white" }}
            />
          </div>
        )}
      </div>

      {/* Erreur géo */}
      {geoError && (
        <div style={{ background: "#FFF3F0", padding: "10px 16px", borderBottom: "1px solid #FFE5CC" }}>
          <div style={{ fontSize: 13, color: "#FF3B30" }}>⚠️ {geoError}</div>
        </div>
      )}

      {/* Carte Leaflet */}
      <div ref={mapRef} style={{ height: selected ? "40vh" : "55vh", width: "100%" }}>
        {!mapReady && (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#e8f0e8" }}>
            <div style={{ textAlign: "center", color: "#666" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
              <div>Chargement de la carte...</div>
            </div>
          </div>
        )}
      </div>

      {/* Offre sélectionnée */}
      {selected && (
        <div style={{ padding: "12px 16px 0" }}>
          <Link to={`/OffreDetail?id=${selected.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: 16, padding: 14,
              display: "flex", gap: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              border: "2px solid #FF6B00"
            }}>
              <img src={selected.image_url} alt={selected.titre}
                style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 2 }}>{selected.titre}</div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                  {selected.commercant_nom}
                  {userPos && ` · ${formatDist(haversine(userPos.lat, userPos.lng, selected.latitude, selected.longitude))}`}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "#FF3B30", color: "white", borderRadius: 10, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>
                    -{selected.valeur_reduction}{selected.type_reduction === "pourcentage" ? "%" : "€"}
                  </span>
                  {selected.est_urgente && <span style={{ fontSize: 12, color: "#FF3B30", fontWeight: 600 }}>🔥</span>}
                  <span style={{ fontSize: 12, color: "#007AFF", marginLeft: "auto" }}>Voir l'offre →</span>
                </div>
              </div>
            </div>
          </Link>
          <button onClick={() => setSelected(null)} style={{
            display: "block", margin: "8px auto 0", background: "none",
            border: "none", color: "#aaa", fontSize: 13, cursor: "pointer"
          }}>✕ Fermer</button>
        </div>
      )}

      {/* Liste proximité */}
      <div style={{ padding: "14px 16px 100px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#1a1a1a" }}>
          📍 {userPos ? "Offres à proximité" : "Toutes les offres"}
        </div>

        {loading && <div style={{ textAlign: "center", padding: 30, color: "#999" }}>Chargement...</div>}

        {!loading && offresProches.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div style={{ color: "#666", fontSize: 14 }}>Aucune offre dans ce rayon.</div>
            <div style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>Augmentez le rayon de recherche.</div>
          </div>
        )}

        {offresProches.map(offre => (
          <Link key={offre.id} to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${CAT_COLORS[offre.categorie] || "#FF6B00"}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0
              }}>
                {CAT_ICONS[offre.categorie]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {offre.titre}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>{offre.commercant_nom}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#FF3B30" }}>
                  -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                </div>
                <div style={{ fontSize: 11, color: userPos ? "#007AFF" : "#aaa", fontWeight: userPos ? 600 : 400 }}>
                  {offre.dist ? formatDist(offre.dist) : offre.ville}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <NavBar active="carte" />
    </div>
  );
}
