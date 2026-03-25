import { useState, useEffect, useRef } from "react";
import { Offre, ProfilUtilisateur } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo } from "./Home";

// ── Utils ──────────────────────────────────────────────────────────────────
export function haversine(la1,lo1,la2,lo2){const R=6371,dL=((la2-la1)*Math.PI)/180,dO=((lo2-lo1)*Math.PI)/180,a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
export function formatDist(km){return km<1?`${Math.round(km*1000)} m`:`${km.toFixed(1)} km`;}

const CATS = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Pharmacie","Services"];
const CAT_META = {
  "Tout":             { color:"#0A0A0A", icon:(c,s)=>Ic.cat.tout(c,s) },
  "Restaurant":       { color:"#E53E3E", icon:(c,s)=>Ic.cat.restaurant(c,s) },
  "Boutique":         { color:"#7C3AED", icon:(c,s)=>Ic.cat.boutique(c,s) },
  "Beauté & Coiffure":{ color:"#D53F8C", icon:(c,s)=>Ic.cat.beaute(c,s) },
  "Fitness & Sport":  { color:"#00B37E", icon:(c,s)=>Ic.cat.sport(c,s) },
  "Épicerie":         { color:"#D97706", icon:(c,s)=>Ic.cat.epicerie(c,s) },
  "Pharmacie":        { color:"#0369A1", icon:(c,s)=>Ic.cat.pharmacie(c,s) },
  "Services":         { color:"#2563EB", icon:(c,s)=>Ic.cat.services(c,s) },
};

// Premium lock icon
const IcPremium = (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcAlerte = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IcEuro = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9.354a4 4 0 100 5.292M8 12h6"/></svg>;

// ── NavBar ─────────────────────────────────────────────────────────────────
export function NavBar({ active }) {
  const navigate = useNavigate();
  const tabs = [
    { key:"feed",    label:"Offres",  path:"/Feed" },
    { key:"carte",   label:"Carte",   path:"/Carte" },
    { key:"favoris", label:"Favoris", path:"/Favoris" },
    { key:"profil",  label:"Profil",  path:"/Profil" },
  ];
  return (
    <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:999, background:"rgba(255,255,255,0.94)", backdropFilter:"blur(20px) saturate(160%)", WebkitBackdropFilter:"blur(20px) saturate(160%)", borderTop:`1px solid ${DS.ink10}`, display:"flex", paddingBottom:"max(env(safe-area-inset-bottom),8px)" }}>
      {tabs.map(t => {
        const on = active === t.key;
        const col = on ? DS.brand : DS.ink20;
        return (
          <button key={t.key} onClick={() => navigate(t.path)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"10px 0 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            {t.key==="feed"    && Ic.grid(col)}
            {t.key==="carte"   && Ic.map(col)}
            {t.key==="favoris" && Ic.heart(col)}
            {t.key==="profil"  && Ic.user(col)}
            <span style={{ fontSize:9.5, fontWeight:on?700:400, color:col, fontFamily:DS.font, letterSpacing:0.3, textTransform:"uppercase" }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Timer ──────────────────────────────────────────────────────────────────
function Timer({ dateFin }) {
  const [txt,setTxt]=useState(""); const [crit,setCrit]=useState(false);
  useEffect(()=>{
    const u=()=>{ const d=new Date(dateFin)-new Date(); if(d<=0){setTxt("Expiré");return;} const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000); setCrit(d<3600000); setTxt(h>0?`${h}h ${m}m`:`${m}m ${s}s`); };
    u(); const id=setInterval(u,1000); return()=>clearInterval(id);
  },[dateFin]);
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", color:DS.white, borderRadius:DS.pill, padding:"4px 10px", fontSize:11, fontWeight:600 }}>{Ic.bolt(DS.white,11)} {txt}</span>;
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background:DS.white, borderRadius:DS.xl, overflow:"hidden", marginBottom:12, boxShadow:DS.e1 }}>
      <div style={{ height:200, background:`linear-gradient(90deg,${DS.ink05} 25%,${DS.white} 50%,${DS.ink05} 75%)`, backgroundSize:"400% 100%", animation:"sh 1.4s ease infinite" }}/>
      <div style={{ padding:"14px 16px 18px" }}>
        {[["45%","10px"],["80%","16px"],["55%","12px"],["30%","20px"]].map(([w,h],i)=><div key={i} style={{height:h,background:DS.ink05,borderRadius:4,width:w,marginBottom:i<3?8:0}}/>)}
      </div>
    </div>
  );
}

// ── Paywall Premium flottant ───────────────────────────────────────────────
function PremiumPaywall({ onClose, navigate }) {
  const perks = [
    { icon: <span style={{display:"flex"}}>{IcAlerte(14)}</span>, t:"Alertes avant tout le monde", d:"Soyez notifié 30 min avant les autres dès qu'une offre flash apparaît." },
    { icon: Ic.eye(DS.brand,14), t:"Voir toutes les offres exclusives", d:"Certaines offres ne sont visibles que pour les membres Premium." },
    { icon: <span style={{display:"flex"}}>{IcEuro(14)}</span>, t:"Réductions supplémentaires", d:"-5% supplémentaires chez nos partenaires Premium." },
    { icon: Ic.map(DS.brand,14), t:"Rayon illimité", d:"Cherchez des offres jusqu'à 50km sans restriction." },
    { icon: Ic.star(DS.brand,14,true), t:"Badge Premium visible", d:"Profil mis en avant dans les avis et commentaires." },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}/>
      <div style={{ position:"relative", width:"100%", maxWidth:430, margin:"0 auto", background:DS.white, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", boxShadow:"0 -20px 60px rgba(0,0,0,0.18)", animation:"slideUp .35s cubic-bezier(.34,1.1,.64,1)" }}>
        <div style={{ width:36, height:4, background:DS.ink10, borderRadius:2, margin:"0 auto 20px" }}/>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ width:56, height:56, borderRadius:DS.xl, background:`linear-gradient(135deg,${DS.brand},#FF8C42)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:DS.eBrand }}>
            <span style={{ color:DS.white }}>{IcPremium(22)}</span>
          </div>
          <div style={{ fontSize:22, fontWeight:900, color:DS.ink, letterSpacing:-.5, marginBottom:6 }}>Passez Premium</div>
          <div style={{ fontSize:13, color:DS.ink40, lineHeight:1.7 }}>Débloquez toutes les fonctionnalités Click & Promo pour seulement <strong style={{color:DS.brand}}>9,99€/mois</strong></div>
        </div>
        {perks.map((p,i)=>(
          <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i<perks.length-1?`1px solid ${DS.ink05}`:"none" }}>
            <div style={{ width:32, height:32, borderRadius:DS.sm, background:`${DS.brand}10`, display:"flex", alignItems:"center", justifyContent:"center", color:DS.brand, flexShrink:0 }}>{p.icon}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:DS.ink, marginBottom:2 }}>{p.t}</div>
              <div style={{ fontSize:11, color:DS.ink40, lineHeight:1.6 }}>{p.d}</div>
            </div>
          </div>
        ))}
        <button onClick={()=>navigate("/Abonnement?tab=user")} style={{ width:"100%", background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"16px", fontSize:15, fontWeight:800, cursor:"pointer", boxShadow:DS.eBrand, marginTop:20, letterSpacing:-.2 }}>
          Essayer Premium — 9,99€/mois
        </button>
        <button onClick={onClose} style={{ width:"100%", background:"none", border:"none", color:DS.ink20, fontSize:13, cursor:"pointer", padding:"10px", marginTop:6 }}>Non merci</button>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Bloc Alertes Premium ───────────────────────────────────────────────────
function AlerteSetup({ isPremium, navigate, onClose }) {
  const [cats, setCats] = useState([]);
  const [rayon, setRayon] = useState(5);
  const [saved, setSaved] = useState(false);
  const allCats = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Pharmacie","Services"];
  const toggle = c => setCats(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c]);
  const save = () => { localStorage.setItem("cp_alertes", JSON.stringify({cats,rayon})); setSaved(true); setTimeout(onClose, 1200); };
  if (!isPremium) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}/>
      <div style={{ position:"relative", width:"100%", maxWidth:430, margin:"0 auto", background:DS.white, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", boxShadow:"0 -20px 60px rgba(0,0,0,0.18)", animation:"slideUp .35s cubic-bezier(.34,1.1,.64,1)" }}>
        <div style={{ width:36, height:4, background:DS.ink10, borderRadius:2, margin:"0 auto 18px" }}/>
        <div style={{ fontWeight:800, fontSize:18, color:DS.ink, marginBottom:4, letterSpacing:-.4 }}>Configurer mes alertes</div>
        <div style={{ fontSize:12, color:DS.ink40, marginBottom:18 }}>Vous serez notifié en avant-première sur ces catégories</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
          {allCats.map(c=>{const on=cats.includes(c);return<button key={c} onClick={()=>toggle(c)} style={{background:on?DS.brand:DS.ink05,color:on?DS.white:DS.ink60,border:"none",borderRadius:DS.pill,padding:"7px 14px",fontSize:12,fontWeight:on?700:500,cursor:"pointer",transition:"all .18s"}}>{c}</button>;})}
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:DS.ink60 }}>Rayon d'alerte</span>
            <span style={{ fontSize:12, fontWeight:700, color:DS.brand }}>{rayon} km</span>
          </div>
          <input type="range" min={1} max={50} value={rayon} onChange={e=>setRayon(+e.target.value)} style={{ width:"100%", accentColor:DS.brand }}/>
        </div>
        {saved ? (
          <div style={{ background:"#F0FFF9", borderRadius:DS.md, padding:14, textAlign:"center", color:DS.success, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>{Ic.check(DS.success,15)} Alertes enregistrées !</div>
        ) : (
          <button onClick={save} disabled={cats.length===0} style={{ width:"100%", background:cats.length===0?DS.ink10:DS.brand, color:cats.length===0?DS.ink40:DS.white, border:"none", borderRadius:DS.lg, padding:"14px", fontWeight:700, fontSize:14, cursor:cats.length===0?"not-allowed":"pointer", boxShadow:cats.length===0?"none":DS.eBrand }}>
            Activer les alertes
          </button>
        )}
      </div>
    </div>
  );
}

// ── Barre économies Premium ────────────────────────────────────────────────
function EcoBar({ offres, isPremium }) {
  const total = offres.filter(o=>o.est_active).reduce((s,o)=> o.prix_original&&o.prix_promo ? s+(o.prix_original-o.prix_promo) : s, 0);
  if (total < 50) return null;
  return (
    <div style={{ margin:"0 14px 12px", background:DS.white, borderRadius:DS.lg, padding:"12px 14px", boxShadow:DS.e1, display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:38, height:38, borderRadius:DS.md, background:`${DS.success}10`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:DS.success }}>{IcEuro(17)}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:DS.ink }}>Jusqu'à <span style={{color:DS.success}}>{total.toFixed(0)}€</span> d'économies disponibles</div>
        <div style={{ fontSize:11, color:DS.ink40, marginTop:1 }}>sur {offres.filter(o=>o.est_active).length} offres actives{isPremium?" · -5% supplémentaires inclus":""}</div>
      </div>
      {isPremium && <div style={{ background:`${DS.brand}10`, borderRadius:DS.pill, padding:"2px 8px", flexShrink:0 }}><span style={{fontSize:10,fontWeight:700,color:DS.brand}}>PREMIUM</span></div>}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
function OffreCard({ offre, favs, onToggle, onFavChange, userPos, isPremium, onPremiumClick }) {
  const isFav = favs.includes(offre.id);
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;
  const pct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial) * 100 : 100;
  const expired = offre.date_fin && new Date(offre.date_fin) < new Date();
  const meta = CAT_META[offre.categorie] || CAT_META["Tout"];
  const bigDiscount = offre.valeur_reduction >= 40;

  // Offres exclusives Premium : réduction >= 50% ou marquées comme flash ET stock < 10
  const isExclusive = offre.valeur_reduction >= 50 || (offre.est_urgente && offre.stock_restant != null && offre.stock_restant < 10);
  // Afficher flou si exclusive et non premium
  const isLocked = isExclusive && !isPremium;

  // Prix avec réduction premium supplémentaire
  const prixDisplay = isPremium && offre.prix_promo > 0 ? (offre.prix_promo * 0.95).toFixed(2) : offre.prix_promo;

  const toggleFav = e => { e.preventDefault(); e.stopPropagation(); onToggle(offre.id); onFavChange(!isFav); if(navigator.vibrate)navigator.vibrate(10); };

  return (
    <div style={{ marginBottom:12, position:"relative" }}>
      {/* Badge exclusif */}
      {isExclusive && (
        <div style={{ position:"absolute", top:-6, left:14, zIndex:10, background:`linear-gradient(135deg,${DS.brand},#FF8C42)`, color:DS.white, borderRadius:DS.pill, padding:"3px 10px", fontSize:10, fontWeight:800, letterSpacing:.5, textTransform:"uppercase", boxShadow:DS.eBrand }}>
          {isPremium ? "✦ Exclusif Premium" : "✦ Premium requis"}
        </div>
      )}
      <Link to={isLocked ? "#" : `/OffreDetail?id=${offre.id}`} onClick={isLocked ? e=>{e.preventDefault();onPremiumClick();} : undefined} style={{ textDecoration:"none", display:"block" }}>
        <article style={{ background:DS.white, borderRadius:DS.xl, overflow:"hidden", boxShadow:isExclusive?`0 4px 20px ${DS.brand}18`:DS.e1, border:isExclusive?`1.5px solid ${DS.brand}20`:"none" }}>
          <div style={{ position:"relative", height:210 }}>
            <img src={offre.image_url} alt={offre.titre} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", filter:isLocked?"blur(6px) brightness(0.8)":"none", transition:"filter .3s" }}
              onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)" }}/>

            {/* Lock overlay sur exclusive */}
            {isLocked && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                <div style={{ width:48, height:48, borderRadius:DS.pill, background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ic.lock(DS.brand, 20)}
                </div>
                <div style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:DS.md, padding:"6px 14px", color:DS.white, fontSize:12, fontWeight:700 }}>
                  Offre exclusive Premium
                </div>
              </div>
            )}

            <div style={{ position:"absolute", top:14, left:14, background:bigDiscount?DS.danger:DS.ink, color:DS.white, borderRadius:DS.sm, padding:"5px 12px", fontWeight:800, fontSize:14, letterSpacing:-.3 }}>
              -{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}
            </div>
            {!isLocked && (
              <button onClick={toggleFav} style={{ position:"absolute", top:12, right:12, width:36, height:36, borderRadius:DS.pill, background:"rgba(255,255,255,0.88)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)", transition:"transform .2s cubic-bezier(.34,1.56,.64,1)", transform:isFav?"scale(1.12)":"scale(1)" }}>
                {Ic.heart(isFav?DS.danger:DS.ink40,17,isFav)}
              </button>
            )}
            <div style={{ position:"absolute", bottom:12, left:14, right:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {offre.est_urgente && !expired && !isLocked && <Timer dateFin={offre.date_fin}/>}
              {dist!==null && !isLocked && <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", color:DS.white, borderRadius:DS.pill, padding:"4px 10px", fontSize:11, fontWeight:600 }}>{Ic.pin(DS.white,12)} {formatDist(dist)}</span>}
            </div>
          </div>

          <div style={{ padding:"14px 16px 16px" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginBottom:9, background:`${meta.color}12`, borderRadius:DS.pill, padding:"3px 10px" }}>
              <span style={{ display:"flex", color:meta.color }}>{meta.icon(meta.color,12)}</span>
              <span style={{ fontSize:11, fontWeight:700, color:meta.color, letterSpacing:.4, textTransform:"uppercase" }}>{offre.categorie}</span>
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:DS.ink, lineHeight:1.35, letterSpacing:-.2, marginBottom:5, filter:isLocked?"blur(3px)":"none" }}>{offre.titre}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5, color:DS.ink40, fontSize:12, marginBottom:12 }}>{Ic.store(DS.ink20,13)}<span style={{filter:isLocked?"blur(3px)":"none"}}>{offre.commercant_nom}</span></div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                {isLocked ? (
                  <span style={{ fontSize:20, fontWeight:800, color:DS.brand }}>???</span>
                ) : offre.prix_promo > 0 ? (
                  <>
                    <span style={{ fontSize:22, fontWeight:800, color:DS.brand, letterSpacing:-.8 }}>{prixDisplay}€</span>
                    {isPremium && offre.prix_promo > 0 && <span style={{ fontSize:10, fontWeight:700, color:DS.brand, background:`${DS.brand}10`, borderRadius:DS.pill, padding:"2px 6px" }}>-5% Premium</span>}
                    {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && <span style={{ fontSize:13, color:DS.ink20, textDecoration:"line-through" }}>{offre.prix_original}€</span>}
                  </>
                ) : <span style={{ fontSize:18, fontWeight:700, color:DS.success }}>Gratuit</span>}
              </div>
              {offre.stock_restant != null && !isLocked && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:pct<30?DS.danger:DS.ink40 }}>{offre.stock_restant} dispo</span>
                  <div style={{ width:52, height:3, background:DS.ink10, borderRadius:DS.pill }}><div style={{ height:"100%", borderRadius:DS.pill, background:pct<30?DS.danger:DS.success, width:`${Math.min(pct,100)}%` }}/></div>
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}

