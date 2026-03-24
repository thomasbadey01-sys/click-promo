import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { DS, CPLogo } from "./Home";

const CATEGORIES = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const IMAGE_SUGGESTIONS = {
  "Restaurant":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Boutique":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "Beauté & Coiffure":"https://images.unsplash.com/photo-1560066984-138daaa0e9cd?w=800&q=80",
  "Fitness & Sport":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "Services":"https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
  "Épicerie":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  "Pharmacie":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  "Autre":"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
};

function StatCard({ icon, val, label, color, sub, trend }) {
  return (
    <div style={{ background:DS.card, borderRadius:DS.radius.lg, padding:16, boxShadow:DS.shadow.sm }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ fontSize:26 }}>{icon}</div>
        {trend !== undefined && (
          <span style={{ fontSize:11, fontWeight:700, color:trend>=0?DS.success:DS.danger, background:trend>=0?"#F0FFF4":"#FFF0F0", borderRadius:DS.radius.full, padding:"2px 8px" }}>
            {trend>=0?"↑":"↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize:26, fontWeight:900, color:color, letterSpacing:-0.5 }}>{val}</div>
      <div style={{ fontSize:12, fontWeight:600, color:DS.text, marginTop:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:DS.textMuted, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function MiniGraph({ data, color="#FF6B00", height=40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120, h = height;
  const points = data.map((v,i) => `${(i/(data.length-1))*w},${h-(v/max)*(h*0.85)}`).join(" ");
  const area = `${points} ${w},${h} 0,${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g${color.replace("#","")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Point final */}
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-(data[data.length-1]/max)*(h*0.85)} r="3.5" fill={color}/>
    </svg>
  );
}

export default function Dashboard() {
  const [offres, setOffres] = useState([]);
  const [mode, setMode] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editOffre, setEditOffre] = useState(null);

  const emptyForm = {
    titre:"", description:"", categorie:"Restaurant",
    type_reduction:"pourcentage", valeur_reduction:"",
    prix_original:"", prix_promo:"",
    date_fin:"", stock_initial:"", conditions:"",
    commercant_nom:"", adresse:"", ville:"Paris",
    est_urgente:false, est_active:true,
    latitude:48.8566, longitude:2.3522, rayon_km:2,
    image_url:IMAGE_SUGGESTIONS["Restaurant"]
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { Offre.list().then(data => { setOffres(data); setLoading(false); }); }, []);
  useEffect(() => {
    setForm(f => ({ ...f, image_url: IMAGE_SUGGESTIONS[f.categorie] || IMAGE_SUGGESTIONS["Autre"] }));
  }, [form.categorie]);

  const totalVues = offres.reduce((s,o) => s+(o.nb_vues||0), 0);
  const totalClics = offres.reduce((s,o) => s+(o.nb_clics||0), 0);
  const totalConv = offres.reduce((s,o) => s+(o.nb_conversions||0), 0);
  const tauxConv = totalClics > 0 ? ((totalConv/totalClics)*100).toFixed(1) : "0.0";
  const offresActives = offres.filter(o => o.est_active).length;
  const economiesTotales = offres.reduce((s,o) => {
    if (o.prix_original && o.prix_promo) return s + (o.prix_original-o.prix_promo)*(o.nb_conversions||0);
    return s;
  }, 0);
  const roiEstime = economiesTotales > 0 ? (totalConv * 18).toFixed(0) : "0";

  // Données simulées pour les graphes (7 derniers jours)
  const graphVues = [Math.round(totalVues*0.08),Math.round(totalVues*0.12),Math.round(totalVues*0.10),Math.round(totalVues*0.15),Math.round(totalVues*0.18),Math.round(totalVues*0.20),Math.round(totalVues*0.17)];
  const graphConv = [Math.round(totalConv*0.10),Math.round(totalConv*0.14),Math.round(totalConv*0.12),Math.round(totalConv*0.16),Math.round(totalConv*0.18),Math.round(totalConv*0.15),Math.round(totalConv*0.15)];

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = {
        ...form,
        valeur_reduction:parseFloat(form.valeur_reduction)||0,
        prix_original:parseFloat(form.prix_original)||0,
        prix_promo:parseFloat(form.prix_promo)||0,
        stock_initial:form.stock_initial?parseInt(form.stock_initial):null,
        stock_restant:form.stock_initial?parseInt(form.stock_initial):null,
        nb_vues:0, nb_clics:0, nb_conversions:0,
        date_debut:new Date().toISOString()
      };
      if (editOffre) {
        await Offre.update(editOffre.id, data);
      } else {
        await Offre.create(data);
      }
      const updated = await Offre.list();
      setOffres(updated); setSaved(true);
      setForm(emptyForm); setEditOffre(null);
      setMode("dashboard");
      setTimeout(() => setSaved(false), 4000);
    } catch(err) { alert("Erreur : "+err.message); }
    setSaving(false);
  };

  const toggleActive = async (offre) => {
    await Offre.update(offre.id, { est_active:!offre.est_active });
    setOffres(prev => prev.map(o => o.id===offre.id ? {...o, est_active:!o.est_active} : o));
  };

  const deleteOffre = async (id) => {
    await Offre.delete(id);
    setOffres(prev => prev.filter(o => o.id!==id));
    setDeleteConfirm(null);
  };

  const startEdit = (offre) => {
    setForm({ ...offre, valeur_reduction:String(offre.valeur_reduction), prix_original:String(offre.prix_original), prix_promo:String(offre.prix_promo), stock_initial:String(offre.stock_initial||"") });
    setEditOffre(offre); setMode("creer");
  };

  const inp = { width:"100%", border:`1.5px solid ${DS.border}`, borderRadius:DS.radius.md, padding:"13px 14px", fontSize:14, outline:"none", boxSizing:"border-box", background:"#FAFAFA", fontFamily:DS.font, color:DS.text };

  return (
    <div style={{ background:DS.bg, minHeight:"100vh", fontFamily:DS.font, maxWidth:430, margin:"0 auto" }}>

      {/* Header dark avec dégradé */}
      <div style={{ background:"linear-gradient(135deg, #1a0a00 0%, #2d1200 60%, #FF6B0022 100%)", padding:"52px 16px 16px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <CPLogo size={32} white />
          <div>
            <div style={{ color:"white", fontSize:17, fontWeight:900, letterSpacing:-0.3 }}>Espace Commerçant</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Dashboard Click & Promo</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.08)", borderRadius:DS.radius.md, padding:4, gap:4 }}>
          {[{ key:"dashboard", label:"📈 Stats" }, { key:"creer", label: editOffre?"✏️ Modifier":"➕ Créer" }, { key:"liste", label:"📋 Offres" }].map(t => (
            <button key={t.key} onClick={() => { setMode(t.key); if(t.key!=="creer") setEditOffre(null); }} style={{
              flex:1, background:mode===t.key ? DS.primary : "transparent",
              color:"white", border:"none", borderRadius:DS.radius.sm,
              padding:"9px 4px", fontSize:12, fontWeight:mode===t.key?700:500, cursor:"pointer",
              boxShadow:mode===t.key?`0 2px 8px ${DS.primary}55`:"none", transition:"all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>

        {/* Toast */}
        {saved && (
          <div style={{ background:DS.success, color:"white", borderRadius:DS.radius.md, padding:"13px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:10, fontWeight:700, boxShadow:`0 4px 16px ${DS.success}44` }}>
            🎉 Offre {editOffre?"modifiée":"publiée"} avec succès !
          </div>
        )}

        {/* ========== DASHBOARD ========== */}
        {mode === "dashboard" && (
          <>
            {/* KPI grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <StatCard icon="🏷️" val={offresActives} label="Offres actives" color={DS.primary} sub={`${offres.length} au total`} trend={12}/>
              <StatCard icon="👁️" val={totalVues.toLocaleString()} label="Vues totales" color="#007AFF" sub="toutes offres" trend={8}/>
              <StatCard icon="🎁" val={totalConv} label="Conversions" color={DS.success} sub={`${tauxConv}% taux`} trend={5}/>
              <StatCard icon="💶" val={`${economiesTotales.toFixed(0)}€`} label="Économies clients" color="#AF52DE" sub="générées" />
            </div>

            {/* Graphe vues 7 jours */}
            <div style={{ background:"white", borderRadius:DS.radius.lg, padding:16, marginBottom:14, boxShadow:DS.shadow.sm }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:14, color:DS.text }}>📈 Vues — 7 derniers jours</span>
                <span style={{ fontSize:13, fontWeight:800, color:DS.primary }}>{totalVues.toLocaleString()}</span>
              </div>
              <MiniGraph data={graphVues} color={DS.primary} height={52}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                {["L","M","M","J","V","S","D"].map((d,i) => (
                  <span key={i} style={{ fontSize:10, color:DS.textMuted, flex:1, textAlign:"center" }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Graphe conversions */}
            <div style={{ background:"white", borderRadius:DS.radius.lg, padding:16, marginBottom:14, boxShadow:DS.shadow.sm }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:14, color:DS.text }}>🎯 Conversions — 7 jours</span>
                <span style={{ fontSize:13, fontWeight:800, color:DS.success }}>{totalConv}</span>
              </div>
              <MiniGraph data={graphConv} color={DS.success} height={52}/>
            </div>

            {/* Taux conversion */}
            <div style={{ background:"white", borderRadius:DS.radius.lg, padding:16, marginBottom:14, boxShadow:DS.shadow.sm }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontWeight:700, fontSize:14, color:DS.text }}>🎯 Taux de conversion</span>
                <span style={{ fontSize:22, fontWeight:900, color:parseFloat(tauxConv)>20?DS.success:DS.warning }}>{tauxConv}%</span>
              </div>
              <div style={{ background:DS.border, borderRadius:DS.radius.full, height:10, overflow:"hidden", marginBottom:8 }}>
                <div style={{ background:parseFloat(tauxConv)>20?`linear-gradient(90deg,${DS.success},#30D158)`:`linear-gradient(90deg,${DS.warning},${DS.primary})`, height:"100%", borderRadius:DS.radius.full, width:`${Math.min(parseFloat(tauxConv),100)}%`, transition:"width 1.2s" }}/>
              </div>
              <div style={{ fontSize:12, color:DS.textSub }}>{totalConv} conversions sur {totalClics} utilisations</div>
            </div>

            {/* ROI estimé */}
            <div style={{ background:`linear-gradient(135deg, ${DS.primary}15, ${DS.secondary}10)`, borderRadius:DS.radius.lg, padding:16, marginBottom:14, border:`1.5px solid ${DS.primary}22` }}>
              <div style={{ fontWeight:700, fontSize:14, color:DS.primary, marginBottom:6 }}>💰 ROI estimé</div>
              <div style={{ fontSize:28, fontWeight:900, color:DS.text, marginBottom:4 }}>{roiEstime}€</div>
              <div style={{ fontSize:12, color:DS.textSub }}>Chiffre d'affaires généré estimé (18€/conversion moyenne)</div>
            </div>

            {/* Top offres */}
            <div style={{ fontWeight:700, fontSize:14, color:DS.text, marginBottom:10, textTransform:"uppercase", letterSpacing:0.8 }}>
              🏆 Performance par offre
            </div>
            {offres.sort((a,b)=>(b.nb_vues||0)-(a.nb_vues||0)).slice(0,5).map(o => (
              <div key={o.id} style={{ background:DS.card, borderRadius:DS.radius.md, padding:14, marginBottom:8, boxShadow:DS.shadow.sm }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:DS.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
                    <div style={{ fontSize:11, color:DS.textMuted, marginTop:2 }}>{o.ville}</div>
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    <span style={{ background:o.est_active?"#F0FFF4":"#f5f5f7", color:o.est_active?DS.success:DS.textMuted, borderRadius:DS.radius.full, padding:"3px 9px", fontSize:10, fontWeight:700 }}>
                      {o.est_active?"● Actif":"○ Inactif"}
                    </span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  {[{label:"Vues",val:o.nb_vues||0,color:"#007AFF"},{label:"Clics",val:o.nb_clics||0,color:DS.primary},{label:"Conv.",val:o.nb_conversions||0,color:DS.success}].map((s,i) => (
                    <div key={i} style={{ flex:1, textAlign:"center", background:DS.bg, borderRadius:DS.radius.sm, padding:"6px 4px" }}>
                      <div style={{ fontSize:15, fontWeight:800, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:10, color:DS.textMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ========== CRÉER / MODIFIER ========== */}
        {mode === "creer" && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight:700, fontSize:15, color:DS.text, marginBottom:14 }}>
              {editOffre ? "✏️ Modifier l'offre" : "➕ Créer une nouvelle offre"}
            </div>

            {/* Preview image */}
            {form.image_url && (
              <div style={{ borderRadius:DS.radius.lg, overflow:"hidden", height:160, marginBottom:14, position:"relative" }}>
                <img src={form.image_url} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}/>
                <div style={{ position:"absolute", bottom:12, left:12, color:"white", fontWeight:700, fontSize:14 }}>Aperçu photo</div>
              </div>
            )}

            {[
              { label:"Titre de l'offre *", key:"titre", placeholder:"Ex: Ramen Tonkotsu -35%", required:true },
              { label:"Nom du commerce *", key:"commercant_nom", placeholder:"Ex: Brasserie du Marais", required:true },
              { label:"Description", key:"description", placeholder:"Détails de l'offre...", multiline:true },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>{f.label}</div>
                {f.multiline ? (
                  <textarea value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} rows={3}
                    style={{ ...inp, resize:"none" }} />
                ) : (
                  <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} required={f.required} style={inp}/>
                )}
              </div>
            ))}

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Catégorie</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setForm({...form, categorie:cat})} style={{
                    background:form.categorie===cat?DS.primary:"white",
                    color:form.categorie===cat?"white":DS.textSub,
                    border:`1.5px solid ${form.categorie===cat?DS.primary:DS.border}`,
                    borderRadius:DS.radius.full, padding:"7px 13px", fontSize:12, fontWeight:600, cursor:"pointer"
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Prix original (€)</div>
                <input type="number" step="0.01" value={form.prix_original} onChange={e=>setForm({...form,prix_original:e.target.value})} placeholder="25.00" style={inp}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Prix promo (€)</div>
                <input type="number" step="0.01" value={form.prix_promo} onChange={e=>setForm({...form,prix_promo:e.target.value})} placeholder="15.00" style={inp}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Réduction (%)</div>
                <input type="number" value={form.valeur_reduction} onChange={e=>setForm({...form,valeur_reduction:e.target.value})} placeholder="40" style={inp}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Stock initial</div>
                <input type="number" value={form.stock_initial} onChange={e=>setForm({...form,stock_initial:e.target.value})} placeholder="50" style={inp}/>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Date de fin</div>
              <input type="datetime-local" value={form.date_fin} onChange={e=>setForm({...form,date_fin:e.target.value})} style={inp}/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Ville</div>
                <input value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})} placeholder="Paris" style={inp}/>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Adresse</div>
                <input value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})} placeholder="12 Rue de..." style={inp}/>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:DS.textSub, marginBottom:6 }}>Conditions</div>
              <input value={form.conditions} onChange={e=>setForm({...form,conditions:e.target.value})} placeholder="Ex: Sur présentation du code. Limité à 1/personne." style={inp}/>
            </div>

            {/* Options */}
            <div style={{ background:"white", borderRadius:DS.radius.md, padding:14, marginBottom:16, boxShadow:DS.shadow.sm }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:600, color:DS.text }}>⚡ Offre urgente / flash deal</span>
                <div onClick={()=>setForm(f=>({...f,est_urgente:!f.est_urgente}))} style={{ width:46,height:26,borderRadius:13,background:form.est_urgente?DS.primary:"#ddd",cursor:"pointer",position:"relative",transition:"background 0.3s" }}>
                  <div style={{ position:"absolute",width:20,height:20,borderRadius:"50%",background:"white",top:3,left:form.est_urgente?23:3,transition:"left 0.3s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:600, color:DS.text }}>✅ Offre active immédiatement</span>
                <div onClick={()=>setForm(f=>({...f,est_active:!f.est_active}))} style={{ width:46,height:26,borderRadius:13,background:form.est_active?DS.success:"#ddd",cursor:"pointer",position:"relative",transition:"background 0.3s" }}>
                  <div style={{ position:"absolute",width:20,height:20,borderRadius:"50%",background:"white",top:3,left:form.est_active?23:3,transition:"left 0.3s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button type="button" onClick={()=>{setMode("dashboard");setEditOffre(null);setForm(emptyForm);}} style={{
                flex:1, background:DS.bg, border:`1.5px solid ${DS.border}`, borderRadius:DS.radius.lg,
                padding:"14px", fontSize:14, fontWeight:600, color:DS.textSub, cursor:"pointer"
              }}>Annuler</button>
              <button type="submit" disabled={saving} style={{
                flex:2, background:saving?"#e0e0e0":DS.gradient, color:saving?DS.textMuted:"white",
                border:"none", borderRadius:DS.radius.lg, padding:"14px",
                fontSize:15, fontWeight:700, cursor:saving?"not-allowed":"pointer",
                boxShadow:saving?"none":`0 6px 22px ${DS.primary}44`
              }}>
                {saving ? "⏳ Enregistrement..." : editOffre ? "✅ Mettre à jour" : "🚀 Publier l'offre"}
              </button>
            </div>
          </form>
        )}

        {/* ========== LISTE ========== */}
        {mode === "liste" && (
          <>
            <div style={{ fontWeight:700, fontSize:14, color:DS.textSub, marginBottom:12, textTransform:"uppercase", letterSpacing:0.8 }}>
              {offres.length} offre{offres.length>1?"s":""} au total
            </div>
            {loading && [1,2,3].map(i => (
              <div key={i} style={{ background:"white", borderRadius:DS.radius.md, height:80, marginBottom:10, boxShadow:DS.shadow.sm, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }}/>
              </div>
            ))}
            {!loading && offres.map(o => (
              <div key={o.id} style={{ background:DS.card, borderRadius:DS.radius.md, padding:14, marginBottom:10, boxShadow:DS.shadow.sm }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <img src={o.image_url} alt={o.titre} style={{ width:52, height:52, borderRadius:DS.radius.md, objectFit:"cover", flexShrink:0 }}
                    onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:DS.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
                    <div style={{ fontSize:11, color:DS.textSub, marginTop:2 }}>{o.ville} · {o.nb_vues||0} vues · {o.nb_conversions||0} conv.</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0 }}>
                    <button onClick={()=>toggleActive(o)} style={{ background:o.est_active?"#F0FFF4":"#f5f5f7", color:o.est_active?DS.success:DS.textMuted, border:"none", borderRadius:DS.radius.full, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      {o.est_active?"● Actif":"○ Pause"}
                    </button>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={()=>startEdit(o)} style={{ flex:1, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.radius.md, padding:"8px", fontSize:12, fontWeight:600, color:DS.primary, cursor:"pointer" }}>
                    ✏️ Modifier
                  </button>
                  {deleteConfirm===o.id ? (
                    <>
                      <button onClick={()=>deleteOffre(o.id)} style={{ flex:1, background:DS.danger, border:"none", borderRadius:DS.radius.md, padding:"8px", fontSize:12, fontWeight:700, color:"white", cursor:"pointer" }}>Confirmer</button>
                      <button onClick={()=>setDeleteConfirm(null)} style={{ flex:1, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.radius.md, padding:"8px", fontSize:12, fontWeight:600, color:DS.textMuted, cursor:"pointer" }}>Annuler</button>
                    </>
                  ) : (
                    <button onClick={()=>setDeleteConfirm(o.id)} style={{ flex:1, background:"#FFF0F0", border:`1px solid ${DS.danger}22`, borderRadius:DS.radius.md, padding:"8px", fontSize:12, fontWeight:600, color:DS.danger, cursor:"pointer" }}>
                      🗑 Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
