import { useState, useEffect, useRef } from "react";
import { Offre } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { DS, Icon, CPLogo } from "./Home";

const CATEGORIES = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Pharmacie","Services"];
const CAT_COLORS = {
  "Tout":DS.orange,"Restaurant":"#EF4444","Boutique":"#A855F7","Beauté & Coiffure":"#EC4899",
  "Fitness & Sport":"#22C55E","Épicerie":"#F59E0B","Pharmacie":"#06B6D4","Services":"#3B82F6","Autre":DS.gray500
};
// Icônes SVG custom par catégorie
const CAT_SVG = {
  "Tout":     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  "Restaurant":<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
  "Boutique":  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  "Beauté & Coiffure":<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  "Fitness & Sport":<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M4 8v8M20 8v8"/></svg>,
  "Épicerie":  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>,
  "Pharmacie": <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  "Services":  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
};

export function haversine(la1,lo1,la2,lo2){const R=6371,dL=((la2-la1)*Math.PI)/180,dO=((lo2-lo1)*Math.PI)/180,a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
export function formatDist(km){return km<1?`${Math.round(km*1000)}m`:`${km.toFixed(1)}km`;}

// ── Navbar ─────────────────────────────────────────────────────────────────
export function NavBar({ active }) {
  const navigate = useNavigate();
  const tabs = [
    { key:"feed",   label:"Offres",   path:"/Feed" },
    { key:"carte",  label:"Carte",    path:"/Carte" },
    { key:"favoris",label:"Favoris",  path:"/Favoris" },
    { key:"profil", label:"Profil",   path:"/Profil" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:430, zIndex:1000,
      background:"rgba(255,255,255,0.96)", backdropFilter:"blur(24px) saturate(180%)",
      borderTop:`1px solid ${DS.gray100}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom,12px)",
    }}>
      {tabs.map(t => {
        const on = active===t.key;
        return (
          <button key={t.key} onClick={()=>navigate(t.path)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"11px 4px 5px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            {t.key==="feed"    && Icon.nav.feed(on)}
            {t.key==="carte"   && Icon.nav.map(on)}
            {t.key==="favoris" && Icon.nav.favs(on)}
            {t.key==="profil"  && Icon.nav.profile(on)}
            <span style={{ fontSize:10, fontWeight:on?700:500, color:on?DS.orange:DS.gray500, fontFamily:DS.font, letterSpacing:0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background:"white", borderRadius:DS.r20, overflow:"hidden", boxShadow:DS.s1, marginBottom:12 }}>
      <div style={{ height:200, background:"linear-gradient(90deg,#f3f4f6 25%,#fafafa 50%,#f3f4f6 75%)", backgroundSize:"400% 100%", animation:"shimmer 1.4s ease infinite" }}/>
      <div style={{ padding:"14px 16px 16px" }}>
        {[["55%","10px"],["85%","14px"],["40%","10px"]].map(([w,h],i)=>(
          <div key={i} style={{ height:h, background:"#f3f4f6", borderRadius:6, width:w, marginBottom:i<2?8:0 }}/>
        ))}
      </div>
    </div>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────
function Timer({ dateFin }) {
  const [txt, setTxt] = useState(""); const [crit, setCrit] = useState(false);
  useEffect(()=>{
    const u=()=>{ const d=new Date(dateFin)-new Date(); if(d<=0){setTxt("Expiré");return;} const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000); setCrit(d<3600000); setTxt(h>0?`${h}h ${m}m`:`${m}m ${s}s`); };
    u(); const id=setInterval(u,1000); return()=>clearInterval(id);
  },[dateFin]);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:crit?"#FEF2F2":"#FFF7ED", color:crit?DS.red:DS.orange, borderRadius:DS.r99, padding:"3px 9px", fontSize:11, fontWeight:700, border:`1px solid ${crit?"#FECACA":"#FED7AA"}` }}>
      <span style={{ display:"flex" }}>{Icon.clock(11, crit?DS.red:DS.orange)}</span>
      {txt}
    </span>
  );
}

// ── Card offre ────────────────────────────────────────────────────────────
function OffreCard({ offre, favs, onToggle, userPos, onFavChange }) {
  const isFav = favs.includes(offre.id);
  const pct = offre.stock_initial?(offre.stock_restant/offre.stock_initial)*100:100;
  const dist = userPos&&offre.latitude?haversine(userPos.lat,userPos.lng,offre.latitude,offre.longitude):null;
  const [imgErr, setImgErr] = useState(false);
  const catColor = CAT_COLORS[offre.categorie]||DS.gray500;
  const isExpired = offre.date_fin && new Date(offre.date_fin)<new Date();

  const togFav = e => {
    e.preventDefault(); e.stopPropagation();
    onToggle(offre.id);
    if(navigator.vibrate) navigator.vibrate(12);
    onFavChange(!isFav);
  };

  return (
    <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{ background:"white", borderRadius:DS.r20, overflow:"hidden", boxShadow:DS.s1, marginBottom:12, transition:"box-shadow 0.2s, transform 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=DS.s3;e.currentTarget.style.transform="translateY(-2px)"}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=DS.s1;e.currentTarget.style.transform="none"}}
      >
        {/* Image */}
        <div style={{ position:"relative", height:210, overflow:"hidden" }}>
          <img src={imgErr?"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800":offre.image_url}
            alt={offre.titre} loading="lazy" onError={()=>setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s" }}
          />
          <div style={{ position:"absolute", inset:0, background:DS.gradCard }}/>

          {/* Badge réduction */}
          <div style={{
            position:"absolute", top:14, left:14,
            background:offre.valeur_reduction>=40?DS.red:DS.orange,
            color:"white", borderRadius:DS.r8, padding:"5px 11px",
            fontWeight:900, fontSize:13, letterSpacing:0.3,
            fontFamily:DS.font
          }}>
            -{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}
          </div>

          {/* Favori */}
          <button onClick={togFav} style={{
            position:"absolute", top:12, right:12,
            width:36, height:36, borderRadius:DS.r99,
            background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            backdropFilter:"blur(8px)",
            boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
            transform:isFav?"scale(1.1)":"scale(1)",
            transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
            {Icon.heart(16, isFav?DS.red:DS.gray500, isFav)}
          </button>

          {/* Bottom info on image */}
          <div style={{ position:"absolute", bottom:12, left:14, right:14, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            {offre.est_urgente && !isExpired && <Timer dateFin={offre.date_fin}/>}
            {dist!==null && (
              <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:4, background:"rgba(0,0,0,0.55)", color:"white", borderRadius:DS.r99, padding:"3px 9px", fontSize:11, fontWeight:600, backdropFilter:"blur(8px)" }}>
                {Icon.pin(11,"white")} {formatDist(dist)}
              </span>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding:"13px 15px 15px" }}>
          {/* Catégorie */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:`${catColor}14`, color:catColor, borderRadius:DS.r99, padding:"3px 9px", marginBottom:8 }}>
            <span style={{ display:"flex", color:catColor }}>{CAT_SVG[offre.categorie]||CAT_SVG["Tout"]}</span>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:0.3 }}>{offre.categorie}</span>
          </div>

          <div style={{ fontWeight:700, fontSize:15, color:DS.black, marginBottom:3, lineHeight:1.3, letterSpacing:-0.2 }}>
            {offre.titre}
          </div>
          <div style={{ fontSize:12, color:DS.gray500, marginBottom:10, display:"flex", alignItems:"center", gap:5 }}>
            {Icon.store(12, DS.gray400)}
            {offre.commercant_nom}
          </div>

          {/* Prix + stock */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:7 }}>
              {offre.prix_promo>0 && <span style={{ fontSize:20, fontWeight:900, color:DS.orange, letterSpacing:-0.5 }}>{offre.prix_promo}€</span>}
              {offre.prix_original>0 && offre.prix_original!==offre.prix_promo && (
                <span style={{ fontSize:13, color:DS.gray300, textDecoration:"line-through" }}>{offre.prix_original}€</span>
              )}
              {offre.prix_promo===0 && <span style={{ fontSize:16, fontWeight:800, color:DS.green }}>Gratuit</span>}
            </div>
            {offre.stock_restant!=null && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:pct<30?DS.red:DS.gray500, fontWeight:600, marginBottom:3 }}>
                  {offre.stock_restant} restant{offre.stock_restant>1?"s":""}
                </div>
                <div style={{ background:DS.gray100, borderRadius:DS.r99, height:3, width:64 }}>
                  <div style={{ background:pct<30?DS.red:DS.green, height:"100%", borderRadius:DS.r99, width:`${Math.min(pct,100)}%`, transition:"width 0.8s" }}/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page Feed ─────────────────────────────────────────────────────────────
export default function Feed() {
  const [offres, setOffres]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [spinning, setSpinning]   = useState(false);
  const [cat, setCat]             = useState("Tout");
  const [q, setQ]                 = useState("");
  const [tri, setTri]             = useState("proximite");
  const [userPos, setUserPos]     = useState(null);
  const [favs, setFavs]           = useState(()=>{ try{return JSON.parse(localStorage.getItem("cp_favs")||"[]")}catch{return[]} });
  const [toast, setToast]         = useState(null);

  useEffect(()=>{
    navigator.geolocation?.getCurrentPosition(p=>setUserPos({lat:p.coords.latitude,lng:p.coords.longitude}),()=>{},{enableHighAccuracy:true,timeout:8000});
  },[]);

  const load = async()=>{ const d=await Offre.list(); setOffres(d.filter(o=>o.est_active)); };
  useEffect(()=>{ load().finally(()=>setLoading(false)); },[]);

  const refresh = async()=>{ setSpinning(true); await load(); setTimeout(()=>setSpinning(false),600); if(navigator.vibrate)navigator.vibrate([10,30,10]); };

  const toggle = id=>{ const nf=favs.includes(id)?favs.filter(f=>f!==id):[...favs,id]; setFavs(nf); localStorage.setItem("cp_favs",JSON.stringify(nf)); };
  const showToast = added=>{ setToast(added); setTimeout(()=>setToast(null),2200); };

  const list = offres
    .map(o=>({...o,dist:userPos&&o.latitude?haversine(userPos.lat,userPos.lng,o.latitude,o.longitude):null}))
    .filter(o=>{ if(cat!=="Tout"&&o.categorie!==cat)return false; if(q&&!o.titre.toLowerCase().includes(q.toLowerCase())&&!o.commercant_nom?.toLowerCase().includes(q.toLowerCase()))return false; return true; })
    .sort((a,b)=>{
      if(tri==="proximite"&&userPos)return(a.dist||999)-(b.dist||999);
      if(tri==="reduction")return b.valeur_reduction-a.valeur_reduction;
      if(tri==="urgence")return(b.est_urgente?1:0)-(a.est_urgente?1:0);
      return 0;
    });

  const flash = list.filter(o=>o.est_urgente);
  const normal = list.filter(o=>!o.est_urgente);

  return (
    <div style={{ background:DS.gray50, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Toast */}
      {toast!==null && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:DS.black, color:"white", borderRadius:DS.r99, padding:"10px 20px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:DS.s3, animation:"toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <span style={{ color:toast?DS.red:DS.gray400, display:"flex" }}>{Icon.heart(14, toast?DS.red:DS.gray400, toast)}</span>
          {toast ? "Ajouté aux favoris" : "Retiré des favoris"}
        </div>
      )}

      {/* Header */}
      <div style={{ background:"white", padding:"52px 16px 0", position:"sticky", top:0, zIndex:100, borderBottom:`1px solid ${DS.gray100}` }}>
        {/* Top */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <CPLogo size={32} />
            <div>
              <div style={{ fontSize:17, fontWeight:800, color:DS.black, letterSpacing:-0.4 }}>Click & Promo</div>
              <div style={{ fontSize:11, color:DS.gray500, display:"flex", alignItems:"center", gap:3 }}>
                {Icon.pin(10, userPos?DS.green:DS.gray400)}
                {userPos?"Offres près de vous":"Toute la France"}
              </div>
            </div>
          </div>
          <button onClick={refresh} style={{ width:36, height:36, borderRadius:DS.r99, background:DS.gray100, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:DS.gray700 }}>
            <span style={{ display:"flex", animation:spinning?"spin 0.6s linear infinite":"none" }}>{Icon.refresh(16, DS.gray700)}</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", color:DS.gray400 }}>{Icon.search(16,DS.gray400)}</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher une offre, un commerce..."
            style={{ width:"100%", border:`1.5px solid ${DS.gray100}`, borderRadius:DS.r12, padding:"11px 14px 11px 40px", fontSize:14, outline:"none", background:DS.gray50, color:DS.black, boxSizing:"border-box", fontFamily:DS.font, transition:"border-color 0.2s" }}
            onFocus={e=>e.target.style.borderColor=DS.orange}
            onBlur={e=>e.target.style.borderColor=DS.gray100}
          />
        </div>

        {/* Catégories */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:12, scrollbarWidth:"none" }}>
          {CATEGORIES.map(c=>{
            const on=cat===c; const col=CAT_COLORS[c]||DS.gray500;
            return (
              <button key={c} onClick={()=>setCat(c)} style={{
                flexShrink:0, border:"none", cursor:"pointer", borderRadius:DS.r99,
                padding:"7px 13px", fontFamily:DS.font,
                background:on?col:DS.gray100,
                color:on?"white":DS.gray700,
                fontSize:12, fontWeight:on?700:500,
                display:"flex", alignItems:"center", gap:5,
                boxShadow:on?`0 4px 12px ${col}44`:"none",
                transition:"all 0.2s"
              }}>
                <span style={{ display:"flex", color:on?"white":col }}>{CAT_SVG[c]||CAT_SVG["Tout"]}</span>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:"14px 14px 100px" }}>

        {/* Tri */}
        <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", scrollbarWidth:"none" }}>
          {[
            { k:"proximite", label:"Distance",  ico:Icon.pin(12,"currentColor") },
            { k:"reduction", label:"Réduction", ico:Icon.percent(12,"currentColor") },
            { k:"urgence",   label:"Flash",     ico:Icon.flash(12,"currentColor") },
          ].map(t=>{
            const on=tri===t.k;
            return (
              <button key={t.k} onClick={()=>setTri(t.k)} style={{
                flexShrink:0, border:`1.5px solid ${on?DS.orange:DS.gray200}`,
                borderRadius:DS.r99, padding:"6px 12px",
                background:on?DS.orange:"white",
                color:on?"white":DS.gray700,
                fontSize:12, fontWeight:on?700:500, cursor:"pointer",
                display:"flex", alignItems:"center", gap:5, fontFamily:DS.font,
                boxShadow:on?`0 4px 10px ${DS.orange}33`:"none",
                transition:"all 0.2s"
              }}>
                <span style={{ display:"flex", color:on?"white":DS.gray500 }}>{t.ico}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Flash deals section */}
        {!loading && flash.length>0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#FEF2F2", borderRadius:DS.r99, padding:"5px 12px", border:`1px solid #FECACA` }}>
                <span style={{ display:"flex", color:DS.red }}>{Icon.flash(13, DS.red)}</span>
                <span style={{ fontSize:12, fontWeight:800, color:DS.red, letterSpacing:0.5, textTransform:"uppercase" }}>Flash deals</span>
              </div>
              <span style={{ fontSize:12, color:DS.gray500 }}>{flash.length} offre{flash.length>1?"s":""}</span>
            </div>
            {flash.map(o=><OffreCard key={o.id} offre={o} favs={favs} onToggle={toggle} userPos={userPos} onFavChange={showToast}/>)}
          </div>
        )}

        {/* Label */}
        {!loading && list.length>0 && (
          <div style={{ fontSize:11, fontWeight:700, color:DS.gray400, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>
            {list.length} offre{list.length>1?"s":" "} disponible{list.length>1?"s":""}
          </div>
        )}

        {/* Skeleton */}
        {loading && [1,2,3].map(i=><Skeleton key={i}/>)}

        {/* Offres */}
        {!loading && normal.map(o=><OffreCard key={o.id} offre={o} favs={favs} onToggle={toggle} userPos={userPos} onFavChange={showToast}/>)}

        {/* Vide */}
        {!loading && list.length===0 && (
          <div style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ width:72, height:72, borderRadius:DS.r20, background:DS.gray100, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:DS.gray400 }}>
              {Icon.search(32,DS.gray400)}
            </div>
            <div style={{ fontWeight:700, fontSize:17, color:DS.black, marginBottom:8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize:14, color:DS.gray500, lineHeight:1.7, marginBottom:20 }}>Essayez une autre catégorie ou attendez de nouvelles offres.</div>
            <button onClick={()=>{setCat("Tout");setQ("")}} style={{ background:DS.orange, color:"white", border:"none", borderRadius:DS.r16, padding:"12px 24px", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:DS.sOrange }}>
              Voir tout
            </button>
          </div>
        )}
      </div>

      <NavBar active="feed"/>

      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        *{-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
