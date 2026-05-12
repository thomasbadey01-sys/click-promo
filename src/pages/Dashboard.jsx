import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, Ic, Sparkline } from "./theme";
import { base44 } from "@/api/base44Client";

const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const IMGS = {
  "Restaurant":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  "Boutique":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
  "Beauté & Coiffure":"https://images.unsplash.com/photo-1560066984-138daaa0e9cd?w=800",
  "Fitness & Sport":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  "Services":"https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800",
  "Épicerie":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
  "Pharmacie":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
  "Autre":"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
};

const emptyForm = {
  titre:"", description:"", categorie:"Restaurant", type_reduction:"pourcentage",
  valeur_reduction:"", prix_original:"", prix_promo:"", date_fin:"",
  stock_initial:"", conditions:"", commercant_nom:"", adresse:"", ville:"Paris",
  est_urgente:false, est_active:true, achat_en_ligne:false,
  latitude:48.8566, longitude:2.3522, rayon_km:2,
  image_url: IMGS["Restaurant"],
};

function exportCSV(offres) {
  const headers = ["Titre","Catégorie","Ville","Prix promo","Vues","Clics","Conversions","Stock restant","Active","Date fin"];
  const rows = offres.map(o => [
    `"${(o.titre||"").replace(/"/g,'""')}"`, o.categorie||"", o.ville||"", o.prix_promo||0,
    o.nb_vues||0, o.nb_clics||0, o.nb_conversions||0, o.stock_restant||0,
    o.est_active?"Oui":"Non",
    o.date_fin ? new Date(o.date_fin).toLocaleDateString("fr-FR") : ""
  ]);
  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "offres.csv"; a.click();
  URL.revokeObjectURL(url);
}

function get7DayData(offres) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: d, key, label: d.toLocaleDateString("fr-FR",{weekday:"short"}).slice(0,1) });
  }
  const vues = days.map(d => offres.filter(o => o.created_date?.startsWith(d.key)).reduce((s,o)=>s+(o.nb_vues||0),0));
  const convs = days.map(d => offres.filter(o => o.created_date?.startsWith(d.key)).reduce((s,o)=>s+(o.nb_conversions||0),0));
  return { days, vues, convs };
}

