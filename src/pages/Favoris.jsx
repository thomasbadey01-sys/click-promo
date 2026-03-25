import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { DS, Ic, CPLogo } from "./Home";

export default function Favoris() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]); const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState([]); const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("cp_favs")||"[]"); setFavIds(ids);
    if (!ids.length) { setLoading(false); return; }
    Offre.list().then(all => { setOffres(all.filter(o => ids.includes(o.id))); setLoading(false); });
  }, []);

  const remove = id => {
    setRemoving(id);
    setTimeout(() => {
      const nf = favIds.filter(f => f !== id);
      setFavIds(nf); setOffres(p => p.filter(o => o.id !== id));
      localStorage.setItem("cp_favs", JSON.stringify(nf)); setRemoving(null);
      if (navigator.vibrate) navigator.vibrate(15);
    }, 250);
  };

  const filtered = offres.filter(o => {
    if (filter === "actives") return o.est_active && !(o.date_fin && new Date(o.date_fin) < new Date());
    if (filter === "flash") return o.est_urgente && o.est_active;
    return true;
  });

  const nbActives = offres.filter(o => o.est_active && !(o.date_fin && new Date(o.date_fin) < new Date())).length;
  const nbFlash = offres.filter(o => o.est_urgente && o.est_active).length;

  return (
    <div style={{ background:DS.ink05, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Header */}
      <header style={{ background:DS.white, borderBottom:`1px solid ${DS.ink10}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ padding:"52px 16px 12px", display:"flex", alignItems:"center", gap:10 }}>
          <CPLogo size={32}/>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:DS.ink, letterSpacing:-0.5 }}>Mes Favoris</div>
            <div style={{ fontSize:11, color:DS.ink40 }}>{offres.length} offre{offres.length!==1?"s":""} sauvegardée{offres.length!==1?"s":""}</div>
          </div>
          {nbFlash > 0 && (
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, background:DS.danger, borderRadius:DS.pill, padding:"4px 10px" }}>
              {Ic.bolt(DS.white, 11)}
              <span style={{ color:DS.white, fontSize:11, fontWeight:700 }}>{nbFlash}</span>
            </div>
          )}
        </div>
        {offres.length > 0 && (
          <div style={{ display:"flex", gap:6, padding:"0 16px 12px", overflowX:"auto", scrollbarWidth:"none" }}>
            {[{k:"all",l:`Tout (${offres.length})`},{k:"actives",l:`Actives (${nbActives})`},{k:"flash",l:`Flash (${nbFlash})`}].map(t => (
              <button key={t.k} onClick={() => setFilter(t.k)} style={{ flexShrink:0, border:`1.5px solid ${filter===t.k?DS.brand:DS.ink10}`, borderRadius:DS.pill, padding:"6px 13px", background:filter===t.k?DS.brand:DS.white, color:filter===t.k?DS.white:DS.ink60, fontSize:12, fontWeight:filter===t.k?700:500, cursor:"pointer", fontFamily:DS.font, transition:"all .18s" }}>{t.l}</button>
            ))}
          </div>
        )}
      </header>

      <main style={{ padding:"14px 14px 100px" }}>

        {/* Skeletons */}
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ background:DS.white, borderRadius:DS.lg, height:96, marginBottom:10, boxShadow:DS.e1, overflow:"hidden" }}>
            <div style={{ height:"100%", background:`linear-gradient(90deg,${DS.ink05} 25%,${DS.white} 50%,${DS.ink05} 75%)`, backgroundSize:"400% 100%", animation:"sh 1.4s infinite" }}/>
          </div>
        ))}

        {/* Empty */}
        {!loading && offres.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ width:80, height:80, borderRadius:DS.xl, background:DS.white, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:DS.e2 }}>
              {Ic.heart(DS.ink10, 34)}
            </div>
            <div style={{ fontSize:20, fontWeight:700, color:DS.ink, marginBottom:8, letterSpacing:-0.3 }}>Pas encore de favoris</div>
            <div style={{ fontSize:14, color:DS.ink40, marginBottom:28, lineHeight:1.75 }}>Appuyez sur l'icône {Ic.heart(DS.ink40,13,true)} sur une offre pour la sauvegarder.</div>
            <button onClick={() => navigate("/Feed")} style={{ background:DS.brand, color:DS.white, border:"none", borderRadius:DS.lg, padding:"13px 28px", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:DS.eBrand }}>Découvrir les offres</button>
          </div>
        )}

        {/* Empty filter */}
        {!loading && offres.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 24px" }}>
            <div style={{ fontSize:13, color:DS.ink40, marginBottom:12 }}>Aucune offre dans ce filtre</div>
            <button onClick={() => setFilter("all")} style={{ background:DS.white, border:`1px solid ${DS.ink10}`, borderRadius:DS.pill, padding:"8px 18px", fontSize:12, fontWeight:600, color:DS.ink60, cursor:"pointer" }}>Voir tout</button>
          </div>
        )}

        {/* Liste */}
        {filtered.map(o => {
          const exp = o.date_fin && new Date(o.date_fin) < new Date();
          const pct = o.stock_initial ? (o.stock_restant / o.stock_initial) * 100 : 100;
          return (
            <div key={o.id} style={{ background:DS.white, borderRadius:DS.lg, overflow:"hidden", marginBottom:10, boxShadow:DS.e1, opacity:removing===o.id?0:exp?0.55:1, transform:removing===o.id?"translateX(48px)":"none", transition:"opacity .25s, transform .25s", borderLeft:o.est_urgente&&!exp?`3px solid ${DS.danger}`:"3px solid transparent" }}>
              {/* Ligne principale */}
              <div onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{ display:"flex", cursor:"pointer", padding:"12px 12px 0" }}>
                <div style={{ position:"relative", width:80, height:80, flexShrink:0, borderRadius:DS.md, overflow:"hidden" }}>
                  <img src={o.image_url} alt={o.titre} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}/>
                  <div style={{ position:"absolute", top:5, left:5, background:exp?DS.ink40:(o.valeur_reduction>=40?DS.danger:DS.brand), color:DS.white, borderRadius:DS.xs, padding:"2px 6px", fontSize:10, fontWeight:800 }}>
                    -{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}
                  </div>
                </div>
                <div style={{ flex:1, minWidth:0, paddingLeft:12 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:DS.ink, lineHeight:1.35, marginBottom:4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{o.titre}</div>
                  <div style={{ fontSize:11, color:DS.ink40, marginBottom:6, display:"flex", alignItems:"center", gap:4 }}>{Ic.store(DS.ink20,11)}{o.commercant_nom}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, alignItems:"center" }}>
                    {o.prix_promo > 0 && <span style={{ fontSize:15, fontWeight:900, color:DS.brand, letterSpacing:-0.5 }}>{o.prix_promo}€</span>}
                    {o.prix_original > 0 && <span style={{ fontSize:11, color:DS.ink20, textDecoration:"line-through" }}>{o.prix_original}€</span>}
                    {o.stock_restant != null && !exp && (
                      <div style={{ marginLeft:"auto", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                        <span style={{ fontSize:10, color:pct<30?DS.danger:DS.ink40, fontWeight:600 }}>{o.stock_restant} dispo</span>
                        <div style={{ width:40, height:2, background:DS.ink10, borderRadius:DS.pill }}>
                          <div style={{ background:pct<30?DS.danger:DS.success, height:"100%", width:`${Math.min(pct,100)}%`, borderRadius:DS.pill }}/>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding:"8px 12px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, borderTop:`1px solid ${DS.ink05}` }}>
                <span style={{ fontSize:11, fontWeight:600, color:exp?DS.danger:o.est_active?DS.success:DS.ink40, display:"flex", alignItems:"center", gap:4 }}>
                  {exp ? <>{Ic.clock(DS.danger,11)} Expirée</> : o.est_active ? <>{Ic.check(DS.success,11)} Disponible</> : "Inactive"}
                </span>
                <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                  <button onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{ background:`${DS.brand}12`, border:"none", borderRadius:DS.pill, padding:"5px 12px", fontSize:11, fontWeight:700, color:DS.brand, cursor:"pointer" }}>Voir</button>
                  <button onClick={() => remove(o.id)} style={{ background:DS.white, border:`1px solid ${DS.ink10}`, borderRadius:DS.pill, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {Ic.trash(DS.ink20, 13)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <NavBar active="favoris"/>
      <style>{`@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
