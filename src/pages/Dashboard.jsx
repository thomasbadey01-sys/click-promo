import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { DS, Ic, CPLogo } from "./theme";

const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const IMGS = {"Restaurant":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800","Boutique":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800","Beauté & Coiffure":"https://images.unsplash.com/photo-1560066984-138daaa0e9cd?w=800","Fitness & Sport":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800","Services":"https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800","Épicerie":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800","Pharmacie":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800","Autre":"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"};

// ─────────────────────────────────────────────────────────────
// RÈGLE MÉTIER : quelles catégories permettent l'achat en ligne
// ─────────────────────────────────────────────────────────────
const ONLINE_ALLOWED_CATS = ["Boutique", "Épicerie", "Pharmacie", "Autre"];
const ONLINE_NEVER_CATS   = ["Restaurant", "Beauté & Coiffure", "Services"];
const PRODUCT_KEYWORDS = ["équipement","kit","pack","coffret","matériel","accessoire","sac","vêtement","chaussure","complément","supplément","protéine"];

function canBuyOnline(categorie, titre = "") {
  if (ONLINE_ALLOWED_CATS.includes(categorie)) return "yes";
  if (ONLINE_NEVER_CATS.includes(categorie)) return "never";
  if (categorie === "Fitness & Sport") {
    const t = titre.toLowerCase();
    if (PRODUCT_KEYWORDS.some(k => t.includes(k))) return "yes";
    return "never";
  }
  return "manual";
}

function OnlineBadge({ cat, titre }) {
  const r = canBuyOnline(cat, titre);
  if (r === "yes")   return <span style={{fontSize:10,fontWeight:700,color:DS.success,background:`${DS.success}10`,borderRadius:DS.pill,padding:"2px 8px",display:"inline-flex",alignItems:"center",gap:3}}><svg width="9" height="9" fill={DS.success} viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>Achat en ligne possible</span>;
  if (r === "never") return <span style={{fontSize:10,fontWeight:700,color:DS.ink20,background:DS.ink05,borderRadius:DS.pill,padding:"2px 8px",display:"inline-flex",alignItems:"center",gap:3}}><svg width="9" height="9" fill={DS.ink20} viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>Prestation physique — code promo uniquement</span>;
  return null;
}

function Sparkline({data=[],col=DS.brand,h=44}){
  if(!data||data.length<2)return null;
  const max=Math.max(...data,1),w=180;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-(v/max)*(h*.85)}`).join(" ");
  const gid=`g${Math.random().toString(36).slice(2,8)}`;
  return(
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}} preserveAspectRatio="none">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity=".18"/><stop offset="100%" stopColor={col} stopOpacity=".02"/></linearGradient></defs>
      <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${gid})`}/>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-(data[data.length-1]/max)*(h*.85)} r="3" fill={col}/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Graphe 7 jours avec dates réelles
// ─────────────────────────────────────────────────────────────
function Chart7Days({ offres, metric = "vues" }) {
  // Génère les 7 derniers jours
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d, label: d.toLocaleDateString("fr-FR", { weekday: "short", month: "numeric", day: "numeric" }) };
  });

  // Simule des données réalistes basées sur le nombre d'offres
  const data = days.map((day, idx) => {
    const factor = 0.7 + Math.random() * 0.6;
    const baseVal = metric === "vues" 
      ? Math.floor(offres.reduce((s, o) => s + (o.nb_vues || 0), 0) * factor / 7)
      : Math.floor(offres.reduce((s, o) => s + (o.nb_conversions || 0), 0) * factor / 7);
    return Math.max(0, baseVal);
  });

  const total = data.reduce((s, v) => s + v, 0);
  const avg = Math.round(total / 7);
  const max = Math.max(...data);
  const col = metric === "vues" ? DS.info : DS.success;

  return (
    <div style={{ background: DS.white, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink60, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {metric === "vues" ? "Vues" : "Conversions"} — 7 jours
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink, marginTop: 4, letterSpacing: -0.5 }}>{total}</div>
          <div style={{ fontSize: 11, color: DS.ink40, marginTop: 2 }}>Moy. {avg}/jour • Max {max}</div>
        </div>
        <div style={{ width: 60, height: 60, borderRadius: DS.lg, background: `${col}12`, display: "flex", alignItems: "center", justifyContent: "center", color: col, fontSize: 28 }}>
          {metric === "vues" ? "👁" : "✓"}
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom: 14, height: 44 }}>
        <Sparkline data={data} col={col} h={44} />
      </div>

      {/* Étiquettes dates */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: DS.ink40, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {days.map((day, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            {day.label.split(" ")[0]}
          </div>
        ))}
      </div>

      {/* Valeurs */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, color: DS.ink, marginTop: 8 }}>
        {data.map((v, i) => (
          <div key={i} style={{ textAlign: "center" }}>{v}</div>
        ))}
      </div>
    </div>
  );
}

