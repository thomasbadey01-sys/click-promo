import { useState, useEffect } from "react";
import { Offre, Commercant, DemandeCommercant, Abonnement, AvisCommercant } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo } from "./theme";

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({ offres:0, commercants:0, demandes:0, abonnements:0 });
  const [demandes, setDemandes] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [o, c, d, a] = await Promise.all([
          Offre.list(), Commercant.list(), DemandeCommercant.list(), Abonnement.list()
        ]);
        setStats({ offres:o.length, commercants:c.length, demandes:d.length, abonnements:a.length });
        setOffres(o);
        setDemandes(d.sort((a,b) => new Date(b.date_soumission)-new Date(a.date_soumission)));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const validerDemande = async (id, statut) => {
    await DemandeCommercant.update(id, { statut, date_decision: new Date().toISOString() });
    setDemandes(p => p.map(d => d.id===id ? {...d, statut} : d));
  };

  const toggleOffre = async (o) => {
    await Offre.update(o.id, { est_active: !o.est_active });
    setOffres(p => p.map(x => x.id===o.id ? {...x, est_active:!o.est_active} : x));
  };

  if (loading) return (
    <div style={{ background:DS.dark, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:DS.fontBase }}>
      <div style={{ textAlign:"center" }}>
        <CPLogo size={40} />
        <div style={{ marginTop:12, color:"rgba(255,255,255,.4)", fontSize:14 }}>Chargement admin…</div>
      </div>
    </div>
  );

  return (
    <div style={{ background:DS.dark, minHeight:"100vh", fontFamily:DS.fontBase, color:DS.white }}>
      {/* Header */}
      <div style={{ background:DS.dark2, padding:"52px 16px 16px", borderBottom:`1px solid ${DS.darkBorder}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:24, fontWeight:900, color:DS.white, letterSpacing:-0.8 }}>⚙️ Admin</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>Panel de gestion Click & Promo</div>
          </div>
          <a href="/Feed" style={{ background:DS.brand, color:DS.white, borderRadius:DS.pill, padding:"8px 16px", fontSize:13, fontWeight:700, textDecoration:"none" }}>
            Voir l'app
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, marginTop:16, borderBottom:`1px solid ${DS.darkBorder}` }}>
          {[
            {id:"dashboard", label:"Dashboard"},
            {id:"demandes",  label:`Demandes (${demandes.filter(d=>d.statut==="en_attente").length})`},
            {id:"offres",    label:"Offres"},
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"12px 16px", background:"none", border:"none", cursor:"pointer",
              color:tab===t.id?DS.white:"rgba(255,255,255,.4)",
              fontWeight:tab===t.id?800:500, fontSize:13,
              borderBottom:`2px solid ${tab===t.id?DS.brand:"transparent"}`,
              fontFamily:DS.fontBase, whiteSpace:"nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {[
                {label:"Offres actives", value:stats.offres, emoji:"🏷️", col:DS.brand2},
                {label:"Commerçants", value:stats.commercants, emoji:"🏪", col:DS.success},
                {label:"Demandes", value:stats.demandes, emoji:"📋", col:DS.warning},
                {label:"Abonnements", value:stats.abonnements, emoji:"💳", col:"#F472B6"},
              ].map(s => (
                <div key={s.label} style={{ background:DS.darkCard, borderRadius:DS.lg, padding:"16px", border:`1px solid ${DS.darkBorder}` }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.emoji}</div>
                  <div style={{ fontSize:32, fontWeight:900, color:s.col, letterSpacing:-1 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Demandes en attente */}
            {demandes.filter(d=>d.statut==="en_attente").length > 0 && (
              <>
                <div style={{ fontSize:16, fontWeight:800, color:DS.white, marginBottom:12 }}>
                  🔔 Demandes en attente
                </div>
                {demandes.filter(d=>d.statut==="en_attente").slice(0,3).map(d => (
                  <DemandeCard key={d.id} d={d} onValider={validerDemande} />
                ))}
              </>
            )}
          </>
        )}

        {/* ── DEMANDES ── */}
        {tab==="demandes" && (
          <>
            <div style={{ fontSize:16, fontWeight:800, color:DS.white, marginBottom:12 }}>
              Toutes les demandes ({demandes.length})
            </div>
            {demandes.length===0
              ? <EmptyState emoji="📭" text="Aucune demande" />
              : demandes.map(d => <DemandeCard key={d.id} d={d} onValider={validerDemande} />)
            }
          </>
        )}

        {/* ── OFFRES ── */}
        {tab==="offres" && (
          <>
            <div style={{ fontSize:16, fontWeight:800, color:DS.white, marginBottom:12 }}>
              Toutes les offres ({offres.length})
            </div>
            {offres.length===0
              ? <EmptyState emoji="📭" text="Aucune offre" />
              : offres.map(o => (
                <div key={o.id} style={{ background:DS.darkCard, borderRadius:DS.lg, padding:"14px", marginBottom:10, border:`1px solid ${DS.darkBorder}`, display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:56, height:50, borderRadius:DS.md, overflow:"hidden", flexShrink:0 }}>
                    <img src={o.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:DS.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{o.commercant_nom} · {o.ville}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>
                      {o.nb_vues||0} vues · {o.nb_conversions||0} conv.
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <div style={{ background:o.est_active?`${DS.success}20`:`${DS.danger}20`, color:o.est_active?DS.success:DS.danger, borderRadius:DS.pill, padding:"3px 10px", fontSize:11, fontWeight:700, textAlign:"center" }}>
                      {o.est_active?"Active":"Inactive"}
                    </div>
                    <button onClick={()=>toggleOffre(o)} style={{ background:DS.dark4, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"5px 10px", fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", cursor:"pointer" }}>
                      {o.est_active?"Désactiver":"Activer"}
                    </button>
                  </div>
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
}

function DemandeCard({ d, onValider }) {
  const statusCol = {en_attente:DS.warning, approuvee:DS.success, refusee:DS.danger}[d.statut] || DS.ink40;
  const statusLabel = {en_attente:"En attente", approuvee:"Approuvée", refusee:"Refusée"}[d.statut] || d.statut;
  return (
    <div style={{ background:DS.darkCard, borderRadius:DS.lg, padding:"16px", marginBottom:12, border:`1px solid ${DS.darkBorder}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:DS.white, marginBottom:2 }}>{d.nom_commerce}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.45)" }}>{d.categorie} · {d.ville}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.3)", marginTop:2 }}>{d.email_pro}</div>
        </div>
        <div style={{ background:`${statusCol}20`, color:statusCol, borderRadius:DS.pill, padding:"4px 12px", fontSize:11, fontWeight:800, flexShrink:0 }}>
          {statusLabel}
        </div>
      </div>
      {d.description && (
        <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginBottom:12, lineHeight:1.7 }}>{d.description.slice(0,120)}{d.description.length>120?"…":""}</div>
      )}
      {d.statut==="en_attente" && (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>onValider(d.id,"approuvee")} style={{ flex:1, background:DS.success, border:"none", borderRadius:DS.md, padding:"10px", fontSize:13, fontWeight:700, color:DS.white, cursor:"pointer" }}>
            ✅ Approuver
          </button>
          <button onClick={()=>onValider(d.id,"refusee")} style={{ flex:1, background:"rgba(239,68,68,.15)", border:`1px solid rgba(239,68,68,.3)`, borderRadius:DS.md, padding:"10px", fontSize:13, fontWeight:700, color:DS.danger, cursor:"pointer" }}>
            ❌ Refuser
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{emoji}</div>
      <div style={{ color:"rgba(255,255,255,.3)", fontSize:15, fontWeight:600 }}>{text}</div>
    </div>
  );
}