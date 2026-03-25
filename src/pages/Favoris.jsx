import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { DS, Icon, CPLogo } from "./Home";

function TimerBadge({ dateFin }) {
  const [txt, setTxt] = useState(""); const [crit, setCrit] = useState(false);
  useEffect(()=>{
    const u=()=>{ const d=new Date(dateFin)-new Date(); if(d<=0){setTxt("Expirée");return;} const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000); setCrit(d<3600000); setTxt(h>24?`${Math.floor(h/24)}j`:h>0?`${h}h ${m}m`:`${m}m`); };
    u(); const t=setInterval(u,15000); return()=>clearInterval(t);
  },[dateFin]);
  if(!txt) return null;
  const exp=txt==="Expirée";
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:exp?DS.gray100:crit?`${DS.red}15`:`${DS.orange}15`,color:exp?DS.gray400:crit?DS.red:DS.orange,borderRadius:DS.r99,padding:"3px 9px",fontSize:11,fontWeight:700,border:`1px solid ${exp?DS.gray200:crit?`${DS.red}44`:`${DS.orange}44`}`}}>{!exp&&<span style={{display:"flex"}}>{Icon.clock(10,crit?DS.red:DS.orange)}</span>}{exp?"Expirée":txt}</span>;
}

export default function Favoris() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]); const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState([]); const [tri, setTri] = useState("all");
  const [removing, setRemoving] = useState(null);

  useEffect(()=>{
    const ids=JSON.parse(localStorage.getItem("cp_favs")||"[]"); setFavIds(ids);
    if(!ids.length){setLoading(false);return;}
    Offre.list().then(all=>{setOffres(all.filter(o=>ids.includes(o.id)));setLoading(false);});
  },[]);

  const remove = id => {
    setRemoving(id);
    setTimeout(()=>{ const nf=favIds.filter(f=>f!==id); setFavIds(nf); setOffres(p=>p.filter(o=>o.id!==id)); localStorage.setItem("cp_favs",JSON.stringify(nf)); setRemoving(null); if(navigator.vibrate)navigator.vibrate(20); },250);
  };

  const nbA=offres.filter(o=>o.est_active&&!(o.date_fin&&new Date(o.date_fin)<new Date())).length;
  const nbU=offres.filter(o=>o.est_urgente&&o.est_active).length;
  const filtered=offres.filter(o=>{
    if(tri==="actives")return o.est_active&&!(o.date_fin&&new Date(o.date_fin)<new Date());
    if(tri==="urgentes")return o.est_urgente&&o.est_active;
    if(tri==="expirees")return !o.est_active||(o.date_fin&&new Date(o.date_fin)<new Date());
    return true;
  });

  return (
    <div style={{background:DS.gray50,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:"white",padding:"50px 16px 0",position:"sticky",top:0,zIndex:100,borderBottom:`1px solid ${DS.gray100}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <CPLogo size={32}/>
            <div>
              <div style={{fontSize:17,fontWeight:800,color:DS.black,letterSpacing:-0.4}}>Mes Favoris</div>
              <div style={{fontSize:11,color:DS.gray500}}>{offres.length} offre{offres.length!==1?"s":""} sauvegardée{offres.length!==1?"s":""}</div>
            </div>
          </div>
          {nbU>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:`${DS.red}15`,borderRadius:DS.r99,padding:"5px 11px",border:`1px solid ${DS.red}33`}}>{Icon.flash(12,DS.red)}<span style={{fontSize:11,fontWeight:700,color:DS.red}}>{nbU} flash</span></div>}
        </div>
        {offres.length>0&&(
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none"}}>
            {[{k:"all",l:`Tout (${offres.length})`},{k:"actives",l:`Actives (${nbA})`},{k:"urgentes",l:`Flash (${nbU})`},{k:"expirees",l:"Expirées"}].map(t=>(
              <button key={t.k} onClick={()=>setTri(t.k)} style={{flexShrink:0,border:`1.5px solid ${tri===t.k?DS.orange:DS.gray200}`,borderRadius:DS.r99,padding:"6px 13px",background:tri===t.k?DS.orange:"white",color:tri===t.k?"white":DS.gray700,fontSize:12,fontWeight:tri===t.k?700:500,cursor:"pointer",transition:"all 0.2s",fontFamily:DS.font}}>{t.l}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{padding:"14px 14px 100px"}}>
        {loading&&[1,2,3].map(i=><div key={i} style={{background:"white",borderRadius:DS.r16,height:100,marginBottom:10,boxShadow:DS.s1,overflow:"hidden"}}><div style={{height:"100%",background:"linear-gradient(90deg,#f3f4f6 25%,#fafafa 50%,#f3f4f6 75%)",backgroundSize:"400% 100%",animation:"shimmer 1.4s infinite"}}/></div>)}

        {!loading&&offres.length===0&&(
          <div style={{textAlign:"center",padding:"72px 24px"}}>
            <div style={{width:80,height:80,borderRadius:DS.r24,background:DS.gray100,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:DS.gray300}}>{Icon.heart(36,DS.gray300)}</div>
            <div style={{fontSize:20,fontWeight:800,color:DS.black,marginBottom:8,letterSpacing:-0.3}}>Pas encore de favoris</div>
            <div style={{fontSize:14,color:DS.gray500,lineHeight:1.7,marginBottom:24}}>Appuyez sur {Icon.heart(14,DS.red,true)} sur une offre pour la retrouver ici.</div>
            <button onClick={()=>navigate("/Feed")} style={{background:DS.gradMain,color:"white",border:"none",borderRadius:DS.r16,padding:"13px 28px",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:DS.sOrange}}>Découvrir les offres</button>
          </div>
        )}

        {!loading&&offres.length>0&&filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 24px"}}>
            <div style={{fontSize:13,color:DS.gray400,marginBottom:12}}>Aucune offre dans ce filtre</div>
            <button onClick={()=>setTri("all")} style={{background:"white",border:`1.5px solid ${DS.gray200}`,borderRadius:DS.r16,padding:"9px 20px",fontSize:13,fontWeight:600,color:DS.gray700,cursor:"pointer"}}>Voir tout</button>
          </div>
        )}

        {filtered.map(o=>{
          const exp=o.date_fin&&new Date(o.date_fin)<new Date();
          const pct=o.stock_initial?(o.stock_restant/o.stock_initial)*100:100;
          return (
            <div key={o.id} style={{background:"white",borderRadius:DS.r16,overflow:"hidden",marginBottom:10,boxShadow:DS.s1,opacity:removing===o.id?0:exp?0.6:1,transform:removing===o.id?"translateX(50px)":"none",transition:"opacity 0.25s,transform 0.25s",border:o.est_urgente&&!exp?`1.5px solid ${DS.red}22`:`1.5px solid transparent`}}>
              <div onClick={()=>navigate(`/OffreDetail?id=${o.id}`)} style={{display:"flex",cursor:"pointer"}}>
                <div style={{position:"relative",width:108,flexShrink:0}}>
                  <img src={o.image_url} alt={o.titre} style={{width:"100%",height:108,objectFit:"cover"}} onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}/>
                  <div style={{position:"absolute",top:8,left:8,background:exp?"rgba(0,0,0,0.5)":o.valeur_reduction>=40?DS.red:DS.orange,color:"white",borderRadius:DS.r8,padding:"3px 8px",fontSize:11,fontWeight:900}}>{exp?"Exp.":`-${o.valeur_reduction}${o.type_reduction==="pourcentage"?"%":"€"}`}</div>
                  {o.est_urgente&&!exp&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:`${DS.red}CC`,padding:"3px 0",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{Icon.flash(10,"white")}<span style={{color:"white",fontSize:10,fontWeight:700}}>FLASH</span></div>}
                </div>
                <div style={{padding:"11px 13px",flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.black,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{o.titre}</div>
                  <div style={{fontSize:11,color:DS.gray500,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>{Icon.store(11,DS.gray400)}{o.commercant_nom}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                    {o.prix_promo>0&&<span style={{fontSize:15,fontWeight:900,color:DS.orange}}>{o.prix_promo}€</span>}
                    {o.prix_original>0&&<span style={{fontSize:12,color:DS.gray300,textDecoration:"line-through"}}>{o.prix_original}€</span>}
                    {o.date_fin&&<TimerBadge dateFin={o.date_fin}/>}
                  </div>
                  {o.stock_restant!=null&&!exp&&<div style={{marginTop:7,background:DS.gray100,borderRadius:DS.r99,height:3}}><div style={{background:pct<30?DS.red:DS.green,height:"100%",borderRadius:DS.r99,width:`${Math.min(pct,100)}%`}}/></div>}
                </div>
              </div>
              <div style={{borderTop:`1px solid ${DS.gray100}`,padding:"8px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:exp?DS.red:o.est_active?DS.green:DS.gray400}}>
                  {exp?<>{Icon.clock(11,DS.red)} Expirée</>:o.est_active?<>{Icon.check(11,DS.green)} Disponible</>:<span>Inactive</span>}
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button onClick={()=>navigate(`/OffreDetail?id=${o.id}`)} style={{background:`${DS.orange}15`,border:"none",borderRadius:DS.r99,padding:"6px 13px",fontSize:12,fontWeight:700,color:DS.orange,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>Voir {Icon.chevronR(12,DS.orange)}</button>
                  <button onClick={()=>remove(o.id)} style={{background:"#FEF2F2",border:"none",borderRadius:DS.r99,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:DS.red}}>{Icon.trash(14,DS.red)}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NavBar active="favoris"/>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
