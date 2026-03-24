import { useState, useEffect } from "react";
import { Offre } from "../api/entities";
import { Link, useSearchParams } from "react-router-dom";

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2-lat1)*Math.PI)/180, dLon = ((lon2-lon1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function formatDist(km) { return km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`; }

function CountdownTimer({ dateFin }) {
  const [t, setT] = useState({ h:0, m:0, s:0, expired:false });
  useEffect(() => {
    const update = () => {
      const diff = new Date(dateFin) - new Date();
      if (diff <= 0) { setT({ h:0,m:0,s:0,expired:true }); return; }
      setT({ h:Math.floor(diff/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000), expired:false });
    };
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, [dateFin]);
  if (t.expired) return <div style={{ textAlign:"center", padding:12, background:"#f8f8f8", borderRadius:12, color:"#999" }}>Offre expirée</div>;
  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
      {[{val:String(t.h).padStart(2,"0"),label:"heures"},{val:String(t.m).padStart(2,"0"),label:"min"},{val:String(t.s).padStart(2,"0"),label:"sec"}].map((u,i) => (
        <div key={i} style={{ textAlign:"center" }}>
          <div style={{ background:"#FF3B30", color:"white", borderRadius:10, padding:"8px 14px", fontSize:24, fontWeight:800, minWidth:52 }}>{u.val}</div>
          <div style={{ fontSize:11, color:"#888", marginTop:3 }}>{u.label}</div>
        </div>
      ))}
    </div>
  );
}

// Composant notation post-utilisation
function NotationOffre({ offreId, onNote }) {
  const [note, setNote] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [done, setDone] = useState(false);
  if (done) return (
    <div style={{ textAlign:"center", padding:14, background:"#F0FFF4", borderRadius:12, color:"#34C759", fontWeight:600 }}>
      ✅ Merci pour votre avis !
    </div>
  );
  return (
    <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", textAlign:"center" }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Comment était cette offre ?</div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:10 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => { setNote(n); setDone(true); onNote && onNote(n); }}
            style={{ background:"none", border:"none", fontSize:28, cursor:"pointer", opacity:(hovered||note)>=n ? 1 : 0.3, transition:"opacity 0.15s" }}>
            ⭐
          </button>
        ))}
      </div>
      <div style={{ fontSize:12, color:"#aaa" }}>Votre avis aide les autres utilisateurs</div>
    </div>
  );
}

// Offres similaires (même catégorie)
function OffresSimilaires({ offreId, categorie }) {
  const [similaires, setSimilaires] = useState([]);
  useEffect(() => {
    Offre.list().then(all => {
      setSimilaires(all.filter(o => o.id !== offreId && o.categorie === categorie && o.est_active).slice(0,3));
    });
  }, [offreId, categorie]);
  if (!similaires.length) return null;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>🔍 Offres similaires</div>
      {similaires.map(o => (
        <Link key={o.id} to={`/OffreDetail?id=${o.id}`} style={{ textDecoration:"none" }}>
          <div style={{ background:"white", borderRadius:12, display:"flex", gap:10, padding:10, marginBottom:8, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <img src={o.image_url} alt={o.titre} loading="lazy"
              style={{ width:56, height:56, borderRadius:8, objectFit:"cover", flexShrink:0 }}
              onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=60"}
            />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
              <div style={{ fontSize:11, color:"#888" }}>{o.commercant_nom}</div>
            </div>
            <div style={{ flexShrink:0, fontWeight:800, fontSize:15, color:"#FF3B30" }}>-{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function OffreDetail() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeVisible, setCodeVisible] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [utilisee, setUtilisee] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [partageOk, setPartageOk] = useState(false);
  const [noteDone, setNoteDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    Offre.get(id).then(data => {
      setOffre(data);
      setLoading(false);
      const favs = JSON.parse(localStorage.getItem("cp_favs") || "[]");
      setIsFav(favs.includes(id));
      Offre.update(id, { nb_vues: (data.nb_vues||0)+1 }).catch(()=>{});
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => setUserPos({ lat:p.coords.latitude, lng:p.coords.longitude }), ()=>{});
    }
  }, [id]);

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("cp_favs")||"[]");
    const newFavs = isFav ? favs.filter(f=>f!==id) : [...favs, id];
    localStorage.setItem("cp_favs", JSON.stringify(newFavs));
    setIsFav(!isFav);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const utiliserOffre = () => {
    setCodeVisible(true);
    setUtilisee(true);
    if (navigator.vibrate) navigator.vibrate([50,30,50]);
    if (offre) {
      Offre.update(id, {
        nb_clics: (offre.nb_clics||0)+1,
        nb_conversions: (offre.nb_conversions||0)+1,
        stock_restant: Math.max(0, (offre.stock_restant||0)-1)
      }).catch(()=>{});
    }
  };

  const ouvrirNavigation = () => {
    if (!offre?.latitude) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${offre.latitude},${offre.longitude}&travelmode=walking`, "_blank");
  };

  const partager = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: offre.titre, text: `${offre.titre} — -${offre.valeur_reduction}% chez ${offre.commercant_nom} !`, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setPartageOk(true);
      setTimeout(() => setPartageOk(false), 2000);
    }
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"#f8f8f8", flexDirection:"column", gap:12 }}>
      <div style={{ width:60, height:60, borderRadius:"50%", border:"4px solid #f0f0f0", borderTop:"4px solid #FF6B00", animation:"spin 0.8s linear infinite" }} />
      <div style={{ color:"#aaa", fontSize:14 }}>Chargement...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!offre) return (
    <div style={{ textAlign:"center", padding:40, fontFamily:"system-ui" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>😕</div>
      <div style={{ color:"#666", marginBottom:16 }}>Offre introuvable</div>
      <Link to="/Feed" style={{ color:"#FF6B00", fontWeight:600 }}>← Retour aux offres</Link>
    </div>
  );

  const stockPct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial)*100 : 100;
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;
  const isExpired = offre.date_fin && new Date(offre.date_fin) < new Date();

  return (
    <div style={{ background:"#F8F8F8", minHeight:"100vh", fontFamily:"'SF Pro Display',-apple-system,sans-serif", maxWidth:430, margin:"0 auto" }}>
      {/* Hero */}
      <div style={{ position:"relative", height:280 }}>
        <img src={offre.image_url} alt={offre.titre} loading="lazy"
          style={{ width:"100%", height:"100%", objectFit:"cover" }}
          onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"}
        />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />

        <Link to="/Feed">
          <div style={{ position:"absolute", top:50, left:16, background:"rgba(255,255,255,0.9)", borderRadius:"50%", width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>←</div>
        </Link>
        <button onClick={partager} style={{ position:"absolute", top:50, right:60, background:"rgba(255,255,255,0.9)", border:"none", borderRadius:"50%", width:38, height:38, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
          {partageOk ? "✅" : "🔗"}
        </button>
        <button onClick={toggleFav} style={{ position:"absolute", top:50, right:16, background:"rgba(255,255,255,0.9)", border:"none", borderRadius:"50%", width:38, height:38, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
          {isFav ? "❤️" : "🤍"}
        </button>

        <div style={{ position:"absolute", bottom:16, left:16 }}>
          <div style={{ background: isExpired ? "#aaa" : "#FF3B30", color:"white", borderRadius:20, padding:"6px 14px", fontWeight:800, fontSize:16 }}>
            {isExpired ? "Expirée" : `-${offre.valeur_reduction}${offre.type_reduction==="pourcentage"?"%":"€"}`}
          </div>
        </div>
        {dist !== null && (
          <div style={{ position:"absolute", bottom:16, right:16, background:"rgba(0,0,0,0.6)", color:"white", borderRadius:12, padding:"5px 10px", fontSize:12, fontWeight:600 }}>
            📍 {formatDist(dist)} de vous
          </div>
        )}
      </div>

      <div style={{ padding:"20px 16px 130px" }}>
        {/* Alerte expirée */}
        {isExpired && (
          <div style={{ background:"#FFF3F0", border:"1px solid #FFD0C8", borderRadius:12, padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <span style={{ fontSize:13, color:"#FF3B30", fontWeight:600 }}>Cette offre est expirée</span>
          </div>
        )}

        {/* Titre & commerçant */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#FF6B00", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{offre.categorie}</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", margin:"0 0 8px", lineHeight:1.3 }}>{offre.titre}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {offre.commercant_logo && <img src={offre.commercant_logo} alt="" style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }} />}
            <span style={{ fontSize:14, color:"#333", fontWeight:600 }}>{offre.commercant_nom}</span>
            {offre.adresse && <span style={{ fontSize:13, color:"#aaa" }}>• {offre.adresse}</span>}
          </div>
        </div>

        {/* Prix — masquer si prix_promo = 0 et prix_original = 0 */}
        {(offre.prix_promo > 0 || offre.prix_original > 0) && (
          <div style={{ background:"white", borderRadius:14, padding:16, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div>
              <div style={{ fontSize:12, color:"#888", marginBottom:2 }}>Prix promotionnel</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                {offre.prix_promo > 0 && <span style={{ fontSize:28, fontWeight:800, color:"#FF3B30" }}>{offre.prix_promo}€</span>}
                {offre.prix_original > 0 && <span style={{ fontSize:16, color:"#aaa", textDecoration:"line-through" }}>{offre.prix_original}€</span>}
              </div>
            </div>
            {offre.prix_original > offre.prix_promo && offre.prix_promo > 0 && (
              <div style={{ textAlign:"center", background:"#FFF3F0", borderRadius:10, padding:"8px 12px" }}>
                <div style={{ fontSize:18, fontWeight:800, color:"#FF3B30" }}>-{(offre.prix_original-offre.prix_promo).toFixed(2)}€</div>
                <div style={{ fontSize:11, color:"#FF6B00" }}>économisés</div>
              </div>
            )}
          </div>
        )}

        {/* Compte à rebours */}
        {offre.est_urgente && !isExpired && (
          <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ textAlign:"center", marginBottom:12, fontWeight:700, color:"#FF3B30", fontSize:14 }}>🔥 Se termine dans :</div>
            <CountdownTimer dateFin={offre.date_fin} />
          </div>
        )}

        {/* Stock */}
        {offre.stock_restant !== undefined && offre.stock_restant !== null && (
          <div style={{ background:"white", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#333" }}>Stock disponible</span>
              <span style={{ fontSize:13, fontWeight:700, color:stockPct<30?"#FF3B30":"#34C759" }}>{offre.stock_restant} / {offre.stock_initial}</span>
            </div>
            <div style={{ background:"#f0f0f0", borderRadius:6, height:8 }}>
              <div style={{ background:stockPct<30?"#FF3B30":"#34C759", height:"100%", borderRadius:6, width:`${Math.min(stockPct,100)}%`, transition:"width 0.3s" }} />
            </div>
            {stockPct < 30 && <div style={{ fontSize:12, color:"#FF3B30", marginTop:6, fontWeight:600 }}>⚠️ Plus que {offre.stock_restant} disponible{offre.stock_restant>1?"s":""}  !</div>}
          </div>
        )}

        {/* Description */}
        <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>📝 Description</div>
          <div style={{ fontSize:14, color:"#555", lineHeight:1.7 }}>{offre.description}</div>
        </div>

        {/* Conditions */}
        {offre.conditions && (
          <div style={{ background:"#FFF9F0", borderRadius:14, padding:14, marginBottom:12, border:"1px solid #FFE5CC" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6, color:"#FF6B00" }}>⚠️ Conditions</div>
            <div style={{ fontSize:13, color:"#666", lineHeight:1.6 }}>{offre.conditions}</div>
          </div>
        )}

        {/* Navigation */}
        {offre.latitude && (
          <button onClick={ouvrirNavigation} style={{ width:"100%", background:"#F0F7FF", border:"1.5px solid #CCE4FF", borderRadius:14, padding:14, fontSize:14, fontWeight:600, color:"#007AFF", cursor:"pointer", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            🗺️ Itinéraire vers {offre.commercant_nom}
            {dist !== null && <span style={{ color:"#aaa", fontSize:13 }}>({formatDist(dist)})</span>}
          </button>
        )}

        {/* Stats */}
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          {[{icon:"👁",val:offre.nb_vues||0,label:"vues"},{icon:"👆",val:offre.nb_clics||0,label:"utilisations"},{icon:"✅",val:offre.nb_conversions||0,label:"conversions"}].map((s,i) => (
            <div key={i} style={{ flex:1, background:"white", borderRadius:12, padding:12, textAlign:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:18 }}>{s.icon}</div>
              <div style={{ fontWeight:700, fontSize:16 }}>{s.val}</div>
              <div style={{ fontSize:11, color:"#aaa" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Code promo révélé */}
        {codeVisible && (
          <div style={{ background:"linear-gradient(135deg,#FF6B00,#FF3B30)", borderRadius:16, padding:20, textAlign:"center", marginBottom:16 }}>
            <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, marginBottom:10 }}>📱 Montrez ce code au commerçant</div>
            <div style={{ background:"white", borderRadius:12, padding:"14px 20px", fontSize:24, fontWeight:800, letterSpacing:4, color:"#FF3B30", display:"inline-block", marginBottom:10 }}>
              {offre.code_promo || "CP-" + id?.slice(-6).toUpperCase()}
            </div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>
              ✅ Valide jusqu'au {offre.date_fin ? new Date(offre.date_fin).toLocaleDateString("fr-FR") : "—"}
            </div>
          </div>
        )}

        {/* Notation après utilisation */}
        {utilisee && !noteDone && (
          <NotationOffre offreId={id} onNote={() => setNoteDone(true)} />
        )}

        {/* Offres similaires */}
        <OffresSimilaires offreId={id} categorie={offre.categorie} />
      </div>

      {/* CTA fixe */}
      {!utilisee && !isExpired && (
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"white", padding:"12px 16px env(safe-area-inset-bottom, 20px)", boxShadow:"0 -4px 20px rgba(0,0,0,0.1)" }}>
          <button onClick={utiliserOffre} style={{ width:"100%", background:"linear-gradient(135deg,#FF6B00,#FF3B30)", color:"white", border:"none", borderRadius:14, padding:16, fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(255,107,0,0.4)" }}>
            🎁 Profiter de cette offre
          </button>
        </div>
      )}
      {isExpired && (
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"white", padding:"12px 16px env(safe-area-inset-bottom, 20px)", boxShadow:"0 -4px 20px rgba(0,0,0,0.1)" }}>
          <Link to="/Feed" style={{ textDecoration:"none" }}>
            <div style={{ width:"100%", background:"#f5f5f5", color:"#888", border:"none", borderRadius:14, padding:16, fontSize:15, fontWeight:600, textAlign:"center" }}>
              ← Voir d'autres offres
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