function BarChart({ data, labels, color, h = 80 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:h, justifyContent:"space-between" }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", gap:3 }}>
          <span style={{ fontSize:9, color:"rgba(255,255,255,.3)" }}>{v||""}</span>
          <div style={{ width:"100%", background:color, borderRadius:"3px 3px 0 0", minHeight:4, height:`${Math.max(4,(v/max)*h)}px` }} />
          <span style={{ fontSize:8, color:"rgba(255,255,255,.4)" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [delConf, setDelConf] = useState(null);
  const [editO, setEditO] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const all = await Offre.filter({ created_by: u.email });
      setOffres(all);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalV  = offres.reduce((s,o) => s+(o.nb_vues||0), 0);
  const totalCl = offres.reduce((s,o) => s+(o.nb_clics||0), 0);
  const totalCo = offres.reduce((s,o) => s+(o.nb_conversions||0), 0);
  const taux    = totalCl > 0 ? ((totalCo/totalCl)*100).toFixed(1) : "0.0";
  const { days, vues: vData, convs: cData } = get7DayData(offres);
  const dayLabels = days.map(d => d.label);

  const startEdit = o => {
    setForm({ ...o, valeur_reduction:String(o.valeur_reduction), prix_original:String(o.prix_original||""), prix_promo:String(o.prix_promo||""), stock_initial:String(o.stock_initial||"") });
    setEditO(o); setTab("creer");
  };

  const duplicate = async o => {
    const { id, created_date, updated_date, created_by, nb_vues, nb_clics, nb_conversions, ...rest } = o;
    const created = await Offre.create({ ...rest, titre: rest.titre+" (copie)", est_active:false, nb_vues:0, nb_clics:0, nb_conversions:0, stock_restant:rest.stock_initial||0 });
    setOffres(p => [created, ...p]); setTab("liste");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        valeur_reduction: parseFloat(form.valeur_reduction)||0,
        prix_original: parseFloat(form.prix_original)||0,
        prix_promo: parseFloat(form.prix_promo)||0,
        stock_initial: parseInt(form.stock_initial)||0,
        stock_restant: editO ? (form.stock_restant||0) : parseInt(form.stock_initial)||0,
      };
      if (editO) {
        const updated = await Offre.update(editO.id, payload);
        setOffres(p => p.map(o => o.id===editO.id ? updated : o));
      } else {
        const created = await Offre.create(payload);
        setOffres(p => [created, ...p]);
      }
      setSaved(true); setForm(emptyForm); setEditO(null); setTab("stats");
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const delO = async id => { await Offre.delete(id); setOffres(p => p.filter(o => o.id!==id)); setDelConf(null); };

  if (loading) return (
    <div style={{ background:DS.dark, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:DS.fontBase }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:52, height:52, background:DS.brand, borderRadius:14, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:20 }}>C&P</span>
        </div>
        <div style={{ color:"rgba(255,255,255,.4)", fontSize:13 }}>Chargement…</div>
      </div>
    </div>
  );

  return (
    <div style={{ background:DS.dark, minHeight:"100vh", fontFamily:DS.fontBase, color:DS.white }}>

      {/* Header */}
      <div style={{ background:DS.dark2, padding:`calc(${DS.safeTop} + 8px) 16px 0`, borderBottom:`1px solid ${DS.darkBorder}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:DS.white, letterSpacing:-0.5 }}>
              Tableau de Bord
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>
              {user?.email || "Commerçant"} · {offres.filter(o=>o.est_active).length} offres actives
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => navigate("/Feed")} style={{ background:DS.brand, color:"#fff", border:"none", borderRadius:100, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              🛒 Feed
            </button>
            <div style={{ width:38, height:38, borderRadius:"50%", background:DS.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800 }}>
              {(user?.full_name||user?.email||"M")[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none" }}>
          {[
            {id:"stats",  label:"📊 Stats"},
            {id:"liste",  label:`📋 Offres (${offres.length})`},
            {id:"creer",  label:editO?"✏️ Modifier":"➕ Créer"},
            {id:"analyses",label:"📈 Analyses"},
          ].map(t => (
            <button key={t.id} onClick={() => { if(t.id!=="creer"){ setEditO(null); setForm(emptyForm); } setTab(t.id); }} style={{
              padding:"10px 14px", background:"none", border:"none", cursor:"pointer",
              color:tab===t.id ? DS.white : "rgba(255,255,255,.4)",
              fontWeight:tab===t.id ? 800 : 500, fontSize:13,
              borderBottom:`2px solid ${tab===t.id ? DS.brand : "transparent"}`,
              fontFamily:DS.fontBase, whiteSpace:"nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {saved && (
        <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", background:DS.success, color:"#fff", borderRadius:100, padding:"10px 20px", fontSize:13, fontWeight:700, zIndex:999, boxShadow:DS.e3, animation:"popIn .25s ease" }}>
          ✓ Sauvegardé !
        </div>
      )}

      <div style={{ padding:"16px 16px 100px" }}>

        {/* ── STATS ── */}
        {tab==="stats" && (
          <>
            {/* Alertes */}
            {offres.some(o => o.est_active && o.date_fin && (new Date(o.date_fin)-new Date())/3600000 < 24) && (
              <div style={{ background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.3)", borderRadius:DS.lg, padding:"12px 14px", marginBottom:14, fontSize:13, fontWeight:600, color:DS.warning }}>
                ⚠️ Une offre expire dans moins de 24h — vérifiez vos offres
              </div>
            )}
            {offres.some(o => o.nb_vues > 50 && o.nb_conversions === 0) && (
              <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", borderRadius:DS.lg, padding:"12px 14px", marginBottom:14, fontSize:13, fontWeight:600, color:DS.danger }}>
                💡 Offre avec 0 conversion après 50+ vues — pensez à revoir le prix !
              </div>
            )}

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Vues", value:totalV.toLocaleString(), emoji:"👁️", col:DS.brand2, data:[...Array(7)].map((_,i)=>Math.round(totalV*(i+1)/7*0.15)) },
                { label:"Clics", value:totalCl.toLocaleString(), emoji:"👆", col:DS.info, data:[...Array(7)].map((_,i)=>Math.round(totalCl*(i+1)/7*0.15)) },
                { label:"Conversions", value:totalCo, emoji:"💳", col:DS.success, data:[...Array(7)].map((_,i)=>Math.round(totalCo*(i+1)/7*0.15)) },
                { label:"Taux conv.", value:`${taux}%`, emoji:"📈", col:DS.warning, data:[2,3,2.5,4,5,4.5,5.2].map(x=>Math.round(x*10)) },
              ].map(s => (
                <div key={s.label} style={{ background:DS.darkCard, borderRadius:DS.lg, padding:"14px", border:`1px solid ${DS.darkBorder}` }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{s.emoji}</div>
                  <div style={{ fontSize:26, fontWeight:900, color:s.col, letterSpacing:-1 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:8 }}>{s.label}</div>
                  <Sparkline data={s.data} col={s.col} h={36} />
                </div>
              ))}
            </div>

            {/* Graphe 7j */}
            <div style={{ background:DS.darkCard, borderRadius:DS.lg, padding:16, marginBottom:16, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize:14, fontWeight:800, color:DS.white, marginBottom:14 }}>7 derniers jours</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:6 }}>Vues</div>
                <BarChart data={vData} labels={dayLabels} color={DS.brand} h={60} />
              </div>
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:6 }}>Conversions</div>
                <BarChart data={cData} labels={dayLabels} color={DS.success} h={60} />
              </div>
            </div>

            {/* Offres actives */}
            <div style={{ fontSize:15, fontWeight:800, color:DS.white, marginBottom:10 }}>Offres actives</div>
            {offres.filter(o=>o.est_active).slice(0,4).map(o => (
              <OffreRow key={o.id} o={o} onEdit={()=>startEdit(o)} onDup={()=>duplicate(o)} onDel={()=>setDelConf(o.id)} delConf={delConf} onDelConfirm={()=>delO(o.id)} onDelCancel={()=>setDelConf(null)} />
            ))}
            {offres.filter(o=>o.est_active).length > 4 && (
              <button onClick={()=>setTab("liste")} style={{ width:"100%", background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:12, fontSize:13, fontWeight:700, color:"rgba(255,255,255,.5)", cursor:"pointer", marginBottom:10 }}>
                Voir toutes les offres →
              </button>
            )}
            <button onClick={()=>exportCSV(offres)} style={{ width:"100%", background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:12, fontSize:13, fontWeight:700, color:"rgba(255,255,255,.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {Ic.download("rgba(255,255,255,.5)",15)} Exporter CSV
            </button>
          </>
        )}

        {/* ── LISTE ── */}
        {tab==="liste" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:16, fontWeight:800, color:DS.white }}>Toutes les offres ({offres.length})</div>
              <button onClick={()=>{ setEditO(null); setForm(emptyForm); setTab("creer"); }} style={{ background:DS.brand, border:"none", borderRadius:DS.pill, padding:"8px 14px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                {Ic.plus("#fff",14)} Nouvelle
              </button>
            </div>
            {offres.length===0 ? (
              <EmptyState emoji="📭" text="Aucune offre" sub="Créez votre première offre" />
            ) : offres.map(o => (
              <OffreRow key={o.id} o={o} onEdit={()=>startEdit(o)} onDup={()=>duplicate(o)} onDel={()=>setDelConf(o.id)} delConf={delConf} onDelConfirm={()=>delO(o.id)} onDelCancel={()=>setDelConf(null)} />
            ))}
          </>
        )}

        {/* ── CRÉER/MODIFIER ── */}
        {tab==="creer" && (
          <form onSubmit={submit}>
            <div style={{ fontSize:18, fontWeight:800, color:DS.white, marginBottom:18 }}>
              {editO ? "✏️ Modifier l'offre" : "➕ Nouvelle offre"}
            </div>

            {/* Aperçu image */}
            {form.image_url && (
              <div style={{ borderRadius:DS.lg, overflow:"hidden", height:130, marginBottom:16, position:"relative" }}>
                <img src={form.image_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.5),transparent)" }} />
                <span style={{ position:"absolute", bottom:8, left:12, color:"#fff", fontSize:11, fontWeight:700, background:"rgba(0,0,0,.4)", borderRadius:DS.pill, padding:"3px 8px" }}>Aperçu</span>
              </div>
            )}

            <DLabel>Catégorie</DLabel>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
              {CATS.map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, categorie:c, image_url:IMGS[c]||IMGS["Autre"]})} style={{
                  background:form.categorie===c ? DS.brand : DS.dark3,
                  color:form.categorie===c ? "#fff" : "rgba(255,255,255,.55)",
                  border:`1.5px solid ${form.categorie===c ? DS.brand : DS.darkBorder}`,
                  borderRadius:DS.pill, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer",
                }}>{c}</button>
              ))}
            </div>

            <DLabel>Titre *</DLabel>
            <DInput value={form.titre} onChange={v=>setForm({...form,titre:v})} placeholder="Ex: Menu Midi -30%" required />

            <DLabel>Nom du commerce *</DLabel>
            <DInput value={form.commercant_nom} onChange={v=>setForm({...form,commercant_nom:v})} placeholder="Le Bistrot de Paris" required />

            <DLabel>Description</DLabel>
            <DTextarea value={form.description} onChange={v=>setForm({...form,description:v})} placeholder="Décrivez l'offre..." />

            <DLabel>Type de réduction</DLabel>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {["pourcentage","montant"].map(tp => (
                <button key={tp} type="button" onClick={() => setForm({...form,type_reduction:tp})} style={{
                  flex:1, padding:"10px", borderRadius:DS.md, fontSize:13, fontWeight:700, cursor:"pointer", border:`1.5px solid ${form.type_reduction===tp ? DS.brand : DS.darkBorder}`,
                  background:form.type_reduction===tp ? DS.brand : DS.dark3, color:form.type_reduction===tp ? "#fff" : "rgba(255,255,255,.5)",
                }}>{tp==="pourcentage" ? "% Pourcentage" : "€ Montant"}</button>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:0 }}>
              <div><DLabel>Réduction *</DLabel><DInput type="number" value={form.valeur_reduction} onChange={v=>setForm({...form,valeur_reduction:v})} placeholder="30" required /></div>
              <div><DLabel>Prix orig.</DLabel><DInput type="number" value={form.prix_original} onChange={v=>setForm({...form,prix_original:v})} placeholder="29.90" /></div>
              <div><DLabel>Prix promo</DLabel><DInput type="number" value={form.prix_promo} onChange={v=>setForm({...form,prix_promo:v})} placeholder="20.90" /></div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:0 }}>
              <div><DLabel>Date fin</DLabel><DInput type="date" value={form.date_fin?.slice?.(0,10)||""} onChange={v=>setForm({...form,date_fin:v})} /></div>
              <div><DLabel>Stock</DLabel><DInput type="number" value={form.stock_initial} onChange={v=>setForm({...form,stock_initial:v})} placeholder="100" /></div>
            </div>

            <DLabel>Adresse</DLabel>
            <DInputGeo value={form.adresse} onChange={v=>setForm({...form,adresse:v})} placeholder="12 rue de la Paix"
              onGeocode={(lat,lon,ville) => setForm(f => ({...f, latitude:lat, longitude:lon, ville: ville||f.ville}))} />
            <DLabel>Ville</DLabel><DInput value={form.ville} onChange={v=>setForm({...form,ville:v})} placeholder="Paris" />
            <DLabel>Code promo</DLabel><DInput value={form.code_promo||""} onChange={v=>setForm({...form,code_promo:v})} placeholder="PROMO2024" />
            <DLabel>Conditions</DLabel><DTextarea value={form.conditions} onChange={v=>setForm({...form,conditions:v})} placeholder="Non cumulable, valable sur place..." />

            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              <DToggle label="⚡ Offre flash urgente" val={form.est_urgente} onChange={v=>setForm({...form,est_urgente:v})} />
              <DToggle label="✅ Offre active" val={form.est_active} onChange={v=>setForm({...form,est_active:v})} />
              <DToggle label="🌐 Achat en ligne" val={form.achat_en_ligne} onChange={v=>setForm({...form,achat_en_ligne:v})} />
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button type="button" onClick={() => { setTab("stats"); setEditO(null); setForm(emptyForm); }} style={{ flex:1, background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"14px", fontSize:14, fontWeight:700, color:"rgba(255,255,255,.5)", cursor:"pointer" }}>Annuler</button>
              <button type="submit" disabled={saving} style={{ flex:2, background:DS.brand, border:"none", borderRadius:DS.md, padding:"14px", fontSize:15, fontWeight:800, color:"#fff", cursor:saving?"not-allowed":"pointer", boxShadow:DS.eBrand }}>
                {saving ? "Enregistrement…" : editO ? "Modifier l'offre" : "Publier l'offre 🚀"}
              </button>
            </div>
          </form>
        )}

        {/* ── ANALYSES ── */}
        {tab==="analyses" && (
          <>
            <div style={{ fontSize:16, fontWeight:800, color:DS.white, marginBottom:16 }}>Analyses détaillées</div>

            <div style={{ background:DS.darkCard, borderRadius:DS.lg, padding:16, marginBottom:12, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.55)", marginBottom:12 }}>Vues — 7j</div>
              <Sparkline data={vData.length ? vData : [0]} col={DS.brand2} h={80} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                {dayLabels.map((d,i) => <span key={i} style={{ fontSize:10, color:"rgba(255,255,255,.3)", flex:1, textAlign:"center" }}>{d}</span>)}
              </div>
            </div>

            <div style={{ background:DS.darkCard, borderRadius:DS.lg, padding:16, marginBottom:12, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.55)", marginBottom:12 }}>Conversions — 7j</div>
              <Sparkline data={cData.length ? cData : [0]} col={DS.success} h={80} />
            </div>

            <div style={{ background:DS.darkCard, borderRadius:DS.lg, padding:16, marginBottom:16, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.55)", marginBottom:8 }}>Taux de conversion</div>
              <div style={{ fontSize:40, fontWeight:900, color:DS.white, marginBottom:10 }}>{taux}%</div>
              <div style={{ background:"rgba(255,255,255,.1)", borderRadius:DS.pill, height:6 }}>
                <div style={{ background:parseFloat(taux)>15?DS.success:DS.brand2, height:"100%", borderRadius:DS.pill, width:`${Math.min(parseFloat(taux)*3,100)}%`, transition:"width 1.2s" }} />
              </div>
            </div>

            <button onClick={()=>exportCSV(offres)} style={{ width:"100%", background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:13, fontSize:13, fontWeight:700, color:"rgba(255,255,255,.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {Ic.download("rgba(255,255,255,.5)",15)} Exporter CSV
            </button>
          </>
        )}
      </div>

      {/* Bottom Nav dark */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:DS.dark2, borderTop:`1px solid ${DS.darkBorder}`, display:"flex", paddingBottom:`max(${DS.safeBottom}, 8px)`, zIndex:100 }}>
        {[
          {id:"stats",    label:"Stats",    icon:Ic.grid},
          {id:"liste",    label:"Offres",   icon:Ic.offers},
          {id:"creer",    label:"Créer",    icon:Ic.plus},
          {id:"analyses", label:"Analyses", icon:Ic.chart},
        ].map(t => {
          const isA = tab===t.id;
          return (
            <button key={t.id} onClick={()=>{ if(t.id!=="creer"){ setEditO(null); setForm(emptyForm); } setTab(t.id); }} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              padding:"10px 0 4px", gap:3, background:"none", border:"none", cursor:"pointer",
              color:isA ? DS.brand : "rgba(255,255,255,.4)",
            }}>
              {t.icon(isA ? DS.brand : "rgba(255,255,255,.4)", 20)}
              <span style={{ fontSize:9, fontWeight:isA?700:500, fontFamily:DS.fontBase }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OffreRow({ o, onEdit, onDup, onDel, delConf, onDelConfirm, onDelCancel }) {
  const low = o.stock_initial > 0 && o.stock_restant < o.stock_initial * 0.2;
  const exp = o.date_fin && (new Date(o.date_fin)-new Date())/3600000 < 24;
  return (
    <div style={{ background:DS.darkCard, borderRadius:DS.lg, marginBottom:12, overflow:"hidden", border:`1px solid ${exp||low ? DS.warning+"44" : DS.darkBorder}` }}>
      <div style={{ display:"flex", gap:12, padding:"12px 12px 8px" }}>
        <div style={{ width:72, height:64, borderRadius:DS.md, overflow:"hidden", flexShrink:0 }}>
          <img src={o.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ fontWeight:700, fontSize:13, color:DS.white, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>{o.titre}</div>
            <div style={{ background:DS.brand, color:"#fff", borderRadius:DS.sm, padding:"2px 7px", fontSize:11, fontWeight:800, flexShrink:0 }}>-{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}</div>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>{o.commercant_nom}{o.ville ? ` · ${o.ville}` : ""}</div>
          <div style={{ display:"flex", gap:10, marginTop:5 }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.55)", fontWeight:600 }}>{o.nb_vues||0} vues</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>{o.nb_conversions||0} conv.</span>
            {low && <span style={{ fontSize:10, color:DS.warning, fontWeight:700 }}>⚠️ Stock</span>}
            {exp && <span style={{ fontSize:10, color:DS.danger, fontWeight:700 }}>⏰ Expire</span>}
          </div>
          {o.stock_initial > 0 && (
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:DS.pill, height:3, marginTop:6 }}>
              <div style={{ background:low?DS.danger:DS.success, height:"100%", borderRadius:DS.pill, width:`${Math.min((o.stock_restant/o.stock_initial)*100,100)}%` }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ display:"flex", gap:7, padding:"0 12px 12px" }}>
        <button onClick={onEdit} style={{ flex:1, background:DS.brand, border:"none", borderRadius:DS.md, padding:"8px", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer" }}>Gérer</button>
        <button onClick={onDup} style={{ flex:1, background:DS.dark4, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"8px", fontSize:12, fontWeight:600, color:"rgba(255,255,255,.6)", cursor:"pointer" }}>Dupliquer</button>
        {delConf===o.id ? (
          <>
            <button onClick={onDelConfirm} style={{ flex:1, background:DS.danger, border:"none", borderRadius:DS.md, padding:"8px", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer" }}>Confirmer</button>
            <button onClick={onDelCancel} style={{ flex:1, background:DS.dark4, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"8px", fontSize:12, color:"rgba(255,255,255,.4)", cursor:"pointer" }}>Annuler</button>
          </>
        ) : (
          <button onClick={onDel} style={{ width:36, background:"rgba(239,68,68,.12)", border:`1px solid rgba(239,68,68,.2)`, borderRadius:DS.md, padding:"8px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {Ic.trash(DS.danger,13)}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ emoji, text, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"50px 20px" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{emoji}</div>
      <div style={{ color:"rgba(255,255,255,.5)", fontSize:15, fontWeight:700 }}>{text}</div>
      {sub && <div style={{ color:"rgba(255,255,255,.3)", fontSize:13, marginTop:6 }}>{sub}</div>}
    </div>
  );
}

function DInputGeo({ value, onChange, placeholder, onGeocode }) {
  const [geocoding, setGeocoding] = useState(false);
  const geocode = async (addr) => {
    if (!addr || addr.length < 5) return;
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1&countrycodes=fr`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const ville = display_name.split(",").slice(-3, -2)[0]?.trim() || "";
        onGeocode(parseFloat(lat), parseFloat(lon), ville);
      }
    } catch {}
    setGeocoding(false);
  };
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onBlur={e => geocode(e.target.value)}
        style={{ width:"100%", boxSizing:"border-box", background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"11px 40px 11px 14px", fontSize:14, color:DS.white, fontFamily:DS.fontBase, outline:"none" }} />
      {geocoding
        ? <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:14, height:14, border:`2px solid ${DS.brand}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        : value?.length >= 5 && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:14, cursor:"pointer" }} onClick={() => geocode(value)}>📍</span>
      }
    </div>
  );
}

function DLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:.8, marginBottom:7 }}>{children}</div>;
}
function DInput({ value, onChange, type="text", placeholder="", required=false }) {
  return (
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} style={{ width:"100%", boxSizing:"border-box", marginBottom:14, background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"11px 14px", fontSize:14, color:DS.white, fontFamily:DS.fontBase, outline:"none" }} />
  );
}
function DTextarea({ value, onChange, placeholder="" }) {
  return (
    <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ width:"100%", boxSizing:"border-box", marginBottom:14, background:DS.dark3, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md, padding:"11px 14px", fontSize:14, color:DS.white, fontFamily:DS.fontBase, outline:"none", resize:"vertical" }} />
  );
}
function DToggle({ label, val, onChange }) {
  return (
    <div onClick={()=>onChange(!val)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:DS.dark3, borderRadius:DS.md, padding:"12px 14px", border:`1px solid ${DS.darkBorder}`, cursor:"pointer" }}>
      <span style={{ fontSize:14, color:DS.white, fontWeight:600 }}>{label}</span>
      <div style={{ width:44, height:24, borderRadius:DS.pill, background:val?DS.brand:"rgba(255,255,255,.15)", position:"relative", transition:"background .2s" }}>
        <div style={{ position:"absolute", top:3, left:val?22:3, width:18, height:18, borderRadius:DS.pill, background:"#fff", transition:"left .2s" }} />
      </div>
    </div>
  );
}