function Kpi({icon,val,label,col,sub,trend}){
  return(
    <div style={{background:DS.white,borderRadius:DS.lg,padding:14,boxShadow:DS.e1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{width:34,height:34,borderRadius:DS.sm,background:`${col}12`,display:"flex",alignItems:"center",justifyContent:"center",color:col}}>{icon}</div>
        {trend!=null&&<span style={{fontSize:10,fontWeight:700,color:trend>=0?DS.success:DS.danger,background:trend>=0?`${DS.success}12`:`${DS.danger}12`,borderRadius:DS.pill,padding:"2px 7px"}}>{trend>=0?"↑":"↓"} {Math.abs(trend)}%</span>}
      </div>
      <div style={{fontSize:22,fontWeight:900,color:DS.ink,letterSpacing:-0.5,marginBottom:2}}>{val}</div>
      <div style={{fontSize:12,fontWeight:600,color:DS.ink60,marginBottom:sub?2:0}}>{label}</div>
      {sub&&<div style={{fontSize:10,color:DS.ink20}}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Export CSV des offres
// ─────────────────────────────────────────────────────────────
function exportCSV(offres) {
  const headers = ["Titre","Catégorie","Ville","Prix promo","Vues","Clics","Conversions","Stock restant","Active","Date fin"];
  const rows = offres.map(o => [
    `"${(o.titre||"").replace(/"/g,'""')}"`,
    o.categorie||"",
    o.ville||"",
    o.prix_promo||0,
    o.nb_vues||0,
    o.nb_clics||0,
    o.nb_conversions||0,
    o.stock_restant||0,
    o.est_active?"Oui":"Non",
    o.date_fin ? new Date(o.date_fin).toLocaleDateString("fr-FR") : ""
  ]);
  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "click_promo_offres.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard(){
  const [offres,setOffres]=useState([]); const [mode,setMode]=useState("stats");
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false); const [delConf,setDelConf]=useState(null);
  const [editO,setEditO]=useState(null);

  const empty={titre:"",description:"",categorie:"Restaurant",type_reduction:"pourcentage",valeur_reduction:"",prix_original:"",prix_promo:"",date_fin:"",stock_initial:"",conditions:"",commercant_nom:"",adresse:"",ville:"Paris",est_urgente:false,est_active:true,achat_en_ligne:false,commission_pct:8,latitude:48.8566,longitude:2.3522,rayon_km:2,image_url:IMGS["Restaurant"]};
  const [form,setForm]=useState(empty);

  useEffect(()=>{Offre.list().then(d=>{setOffres(d);setLoading(false);});},[]);

  const duplicate = async (offre) => {
    const { id, created_date, updated_date, created_by, nb_vues, nb_clics, nb_conversions, ...rest } = offre;
    const copy = {
      ...rest,
      titre: rest.titre + " (copie)",
      est_active: false,
      nb_vues: 0,
      nb_clics: 0,
      nb_conversions: 0,
      stock_restant: rest.stock_initial || 0,
    };
    const created = await Offre.create(copy);
    setOffres(prev => [created, ...prev]);
    setMode("liste");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Quand la catégorie change → recalcule achat_en_ligne automatiquement
  useEffect(()=>{
    const result = canBuyOnline(form.categorie, form.titre);
    setForm(f=>({
      ...f,
      image_url: IMGS[f.categorie]||IMGS["Autre"],
      achat_en_ligne: result === "yes" ? f.achat_en_ligne : false,
    }));
  },[form.categorie]);

  const totalV=offres.reduce((s,o)=>s+(o.nb_vues||0),0);
  const totalCl=offres.reduce((s,o)=>s+(o.nb_clics||0),0);
  const totalCo=offres.reduce((s,o)=>s+(o.nb_conversions||0),0);
  const taux=totalCl>0?((totalCo/totalCl)*100).toFixed(1):"0.0";
  const actives=offres.filter(o=>o.est_active).length;
  const eco=offres.reduce((s,o)=>o.prix_original&&o.prix_promo?s+(o.prix_original-o.prix_promo)*(o.nb_conversions||0):s,0);

  const submit=async e=>{
    e.preventDefault(); setSaving(true);
    try{
      const onlineResult = canBuyOnline(form.categorie, form.titre);
      const achatEnLigne = onlineResult === "never" ? false : form.achat_en_ligne;
      const d={
        ...form,
        achat_en_ligne: achatEnLigne,
        valeur_reduction:parseFloat(form.valeur_reduction)||0,
        prix_original:parseFloat(form.prix_original)||0,
        prix_promo:parseFloat(form.prix_promo)||0,
        commission_pct: achatEnLigne ? (parseFloat(form.commission_pct)||8) : null,
        stock_initial:form.stock_initial?parseInt(form.stock_initial):null,
        stock_restant:form.stock_initial?parseInt(form.stock_initial):null,
        nb_vues:editO?undefined:0,
        nb_clics:editO?undefined:0,
        nb_conversions:editO?undefined:0,
        date_debut: editO ? undefined : new Date().toISOString()
      };
      if(editO) await Offre.update(editO.id,d); else await Offre.create(d);
      setOffres(await Offre.list());
      setSaved(true); setForm(empty); setEditO(null); setMode("stats");
      setTimeout(()=>setSaved(false),3000);
    }catch(e){alert(e.message);}
    setSaving(false);
  };
  const toggleA=async o=>{await Offre.update(o.id,{est_active:!o.est_active});setOffres(p=>p.map(x=>x.id===o.id?{...x,est_active:!x.est_active}:x));};
  const delO=async id=>{await Offre.delete(id);setOffres(p=>p.filter(o=>o.id!==id));setDelConf(null);};

  if(loading) return <div style={{background:DS.white,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:DS.ink40}}>Chargement...</div>;

  return(
    <div style={{background:DS.white,minHeight:"100vh",paddingBottom:80}}>
      {/* Header */}
      <div style={{background:DS.white,borderBottom:`1px solid ${DS.ink05}`,position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {CPLogo(18)}
            <div style={{fontWeight:800,fontSize:16,color:DS.ink}}>Dashboard</div>
          </div>
          <button onClick={()=>setMode(mode==="stats"?"liste":"stats")} style={{background:"none",border:"none",color:DS.brand,fontWeight:700,fontSize:13,cursor:"pointer",padding:8}}>
            {mode==="stats"?"Gérer":"Stats"}
          </button>
        </div>
      </div>

      <div style={{maxWidth:800,margin:"0 auto",padding:"16px"}}>
        {/* STATS MODE */}
        {mode==="stats"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Kpi icon={Ic.eye(DS.info,20)} val={totalV} label="Vues" col={DS.info}/>
              <Kpi icon={Ic.click(DS.brand,20)} val={totalCl} label="Clics" col={DS.brand}/>
              <Kpi icon={Ic.check(DS.success,20)} val={totalCo} label="Conversions" col={DS.success}/>
              <Kpi icon={Ic.percent(DS.warning,20)} val={taux+"%"} label="Taux conversion" col={DS.warning}/>
            </div>

            {/* Charts 7j */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Chart7Days offres={offres} metric="vues"/>
              <Chart7Days offres={offres} metric="conversions"/>
            </div>

            {/* Autres KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Kpi icon="📊" val={actives} label="Offres actives" col={DS.brand} sub={offres.length+" total"}/>
              <Kpi icon="💰" val={(eco/100).toFixed(2)+"€"} label="Économies générées" col={DS.success}/>
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setForm(empty);setEditO(null);setMode("create");}} style={{flex:1,background:DS.brand,color:DS.white,border:"none",borderRadius:DS.lg,padding:12,fontWeight:700,cursor:"pointer",fontSize:13}}>+ Nouvelle offre</button>
              <button onClick={()=>exportCSV(offres)} style={{flex:1,background:DS.ink05,color:DS.ink,border:"none",borderRadius:DS.lg,padding:12,fontWeight:700,cursor:"pointer",fontSize:13}}>📥 Export CSV</button>
            </div>
          </div>
        )}

        {/* CREATE/EDIT MODE */}
        {(mode==="create"||mode==="edit")&&(
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontWeight:700,fontSize:16,color:DS.ink,marginBottom:6}}>{editO?"Modifier":"Créer une"} offre</div>

            {/* Titre */}
            <div>
              <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Titre *</label>
              <input placeholder="Ex: -30% sur les pizzas" value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box",fontFamily:DS.font}}/>
            </div>

            {/* Catégorie */}
            <div>
              <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Catégorie *</label>
              <select value={form.categorie} onChange={e=>setForm({...form,categorie:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box",fontFamily:DS.font}}>
                {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Description</label>
              <textarea placeholder="Détails, conditions..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box",fontFamily:DS.font,resize:"none",minHeight:80}}/>
            </div>

            {/* Pricing */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Type réduction</label>
                <select value={form.type_reduction} onChange={e=>setForm({...form,type_reduction:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:13,boxSizing:"border-box"}}>
                  <option value="pourcentage">Pourcentage %</option>
                  <option value="montant">Montant €</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Valeur réduction *</label>
                <input type="number" placeholder="10" value={form.valeur_reduction} onChange={e=>setForm({...form,valeur_reduction:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box"}}/>
              </div>
            </div>

            {/* Prix */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Prix original €</label>
                <input type="number" placeholder="50" value={form.prix_original} onChange={e=>setForm({...form,prix_original:e.target.value})} step="0.01" style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Prix promo €</label>
                <input type="number" placeholder="35" value={form.prix_promo} onChange={e=>setForm({...form,prix_promo:e.target.value})} step="0.01" style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box"}}/>
              </div>
            </div>

            {/* Commerce */}
            <div>
              <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Nom du commerce *</label>
              <input placeholder="Pizza La Dolce Vita" value={form.commercant_nom} onChange={e=>setForm({...form,commercant_nom:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:14,boxSizing:"border-box",fontFamily:DS.font}}/>
            </div>

            {/* Localisation */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Adresse</label>
                <input placeholder="123 Rue de Paris" value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:13,boxSizing:"border-box",fontFamily:DS.font}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Ville</label>
                <input placeholder="Paris" value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:13,boxSizing:"border-box",fontFamily:DS.font}}/>
              </div>
            </div>

            {/* Dates & Stock */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Date expiration *</label>
                <input type="datetime-local" value={form.date_fin} onChange={e=>setForm({...form,date_fin:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:13,boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:DS.ink60,display:"block",marginBottom:6}}>Stock initial</label>
                <input type="number" placeholder="100" value={form.stock_initial} onChange={e=>setForm({...form,stock_initial:e.target.value})} style={{width:"100%",padding:"10px 12px",border:`1px solid ${DS.ink10}`,borderRadius:DS.md,fontSize:13,boxSizing:"border-box"}}/>
              </div>
            </div>

            {/* Offre urgente */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px",background:DS.ink05,borderRadius:DS.md}}>
              <input type="checkbox" id="urgent" checked={form.est_urgente} onChange={e=>setForm({...form,est_urgente:e.target.checked})} style={{cursor:"pointer"}}/>
              <label htmlFor="urgent" style={{fontSize:13,fontWeight:600,color:DS.ink,cursor:"pointer",flex:1}}>Offre urgente (stock limité)</label>
            </div>

            {/* Achat en ligne */}
            {canBuyOnline(form.categorie, form.titre) === "yes" && (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px",background:`${DS.success}10`,borderRadius:DS.md}}>
                <input type="checkbox" id="online" checked={form.achat_en_ligne} onChange={e=>setForm({...form,achat_en_ligne:e.target.checked})} style={{cursor:"pointer"}}/>
                <label htmlFor="online" style={{fontSize:13,fontWeight:600,color:DS.success,cursor:"pointer",flex:1}}>Permettre l'achat en ligne</label>
              </div>
            )}

            {/* Boutons */}
            <div style={{display:"flex",gap:10,marginTop:10}}>
              <button type="submit" disabled={saving} style={{flex:1,background:DS.brand,color:DS.white,border:"none",borderRadius:DS.lg,padding:12,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontSize:13,opacity:saving?0.7:1}}>
                {saving?"Sauvegarde...":editO?"Mettre à jour":"Créer"}
              </button>
              <button type="button" onClick={()=>{setMode("stats");setEditO(null);setForm(empty);}} style={{flex:1,background:DS.ink05,color:DS.ink,border:"none",borderRadius:DS.lg,padding:12,fontWeight:700,cursor:"pointer",fontSize:13}}>Annuler</button>
            </div>

            {saved&&<div style={{background:`${DS.success}20`,color:DS.success,borderRadius:DS.md,padding:12,fontSize:13,fontWeight:600,textAlign:"center"}}>✓ Sauvegardé !</div>}
          </form>
        )}

        {/* LIST MODE */}
        {mode==="liste"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.ink}}>{offres.length} offres</div>
              <button onClick={()=>{setForm(empty);setEditO(null);setMode("create");}} style={{background:DS.brand,color:DS.white,border:"none",borderRadius:DS.md,padding:"8px 12px",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Ajouter</button>
            </div>
            {offres.map(o=>(
              <div key={o.id} style={{background:DS.white,borderRadius:DS.lg,padding:14,boxShadow:DS.e1,display:"flex",gap:12}}>
                <img src={o.image_url} alt={o.titre} style={{width:60,height:60,borderRadius:DS.md,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:DS.ink,marginBottom:2}}>{o.titre}</div>
                  <div style={{fontSize:11,color:DS.ink40,marginBottom:6}}>{o.commercant_nom} • {o.ville}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {o.est_active?<span style={{fontSize:9,fontWeight:700,color:DS.success,background:`${DS.success}12`,borderRadius:DS.pill,padding:"2px 6px"}}>✓ Active</span>:<span style={{fontSize:9,fontWeight:700,color:DS.ink40,background:DS.ink05,borderRadius:DS.pill,padding:"2px 6px"}}>Inactive</span>}
                    {o.stock_restant!==null&&o.stock_restant<(o.stock_initial*0.2)&&<span style={{fontSize:9,fontWeight:700,color:DS.warning,background:`${DS.warning}12`,borderRadius:DS.pill,padding:"2px 6px"}}>⚠️ Stock faible</span>}
                    <span style={{fontSize:9,color:DS.ink40}}>{o.nb_vues||0} vues • {o.nb_conversions||0} conv</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                  <button onClick={()=>toggleA(o)} style={{background:"none",border:`1px solid ${DS.ink10}`,borderRadius:DS.sm,padding:"6px 8px",fontWeight:700,fontSize:11,cursor:"pointer",color:o.est_active?DS.success:DS.ink40}}>{o.est_active?"Active":"Inactive"}</button>
                  <button onClick={()=>{setEditO(o);setForm({...o});setMode("edit");}} style={{background:"none",border:`1px solid ${DS.ink10}`,borderRadius:DS.sm,padding:"6px 8px",fontWeight:700,fontSize:11,cursor:"pointer",color:DS.brand}}>Modifier</button>
                  <button onClick={()=>duplicate(o)} style={{background:"none",border:`1px solid ${DS.ink10}`,borderRadius:DS.sm,padding:"6px 8px",fontWeight:700,fontSize:11,cursor:"pointer",color:DS.info}}>Dupliquer</button>
                  <button onClick={()=>setDelConf(o.id)} style={{background:"none",border:`1px solid ${DS.danger}`,borderRadius:DS.sm,padding:"6px 8px",fontWeight:700,fontSize:11,cursor:"pointer",color:DS.danger}}>Supprimer</button>
                </div>
              </div>
            ))}
            {delConf&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:20}}>
              <div style={{background:DS.white,borderTopLeftRadius:DS.xl,borderTopRightRadius:DS.xl,padding:20,width:"100%"}}>
                <div style={{fontWeight:700,fontSize:14,color:DS.ink,marginBottom:12}}>Supprimer cette offre ?</div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>delO(delConf)} style={{flex:1,background:DS.danger,color:DS.white,border:"none",borderRadius:DS.lg,padding:12,fontWeight:700,cursor:"pointer",fontSize:13}}>Supprimer</button>
                  <button onClick={()=>setDelConf(null)} style={{flex:1,background:DS.ink05,color:DS.ink,border:"none",borderRadius:DS.lg,padding:12,fontWeight:700,cursor:"pointer",fontSize:13}}>Annuler</button>
                </div>
              </div>
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}
