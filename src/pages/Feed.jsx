import { useState, useEffect, useRef } from "react";
import { Offre, ProfilUtilisateur } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo } from "./theme";

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
        <div style={{ fontWeight:800, fontSize:18, color:DS.ink, marginBottom:16 }}>Configurer les alertes</div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:DS.ink40, marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>Catégories</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {allCats.map(c=><button key={c} onClick={()=>toggle(c)} style={{ background:cats.includes(c)?DS.brand:DS.ink05, color:cats.includes(c)?DS.white:DS.ink, border:"none", borderRadius:DS.pill, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .18s" }}>{c}</button>)}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:DS.ink40, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Rayon : {rayon}km</div>
          <input type="range" min={1} max={25} value={rayon} onChange={e=>setRayon(parseInt(e.target.value))} style={{ width:"100%", accentColor:DS.brand, height:3 }}/>
        </div>
        {saved && <div style={{ background:DS.success+"12", color:DS.success, padding:"10px 12px", borderRadius:DS.sm, fontSize:13, fontWeight:600, marginBottom:12, textAlign:"center" }}>✅ Alertes configurées</div>}
        <button onClick={save} style={{ width:"100%", background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"14px", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:DS.eBrand }}>Sauvegarder</button>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Main Feed ──────────────────────────────────────────────────────────────
export default function Feed() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("Tout");
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState("recent");
  const [userPos, setUserPos] = useState(null);
  const [favs, setFavs] = useState([]);
  const [premiumModal, setPremiumModal] = useState(false);
  const [alertesModal, setAlertsModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);

  // Charger les offres
  useEffect(() => {
    const loadData = async () => {
      const data = await Offre.list();
      setOffres(data.filter(o => o.est_active));
      setLoading(false);
    };
    loadData();
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Favoris depuis localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cp_favs") || "[]");
    setFavs(stored);
  }, []);

  // Pull-to-refresh
  const handleTouchStart = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      const start = e.touches[0].clientY;
      const handleTouchMove = (ev) => {
        const delta = ev.touches[0].clientY - start;
        if (delta > 0) setPullY(Math.min(delta, 100));
      };
      const handleTouchEnd = () => {
        if (pullY > 50) refresh();
        setPullY(0);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    const data = await Offre.list();
    setOffres(data.filter(o => o.est_active));
    setRefreshing(false);
  };

  // Filtrage
  let filtered = offres.filter(o => {
    if (catFilter !== "Tout" && o.categorie !== catFilter) return false;
    if (recherche && !o.titre.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  // Tri
  if (tri === "reduction") filtered = [...filtered].sort((a, b) => b.valeur_reduction - a.valeur_reduction);
  else if (tri === "urgence") filtered = [...filtered].sort((a, b) => (b.est_urgente ? 1 : 0) - (a.est_urgente ? 1 : 0));
  else if (tri === "proximite" && userPos) filtered = [...filtered].map(o => ({ ...o, dist: haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) })).sort((a, b) => a.dist - b.dist);

  const toggleFav = (id) => {
    const newFavs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavs(newFavs);
    localStorage.setItem("cp_favs", JSON.stringify(newFavs));
    navigator.vibrate?.(50);
  };

  return (
    <div ref={scrollRef} onTouchStart={handleTouchStart} style={{ background:DS.ink05, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto", overflow:"auto", position:"relative" }}>
      {/* Pull indicator */}
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:50, background:DS.white, borderBottom:`1px solid ${DS.ink10}`, padding:`16px 16px max(${pullY}px, 0px)`, transition:pullY>0?"none":"padding 0.3s", display:"flex", alignItems:"center", gap:12 }}>
        {pullY > 0 && (
          <div style={{ transform:`scale(${pullY/100})`, opacity:pullY/100, transition:"transform 0.1s" }}>
            {refreshing ? Ic.loader(DS.brand,16) : Ic.arrowdown(DS.brand,16)}
          </div>
        )}
      </div>

      {/* Header */}
      <header style={{ background:DS.white, borderBottom:`1px solid ${DS.ink10}`, padding:"52px 16px 14px", marginTop:pullY }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <CPLogo size={32}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:DS.ink, letterSpacing:-0.5 }}>Click & Promo</div>
            <div style={{ fontSize:11, color:DS.ink40, display:"flex", alignItems:"center", gap:4 }}>
              {Ic.pin(userPos ? DS.success : DS.ink20, 10)}
              {userPos ? "Près de vous" : "Paris, France"}
            </div>
          </div>
          <button onClick={() => setAlertsModal(true)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:38, height:38, borderRadius:DS.md, background:DS.ink05, border:"none", cursor:"pointer", color:DS.ink40 }}>
            {Ic.bell(DS.ink40,16)}
          </button>
        </div>

        {/* Recherche */}
        <div style={{ background:DS.white, border:`1px solid ${DS.ink10}`, borderRadius:DS.lg, display:"flex", alignItems:"center", padding:"10px 14px", gap:8, marginBottom:12 }}>
          {Ic.search(DS.ink20,16)}
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Chercher une offre…"
            style={{ border:"none", outline:"none", flex:1, fontSize:14, background:"transparent", color:DS.ink, fontFamily:DS.font }}
          />
          {recherche && <button onClick={() => setRecherche("")} style={{ background:"none", border:"none", cursor:"pointer", color:DS.ink20 }}>{Ic.x(DS.ink20,14)}</button>}
        </div>

        {/* Catégories */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", marginBottom:12 }}>
          {CATS.map(c => {
            const on = catFilter === c;
            return (
              <button key={c} onClick={() => setCatFilter(c)} style={{ flexShrink:0, border:`1.5px solid ${on ? DS.brand : DS.ink10}`, borderRadius:DS.pill, padding:"6px 12px", background:on ? DS.brand : DS.white, color:on ? DS.white : DS.ink60, fontSize:11, fontWeight:on ? 700 : 500, cursor:"pointer", transition:"all 0.18s", fontFamily:DS.font }}>
                {c}
              </button>
            );
          })}
        </div>

        {/* Tri */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:700, color:DS.ink40, textTransform:"uppercase", letterSpacing:0.5 }}>
            {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
          </span>
          <select value={tri} onChange={e => setTri(e.target.value)} style={{ background:DS.white, border:`1px solid ${DS.ink10}`, borderRadius:DS.sm, padding:"6px 10px", fontSize:12, color:DS.ink60, outline:"none", cursor:"pointer", fontFamily:DS.font }}>
            <option value="recent">Récents</option>
            <option value="reduction">Meilleures réductions</option>
            <option value="urgence">Plus urgentes</option>
            {userPos && <option value="proximite">Plus proches</option>}
          </select>
        </div>
      </header>

      {/* Contenu */}
      <div style={{ padding:"12px 14px 100px" }}>
        {loading && [1,2,3,4].map(i => <Skeleton key={i}/>)}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏷️</div>
            <div style={{ fontSize:16, fontWeight:700, color:DS.ink, marginBottom:6 }}>Aucune offre</div>
            <div style={{ fontSize:13, color:DS.ink40 }}>Essayez avec d'autres filtres</div>
          </div>
        )}

        {filtered.map(offre => {
          const isFav = favs.includes(offre.id);
          const stockPct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial) * 100 : 100;
          return (
            <div key={offre.id} onClick={() => navigate(`/OffreDetail?id=${offre.id}`)} style={{ background:DS.white, borderRadius:DS.xl, overflow:"hidden", marginBottom:12, boxShadow:DS.e1, cursor:"pointer", position:"relative" }}>
              <div style={{ position:"relative", height:200 }}>
                <img src={offre.image_url} alt={offre.titre} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => e.target.style.display="none"}/>
                <div style={{ position:"absolute", top:12, left:12, background:DS.brand, color:DS.white, borderRadius:DS.sm, padding:"5px 12px", fontWeight:800, fontSize:14 }}>
                  -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleFav(offre.id); }} style={{ position:"absolute", top:10, right:12, background:"rgba(255,255,255,0.95)", border:"none", borderRadius:"50%", width:36, height:36, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isFav ? "❤️" : "🤍"}
                </button>
                {offre.est_urgente && (
                  <div style={{ position:"absolute", bottom:10, left:12 }}>
                    <Timer dateFin={offre.date_fin}/>
                  </div>
                )}
              </div>

              <div style={{ padding:"12px 14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  <span style={{ fontSize:13 }}>🏷️</span>
                  <span style={{ fontSize:12, color:DS.ink40, fontWeight:500 }}>{offre.categorie}</span>
                  <span style={{ fontSize:12, color:DS.ink20, marginLeft:"auto" }}>📍 {offre.ville}</span>
                </div>

                <div style={{ fontWeight:700, fontSize:15, color:DS.ink, marginBottom:4, lineHeight:1.3 }}>
                  {offre.titre}
                </div>

                <div style={{ fontSize:13, color:DS.ink40, marginBottom:10 }}>
                  {offre.commercant_nom}
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                    {offre.prix_promo > 0 && <span style={{ fontSize:18, fontWeight:800, color:DS.brand }}>{offre.prix_promo}€</span>}
                    {offre.prix_original > 0 && <span style={{ fontSize:12, color:DS.ink20, textDecoration:"line-through" }}>{offre.prix_original}€</span>}
                  </div>
                  {offre.stock_restant !== undefined && (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:11, color:stockPct < 30 ? DS.error : DS.ink40, fontWeight:600 }}>
                        {offre.stock_restant} restant{offre.stock_restant > 1 ? "s" : ""}
                      </div>
                      <div style={{ background:DS.ink05, borderRadius:3, height:4, width:70, marginTop:3 }}>
                        <div style={{ background:stockPct < 30 ? DS.error : DS.success, height:"100%", borderRadius:3, width:`${Math.min(stockPct, 100)}%` }}/>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {premiumModal && <PremiumPaywall onClose={() => setPremiumModal(false)} navigate={navigate}/>}
      {alertesModal && <AlerteSetup isPremium={isPremium} navigate={navigate} onClose={() => setAlertsModal(false)}/>}
      
      <NavBar active="feed"/>
      <style>{`
        @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}
