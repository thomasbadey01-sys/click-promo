import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { DS, CPLogo } from "./Home";
import { haversine, formatDist } from "./Feed";

function CountdownTimer({ dateFin }) {
  const [t, setT] = useState({ h:0, m:0, s:0, expired:false, critical:false });
  useEffect(() => {
    const update = () => {
      const diff = new Date(dateFin) - new Date();
      if (diff <= 0) { setT({ h:0,m:0,s:0,expired:true,critical:false }); return; }
      setT({ h:Math.floor(diff/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000), expired:false, critical: diff<3600000 });
    };
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, [dateFin]);

  if (t.expired) return (
    <div style={{ textAlign:"center", padding:14, background:"#f5f5f7", borderRadius:DS.radius.md, color:DS.textMuted, fontWeight:600 }}>
      ⏱ Offre expirée
    </div>
  );

  return (
    <div>
      <div style={{ fontSize:12, color:DS.textSub, fontWeight:600, textAlign:"center", marginBottom:10, textTransform:"uppercase", letterSpacing:0.8 }}>
        ⚡ Expire dans
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        {[
          { val:String(t.h).padStart(2,"0"), label:"heures" },
          { val:String(t.m).padStart(2,"0"), label:"min" },
          { val:String(t.s).padStart(2,"0"), label:"sec" }
        ].map((u,i) => (
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{
              background: t.critical ? DS.danger : DS.gradient,
              color:"white", borderRadius:DS.radius.md, padding:"10px 16px",
              fontSize:26, fontWeight:900, minWidth:58, lineHeight:1,
              boxShadow: t.critical ? "0 4px 16px rgba(255,59,48,0.4)" : "0 4px 16px rgba(255,107,0,0.35)",
              animation: t.critical ? "criticalPulse 1s infinite" : "none"
            }}>{u.val}</div>
            <div style={{ fontSize:10, color:DS.textMuted, marginTop:4, fontWeight:500 }}>{u.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRating({ onRate }) {
  const [hovered, setHovered] = useState(0);
  const [rated, setRated] = useState(0);
  const [done, setDone] = useState(false);

  if (done) return (
    <div style={{ textAlign:"center", padding:16, background:"#F0FFF4", borderRadius:DS.radius.md, color:DS.success, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
      ✅ Merci pour votre avis !
    </div>
  );
  return (
    <div style={{ background:"white", borderRadius:DS.radius.md, padding:"16px", textAlign:"center", boxShadow:DS.shadow.sm }}>
      <div style={{ fontWeight:700, fontSize:14, color:DS.text, marginBottom:12 }}>Comment était cette offre ?</div>
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:10 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n}
            onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
            onClick={() => { setRated(n); setDone(true); onRate?.(n); }}
            style={{ background:"none", border:"none", fontSize:30, cursor:"pointer",
              transform: (hovered||rated)>=n ? "scale(1.2)" : "scale(1)",
              transition:"all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
              filter: (hovered||rated)>=n ? "none" : "grayscale(100%) opacity(0.35)"
            }}>⭐</button>
        ))}
      </div>
      <div style={{ fontSize:12, color:DS.textMuted }}>Votre avis aide les autres utilisateurs</div>
    </div>
  );
}

function OffresSimilaires({ offreId, categorie }) {
  const [similaires, setSimilaires] = useState([]);
  useEffect(() => {
    Offre.list().then(all =>
      setSimilaires(all.filter(o => o.id!==offreId && o.categorie===categorie && o.est_active).slice(0,3))
    );
  }, [offreId, categorie]);
  if (!similaires.length) return null;
  return (
    <div style={{ background:"white", borderRadius:DS.radius.lg, padding:16, boxShadow:DS.shadow.sm }}>
      <div style={{ fontWeight:700, fontSize:15, color:DS.text, marginBottom:12 }}>🔍 Offres similaires</div>
      {similaires.map(o => (
        <Link key={o.id} to={`/OffreDetail?id=${o.id}`} style={{ textDecoration:"none", display:"block" }}>
          <div style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${DS.border}` }}
            onMouseEnter={e => e.currentTarget.style.opacity="0.75"}
            onMouseLeave={e => e.currentTarget.style.opacity="1"}
          >
            <img src={o.image_url} alt={o.titre} loading="lazy"
              style={{ width:58, height:58, borderRadius:DS.radius.md, objectFit:"cover", flexShrink:0 }}
              onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=60"}
            />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13, color:DS.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
              <div style={{ fontSize:11, color:DS.textSub, marginTop:2 }}>{o.commercant_nom}</div>
              <div style={{ fontSize:12, fontWeight:800, color:DS.primary, marginTop:3 }}>{o.prix_promo > 0 ? `${o.prix_promo}€` : "Gratuit"}</div>
            </div>
            <div style={{
              flexShrink:0, alignSelf:"center",
              background: o.valeur_reduction>=40 ? DS.danger : DS.primary,
              color:"white", borderRadius:DS.radius.full, padding:"4px 10px",
              fontSize:12, fontWeight:800
            }}>-{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function OffreDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeVisible, setCodeVisible] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [utilisee, setUtilisee] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [partageOk, setPartageOk] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (!id) return;
    Offre.get(id).then(data => {
      setOffre(data);
      setLoading(false);
      const favs = JSON.parse(localStorage.getItem("cp_favs")||"[]");
      setIsFav(favs.includes(id));
      Offre.update(id, { nb_vues:(data.nb_vues||0)+1 }).catch(()=>{});
    });
    navigator.geolocation?.getCurrentPosition(p => setUserPos({ lat:p.coords.latitude, lng:p.coords.longitude }), ()=>{});
  }, [id]);

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("cp_favs")||"[]");
    const nf = isFav ? favs.filter(f=>f!==id) : [...favs,id];
    localStorage.setItem("cp_favs", JSON.stringify(nf));
    setIsFav(!isFav);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const utiliserOffre = () => {
    setCodeVisible(true); setUtilisee(true);
    if (navigator.vibrate) navigator.vibrate([40,20,40]);
    if (offre) Offre.update(id, {
      nb_clics:(offre.nb_clics||0)+1,
      nb_conversions:(offre.nb_conversions||0)+1,
      stock_restant:Math.max(0,(offre.stock_restant||0)-1)
    }).catch(()=>{});
  };

  const partager = async () => {
    if (navigator.share) {
      try { await navigator.share({ title:offre.titre, text:`${offre.titre} — -${offre.valeur_reduction}% chez ${offre.commercant_nom} !`, url:window.location.href }); } catch {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setPartageOk(true); setTimeout(()=>setPartageOk(false),2500);
    }
  };

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100vh", background:DS.bg, gap:16 }}>
      <CPLogo size={52} />
      <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${DS.border}`, borderTop:`3px solid ${DS.primary}`, animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!offre) return (
    <div style={{ textAlign:"center", padding:60, fontFamily:DS.font }}>
      <div style={{ fontSize:56, marginBottom:12 }}>😕</div>
      <div style={{ fontWeight:700, fontSize:18, color:DS.text, marginBottom:8 }}>Offre introuvable</div>
      <button onClick={()=>navigate("/Feed")} style={{ background:DS.gradient, color:"white", border:"none", borderRadius:DS.radius.lg, padding:"13px 28px", fontWeight:700, cursor:"pointer" }}>
        ← Retour aux offres
      </button>
    </div>
  );

  const stockPct = offre.stock_initial ? (offre.stock_restant/offre.stock_initial)*100 : 100;
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;
  const isExpired = offre.date_fin && new Date(offre.date_fin) < new Date();

  return (
    <div style={{ background:DS.bg, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Hero image */}
      <div style={{ position:"relative", height:300 }}>
        <img
          src={imgErr ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" : offre.image_url}
          alt={offre.titre} onError={()=>setImgErr(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover" }}
        />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />

        {/* Boutons flottants */}
        <button onClick={()=>navigate(-1)} style={{ position:"absolute", top:52, left:16, background:"rgba(255,255,255,0.92)", border:"none", borderRadius:"50%", width:40, height:40, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:DS.shadow.md }}>←</button>
        <button onClick={partager} style={{ position:"absolute", top:52, right:62, background:"rgba(255,255,255,0.92)", border:"none", borderRadius:"50%", width:40, height:40, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:DS.shadow.md }}>
          {partageOk ? "✅" : "🔗"}
        </button>
        <button onClick={toggleFav} style={{ position:"absolute", top:52, right:16, background:"rgba(255,255,255,0.92)", border:"none", borderRadius:"50%", width:40, height:40, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:DS.shadow.md, transform:isFav?"scale(1.1)":"scale(1)", transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Badge réduction */}
        <div style={{ position:"absolute", bottom:16, left:16, background:isExpired?"#888":(offre.valeur_reduction>=40?DS.danger:DS.primary), color:"white", borderRadius:DS.radius.full, padding:"7px 16px", fontWeight:900, fontSize:18, boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>
          {isExpired ? "Expirée" : `-${offre.valeur_reduction}${offre.type_reduction==="pourcentage"?"%":"€"}`}
        </div>

        {/* Distance */}
        {dist !== null && (
          <div style={{ position:"absolute", bottom:16, right:16, background:"rgba(0,0,0,0.55)", color:"white", borderRadius:DS.radius.full, padding:"6px 12px", fontSize:12, fontWeight:600 }}>
            📍 {formatDist(dist)}
          </div>
        )}
      </div>

      <div style={{ padding:"20px 16px 48px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Titre & infos */}
        <div style={{ background:"white", borderRadius:DS.radius.lg, padding:18, boxShadow:DS.shadow.sm }}>
          <div style={{ fontSize:11, color:DS.primary, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>
            {offre.categorie}
          </div>
          <div style={{ fontSize:22, fontWeight:900, color:DS.text, lineHeight:1.25, letterSpacing:-0.5, marginBottom:6 }}>
            {offre.titre}
          </div>
          <div style={{ fontSize:14, color:DS.textSub, marginBottom:14 }}>{offre.commercant_nom}</div>

          {/* Prix */}
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:14 }}>
            {offre.prix_promo > 0 ? (
              <span style={{ fontSize:34, fontWeight:900, color:DS.primary, letterSpacing:-1 }}>{offre.prix_promo}€</span>
            ) : (
              <span style={{ fontSize:28, fontWeight:900, color:DS.success }}>Gratuit 🎉</span>
            )}
            {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
              <span style={{ fontSize:17, color:DS.textMuted, textDecoration:"line-through" }}>{offre.prix_original}€</span>
            )}
            {offre.valeur_reduction > 0 && (
              <span style={{ background:"#FFF0E8", color:DS.primary, borderRadius:DS.radius.full, padding:"3px 10px", fontSize:13, fontWeight:700 }}>
                -{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}
              </span>
            )}
          </div>

          {/* Stock */}
          {offre.stock_restant != null && (
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:stockPct<30?DS.danger:DS.textSub, fontWeight:600 }}>
                  {stockPct<30?"🔥":"📦"} {offre.stock_restant} restant{offre.stock_restant>1?"s":""}
                </span>
                <span style={{ fontSize:12, color:DS.textMuted }}>sur {offre.stock_initial} initial</span>
              </div>
              <div style={{ background:DS.border, borderRadius:DS.radius.full, height:6, overflow:"hidden" }}>
                <div style={{ background:stockPct<30?DS.danger:DS.success, height:"100%", borderRadius:DS.radius.full, width:`${Math.min(stockPct,100)}%`, transition:"width 1s" }} />
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ fontSize:14, color:DS.textSub, lineHeight:1.7 }}>{offre.description}</div>
        </div>

        {/* Timer si urgente */}
        {offre.est_urgente && offre.date_fin && !isExpired && (
          <div style={{ background:"white", borderRadius:DS.radius.lg, padding:18, boxShadow:DS.shadow.sm }}>
            <CountdownTimer dateFin={offre.date_fin} />
          </div>
        )}

        {/* CTA Principal */}
        {!isExpired && (
          <div>
            {!codeVisible ? (
              <button onClick={utiliserOffre} style={{
                width:"100%", background:DS.gradient, color:"white", border:"none",
                borderRadius:DS.radius.lg, padding:"18px",
                fontSize:17, fontWeight:800, cursor:"pointer",
                boxShadow:`0 8px 28px rgba(255,107,0,0.45)`,
                letterSpacing:0.2, transition:"transform 0.15s, box-shadow 0.15s"
              }}
                onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
                onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
              >
                🎁 Utiliser cette offre
              </button>
            ) : (
              <div style={{ background:"white", borderRadius:DS.radius.lg, padding:18, textAlign:"center", boxShadow:DS.shadow.md, border:`2px solid ${DS.primary}` }}>
                <div style={{ fontSize:13, color:DS.textSub, marginBottom:10, fontWeight:600 }}>Code promo à présenter</div>
                <div style={{
                  background: "#FFF5EE", border:`2px dashed ${DS.primary}`,
                  borderRadius:DS.radius.md, padding:"16px",
                  fontSize:26, fontWeight:900, color:DS.primary, letterSpacing:4,
                  marginBottom:10
                }}>
                  {offre.code_promo || "CLICKPROMO"}
                </div>
                <div style={{ fontSize:12, color:DS.textMuted }}>Montrez ce code au commerçant</div>
                <button onClick={() => { navigator.clipboard?.writeText(offre.code_promo||"CLICKPROMO"); }} style={{
                  marginTop:10, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.radius.md,
                  padding:"8px 16px", fontSize:12, fontWeight:600, color:DS.primary, cursor:"pointer"
                }}>📋 Copier le code</button>
              </div>
            )}
          </div>
        )}

        {/* Expired CTA */}
        {isExpired && (
          <div style={{ background:"#f5f5f7", borderRadius:DS.radius.lg, padding:18, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⏱</div>
            <div style={{ fontWeight:700, color:DS.textSub, marginBottom:12 }}>Cette offre est expirée</div>
            <button onClick={()=>navigate("/Feed")} style={{ background:DS.gradient, color:"white", border:"none", borderRadius:DS.radius.lg, padding:"13px 24px", fontWeight:700, cursor:"pointer" }}>
              🔍 Voir d'autres offres
            </button>
          </div>
        )}

        {/* Lieu & navigation */}
        {offre.adresse && (
          <div style={{ background:"white", borderRadius:DS.radius.lg, padding:16, boxShadow:DS.shadow.sm }}>
            <div style={{ fontWeight:700, fontSize:14, color:DS.text, marginBottom:12 }}>📍 Où trouver cette offre</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:14, color:DS.text, fontWeight:500 }}>{offre.adresse}</div>
                <div style={{ fontSize:13, color:DS.textSub }}>{offre.ville}</div>
                {dist !== null && <div style={{ fontSize:12, color:DS.primary, fontWeight:600, marginTop:3 }}>📍 {formatDist(dist)} de vous</div>}
              </div>
              <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${offre.latitude},${offre.longitude}&travelmode=walking`,"_blank")} style={{
                background:DS.gradient, color:"white", border:"none", borderRadius:DS.radius.md,
                padding:"10px 14px", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0
              }}>
                🧭 Y aller
              </button>
            </div>
          </div>
        )}

        {/* Conditions */}
        {offre.conditions && (
          <div style={{ background:"#FFFBF0", borderRadius:DS.radius.md, padding:14, border:`1px solid #FFE5A0` }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#B8860B", marginBottom:6 }}>⚠️ Conditions</div>
            <div style={{ fontSize:13, color:"#7A6000", lineHeight:1.6 }}>{offre.conditions}</div>
          </div>
        )}

        {/* Notation post-utilisation */}
        {utilisee && <StarRating onRate={(n) => console.log("Note:", n)} />}

        {/* Offres similaires */}
        <OffresSimilaires offreId={id} categorie={offre.categorie} />
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes criticalPulse{0%,100%{opacity:1}50%{opacity:0.65}}
      `}</style>
    </div>
  );
}
