import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { DS, Ic, CPLogo } from "./theme";

const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const IMGS = {"Restaurant":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800","Boutique":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800","Beauté & Coiffure":"https://images.unsplash.com/photo-1560066984-138daaa0e9cd?w=800","Fitness & Sport":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800","Services":"https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800","Épicerie":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800","Pharmacie":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800","Autre":"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"};

// ─────────────────────────────────────────────────────────────
// RÈGLE MÉTIER : quelles catégories permettent l'achat en ligne
// ─────────────────────────────────────────────────────────────
// NON — prestation physique obligatoire, présence requise
//   Restaurant   → repas à consommer sur place / réservation
//   Beauté       → coupe, soin, massage : rendez-vous physique
//   Services     → pressing, plombier, etc. : intervention physique
//   Fitness      → cours & coaching : séance physique
//              SAUF si le titre indique clairement un PRODUIT (équipement…)
//
// OUI — produit livrable ou expérience prépayable
//   Boutique     → vêtements, accessoires, objets
//   Épicerie     → coffrets, produits alimentaires
//   Pharmacie    → compléments, cosmétiques, produits OTC
//   Autre        → au cas par cas (toggle manuel)
// ─────────────────────────────────────────────────────────────

const ONLINE_ALLOWED_CATS = ["Boutique", "Épicerie", "Pharmacie", "Autre"];
const ONLINE_NEVER_CATS   = ["Restaurant", "Beauté & Coiffure", "Services"];
// Fitness & Sport → dépend du titre (produit vs prestation)
const PRODUCT_KEYWORDS = ["équipement","kit","pack","coffret","matériel","accessoire","sac","vêtement","chaussure","complément","supplément","protéine"];

function canBuyOnline(categorie, titre = "") {
  if (ONLINE_ALLOWED_CATS.includes(categorie)) return "yes";
  if (ONLINE_NEVER_CATS.includes(categorie)) return "never";
  // Fitness & Sport : produit ou prestation ?
  if (categorie === "Fitness & Sport") {
    const t = titre.toLowerCase();
    if (PRODUCT_KEYWORDS.some(k => t.includes(k))) return "yes";
    return "never"; // cours, coaching, essai = jamais
  }
  return "manual"; // fallback
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
      achat_en_ligne: result === "yes" ? f.achat_en_ligne : false, // reset si prestation
    }));
  },[form.categorie]);

  const totalV=offres.reduce((s,o)=>s+(o.nb_vues||0),0);
  const totalCl=offres.reduce((s,o)=>s+(o.nb_clics||0),0);
  const totalCo=offres.reduce((s,o)=>s+(o.nb_conversions||0),0);
  const taux=totalCl>0?((totalCo/totalCl)*100).toFixed(1):"0.0";
  const actives=offres.filter(o=>o.est_active).length;
  const eco=offres.reduce((s,o)=>o.prix_original&&o.prix_promo?s+(o.prix_original-o.prix_promo)*(o.nb_conversions||0):s,0);
  const gV=[.08,.12,.10,.15,.18,.20,.17].map(x=>Math.round(totalV*x));
  const gC=[.10,.14,.12,.16,.18,.15,.15].map(x=>Math.round(totalCo*x));

  const submit=async e=>{
    e.preventDefault(); setSaving(true);
    try{
      const onlineResult = canBuyOnline(form.categorie, form.titre);
      // Sécurité : on force achat_en_ligne=false si prestation physique
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
  const startEdit=o=>{setForm({...o,valeur_reduction:String(o.valeur_reduction),prix_original:String(o.prix_original),prix_promo:String(o.prix_promo),stock_initial:String(o.stock_initial||""),commission_pct:String(o.commission_pct||8)});setEditO(o);setMode("creer");};

  const onlineResult = canBuyOnline(form.categorie, form.titre);
  const showOnlineToggle = onlineResult !== "never";

  const inp={width:"100%",border:`1.5px solid ${DS.ink10}`,borderRadius:DS.md,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box",background:DS.ink05,fontFamily:DS.font,color:DS.ink,transition:"border-color .2s"};

  return(
    <div style={{background:DS.ink05,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      <header style={{background:DS.ink,padding:"52px 16px 14px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <CPLogo size={32} inverted/>
          <div>
            <div style={{color:DS.white,fontSize:17,fontWeight:800,letterSpacing:-.4}}>Espace Commerçant</div>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:11}}>{actives} offre{actives!==1?"s":""} active{actives!==1?"s":""}</div>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,.06)",borderRadius:DS.md,padding:4,gap:4}}>
          {[{k:"stats",l:"Statistiques"},{k:"creer",l:editO?"Modifier":"Créer"},{k:"liste",l:"Offres"}].map(t=>(
            <button key={t.k} onClick={()=>{setMode(t.k);if(t.k!=="creer")setEditO(null);}} style={{flex:1,background:mode===t.k?DS.brand:"transparent",color:DS.white,border:"none",borderRadius:DS.sm,padding:"9px 4px",fontSize:12,fontWeight:mode===t.k?700:400,cursor:"pointer",fontFamily:DS.font,transition:"all .2s"}}>{t.l}</button>
          ))}
        </div>
      </header>

      <div style={{padding:"14px 14px 80px"}}>
        {saved&&<div style={{background:"#F0FFF9",border:`1px solid ${DS.success}`,borderRadius:DS.md,padding:"11px 14px",marginBottom:12,color:DS.success,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:8}}>{Ic.check(DS.success,14)} Offre {editO?"modifiée":"publiée"} !</div>}

        {/* ── STATS ── */}
        {mode==="stats"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <Kpi icon={Ic.tag(DS.brand,16)} val={actives} label="Actives" col={DS.brand} sub={`${offres.length} total`} trend={12}/>
              <Kpi icon={Ic.eye(DS.info,16)} val={totalV.toLocaleString()} label="Vues" col={DS.info} sub="toutes offres" trend={8}/>
              <Kpi icon={Ic.check(DS.success,16)} val={totalCo} label="Conversions" col={DS.success} sub={`${taux}% taux`} trend={5}/>
              <Kpi icon={Ic.star(DS.warning,16,true)} val={`${eco.toFixed(0)}€`} label="Éco. clients" col={DS.warning}/>
            </div>
            <div style={{background:DS.white,borderRadius:DS.lg,padding:"14px 16px",marginBottom:10,boxShadow:DS.e1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:13,color:DS.ink}}>Vues — 7 jours</span>
                <span style={{fontSize:13,fontWeight:900,color:DS.brand}}>{totalV.toLocaleString()}</span>
              </div>
              <Sparkline data={gV} col={DS.brand}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                {["L","M","M","J","V","S","D"].map((d,i)=><span key={i} style={{fontSize:9,color:DS.ink20,flex:1,textAlign:"center",textTransform:"uppercase"}}>{d}</span>)}
              </div>
            </div>
            <div style={{background:DS.white,borderRadius:DS.lg,padding:"14px 16px",marginBottom:10,boxShadow:DS.e1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:13,color:DS.ink}}>Conversions — 7 jours</span>
                <span style={{fontSize:13,fontWeight:900,color:DS.success}}>{totalCo}</span>
              </div>
              <Sparkline data={gC} col={DS.success}/>
            </div>
            <div style={{background:DS.white,borderRadius:DS.lg,padding:"14px 16px",marginBottom:10,boxShadow:DS.e1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontWeight:700,fontSize:13,color:DS.ink}}>Taux de conversion</span>
                <span style={{fontSize:20,fontWeight:900,color:parseFloat(taux)>20?DS.success:DS.brand}}>{taux}%</span>
              </div>
              <div style={{background:DS.ink10,borderRadius:DS.pill,height:6}}>
                <div style={{background:parseFloat(taux)>20?DS.success:DS.brand,height:"100%",borderRadius:DS.pill,width:`${Math.min(parseFloat(taux),100)}%`,transition:"width 1.2s"}}/>
              </div>
              <div style={{fontSize:11,color:DS.ink20,marginTop:7}}>{totalCo} conv. sur {totalCl} utilisations</div>
            </div>
            <div style={{background:DS.ink,borderRadius:DS.lg,padding:16,boxShadow:DS.e3}}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>ROI estimé</div>
              <div style={{fontSize:32,fontWeight:900,color:DS.white,letterSpacing:-1}}>{(totalCo*18).toLocaleString()}€</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:4}}>Base 18€/conversion moyenne</div>

            {/* Export CSV */}
            <button onClick={()=>exportCSV(offres)} style={{width:"100%",background:DS.white,border:`1.5px solid ${DS.ink10}`,borderRadius:DS.lg,padding:"13px",fontSize:13,fontWeight:700,color:DS.ink60,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:10}}>
              <svg width="16" height="16" fill="none" stroke={DS.ink60} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exporter les stats (CSV)
            </button>
          </>
        )}

        {/* ── CRÉER / MODIFIER ── */}
        {mode==="creer"&&(
          <form onSubmit={submit}>
            <div style={{fontWeight:700,fontSize:15,color:DS.ink,marginBottom:14}}>{editO?"Modifier l'offre":"Nouvelle offre"}</div>

            {form.image_url&&<div style={{borderRadius:DS.lg,overflow:"hidden",height:130,marginBottom:14,position:"relative"}}><img src={form.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.4),transparent)"}}/><span style={{position:"absolute",bottom:10,left:12,color:DS.white,fontSize:11,fontWeight:600}}>Aperçu</span></div>}

            {/* Catégorie */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Catégorie</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {CATS.map(c=><button key={c} type="button" onClick={()=>setForm({...form,categorie:c})} style={{background:form.categorie===c?DS.brand:DS.white,color:form.categorie===c?DS.white:DS.ink60,border:`1.5px solid ${form.categorie===c?DS.brand:DS.ink10}`,borderRadius:DS.pill,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{c}</button>)}
              </div>
            </div>

            {/* Infos de base */}
            {[{l:"Titre *",k:"titre",ph:"Ex: Pack équipement -35%",req:true},{l:"Commerce *",k:"commercant_nom",ph:"Brasserie du Marais",req:true}].map(f=>(
              <div key={f.k} style={{marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:6}}>{f.l}</div>
                <input value={form[f.k]||""} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} required={f.req} style={inp} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
              </div>
            ))}

            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:6}}>Description</div>
              <textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Détails…" rows={3} style={{...inp,resize:"none"}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[{l:"Prix original €",k:"prix_original",ph:"25"},{l:"Prix promo €",k:"prix_promo",ph:"15"},{l:"Réduction %",k:"valeur_reduction",ph:"40"},{l:"Stock initial",k:"stock_initial",ph:"50"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:6}}>{f.l}</div>
                  <input type="number" value={form[f.k]||""} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} style={inp} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[{l:"Ville",k:"ville",ph:"Paris"},{l:"Adresse",k:"adresse",ph:"12 Rue de…"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:6}}>{f.l}</div>
                  <input value={form[f.k]||""} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} style={inp} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
                </div>
              ))}
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:6}}>Date de fin</div>
              <input type="datetime-local" value={form.date_fin||""} onChange={e=>setForm({...form,date_fin:e.target.value})} style={inp}/>
            </div>

            {/* Toggles généraux */}
            <div style={{background:DS.white,borderRadius:DS.md,padding:14,marginBottom:12,boxShadow:DS.e1}}>
              {[{l:"Offre flash / urgente",k:"est_urgente",col:DS.danger},{l:"Activer immédiatement",k:"est_active",col:DS.success}].map((t,i)=>(
                <div key={t.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i===0?12:0}}>
                  <span style={{fontSize:13,fontWeight:500,color:DS.ink}}>{t.l}</span>
                  <div onClick={()=>setForm(f=>({...f,[t.k]:!f[t.k]}))} style={{width:42,height:22,borderRadius:11,background:form[t.k]?t.col:DS.ink10,cursor:"pointer",position:"relative",transition:"background .3s"}}>
                    <div style={{position:"absolute",width:16,height:16,borderRadius:"50%",background:DS.white,top:3,left:form[t.k]?23:3,transition:"left .3s",boxShadow:DS.e1}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* ── BLOC ACHAT EN LIGNE — logique stricte ── */}
            <div style={{background:DS.white,borderRadius:DS.md,padding:16,marginBottom:14,boxShadow:DS.e1,border:`1.5px solid ${onlineResult==="never"?DS.ink10:onlineResult==="yes"&&form.achat_en_ligne?`${DS.success}40`:DS.ink10}`}}>
              <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Vente en ligne</div>

              {/* Cas : jamais possible */}
              {onlineResult==="never"&&(
                <div style={{background:"#FFF7ED",borderRadius:DS.sm,padding:12,border:"1px solid #FED7AA"}}>
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <svg width="16" height="16" fill="none" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#92400E",marginBottom:3}}>Achat en ligne non disponible</div>
                      <div style={{fontSize:11,color:"#B45309",lineHeight:1.7}}>
                        {form.categorie==="Restaurant"&&"Un repas au restaurant nécessite une présence physique. L'offre fonctionnera avec un code promo à présenter sur place."}
                        {(form.categorie==="Beauté & Coiffure")&&"Une coupe, un soin ou un massage requiert un rendez-vous physique. Utilisez un code promo ou un bon cadeau."}
                        {form.categorie==="Services"&&"Une prestation de service (pressing, intervention…) ne peut pas être délivrée en ligne. Utilisez un code promo."}
                        {form.categorie==="Fitness & Sport"&&"Un cours ou une séance de coaching nécessite une présence physique. Pour vendre de l'équipement, précisez-le dans le titre."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cas : possible (boutique, épicerie, pharmacie…) ou produit sport */}
              {onlineResult!=="never"&&(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:form.achat_en_ligne?14:0}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:DS.ink}}>Activer la vente en ligne</div>
                      <div style={{fontSize:11,color:DS.ink40,marginTop:2}}>Paiement Stripe · commission prélevée à la vente</div>
                    </div>
                    <div onClick={()=>setForm(f=>({...f,achat_en_ligne:!f.achat_en_ligne}))} style={{width:42,height:22,borderRadius:11,background:form.achat_en_ligne?DS.success:DS.ink10,cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
                      <div style={{position:"absolute",width:16,height:16,borderRadius:"50%",background:DS.white,top:3,left:form.achat_en_ligne?23:3,transition:"left .3s",boxShadow:DS.e1}}/>
                    </div>
                  </div>

                  {/* Sous-options quand activé */}
                  {form.achat_en_ligne&&(
                    <div style={{borderTop:`1px solid ${DS.ink05}`,paddingTop:14,display:"flex",flexDirection:"column",gap:10}}>
                      <div style={{background:`${DS.success}08`,borderRadius:DS.sm,padding:10,border:`1px solid ${DS.success}20`}}>
                        <div style={{fontSize:11,color:DS.success,fontWeight:600,marginBottom:2}}>Produit livrable confirmé</div>
                        <div style={{fontSize:11,color:DS.ink40,lineHeight:1.6}}>Le client paie en ligne, vous livrez ou il vient récupérer en boutique. Assurez-vous que le produit peut bien être expédié ou retiré.</div>
                      </div>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.7,marginBottom:6}}>Commission Click & Promo (%)</div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <input type="range" min={3} max={20} value={parseFloat(form.commission_pct)||8} onChange={e=>setForm({...form,commission_pct:e.target.value})} style={{flex:1,accentColor:DS.brand}}/>
                          <span style={{fontSize:15,fontWeight:800,color:DS.brand,minWidth:36,textAlign:"right"}}>{parseFloat(form.commission_pct)||8}%</span>
                        </div>
                        <div style={{fontSize:10,color:DS.ink20,marginTop:4}}>
                          Sur {form.prix_promo||0}€ → vous gardez <strong style={{color:DS.ink60}}>{((form.prix_promo||0)*(1-(parseFloat(form.commission_pct)||8)/100)).toFixed(2)}€</strong> · Click & Promo perçoit <strong style={{color:DS.brand}}>{((form.prix_promo||0)*(parseFloat(form.commission_pct)||8)/100).toFixed(2)}€</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{display:"flex",gap:10}}>
              <button type="button" onClick={()=>{setMode("stats");setEditO(null);setForm(empty);}} style={{flex:1,background:DS.white,border:`1.5px solid ${DS.ink10}`,borderRadius:DS.lg,padding:"13px",fontSize:14,fontWeight:600,color:DS.ink40,cursor:"pointer"}}>Annuler</button>
              <button type="submit" disabled={saving} style={{flex:2,background:saving?DS.ink10:DS.brand,color:saving?DS.ink40:DS.white,border:"none",borderRadius:DS.lg,padding:"13px",fontSize:14,fontWeight:700,cursor:saving?"not-allowed":"pointer",boxShadow:saving?"none":DS.eBrand}}>
                {saving?"Enregistrement…":editO?"Mettre à jour":"Publier"}
              </button>
            </div>
          </form>
        )}

        {/* ── LISTE ── */}
        {mode==="liste"&&(
          <>
            <div style={{fontSize:10,fontWeight:700,color:DS.ink20,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{offres.length} offre{offres.length!==1?"s":""}</div>
            {loading&&[1,2,3].map(i=><div key={i} style={{background:DS.white,borderRadius:DS.md,height:72,marginBottom:8,overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${DS.ink05} 25%,${DS.white} 50%,${DS.ink05} 75%)`,backgroundSize:"400% 100%",animation:"sh 1.4s infinite"}}/></div>)}
            {offres.map(o=>{
              const oResult = canBuyOnline(o.categorie, o.titre);
              return (
                <div key={o.id} style={{background:DS.white,borderRadius:DS.md,padding:"12px 13px",marginBottom:8,boxShadow:DS.e1}}>
                  <div style={{display:"flex",gap:11,alignItems:"center"}}>
                    <img src={o.image_url} alt="" style={{width:44,height:44,borderRadius:DS.sm,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <div style={{fontWeight:600,fontSize:13,color:DS.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{o.titre}</div>
                        {o.stock_restant!==null&&o.stock_restant<(o.stock_initial*0.2)&&o.stock_restant>0&&(
                          <div style={{background:`${DS.warning}22`,color:DS.warning,borderRadius:DS.pill,padding:"3px 8px",fontSize:10,fontWeight:700,flexShrink:0}}>
                            {o.stock_restant}/{o.stock_initial} restant
                          </div>
                        )}
                      </div>
                      <div style={{fontSize:10,color:DS.ink40,display:"flex",alignItems:"center",gap:6}}>
                        {o.ville} · {o.nb_vues||0} vues · {o.nb_conversions||0} conv.
                        {o.achat_en_ligne&&<span style={{color:DS.success,fontWeight:700}}>· En ligne</span>}
                        {oResult==="never"&&<span style={{color:DS.ink20}}>· Code promo</span>}
                        {o.stock_restant!==null&&o.stock_restant<(o.stock_initial*0.2)&&<span style={{color:DS.warning,fontWeight:700}}>⚠️ Stock faible</span>}
                      </div>
                    </div>
                    <button onClick={()=>toggleA(o)} style={{background:o.est_active?`${DS.success}12`:DS.ink05,color:o.est_active?DS.success:DS.ink40,border:"none",borderRadius:DS.pill,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                      {o.est_active?"Actif":"Pause"}
                    </button>
                  </div>
                  <div style={{display:"flex",gap:7,marginTop:10}}>
                    <button onClick={()=>startEdit(o)} style={{flex:1,background:DS.ink05,border:"none",borderRadius:DS.sm,padding:"7px",fontSize:11,fontWeight:600,color:DS.brand,cursor:"pointer"}}>Modifier</button>
                    <button onClick={()=>duplicate(o)} style={{flex:1,background:DS.ink05,border:"none",borderRadius:DS.sm,padding:"7px",fontSize:11,fontWeight:600,color:DS.ink60,cursor:"pointer"}}>Dupliquer</button>
                    {delConf===o.id?(
                      <>
                        <button onClick={()=>delO(o.id)} style={{flex:1,background:DS.danger,border:"none",borderRadius:DS.sm,padding:"7px",fontSize:11,fontWeight:700,color:DS.white,cursor:"pointer"}}>Confirmer</button>
                        <button onClick={()=>setDelConf(null)} style={{flex:1,background:DS.ink05,border:"none",borderRadius:DS.sm,padding:"7px",fontSize:11,fontWeight:600,color:DS.ink40,cursor:"pointer"}}>Annuler</button>
                      </>
                    ):(
                      <button onClick={()=>setDelConf(o.id)} style={{flex:1,background:"#FEF2F2",border:"none",borderRadius:DS.sm,padding:"7px",fontSize:11,fontWeight:600,color:DS.danger,cursor:"pointer"}}>Supprimer</button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <style>{`@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
