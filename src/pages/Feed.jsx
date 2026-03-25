import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo } from "./Home";

// ── Utils ──────────────────────────────────────────────────────────────────
export function haversine(la1,lo1,la2,lo2){const R=6371,dL=((la2-la1)*Math.PI)/180,dO=((lo2-lo1)*Math.PI)/180,a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
export function formatDist(km){return km<1?`${Math.round(km*1000)} m`:`${km.toFixed(1)} km`;}

const CATS = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Pharmacie","Services"];
const CAT_META = {
  "Tout":            { color:"#0A0A0A", icon:(c,s)=>Ic.cat.tout(c,s) },
  "Restaurant":      { color:"#E53E3E", icon:(c,s)=>Ic.cat.restaurant(c,s) },
  "Boutique":        { color:"#7C3AED", icon:(c,s)=>Ic.cat.boutique(c,s) },
  "Beauté & Coiffure":{ color:"#D53F8C", icon:(c,s)=>Ic.cat.beaute(c,s) },
  "Fitness & Sport": { color:"#00B37E", icon:(c,s)=>Ic.cat.sport(c,s) },
  "Épicerie":        { color:"#D97706", icon:(c,s)=>Ic.cat.epicerie(c,s) },
  "Pharmacie":       { color:"#0369A1", icon:(c,s)=>Ic.cat.pharmacie(c,s) },
  "Services":        { color:"#2563EB", icon:(c,s)=>Ic.cat.services(c,s) },
};

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
    <nav style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:430, zIndex:999,
      background:"rgba(255,255,255,0.94)",
      backdropFilter:"blur(20px) saturate(160%)",
      WebkitBackdropFilter:"blur(20px) saturate(160%)",
      borderTop:`1px solid ${DS.ink10}`,
      display:"flex",
      paddingBottom:"max(env(safe-area-inset-bottom),8px)",
    }}>
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
  const [txt, setTxt] = useState(""); const [crit, setCrit] = useState(false);
  useEffect(() => {
    const u = () => {
      const d = new Date(dateFin) - new Date();
      if (d <= 0) { setTxt("Expiré"); return; }
      const h=Math.floor(d/3600000), m=Math.floor((d%3600000)/60000), s=Math.floor((d%60000)/1000);
      setCrit(d < 3600000);
      setTxt(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    u(); const id = setInterval(u, 1000); return () => clearInterval(id);
  }, [dateFin]);
  const col = crit ? DS.danger : DS.brand;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", color:DS.white, borderRadius:DS.pill, padding:"4px 10px", fontSize:11, fontWeight:600, letterSpacing:0.2 }}>
      {Ic.bolt(DS.white, 11)} {txt}
    </span>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background:DS.white, borderRadius:DS.xl, overflow:"hidden", marginBottom:12, boxShadow:DS.e1 }}>
      <div style={{ height:200, background:`linear-gradient(90deg,${DS.ink05} 25%,${DS.white} 50%,${DS.ink05} 75%)`, backgroundSize:"400% 100%", animation:"sh 1.4s ease infinite" }}/>
      <div style={{ padding:"14px 16px 18px" }}>
        <div style={{ height:10, background:DS.ink05, borderRadius:4, width:"45%", marginBottom:10 }}/>
        <div style={{ height:16, background:DS.ink05, borderRadius:4, width:"80%", marginBottom:8 }}/>
        <div style={{ height:12, background:DS.ink05, borderRadius:4, width:"55%", marginBottom:14 }}/>
        <div style={{ height:20, background:DS.ink05, borderRadius:4, width:"30%" }}/>
      </div>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
