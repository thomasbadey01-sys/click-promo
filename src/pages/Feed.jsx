import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { CPLogo, DS } from "./Home";

const CATEGORIES = ["Tout", "Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Pharmacie", "Services"];
const CAT_ICONS = { "Tout":"🏷️","Restaurant":"🍽️","Boutique":"🛍️","Beauté & Coiffure":"💇","Fitness & Sport":"💪","Services":"🔧","Épicerie":"🥖","Pharmacie":"💊","Autre":"📦" };

export function haversine(lat1,lon1,lat2,lon2){const R=6371;const dLat=((lat2-lat1)*Math.PI)/180;const dLon=((lon2-lon1)*Math.PI)/180;const a=Math.sin(dLat/2)**2+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
export function formatDist(km){if(km<1)return`${Math.round(km*1000)}m`;return`${km.toFixed(1)}km`;}

// NavBar partagée — design system
export function NavBar({ active }) {
  const navigate = useNavigate();
  const tabs = [
    { key:"feed", icon:"🏷️", label:"Offres", path:"/Feed" },
    { key:"carte", icon:"🗺️", label:"Carte", path:"/Carte" },
    { key:"favoris", icon:"❤️", label:"Favoris", path:"/Favoris" },
    { key:"profil", icon:"👤", label:"Profil", path:"/Profil" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:430,
      background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px) saturate(180%)",
      borderTop:`1px solid ${DS.border}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom,12px)",
      zIndex:1000, boxShadow:"0 -1px 0 rgba(0,0,0,0.06)"
    }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => navigate(t.path)} style={{
          flex:1, background:"none", border:"none", cursor:"pointer",
          padding:"10px 4px 4px", display:"flex", flexDirection:"column",
          alignItems:"center", gap:3
        }}>
          <div style={{
            fontSize:22, lineHeight:1,
            filter: active===t.key ? "none" : "grayscale(100%) opacity(0.5)"
          }}>{t.icon}</div>
          <div style={{
            fontSize:10, fontWeight: active===t.key ? 700 : 500,
            color: active===t.key ? DS.primary : DS.textMuted,
            fontFamily: DS.font
          }}>{t.label}</div>
          {active===t.key && (
            <div style={{ width:4, height:4, borderRadius:"50%", background:DS.primary, marginTop:1 }} />
          )}
        </button>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background:"white", borderRadius:DS.radius.lg, overflow:"hidden", boxShadow:DS.shadow.sm, marginBottom:14 }}>
      <div style={{ height:180, background:"linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }} />
      <div style={{ padding:"14px 16px 16px" }}>
        {[["60%","12px"],["90%","16px"],["40%","12px"]].map(([w,h],i) => (
          <div key={i} style={{ height:h, background:"#f0f0f0", borderRadius:6, width:w, marginBottom:i<2?8:0 }} />
        ))}
      </div>
    </div>
  );
}

function CountdownTimer({ dateFin }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [critical, setCritical] = useState(false);
  useEffect(() => {
    const update = () => {
      const diff = new Date(dateFin) - new Date();
      if (diff <= 0) { setTimeLeft("Expirée"); return; }
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      setCritical(diff < 3600000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [dateFin]);
  return (
    <span style={{
      background: critical ? DS.danger : DS.primary,
      color:"white", padding:"3px 10px", borderRadius:DS.radius.full,
      fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:4,
      boxShadow: critical ? "0 2px 8px rgba(255,59,48,0.5)" : "0 2px 8px rgba(255,107,0,0.4)",
      animation: critical ? "criticalPulse 1s infinite" : "none"
    }}>
      ⏱ {timeLeft}
    </span>
  );
}

function OffreCard({ offre, favs, onToggleFav, userPos, onFavChange }) {
  const isFav = favs.includes(offre.id);
  const stockPct = offre.stock_initial ? (offre.stock_restant/offre.stock_initial)*100 : 100;
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;
  const [imgErr, setImgErr] = useState(false);

  const toggleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    onToggleFav(offre.id);
    if (navigator.vibrate) navigator.vibrate(12);
    onFavChange(!isFav, offre.titre);
  };

  return (
    <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{
        background: DS.card, borderRadius: DS.radius.lg, overflow:"hidden",
        boxShadow: DS.shadow.sm, marginBottom:14,
        transition:"transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=DS.shadow.md; }}
        onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=DS.shadow.sm; }}
      >
        {/* Image */}
        <div style={{ position:"relative", height:185, overflow:"hidden" }}>
          <img
            src={imgErr ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" : offre.image_url}
            alt={offre.titre} loading="lazy" onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s" }}
          />
          {/* Gradient overlay bas */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(transparent, rgba(0,0,0,0.35))" }} />

          {/* Badge réduction */}
          <div style={{
            position:"absolute", top:12, left:12,
            background: offre.valeur_reduction >= 40 ? DS.danger : DS.primary,
            color:"white", borderRadius:DS.radius.full, padding:"5px 13px",
            fontWeight:900, fontSize:14, boxShadow:"0 2px 8px rgba(0,0,0,0.25)",
            letterSpacing:-0.3
          }}>
            -{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}
          </div>

          {/* Bouton favori */}
          <button onClick={toggleFav} style={{
            position:"absolute", top:10, right:12,
            background:"rgba(255,255,255,0.93)", border:"none",
            borderRadius:"50%", width:38, height:38, fontSize:18, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 8px rgba(0,0,0,0.18)",
            transform: isFav ? "scale(1.15)" : "scale(1)",
            transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
            {isFav ? "❤️" : "🤍"}
          </button>

          {/* Timer urgence */}
          {offre.est_urgente && (
            <div style={{ position:"absolute", bottom:10, left:12 }}>
              <CountdownTimer dateFin={offre.date_fin} />
            </div>
          )}

          {/* Distance */}
          {dist !== null && (
            <div style={{
              position:"absolute", bottom:10, right:12,
              background:"rgba(0,0,0,0.52)", color:"white",
              borderRadius:DS.radius.full, padding:"3px 9px", fontSize:11, fontWeight:600
            }}>
              📍 {formatDist(dist)}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div style={{ padding:"13px 15px 15px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
            <span style={{ fontSize:13 }}>{CAT_ICONS[offre.categorie]||"🏷️"}</span>
            <span style={{ fontSize:11, color:DS.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{offre.categorie}</span>
            {!dist && offre.ville && (
              <span style={{ fontSize:11, color:DS.textMuted, marginLeft:"auto" }}>📍 {offre.ville}</span>
            )}
          </div>

          <div style={{ fontWeight:700, fontSize:15, color:DS.text, marginBottom:3, lineHeight:1.3, letterSpacing:-0.2 }}>
            {offre.titre}
          </div>
          <div style={{ fontSize:12, color:DS.textSub, marginBottom:11 }}>{offre.commercant_nom}</div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:7 }}>
              {offre.prix_promo > 0 && (
                <span style={{ fontSize:21, fontWeight:900, color:DS.primary, letterSpacing:-0.5 }}>
                  {offre.prix_promo}€
                </span>
              )}
              {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
                <span style={{ fontSize:13, color:DS.textMuted, textDecoration:"line-through" }}>{offre.prix_original}€</span>
              )}
              {offre.prix_promo === 0 && (
                <span style={{ fontSize:16, fontWeight:800, color:DS.success }}>Gratuit</span>
              )}
            </div>

            {offre.stock_restant != null && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color: stockPct<30 ? DS.danger : DS.textMuted, fontWeight:600, marginBottom:3 }}>
                  {offre.stock_restant} restant{offre.stock_restant>1?"s":""}
                </div>
                <div style={{ background:DS.border, borderRadius:DS.radius.full, height:4, width:68 }}>
                  <div style={{
                    background: stockPct<30 ? DS.danger : DS.success,
                    height:"100%", borderRadius:DS.radius.full,
                    width:`${Math.min(stockPct,100)}%`, transition:"width 0.8s"
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Feed() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categorie, setCategorie] = useState("Tout");
  const [favs, setFavs] = useState(() => { try { return JSON.parse(localStorage.getItem("cp_favs")||"[]"); } catch { return []; } });
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState("proximite");
  const [userPos, setUserPos] = useState(null);
  const [toast, setToast] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat:p.coords.latitude, lng:p.coords.longitude }),
      () => {}, { enableHighAccuracy:true, timeout:8000 }
    );
  }, []);

  const loadOffres = async () => {
    const data = await Offre.list();
    setOffres(data.filter(o => o.est_active));
  };

  useEffect(() => { loadOffres().finally(() => setLoading(false)); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadOffres();
    setRefreshing(false);
    if (navigator.vibrate) navigator.vibrate([10,30,10]);
  };

  const toggleFav = (id) => {
    const nf = favs.includes(id) ? favs.filter(f=>f!==id) : [...favs,id];
    setFavs(nf);
    localStorage.setItem("cp_favs", JSON.stringify(nf));
  };

  const showToast = (added, title) => {
    setToast({ added, title });
    setTimeout(() => setToast(null), 2500);
  };

  // Pull to refresh
  const onTouchStart = e => setTouchStart(e.touches[0].clientY);
  const onTouchEnd = e => {
    if (touchStart && e.changedTouches[0].clientY - touchStart > 70 && scrollRef.current?.scrollTop === 0) {
      refresh();
    }
    setTouchStart(null);
  };

  const withDist = offres.map(o => ({
    ...o, dist: userPos && o.latitude ? haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) : null
  }));

  let filtered = withDist.filter(o => {
    if (categorie !== "Tout" && o.categorie !== categorie) return false;
    if (recherche && !o.titre.toLowerCase().includes(recherche.toLowerCase()) && !o.commercant_nom?.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  if (tri === "proximite" && userPos) filtered.sort((a,b) => (a.dist||999)-(b.dist||999));
  else if (tri === "reduction") filtered.sort((a,b) => b.valeur_reduction-a.valeur_reduction);
  else if (tri === "urgence") filtered.sort((a,b) => (b.est_urgente?1:0)-(a.est_urgente?1:0));
  else if (tri === "stock") filtered.sort((a,b) => (a.stock_restant||99)-(b.stock_restant||99));

  const urgentes = filtered.filter(o => o.est_urgente);
  const normales = filtered.filter(o => !o.est_urgente);

  return (
    <div ref={scrollRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{ background:DS.bg, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto", overflowX:"hidden" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
          background: toast.added ? DS.primary : "#555",
          color:"white", borderRadius:DS.radius.full, padding:"10px 20px",
          fontSize:13, fontWeight:600, zIndex:9999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          display:"flex", alignItems:"center", gap:8,
          animation:"slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)"
        }}>
          {toast.added ? "❤️" : "🤍"} {toast.added ? "Ajouté aux favoris" : "Retiré des favoris"}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: DS.gradient, padding:"52px 20px 0",
        position:"sticky", top:0, zIndex:100
      }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <CPLogo size={34} white />
            <div>
              <div style={{ color:"white", fontSize:18, fontWeight:900, letterSpacing:-0.5, lineHeight:1.1 }}>Click & Promo</div>
              <div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>
                {userPos ? "📍 Offres près de vous" : "📍 Toute la France"}
              </div>
            </div>
          </div>
          <button onClick={refresh} style={{
            background:"rgba(255,255,255,0.18)", border:"none", borderRadius:DS.radius.full,
            width:38, height:38, cursor:"pointer", fontSize:17, color:"white",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation: refreshing ? "spin 0.8s linear infinite" : "none"
          }}>↻</button>
        </div>

        {/* Barre de recherche */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
          <input
            placeholder="Rechercher une offre, un commerce..."
            value={recherche} onChange={e => setRecherche(e.target.value)}
            style={{
              width:"100%", border:"none", borderRadius:DS.radius.md,
              padding:"12px 14px 12px 42px", fontSize:14,
              background:"rgba(255,255,255,0.95)", color:DS.text,
              boxSizing:"border-box", fontFamily:DS.font, outline:"none",
              boxShadow:"0 2px 12px rgba(0,0,0,0.12)"
            }}
          />
        </div>

        {/* Filtres catégories */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:14, scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategorie(cat)} style={{
              flexShrink:0, background: categorie===cat ? "white" : "rgba(255,255,255,0.18)",
              color: categorie===cat ? DS.primary : "rgba(255,255,255,0.85)",
              border:"none", borderRadius:DS.radius.full, padding:"8px 14px",
              fontSize:12, fontWeight: categorie===cat ? 700 : 500, cursor:"pointer",
              display:"flex", alignItems:"center", gap:5, transition:"all 0.2s",
              boxShadow: categorie===cat ? "0 2px 8px rgba(0,0,0,0.15)" : "none"
            }}>
              <span>{CAT_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>

        {/* Tri */}
        <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", scrollbarWidth:"none" }}>
          {[
            { key:"proximite", label:"📍 Distance" },
            { key:"reduction", label:"🔥 Réduction" },
            { key:"urgence", label:"⚡ Flash" },
            { key:"stock", label:"📦 Stock faible" },
          ].map(t => (
            <button key={t.key} onClick={() => setTri(t.key)} style={{
              flexShrink:0, background: tri===t.key ? DS.primary : "white",
              color: tri===t.key ? "white" : DS.textSub,
              border:`1.5px solid ${tri===t.key ? DS.primary : DS.border}`,
              borderRadius:DS.radius.full, padding:"7px 13px",
              fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s",
              boxShadow: tri===t.key ? `0 2px 8px ${DS.primary}44` : "none"
            }}>{t.label}</button>
          ))}
        </div>

        {/* Offres flash */}
        {!loading && urgentes.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ background:DS.danger, borderRadius:DS.radius.full, padding:"4px 12px", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:12 }}>⚡</span>
                <span style={{ color:"white", fontSize:12, fontWeight:700 }}>FLASH DEALS</span>
              </div>
              <span style={{ fontSize:12, color:DS.textMuted }}>{urgentes.length} offre{urgentes.length>1?"s":""}</span>
            </div>
            {urgentes.map(o => <OffreCard key={o.id} offre={o} favs={favs} onToggleFav={toggleFav} userPos={userPos} onFavChange={showToast} />)}
          </div>
        )}

        {/* Toutes les offres */}
        {!loading && normales.length > 0 && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:DS.textSub, marginBottom:12, textTransform:"uppercase", letterSpacing:0.8 }}>
              {filtered.length} offre{filtered.length>1?"s":""} disponible{filtered.length>1?"s":""}
            </div>
            {normales.map(o => <OffreCard key={o.id} offre={o} favs={favs} onToggleFav={toggleFav} userPos={userPos} onFavChange={showToast} />)}
          </div>
        )}

        {/* Skeleton */}
        {loading && [1,2,3].map(i => <SkeletonCard key={i} />)}

        {/* Vide */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 24px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <div style={{ fontWeight:700, fontSize:17, color:DS.text, marginBottom:8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize:14, color:DS.textSub, lineHeight:1.6 }}>Essayez une autre catégorie ou attendez de nouvelles offres.</div>
            <button onClick={() => { setCategorie("Tout"); setRecherche(""); }} style={{
              marginTop:20, background:DS.gradient, color:"white", border:"none",
              borderRadius:DS.radius.lg, padding:"13px 28px", fontWeight:700, fontSize:14, cursor:"pointer",
              boxShadow:`0 4px 16px ${DS.primary}44`
            }}>Voir toutes les offres</button>
          </div>
        )}
      </div>

      <NavBar active="feed" />

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes criticalPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
