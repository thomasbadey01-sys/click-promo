import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DS, Icon, CPLogo } from "./Home";
import { haversine, formatDist } from "./Feed";

function Timer({ dateFin }) {
  const [t, setT] = useState({h:0,m:0,s:0,exp:false,crit:false});
  useEffect(()=>{
    const u=()=>{ const d=new Date(dateFin)-new Date(); if(d<=0){setT({h:0,m:0,s:0,exp:true,crit:false});return;} setT({h:Math.floor(d/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000),exp:false,crit:d<3600000}); };
    u(); const id=setInterval(u,1000); return()=>clearInterval(id);
  },[dateFin]);
  if(t.exp) return <div style={{textAlign:"center",padding:14,background:DS.gray100,borderRadius:DS.r12,color:DS.gray500,fontWeight:600,fontSize:13}}>Offre expirée</div>;
  return (
    <div>
      <div style={{fontSize:11,fontWeight:700,color:DS.gray500,textAlign:"center",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Expire dans</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {[{v:String(t.h).padStart(2,"0"),l:"h"},{v:String(t.m).padStart(2,"0"),l:"min"},{v:String(t.s).padStart(2,"0"),l:"s"}].map((u,i)=>(
          <div key={i} style={{textAlign:"center"}}>
            <div style={{background:t.crit?DS.red:DS.black,color:"white",borderRadius:DS.r12,padding:"10px 14px",fontSize:26,fontWeight:900,minWidth:56,fontFamily:DS.font,letterSpacing:-1,boxShadow:t.crit?`0 4px 16px ${DS.red}44`:DS.s2}}>{u.v}</div>
            <div style={{fontSize:10,color:DS.gray400,marginTop:4}}>{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRating({ onRate }) {
  const [hov, setHov] = useState(0); const [done, setDone] = useState(false);
  if(done) return <div style={{textAlign:"center",padding:14,background:"#F0FFF4",borderRadius:DS.r12,color:DS.green,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Icon.check(16,DS.green)} Merci pour votre avis !</div>;
  return (
    <div style={{background:"white",borderRadius:DS.r16,padding:16,boxShadow:DS.s1}}>
      <div style={{fontWeight:700,fontSize:14,color:DS.black,marginBottom:12,textAlign:"center"}}>Comment était cette offre ?</div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:8}}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)} onClick={()=>{setDone(true);onRate?.(n);}}
            style={{background:"none",border:"none",cursor:"pointer",padding:4,transform:hov>=n?"scale(1.25)":"scale(1)",transition:"transform 0.15s cubic-bezier(0.34,1.56,0.64,1)"}}>
            {Icon.star(28, "#F59E0B", hov>=n)}
          </button>
        ))}
      </div>
      <div style={{fontSize:11,color:DS.gray400,textAlign:"center"}}>Votre avis aide les autres utilisateurs</div>
    </div>
  );
}

function SimilarOffers({ offreId, categorie }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  useEffect(()=>{ Offre.list().then(all=>setItems(all.filter(o=>o.id!==offreId&&o.categorie===categorie&&o.est_active).slice(0,3))); },[offreId,categorie]);
  if(!items.length) return null;
  return (
    <div style={{background:"white",borderRadius:DS.r16,padding:16,boxShadow:DS.s1}}>
      <div style={{fontWeight:700,fontSize:15,color:DS.black,marginBottom:12}}>Offres similaires</div>
      {items.map(o=>(
        <div key={o.id} onClick={()=>navigate(`/OffreDetail?id=${o.id}`)} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${DS.gray100}`,cursor:"pointer",transition:"opacity 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <img src={o.image_url} alt={o.titre} loading="lazy" style={{width:56,height:56,borderRadius:DS.r12,objectFit:"cover",flexShrink:0}} onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:13,color:DS.black,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.titre}</div>
            <div style={{fontSize:11,color:DS.gray500,marginTop:2,display:"flex",alignItems:"center",gap:4}}>{Icon.store(11,DS.gray400)}{o.commercant_nom}</div>
            {o.prix_promo>0&&<div style={{fontSize:13,fontWeight:800,color:DS.orange,marginTop:3}}>{o.prix_promo}€</div>}
          </div>
          <div style={{flexShrink:0,alignSelf:"center",background:o.valeur_reduction>=40?`${DS.red}15`:`${DS.orange}15`,color:o.valeur_reduction>=40?DS.red:DS.orange,borderRadius:DS.r8,padding:"4px 9px",fontSize:12,fontWeight:800}}>
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
  const [copied, setCopied] = useState(false); const [imgErr, setImgErr] = useState(false);

  useEffect(()=>{
    if(!id)return;
    Offre.get(id).then(d=>{ setOffre(d); setLoading(false); const f=JSON.parse(localStorage.getItem("cp_favs")||"[]"); setIsFav(f.includes(id)); Offre.update(id,{nb_vues:(d.nb_vues||0)+1}).catch(()=>{}); });
    navigator.geolocation?.getCurrentPosition(p=>setUserPos({lat:p.coords.latitude,lng:p.coords.longitude}),()=>{});
  },[id]);

  const toggleFav=()=>{ const f=JSON.parse(localStorage.getItem("cp_favs")||"[]"); const nf=isFav?f.filter(x=>x!==id):[...f,id]; localStorage.setItem("cp_favs",JSON.stringify(nf)); setIsFav(!isFav); if(navigator.vibrate)navigator.vibrate(40); };
  const useOffer=()=>{ setCodeVis(true); setUsed(true); if(navigator.vibrate)navigator.vibrate([40,20,40]); if(offre)Offre.update(id,{nb_clics:(offre.nb_clics||0)+1,nb_conversions:(offre.nb_conversions||0)+1,stock_restant:Math.max(0,(offre.stock_restant||0)-1)}).catch(()=>{}); };
  const copyCode=()=>{ navigator.clipboard?.writeText(offre.code_promo||"CLICKPROMO"); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const share=async()=>{ if(navigator.share){try{await navigator.share({title:offre.titre,text:`${offre.titre} — -${offre.valeur_reduction}%`,url:window.location.href})}catch{}}else{navigator.clipboard?.writeText(window.location.href);} };

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:DS.gray50,gap:16}}>
      <CPLogo size={48}/><div style={{width:32,height:32,borderRadius:"50%",border:`3px solid ${DS.gray100}`,borderTop:`3px solid ${DS.orange}`,animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if(!offre) return (
    <div style={{textAlign:"center",padding:60,fontFamily:DS.font}}>
      <div style={{width:72,height:72,borderRadius:DS.r20,background:DS.gray100,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>{Icon.tag(32,DS.gray400)}</div>
      <div style={{fontWeight:700,fontSize:17,color:DS.black,marginBottom:8}}>Offre introuvable</div>
      <button onClick={()=>navigate("/Feed")} style={{background:DS.orange,color:"white",border:"none",borderRadius:DS.r16,padding:"12px 24px",fontWeight:700,cursor:"pointer"}}>Retour aux offres</button>
    </div>
  );

  const pct=offre.stock_initial?(offre.stock_restant/offre.stock_initial)*100:100;
  const dist=userPos&&offre.latitude?haversine(userPos.lat,userPos.lng,offre.latitude,offre.longitude):null;
  const isExpired=offre.date_fin&&new Date(offre.date_fin)<new Date();

  return (
    <div style={{background:DS.gray50,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Hero */}
      <div style={{position:"relative",height:320}}>
        <img src={imgErr?"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800":offre.image_url} alt={offre.titre} onError={()=>setImgErr(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)"}}/>

        {/* Boutons */}
        <button onClick={()=>navigate(-1)} style={{position:"absolute",top:52,left:14,width:38,height:38,borderRadius:DS.r99,background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",boxShadow:DS.s2}}>
          {Icon.back(18,DS.black)}
        </button>
        <button onClick={share} style={{position:"absolute",top:52,right:58,width:38,height:38,borderRadius:DS.r99,background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",boxShadow:DS.s2}}>
          {Icon.share(16,DS.black)}
        </button>
        <button onClick={toggleFav} style={{position:"absolute",top:52,right:14,width:38,height:38,borderRadius:DS.r99,background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",boxShadow:DS.s2,transform:isFav?"scale(1.1)":"scale(1)",transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"}}>
          {Icon.heart(17,isFav?DS.red:DS.gray500,isFav)}
        </button>

        {/* Badges */}
        <div style={{position:"absolute",bottom:16,left:14,display:"flex",gap:7,alignItems:"center"}}>
          <div style={{background:isExpired?"rgba(0,0,0,0.5)":offre.valeur_reduction>=40?DS.red:DS.orange,color:"white",borderRadius:DS.r8,padding:"6px 14px",fontWeight:900,fontSize:16,letterSpacing:0.2}}>
            {isExpired?"Expirée":`-${offre.valeur_reduction}${offre.type_reduction==="pourcentage"?"%":"€"}`}
          </div>
        </div>
        {dist!==null&&(
          <div style={{position:"absolute",bottom:16,right:14,background:"rgba(0,0,0,0.5)",color:"white",borderRadius:DS.r99,padding:"5px 11px",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(8px)"}}>
            {Icon.pin(11,"white")}{formatDist(dist)}
          </div>
        )}
      </div>

      <div style={{padding:"16px 14px 48px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Infos principales */}
        <div style={{background:"white",borderRadius:DS.r20,padding:18,boxShadow:DS.s1}}>
          <div style={{fontSize:11,fontWeight:700,color:DS.orange,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{offre.categorie}</div>
          <div style={{fontSize:22,fontWeight:800,color:DS.black,lineHeight:1.2,letterSpacing:-0.5,marginBottom:6}}>{offre.titre}</div>
          <div style={{fontSize:13,color:DS.gray500,marginBottom:14,display:"flex",alignItems:"center",gap:5}}>{Icon.store(13,DS.gray400)}{offre.commercant_nom}</div>

          {/* Prix */}
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:offre.stock_restant!=null?14:0}}>
            {offre.prix_promo>0?<span style={{fontSize:36,fontWeight:900,color:DS.orange,letterSpacing:-1}}>{offre.prix_promo}€</span>:<span style={{fontSize:28,fontWeight:900,color:DS.green}}>Gratuit</span>}
            {offre.prix_original>0&&offre.prix_original!==offre.prix_promo&&<span style={{fontSize:17,color:DS.gray300,textDecoration:"line-through"}}>{offre.prix_original}€</span>}
            {offre.valeur_reduction>0&&<span style={{background:`${DS.orange}15`,color:DS.orange,borderRadius:DS.r8,padding:"4px 10px",fontSize:13,fontWeight:700}}>-{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}</span>}
          </div>

          {/* Stock */}
          {offre.stock_restant!=null&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:pct<30?DS.red:DS.gray500,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  {pct<30&&<span style={{color:DS.red,display:"flex"}}>{Icon.flash(12,DS.red)}</span>}
                  {offre.stock_restant} restant{offre.stock_restant>1?"s":""}
                </span>
                <span style={{fontSize:11,color:DS.gray400}}>sur {offre.stock_initial||"?"}</span>
              </div>
              <div style={{background:DS.gray100,borderRadius:DS.r99,height:5}}>
                <div style={{background:pct<30?DS.red:DS.green,height:"100%",borderRadius:DS.r99,width:`${Math.min(pct,100)}%`,transition:"width 1s"}}/>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {offre.description&&(
          <div style={{background:"white",borderRadius:DS.r16,padding:16,boxShadow:DS.s1}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.gray400,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Description</div>
            <div style={{fontSize:14,color:DS.gray700,lineHeight:1.75}}>{offre.description}</div>
          </div>
        )}

        {/* Timer */}
        {offre.est_urgente&&offre.date_fin&&!isExpired&&(
          <div style={{background:"white",borderRadius:DS.r16,padding:18,boxShadow:DS.s1}}>
            <Timer dateFin={offre.date_fin}/>
          </div>
        )}

        {/* CTA */}
        {!isExpired&&(
          !codeVis?(
            <button onClick={useOffer} style={{width:"100%",background:DS.gradMain,color:"white",border:"none",borderRadius:DS.r20,padding:"18px",fontSize:17,fontWeight:800,cursor:"pointer",boxShadow:DS.sOrange,letterSpacing:0.2,transition:"transform 0.15s,box-shadow 0.15s"}}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
              Utiliser cette offre
            </button>
          ):(
            <div style={{background:"white",borderRadius:DS.r20,padding:20,textAlign:"center",boxShadow:DS.s2,border:`2px solid ${DS.orange}`}}>
              <div style={{fontSize:12,fontWeight:700,color:DS.gray400,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Code à présenter</div>
              <div style={{background:DS.gray50,border:`2px dashed ${DS.gray200}`,borderRadius:DS.r12,padding:"16px",fontSize:26,fontWeight:900,color:DS.black,letterSpacing:6,marginBottom:10,fontFamily:"monospace"}}>{offre.code_promo||"CLICKPROMO"}</div>
              <button onClick={copyCode} style={{background:copied?DS.green:DS.orange,color:"white",border:"none",borderRadius:DS.r12,padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,transition:"background 0.3s"}}>
                {copied?Icon.check(14,"white"):Icon.tag(14,"white")} {copied?"Copié !":"Copier le code"}
              </button>
              <div style={{fontSize:11,color:DS.gray400,marginTop:10}}>Montrez ce code au commerçant</div>
            </div>
          )
        )}

        {/* Expiré */}
        {isExpired&&(
          <div style={{background:"white",borderRadius:DS.r16,padding:20,textAlign:"center",boxShadow:DS.s1}}>
            <div style={{width:56,height:56,borderRadius:DS.r16,background:DS.gray100,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>{Icon.clock(28,DS.gray400)}</div>
            <div style={{fontWeight:700,color:DS.gray700,marginBottom:12}}>Cette offre est expirée</div>
            <button onClick={()=>navigate("/Feed")} style={{background:DS.orange,color:"white",border:"none",borderRadius:DS.r16,padding:"12px 24px",fontWeight:700,cursor:"pointer"}}>Voir d'autres offres</button>
          </div>
        )}

        {/* Lieu */}
        {offre.adresse&&(
          <div style={{background:"white",borderRadius:DS.r16,padding:16,boxShadow:DS.s1}}>
            <div style={{fontSize:11,fontWeight:700,color:DS.gray400,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Localisation</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,color:DS.black,fontWeight:500}}>{offre.adresse}</div>
                <div style={{fontSize:13,color:DS.gray500,marginTop:2}}>{offre.ville}</div>
                {dist!==null&&<div style={{fontSize:12,color:DS.green,fontWeight:600,marginTop:4,display:"flex",alignItems:"center",gap:4}}>{Icon.pin(11,DS.green)}{formatDist(dist)} de vous</div>}
              </div>
              <button onClick={()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${offre.latitude},${offre.longitude}`,"_blank")} style={{background:DS.orange,color:"white",border:"none",borderRadius:DS.r12,padding:"10px 14px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                {Icon.pin(13,"white")} Y aller
              </button>
            </div>
          </div>
        )}

        {/* Conditions */}
        {offre.conditions&&(
          <div style={{background:"#FFFBEB",borderRadius:DS.r12,padding:14,border:`1px solid #FDE68A`}}>
            <div style={{fontSize:11,fontWeight:700,color:"#92400E",textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Conditions</div>
            <div style={{fontSize:13,color:"#78350F",lineHeight:1.7}}>{offre.conditions}</div>
          </div>
        )}

        {/* Notation */}
        {used&&<StarRating onRate={n=>console.log("Note:",n)}/>}

        {/* Similaires */}
        <SimilarOffers offreId={id} categorie={offre.categorie}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