function OffreCard({ offre, favs, onToggle, onFavChange, userPos }) {
  const isFav = favs.includes(offre.id);
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lng, offre.latitude, offre.longitude) : null;
  const pct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial) * 100 : 100;
  const expired = offre.date_fin && new Date(offre.date_fin) < new Date();
  const meta = CAT_META[offre.categorie] || CAT_META["Tout"];
  const bigDiscount = offre.valeur_reduction >= 40;

  const toggleFav = e => {
    e.preventDefault(); e.stopPropagation();
    onToggle(offre.id);
    onFavChange(!isFav);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration:"none", display:"block", marginBottom:12 }}>
      <article style={{ background:DS.white, borderRadius:DS.xl, overflow:"hidden", boxShadow:DS.e1 }}>
        {/* IMAGE */}
        <div style={{ position:"relative", height:210 }}>
          <img src={offre.image_url} alt={offre.titre} loading="lazy"
            style={{ width:"100%", height:"100%", objectFit:"cover" }}
            onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"}
          />
          {/* Overlay gradient */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)" }}/>

          {/* Badge % — haut gauche */}
          <div style={{
            position:"absolute", top:14, left:14,
            background: bigDiscount ? DS.danger : DS.ink,
            color:DS.white, borderRadius:DS.sm, padding:"5px 12px",
            fontWeight:800, fontSize:14, letterSpacing:-0.3,
          }}>
            -{offre.valeur_reduction}{offre.type_reduction==="pourcentage"?"%":"€"}
          </div>

          {/* Favori — haut droit */}
          <button onClick={toggleFav} aria-label="Favori" style={{
            position:"absolute", top:12, right:12,
            width:36, height:36, borderRadius:DS.pill,
            background:"rgba(255,255,255,0.88)", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            backdropFilter:"blur(10px)",
            transition:"transform .2s cubic-bezier(.34,1.56,.64,1)",
            transform: isFav ? "scale(1.12)" : "scale(1)",
          }}>
            {Ic.heart(isFav ? DS.danger : DS.ink40, 17, isFav)}
          </button>

          {/* Bas image */}
          <div style={{ position:"absolute", bottom:12, left:14, right:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            {offre.est_urgente && !expired && <Timer dateFin={offre.date_fin}/>}
            {dist !== null && (
              <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", color:DS.white, borderRadius:DS.pill, padding:"4px 10px", fontSize:11, fontWeight:600 }}>
                {Ic.pin(DS.white, 12)} {formatDist(dist)}
              </span>
            )}
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ padding:"14px 16px 16px" }}>
          {/* Catégorie pill */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginBottom:9, background:`${meta.color}12`, borderRadius:DS.pill, padding:"3px 10px" }}>
            <span style={{ display:"flex", color:meta.color }}>{meta.icon(meta.color, 12)}</span>
            <span style={{ fontSize:11, fontWeight:700, color:meta.color, letterSpacing:0.4, textTransform:"uppercase" }}>{offre.categorie}</span>
          </div>

          {/* Titre */}
          <div style={{ fontSize:15, fontWeight:700, color:DS.ink, lineHeight:1.35, letterSpacing:-0.2, marginBottom:5 }}>
            {offre.titre}
          </div>

          {/* Commerce */}
          <div style={{ display:"flex", alignItems:"center", gap:5, color:DS.ink40, fontSize:12, marginBottom:12 }}>
            {Ic.store(DS.ink20, 13)}
            <span>{offre.commercant_nom}</span>
          </div>

          {/* Prix + stock */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              {offre.prix_promo > 0
                ? <span style={{ fontSize:22, fontWeight:800, color:DS.brand, letterSpacing:-0.8 }}>{offre.prix_promo}€</span>
                : <span style={{ fontSize:18, fontWeight:700, color:DS.success }}>Gratuit</span>}
              {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
                <span style={{ fontSize:13, color:DS.ink20, textDecoration:"line-through" }}>{offre.prix_original}€</span>
              )}
            </div>
            {offre.stock_restant != null && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                <span style={{ fontSize:11, fontWeight:600, color: pct < 30 ? DS.danger : DS.ink40 }}>
                  {offre.stock_restant} dispo
                </span>
                <div style={{ width:52, height:3, background:DS.ink10, borderRadius:DS.pill }}>
                  <div style={{ height:"100%", borderRadius:DS.pill, background: pct<30 ? DS.danger : DS.success, width:`${Math.min(pct,100)}%`, transition:"width 1s" }}/>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Feed ───────────────────────────────────────────────────────────────────
export default function Feed() {
  const [offres, setOffres]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat]         = useState("Tout");
  const [q, setQ]             = useState("");
  const [sort, setSort]       = useState("distance");
  const [userPos, setUserPos] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [favs, setFavs]       = useState(() => { try { return JSON.parse(localStorage.getItem("cp_favs")||"[]"); } catch { return []; } });
  const [toast, setToast]     = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const load = async () => { const d = await Offre.list(); setOffres(d.filter(o => o.est_active)); };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const refresh = async () => {
    setSpinning(true); await load();
    setTimeout(() => setSpinning(false), 600);
    if (navigator.vibrate) navigator.vibrate([8, 20, 8]);
  };

  const toggleFav = id => {
    const nf = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavs(nf); localStorage.setItem("cp_favs", JSON.stringify(nf));
  };
  const showToast = added => { setToast(added); setTimeout(() => setToast(null), 2000); };

  const list = offres
    .map(o => ({ ...o, _dist: userPos && o.latitude ? haversine(userPos.lat, userPos.lng, o.latitude, o.longitude) : null }))
    .filter(o => {
      if (cat !== "Tout" && o.categorie !== cat) return false;
      if (q && !o.titre.toLowerCase().includes(q.toLowerCase()) && !o.commercant_nom?.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "distance" && userPos) return (a._dist||999) - (b._dist||999);
      if (sort === "reduction") return b.valeur_reduction - a.valeur_reduction;
      return 0;
    });

  const flash  = list.filter(o => o.est_urgente);
  const normal = list.filter(o => !o.est_urgente);

  return (
    <div style={{ background:DS.ink05, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Toast */}
      {toast !== null && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:DS.ink, color:DS.white, borderRadius:DS.pill, padding:"10px 18px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:DS.e4, whiteSpace:"nowrap", animation:"toastIn .3s cubic-bezier(.34,1.56,.64,1)" }}>
          {Ic.heart(toast ? DS.danger : DS.ink40, 13, toast)}
          {toast ? "Ajouté aux favoris" : "Retiré des favoris"}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{ background:DS.white, position:"sticky", top:0, zIndex:100, borderBottom:`1px solid ${DS.ink10}` }}>
        {/* Top row */}
        <div style={{ padding:"52px 16px 12px", display:"flex", alignItems:"center", gap:10 }}>
          <CPLogo size={34}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:DS.ink, letterSpacing:-0.5 }}>Click & Promo</div>
            <div style={{ fontSize:11, color:DS.ink40, display:"flex", alignItems:"center", gap:4 }}>
              {Ic.pin(userPos ? DS.success : DS.ink20, 11)}
              {userPos ? "Offres proches de vous" : "Toute la France"}
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => setSearchOpen(o => !o)} style={{ width:36, height:36, borderRadius:DS.pill, background:searchOpen?DS.ink05:DS.white, border:`1px solid ${DS.ink10}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {Ic.search(DS.ink60)}
            </button>
            <button onClick={refresh} style={{ width:36, height:36, borderRadius:DS.pill, background:DS.white, border:`1px solid ${DS.ink10}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ display:"flex", animation:spinning?"spin .6s linear infinite":"none" }}>{Ic.refresh(DS.ink60)}</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche (collapse) */}
        {searchOpen && (
          <div style={{ padding:"0 16px 10px" }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex" }}>{Ic.search(DS.ink20)}</span>
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Rechercher une offre, un commerce…"
                style={{ width:"100%", border:`1.5px solid ${DS.ink10}`, borderRadius:DS.lg, padding:"11px 14px 11px 40px", fontSize:14, outline:"none", background:DS.ink05, color:DS.ink, boxSizing:"border-box", fontFamily:DS.font, transition:"border-color .2s" }}
                onFocus={e => e.target.style.borderColor = DS.brand}
                onBlur={e => e.target.style.borderColor = DS.ink10}
              />
            </div>
          </div>
        )}

        {/* Catégories */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", padding:"0 16px 12px", scrollbarWidth:"none" }}>
          {CATS.map(c => {
            const on = cat === c;
            const meta = CAT_META[c] || CAT_META["Tout"];
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                flexShrink:0, cursor:"pointer", fontFamily:DS.font,
                border:`1.5px solid ${on ? meta.color : DS.ink10}`,
                borderRadius:DS.pill, padding:"6px 13px",
                background: on ? meta.color : DS.white,
                color: on ? DS.white : DS.ink60,
                fontSize:12, fontWeight: on ? 700 : 500,
                display:"flex", alignItems:"center", gap:6,
                transition:"all .18s",
                boxShadow: on ? `0 4px 12px ${meta.color}30` : "none",
              }}>
                <span style={{ display:"flex", color: on ? DS.white : meta.color }}>
                  {meta.icon(on ? DS.white : meta.color, 13)}
                </span>
                {c}
              </button>
            );
          })}
        </div>

        {/* Sort pills */}
        <div style={{ display:"flex", gap:6, padding:"0 16px 12px" }}>
          {[
            { k:"distance",  label:"Distance" },
            { k:"reduction", label:"Réduction" },
          ].map(t => (
            <button key={t.k} onClick={() => setSort(t.k)} style={{
              border:`1px solid ${sort===t.k ? DS.brand : DS.ink10}`,
              borderRadius:DS.pill, padding:"5px 12px",
              background: sort===t.k ? DS.brand : DS.white,
              color: sort===t.k ? DS.white : DS.ink60,
              fontSize:11, fontWeight: sort===t.k ? 700 : 500,
              cursor:"pointer", fontFamily:DS.font, letterSpacing:0.2,
              transition:"all .18s",
            }}>{t.label}</button>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4, fontSize:11, color:DS.ink40 }}>
            {Ic.pin(DS.ink20, 11)}
            {list.length} résultat{list.length!==1?"s":""}
          </div>
        </div>
      </header>

      {/* ── CONTENU ────────────────────────────────────────────── */}
      <main style={{ padding:"14px 14px 100px" }}>

        {/* Flash deals */}
        {!loading && flash.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:DS.danger, borderRadius:DS.sm, padding:"4px 10px" }}>
                {Ic.bolt(DS.white, 12)}
                <span style={{ fontSize:11, fontWeight:700, color:DS.white, letterSpacing:0.8, textTransform:"uppercase" }}>Flash deals</span>
              </div>
              <span style={{ fontSize:12, color:DS.ink40 }}>· {flash.length} offre{flash.length>1?"s":""}</span>
            </div>
            {flash.map(o => <OffreCard key={o.id} offre={o} favs={favs} onToggle={toggleFav} onFavChange={showToast} userPos={userPos}/>)}
          </section>
        )}

        {/* Section normale */}
        {!loading && normal.length > 0 && (
          <section>
            {flash.length > 0 && (
              <div style={{ fontSize:11, fontWeight:700, color:DS.ink20, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>
                Toutes les offres
              </div>
            )}
            {normal.map(o => <OffreCard key={o.id} offre={o} favs={favs} onToggle={toggleFav} onFavChange={showToast} userPos={userPos}/>)}
          </section>
        )}

        {/* Skeletons */}
        {loading && [1,2,3].map(i => <Skeleton key={i}/>)}

        {/* Vide */}
        {!loading && list.length === 0 && (
          <div style={{ textAlign:"center", padding:"72px 24px" }}>
            <div style={{ width:72, height:72, borderRadius:DS.xl, background:DS.white, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", boxShadow:DS.e1 }}>
              {Ic.search(DS.ink20, 30)}
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:DS.ink, marginBottom:8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize:14, color:DS.ink40, lineHeight:1.7, marginBottom:20 }}>Essayez une autre catégorie ou revenez plus tard.</div>
            <button onClick={() => { setCat("Tout"); setQ(""); }} style={{ background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"12px 24px", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:DS.eBrand }}>
              Tout afficher
            </button>
          </div>
        )}
      </main>

      <NavBar active="feed"/>

      <style>{`
        @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