// ── Bannière Premium dans le feed ──────────────────────────────────────────
function PremiumBanner({ navigate }) {
  return (
    <div onClick={()=>navigate("/Abonnement?tab=user")} style={{ margin:"0 0 16px", background:`linear-gradient(135deg,${DS.ink} 0%,#1A1A2E 100%)`, borderRadius:DS.xl, padding:"16px 18px", cursor:"pointer", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:`radial-gradient(circle,${DS.brand}30,transparent 70%)` }}/>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:DS.lg, background:`linear-gradient(135deg,${DS.brand},#FF8C42)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:DS.white, boxShadow:DS.eBrand }}>{IcPremium(18)}</div>
        <div style={{ flex:1 }}>
          <div style={{ color:DS.white, fontWeight:800, fontSize:14, letterSpacing:-.2, marginBottom:3 }}>Passez Premium</div>
          <div style={{ color:"rgba(255,255,255,.5)", fontSize:11, lineHeight:1.5 }}>Accès prioritaire aux flash · -5% · Alertes · Rayon 50km</div>
        </div>
        <div style={{ background:DS.brand, borderRadius:DS.md, padding:"8px 12px", color:DS.white, fontSize:12, fontWeight:700, flexShrink:0, boxShadow:DS.eBrand }}>9,99€</div>
      </div>
    </div>
  );
}

// ── Feed principal ─────────────────────────────────────────────────────────
export default function Feed() {
  const navigate = useNavigate();
  const [offres,setOffres] = useState([]);
  const [loading,setLoading] = useState(true);
  const [cat,setCat] = useState("Tout");
  const [q,setQ] = useState("");
  const [sort,setSort] = useState("distance");
  const [userPos,setUserPos] = useState(null);
  const [spinning,setSpinning] = useState(false);
  const [favs,setFavs] = useState(()=>{ try{return JSON.parse(localStorage.getItem("cp_favs")||"[]");}catch{return [];} });
  const [toast,setToast] = useState(null);
  const [searchOpen,setSearchOpen] = useState(false);
  const [isPremium,setIsPremium] = useState(false);
  const [showPaywall,setShowPaywall] = useState(false);
  const [showAlertes,setShowAlertes] = useState(false);
  const [rayonPremium] = useState(50);

  useEffect(()=>{
    navigator.geolocation?.getCurrentPosition(p=>setUserPos({lat:p.coords.latitude,lng:p.coords.longitude}),()=>{},{enableHighAccuracy:true,timeout:8000});
    // Check premium
    UserAuth.me().then(async u=>{
      if(!u)return;
      try{ const ps=await ProfilUtilisateur.filter({user_id:u.id}); if(ps.length&&ps[0].est_premium)setIsPremium(true); }catch{}
    }).catch(()=>{});
  },[]);

  const load = async () => { const d = await Offre.list(); setOffres(d.filter(o=>o.est_active)); };
  useEffect(()=>{ load().finally(()=>setLoading(false)); },[]);

  const refresh = async () => { setSpinning(true); await load(); setTimeout(()=>setSpinning(false),600); if(navigator.vibrate)navigator.vibrate([8,20,8]); };
  const toggleFav = id => { const nf=favs.includes(id)?favs.filter(f=>f!==id):[...favs,id]; setFavs(nf); localStorage.setItem("cp_favs",JSON.stringify(nf)); };
  const showToast = added => { setToast(added); setTimeout(()=>setToast(null),2000); };

  // Rayon max selon premium
  const rayonActif = isPremium ? rayonPremium : 10;

  const list = offres
    .map(o=>({...o, _dist:userPos&&o.latitude?haversine(userPos.lat,userPos.lng,o.latitude,o.longitude):null}))
    .filter(o=>{
      if(cat!=="Tout"&&o.categorie!==cat) return false;
      if(q&&!o.titre.toLowerCase().includes(q.toLowerCase())&&!o.commercant_nom?.toLowerCase().includes(q.toLowerCase())) return false;
      // Rayon limité pour non-premium
      if(userPos&&o._dist!==null&&o._dist>rayonActif) return false;
      return true;
    })
    .sort((a,b)=>{
      if(sort==="distance"&&userPos) return (a._dist||999)-(b._dist||999);
      if(sort==="reduction") return b.valeur_reduction-a.valeur_reduction;
      // Premium → flash en priorité
      if(isPremium&&a.est_urgente&&!b.est_urgente) return -1;
      return 0;
    });

  const flash = list.filter(o=>o.est_urgente);
  const normal = list.filter(o=>!o.est_urgente);
  // Offres exclusives visibles pour tous (mais locked si non premium)
  const exclusives = offres.filter(o=>(o.valeur_reduction>=50||(o.est_urgente&&o.stock_restant!=null&&o.stock_restant<10))&&!flash.find(f=>f.id===o.id));

  // Alertes enregistrées
  const alertes = (() => { try { return JSON.parse(localStorage.getItem("cp_alertes")||"null"); } catch { return null; } })();

  return (
    <div style={{ background:DS.ink05, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Toast */}
      {toast!==null && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:DS.ink, color:DS.white, borderRadius:DS.pill, padding:"10px 18px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:DS.e4, whiteSpace:"nowrap", animation:"toastIn .3s cubic-bezier(.34,1.56,.64,1)" }}>
          {Ic.heart(toast?DS.danger:DS.ink40,13,toast)}
          {toast?"Ajouté aux favoris":"Retiré des favoris"}
        </div>
      )}

      {/* Paywall */}
      {showPaywall && <PremiumPaywall onClose={()=>setShowPaywall(false)} navigate={navigate}/>}
      {showAlertes && <AlerteSetup isPremium={isPremium} navigate={navigate} onClose={()=>setShowAlertes(false)}/>}

      {/* ── HEADER ── */}
      <header style={{ background:DS.white, position:"sticky", top:0, zIndex:100, borderBottom:`1px solid ${DS.ink10}` }}>
        <div style={{ padding:"52px 16px 12px", display:"flex", alignItems:"center", gap:10 }}>
          <CPLogo size={34}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:DS.ink, letterSpacing:-.5, display:"flex", alignItems:"center", gap:7 }}>
              Click & Promo
              {isPremium && <span style={{ fontSize:10, fontWeight:800, color:DS.brand, background:`${DS.brand}12`, borderRadius:DS.pill, padding:"2px 8px", letterSpacing:.5 }}>PREMIUM</span>}
            </div>
            <div style={{ fontSize:11, color:DS.ink40, display:"flex", alignItems:"center", gap:4 }}>
              {Ic.pin(userPos?DS.success:DS.ink20,11)}
              {userPos?(isPremium?`Rayon ${rayonPremium}km — Premium`:"Offres proches"):"Toute la France"}
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {/* Bouton alertes Premium */}
            <button onClick={()=>isPremium?setShowAlertes(true):setShowPaywall(true)} style={{ width:36, height:36, borderRadius:DS.pill, background:alertes?`${DS.brand}12`:DS.white, border:`1px solid ${alertes?`${DS.brand}30`:DS.ink10}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:alertes?DS.brand:DS.ink40 }}>
              <span style={{display:"flex"}}>{IcAlerte(15)}</span>
            </button>
            <button onClick={()=>setSearchOpen(o=>!o)} style={{ width:36, height:36, borderRadius:DS.pill, background:searchOpen?DS.ink05:DS.white, border:`1px solid ${DS.ink10}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {Ic.search(DS.ink60)}
            </button>
            <button onClick={refresh} style={{ width:36, height:36, borderRadius:DS.pill, background:DS.white, border:`1px solid ${DS.ink10}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ display:"flex", animation:spinning?"spin .6s linear infinite":"none" }}>{Ic.refresh(DS.ink60)}</span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div style={{ padding:"0 16px 10px" }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex" }}>{Ic.search(DS.ink20)}</span>
              <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher une offre, un commerce…"
                style={{ width:"100%", border:`1.5px solid ${DS.ink10}`, borderRadius:DS.lg, padding:"11px 14px 11px 40px", fontSize:14, outline:"none", background:DS.ink05, color:DS.ink, boxSizing:"border-box", fontFamily:DS.font, transition:"border-color .2s" }}
                onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
            </div>
          </div>
        )}

        {/* Catégories */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", padding:"0 16px 12px", scrollbarWidth:"none" }}>
          {CATS.map(c=>{
            const on=cat===c; const meta=CAT_META[c]||CAT_META["Tout"];
            return <button key={c} onClick={()=>setCat(c)} style={{ flexShrink:0, cursor:"pointer", fontFamily:DS.font, border:`1.5px solid ${on?meta.color:DS.ink10}`, borderRadius:DS.pill, padding:"6px 13px", background:on?meta.color:DS.white, color:on?DS.white:DS.ink60, fontSize:12, fontWeight:on?700:500, display:"flex", alignItems:"center", gap:6, transition:"all .18s", boxShadow:on?`0 4px 12px ${meta.color}30`:"none" }}>
              <span style={{ display:"flex", color:on?DS.white:meta.color }}>{meta.icon(on?DS.white:meta.color,13)}</span>
              {c}
            </button>;
          })}
        </div>

        {/* Sort + rayon non-premium */}
        <div style={{ display:"flex", gap:6, padding:"0 16px 12px", alignItems:"center" }}>
          {[{k:"distance",l:"Distance"},{k:"reduction",l:"Réduction"}].map(t=>(
            <button key={t.k} onClick={()=>setSort(t.k)} style={{ border:`1px solid ${sort===t.k?DS.brand:DS.ink10}`, borderRadius:DS.pill, padding:"5px 12px", background:sort===t.k?DS.brand:DS.white, color:sort===t.k?DS.white:DS.ink60, fontSize:11, fontWeight:sort===t.k?700:500, cursor:"pointer", fontFamily:DS.font, transition:"all .18s" }}>{t.l}</button>
          ))}
          {!isPremium && userPos && (
            <button onClick={()=>setShowPaywall(true)} style={{ border:"none", borderRadius:DS.pill, padding:"5px 10px", background:`${DS.brand}10`, color:DS.brand, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              {Ic.lock(DS.brand,10)} Rayon 10km
            </button>
          )}
          <div style={{ marginLeft:"auto", fontSize:11, color:DS.ink40 }}>{list.length} résultat{list.length!==1?"s":""}</div>
        </div>
      </header>

      {/* ── CONTENU ── */}
      <main style={{ padding:"14px 14px 100px" }}>

        {/* Barre économies */}
        {!loading && <EcoBar offres={offres} isPremium={isPremium}/>}

        {/* Bannière premium (non premium uniquement) */}
        {!isPremium && !loading && offres.length > 4 && <PremiumBanner navigate={navigate}/>}

        {/* Flash deals */}
        {!loading && flash.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:DS.danger, borderRadius:DS.sm, padding:"4px 10px" }}>
                {Ic.bolt(DS.white,12)}
                <span style={{ fontSize:11, fontWeight:700, color:DS.white, letterSpacing:.8, textTransform:"uppercase" }}>Flash deals</span>
              </div>
              <span style={{ fontSize:12, color:DS.ink40 }}>· {flash.length} offre{flash.length>1?"s":""}</span>
              {isPremium && <span style={{ fontSize:10, fontWeight:700, color:DS.brand, background:`${DS.brand}10`, borderRadius:DS.pill, padding:"2px 7px", marginLeft:"auto" }}>Prioritaire ✦</span>}
            </div>
            {flash.map(o=><OffreCard key={o.id} offre={o} favs={favs} onToggle={toggleFav} onFavChange={showToast} userPos={userPos} isPremium={isPremium} onPremiumClick={()=>setShowPaywall(true)}/>)}
          </section>
        )}

        {/* Section normale */}
        {!loading && normal.length > 0 && (
          <section>
            {flash.length > 0 && <div style={{ fontSize:11, fontWeight:700, color:DS.ink20, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Toutes les offres</div>}
            {normal.map(o=><OffreCard key={o.id} offre={o} favs={favs} onToggle={toggleFav} onFavChange={showToast} userPos={userPos} isPremium={isPremium} onPremiumClick={()=>setShowPaywall(true)}/>)}
          </section>
        )}

        {/* Skeletons */}
        {loading && [1,2,3].map(i=><Skeleton key={i}/>)}

        {/* Vide */}
        {!loading && list.length === 0 && (
          <div style={{ textAlign:"center", padding:"72px 24px" }}>
            <div style={{ width:72, height:72, borderRadius:DS.xl, background:DS.white, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", boxShadow:DS.e1 }}>{Ic.search(DS.ink20,30)}</div>
            <div style={{ fontSize:18, fontWeight:700, color:DS.ink, marginBottom:8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize:14, color:DS.ink40, lineHeight:1.7, marginBottom:20 }}>Essayez une autre catégorie ou revenez plus tard.</div>
            <button onClick={()=>{setCat("Tout");setQ("");}} style={{ background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"12px 24px", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:DS.eBrand }}>Tout afficher</button>
          </div>
        )}
      </main>

      <NavBar active="feed"/>
      <style>{`
        @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
