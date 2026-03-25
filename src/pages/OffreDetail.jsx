import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo } from "./Home";
import { haversine, formatDist } from "./Feed";

function Countdown({ dateFin }) {
  const [t, setT] = useState({ h:0,m:0,s:0,exp:false,crit:false });
  useEffect(() => {
    const u = () => {
      const d = new Date(dateFin) - new Date();
      if (d <= 0) { setT(x=>({...x,exp:true})); return; }
      setT({ h:Math.floor(d/3600000), m:Math.floor((d%3600000)/60000), s:Math.floor((d%60000)/1000), exp:false, crit:d<3600000 });
    };
    u(); const id = setInterval(u, 1000); return () => clearInterval(id);
  }, [dateFin]);

  if (t.exp) return (
    <div style={{ textAlign:"center", padding:16, background:DS.ink05, borderRadius:DS.md, color:DS.ink40, fontSize:13, fontWeight:600 }}>
      Offre expirée
    </div>
  );
  const col = t.crit ? DS.danger : DS.brand;
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:DS.ink40, textAlign:"center", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Expire dans</div>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        {[{v:String(t.h).padStart(2,"0"),l:"h"},{v:String(t.m).padStart(2,"0"),l:"min"},{v:String(t.s).padStart(2,"0"),l:"s"}].map((u,i) => (
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{ background:DS.ink, color:DS.white, borderRadius:DS.md, padding:"10px 16px", fontSize:28, fontWeight:800, minWidth:60, letterSpacing:-1, fontFamily:DS.font, fontVariantNumeric:"tabular-nums" }}>{u.v}</div>
            <div style={{ fontSize:10, color:DS.ink40, marginTop:5, fontWeight:500, textTransform:"uppercase", letterSpacing:0.8 }}>{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stars({ onRate }) {
  const [hov, setHov] = useState(0); const [done, setDone] = useState(false);
  if (done) return (
    <div style={{ textAlign:"center", padding:14, background:"#F0FFF9", borderRadius:DS.md, color:DS.success, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
      {Ic.check(DS.success, 16)} Merci pour votre avis
    </div>
  );
  return (
    <div style={{ background:DS.white, borderRadius:DS.lg, padding:18, boxShadow:DS.e1, textAlign:"center" }}>
      <div style={{ fontWeight:700, fontSize:14, color:DS.ink, marginBottom:14 }}>Comment était cette offre ?</div>
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:8 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={() => { setDone(true); onRate?.(n); }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:4, transform:hov>=n?"scale(1.3)":"scale(1)", transition:"transform .15s cubic-bezier(.34,1.56,.64,1)" }}>
            {Ic.star(DS.warning, 26, hov >= n)}
          </button>
        ))}
      </div>
      <div style={{ fontSize:11, color:DS.ink20 }}>Votre avis aide les autres</div>
    </div>
  );
}

function Similar({ offreId, categorie }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { Offre.list().then(all => setItems(all.filter(o => o.id!==offreId && o.categorie===categorie && o.est_active).slice(0,3))); }, [offreId, categorie]);
  if (!items.length) return null;
  return (
    <div style={{ background:DS.white, borderRadius:DS.xl, padding:18, boxShadow:DS.e1 }}>
      <div style={{ fontWeight:700, fontSize:14, color:DS.ink, marginBottom:14, letterSpacing:-0.2 }}>Offres similaires</div>
      {items.map((o,i) => (
        <div key={o.id} onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{ display:"flex", gap:12, padding:"10px 0", borderTop:i>0?`1px solid ${DS.ink05}`:"none", cursor:"pointer" }}>
          <img src={o.image_url} loading="lazy" alt={o.titre} style={{ width:52, height:52, borderRadius:DS.md, objectFit:"cover", flexShrink:0 }} onError={e=>e.target.style.display="none"}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:13, color:DS.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
            <div style={{ fontSize:11, color:DS.ink40, marginTop:2 }}>{o.commercant_nom}</div>
          </div>
          <div style={{ flexShrink:0, alignSelf:"center", background:`${DS.brand}12`, color:DS.brand, borderRadius:DS.sm, padding:"4px 10px", fontSize:12, fontWeight:800 }}>
            -{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OffreDetail() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const id = params.get("id");
  const [offre, setOffre] = useState(null); const [loading, setLoading] = useState(true);
  const [codeVis, setCodeVis] = useState(false); const [isFav, setIsFav] = useState(false);
  const [used, setUsed] = useState(false); const [userPos, setUserPos] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    Offre.get(id).then(d => {
      setOffre(d); setLoading(false);
      setIsFav(JSON.parse(localStorage.getItem("cp_favs")||"[]").includes(id));
      Offre.update(id, { nb_vues:(d.nb_vues||0)+1 }).catch(()=>{});
    });
    navigator.geolocation?.getCurrentPosition(p => setUserPos({ lat:p.coords.latitude, lng:p.coords.longitude }), ()=>{});
  }, [id]);

  const toggleFav = () => {
    const f = JSON.parse(localStorage.getItem("cp_favs")||"[]");
    const nf = isFav ? f.filter(x=>x!==id) : [...f,id];
    localStorage.setItem("cp_favs", JSON.stringify(nf)); setIsFav(!isFav);
    if (navigator.vibrate) navigator.vibrate(30);
  };
  const useOffer = () => {
    setCodeVis(true); setUsed(true);
    if (navigator.vibrate) navigator.vibrate([30,20,30]);
    if (offre) Offre.update(id, { nb_clics:(offre.nb_clics||0)+1, nb_conversions:(offre.nb_conversions||0)+1, stock_restant:Math.max(0,(offre.stock_restant||0)-1) }).catch(()=>{});
  };
  const copyCode = () => { navigator.clipboard?.writeText(offre.code_promo||"CLICKPROMO"); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title:offre.titre, url:window.location.href }); } catch {} } else { navigator.clipboard?.writeText(window.location.href); } };

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:DS.ink05, gap:16 }}>
      <CPLogo size={44}/>
      <div style={{ width:28, height:28, borderRadius:"50%", border:`2.5px solid ${DS.ink10}`, borderTop:`2.5px solid ${DS.brand}`, animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!offre) return (
    <div style={{ textAlign:"center", padding:60, fontFamily:DS.font }}>
      <div style={{ fontWeight:700, color:DS.ink, marginBottom:16 }}>Offre introuvable</div>
      <button onClick={() => navigate("/Feed")} style={{ background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"12px 24px", fontWeight:700, cursor:"pointer" }}>Retour</button>
    </div>
  );

  const pct = offre.stock_initial ? (offre.stock_restant/offre.stock_initial)*100 : 100;
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;
  const expired = offre.date_fin && new Date(offre.date_fin) < new Date();

  return (
    <div style={{ background:DS.ink05, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>
      {/* Hero */}
      <div style={{ position:"relative", height:340 }}>
        <img src={offre.image_url} alt={offre.titre}
          style={{ width:"100%", height:"100%", objectFit:"cover" }}
          onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"}
        />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)" }}/>

        {/* Boutons header */}
        <button onClick={() => navigate(-1)} style={{ position:"absolute", top:52, left:14, width:40, height:40, borderRadius:DS.pill, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)" }}>
          {Ic.back(DS.ink, 18)}
        </button>
        <button onClick={share} style={{ position:"absolute", top:52, right:58, width:40, height:40, borderRadius:DS.pill, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)" }}>
          {Ic.share(DS.ink, 17)}
        </button>
        <button onClick={toggleFav} style={{ position:"absolute", top:52, right:14, width:40, height:40, borderRadius:DS.pill, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)", transform:isFav?"scale(1.12)":"scale(1)", transition:"transform .2s cubic-bezier(.34,1.56,.64,1)" }}>
          {Ic.heart(isFav ? DS.danger : DS.ink60, 18, isFav)}
        </button>

        {/* Info bas image */}
        <div style={{ position:"absolute", bottom:18, left:16, right:16 }}>
          <div style={{ display:"inline-block", background:expired?"rgba(0,0,0,0.6)":(offre.valeur_reduction>=40?DS.danger:DS.ink), color:DS.white, borderRadius:DS.sm, padding:"6px 14px", fontWeight:800, fontSize:16, letterSpacing:-0.3, marginBottom:8 }}>
            {expired ? "Expirée" : `-${offre.valeur_reduction}${offre.type_reduction==="pourcentage"?"%":"€"}`}
          </div>
          {dist !== null && (
            <div style={{ float:"right", display:"inline-flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", color:DS.white, borderRadius:DS.pill, padding:"5px 11px", fontSize:11, fontWeight:600 }}>
              {Ic.pin(DS.white, 11)} {formatDist(dist)}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:"16px 14px 60px", display:"flex", flexDirection:"column", gap:10 }}>

        {/* Bloc principal */}
        <div style={{ background:DS.white, borderRadius:DS.xl, padding:20, boxShadow:DS.e1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:DS.brand, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{offre.categorie}</div>
          <div style={{ fontSize:22, fontWeight:800, color:DS.ink, lineHeight:1.2, letterSpacing:-0.5, marginBottom:6 }}>{offre.titre}</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, color:DS.ink40, fontSize:13, marginBottom:18 }}>
            {Ic.store(DS.ink20, 13)} {offre.commercant_nom}
          </div>

          {/* Prix */}
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:offre.stock_restant!=null?16:0 }}>
            {offre.prix_promo > 0
              ? <span style={{ fontSize:38, fontWeight:900, color:DS.brand, letterSpacing:-1.5, lineHeight:1 }}>{offre.prix_promo}€</span>
              : <span style={{ fontSize:28, fontWeight:800, color:DS.success }}>Gratuit</span>}
            {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
              <span style={{ fontSize:17, color:DS.ink20, textDecoration:"line-through" }}>{offre.prix_original}€</span>
            )}
            {offre.valeur_reduction > 0 && (
              <span style={{ background:`${DS.brand}12`, color:DS.brand, borderRadius:DS.sm, padding:"4px 10px", fontSize:13, fontWeight:700 }}>
                -{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}
              </span>
            )}
          </div>

          {/* Stock */}
          {offre.stock_restant != null && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:pct<30?DS.danger:DS.ink40, fontWeight:600 }}>
                  {pct < 30 && <span style={{ display:"inline-flex", marginRight:4 }}>{Ic.bolt(DS.danger, 11)}</span>}
                  {offre.stock_restant} restant{offre.stock_restant>1?"s":""}
                </span>
                <span style={{ fontSize:11, color:DS.ink20 }}>/{offre.stock_initial}</span>
              </div>
              <div style={{ background:DS.ink10, borderRadius:DS.pill, height:4 }}>
                <div style={{ background:pct<30?DS.danger:DS.success, height:"100%", borderRadius:DS.pill, width:`${Math.min(pct,100)}%`, transition:"width 1.2s" }}/>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {offre.description && (
          <div style={{ background:DS.white, borderRadius:DS.lg, padding:18, boxShadow:DS.e1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:DS.ink40, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Description</div>
            <div style={{ fontSize:14, color:DS.ink60, lineHeight:1.8 }}>{offre.description}</div>
          </div>
        )}

        {/* Countdown */}
        {offre.est_urgente && offre.date_fin && !expired && (
          <div style={{ background:DS.white, borderRadius:DS.lg, padding:18, boxShadow:DS.e1 }}>
            <Countdown dateFin={offre.date_fin}/>
          </div>
        )}

        {/* CTA */}
        {!expired && (
          !codeVis ? (
            <button onClick={useOffer} style={{ width:"100%", background:DS.brand, color:DS.white, border:"none", borderRadius:DS.xl, padding:"18px", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:DS.eBrand, letterSpacing:-0.2, transition:"transform .15s, opacity .15s" }}
              onMouseDown={e => e.currentTarget.style.transform="scale(0.97)"}
              onMouseUp={e => e.currentTarget.style.transform="scale(1)"}
            >
              Utiliser cette offre
            </button>
          ) : (
            <div style={{ background:DS.white, borderRadius:DS.xl, padding:22, textAlign:"center", boxShadow:DS.e2, border:`1.5px solid ${DS.brand}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:DS.ink40, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Code promo</div>
              <div style={{ background:DS.ink05, borderRadius:DS.md, padding:"18px", fontSize:28, fontWeight:900, color:DS.ink, letterSpacing:8, fontFamily:"monospace", marginBottom:14, border:`2px dashed ${DS.ink10}` }}>
                {offre.code_promo || "CLICKPROMO"}
              </div>
              <button onClick={copyCode} style={{ display:"inline-flex", alignItems:"center", gap:8, background:copied?DS.success:DS.ink, color:DS.white, border:"none", borderRadius:DS.md, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer", transition:"background .3s" }}>
                {copied ? Ic.check(DS.white, 14) : Ic.copy(DS.white, 14)}
                {copied ? "Copié !" : "Copier le code"}
              </button>
              <div style={{ fontSize:11, color:DS.ink20, marginTop:12 }}>Montrez ce code au commerçant</div>
            </div>
          )
        )}

        {/* Expiré */}
        {expired && (
          <div style={{ background:DS.white, borderRadius:DS.lg, padding:22, textAlign:"center", boxShadow:DS.e1 }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>{Ic.clock(DS.ink20, 36)}</div>
            <div style={{ fontWeight:700, color:DS.ink60, marginBottom:14, fontSize:15 }}>Cette offre est expirée</div>
            <button onClick={() => navigate("/Feed")} style={{ background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"12px 24px", fontWeight:700, cursor:"pointer", boxShadow:DS.eBrand }}>Voir les offres</button>
          </div>
        )}

        {/* Localisation */}
        {offre.adresse && (
          <div style={{ background:DS.white, borderRadius:DS.lg, padding:18, boxShadow:DS.e1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:DS.ink40, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Adresse</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:14, color:DS.ink, fontWeight:500 }}>{offre.adresse}</div>
                <div style={{ fontSize:13, color:DS.ink40, marginTop:2 }}>{offre.ville}</div>
                {dist !== null && <div style={{ fontSize:12, color:DS.success, fontWeight:600, marginTop:5, display:"flex", alignItems:"center", gap:4 }}>{Ic.pin(DS.success, 11)} {formatDist(dist)} de vous</div>}
              </div>
              <button onClick={() => window.open(`https://maps.google.com/?q=${offre.latitude},${offre.longitude}`,"_blank")} style={{ background:DS.ink, color:DS.white, border:"none", borderRadius:DS.md, padding:"10px 14px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
                {Ic.nav(DS.white, 14)} Y aller
              </button>
            </div>
          </div>
        )}

        {/* Conditions */}
        {offre.conditions && (
          <div style={{ background:"#FFFBEB", borderRadius:DS.md, padding:14, border:`1px solid #FDE68A` }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#92400E", textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>Conditions</div>
            <div style={{ fontSize:13, color:"#78350F", lineHeight:1.75 }}>{offre.conditions}</div>
          </div>
        )}

        {used && <Stars onRate={n => console.log("Note:", n)}/>}
        <Similar offreId={id} categorie={offre.categorie}/>
      </div>
    </div>
  );
}
