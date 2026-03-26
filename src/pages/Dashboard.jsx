import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { DS, Ic, Sparkline, DarkNavBar } from "./theme";
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

function exportCSV(offres) {
  const headers = ["Titre","Catégorie","Ville","Prix promo","Vues","Clics","Conversions","Stock restant","Active","Date fin"];
  const rows = offres.map(o => [
    `"${(o.titre||"").replace(/"/g,'""')}"`,
    o.categorie||"",o.ville||"",o.prix_promo||0,
    o.nb_vues||0,o.nb_clics||0,o.nb_conversions||0,
    o.stock_restant||0,o.est_active?"Oui":"Non",
    o.date_fin ? new Date(o.date_fin).toLocaleDateString("fr-FR") : ""
  ]);
  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "click_promo_offres.csv"; a.click();
  URL.revokeObjectURL(url);
}

// Carte stat dark
function StatCard({ label, value, trend, data, col = DS.brand2 }) {
  return (
    <div style={{
      background: DS.darkCard,
      borderRadius: DS.lg,
      padding: "14px 14px 10px",
      border: `1px solid ${DS.darkBorder}`,
      flex: 1,
    }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: DS.white, letterSpacing: -1, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginBottom: 8 }}>{label}</div>
      <Sparkline data={data} col={col} h={40} />
      {trend != null && (
        <div style={{ fontSize: 12, fontWeight: 700, color: DS.success, marginTop: 4 }}>
          +{trend}% M-D
        </div>
      )}
    </div>
  );
}


// Fonction pour calculer stats des 7 derniers jours
function get7DayStats(offres) {
  const now = new Date();
  const stats = {};
  
  // Initialiser 7 jours (J-6 à J)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
    stats[key] = { vues: 0, conversions: 0, date: new Date(d) };
  }
  
  // Agréger par created_date
  offres.forEach(o => {
    if (!o.created_date) return;
    const oDate = new Date(o.created_date).toISOString().split('T')[0];
    if (stats[oDate]) {
      stats[oDate].vues += o.nb_vues || 0;
      stats[oDate].conversions += o.nb_conversions || 0;
    }
  });
  
  return Object.values(stats).sort((a, b) => a.date - b.date);
}

// Composant BarChart
function BarChart7D({ stats, label }) {
  const maxVal = Math.max(...stats.map(s => (label === 'vues' ? s.vues : s.conversions)), 1);
  return (
    <div style={{
      background: DS.darkCard,
      borderRadius: DS.lg,
      padding: "16px",
      border: `1px solid ${DS.darkBorder}`,
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: DS.white, marginBottom: 12 }}>
        Tendance {label === 'vues' ? 'Vues' : 'Conversions'} (7 derniers jours)
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, justifyContent: "space-between" }}>
        {stats.map((s, i) => {
          const val = label === 'vues' ? s.vues : s.conversions;
          const h = Math.max(8, (val / maxVal) * 100);
          const d = s.date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' });
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", minHeight: 16, textAlign: "center" }}>{val}</div>
              <div style={{
                width: "100%",
                height: h + "%",
                background: label === 'vues' ? DS.brand : DS.success,
                borderRadius: "4px 4px 0 0",
                minHeight: 8,
              }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", marginTop: 4 }}>{d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const empty = {
  titre:"",description:"",categorie:"Restaurant",type_reduction:"pourcentage",
  valeur_reduction:"",prix_original:"",prix_promo:"",date_fin:"",
  stock_initial:"",conditions:"",commercant_nom:"",adresse:"",ville:"Paris",
  est_urgente:false,est_active:true,achat_en_ligne:false,commission_pct:8,
  latitude:48.8566,longitude:2.3522,rayon_km:2,image_url:IMGS["Restaurant"],
};

export default function Dashboard() {
  const [offres, setOffres] = useState([]);
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [delConf, setDelConf] = useState(null);
  const [editO, setEditO] = useState(null);
  const [form, setForm] = useState(empty);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Offre.list().then(d => { setOffres(d); setLoading(false); });
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const totalV  = offres.reduce((s,o) => s + (o.nb_vues||0), 0);
  const totalCl = offres.reduce((s,o) => s + (o.nb_clics||0), 0);
  const totalCo = offres.reduce((s,o) => s + (o.nb_conversions||0), 0);
  const taux = totalCl > 0 ? ((totalCo/totalCl)*100).toFixed(1) : "0.0";
  const actives = offres.filter(o => o.est_active).length;

  const gV = [.08,.12,.10,.15,.18,.20,.17].map(x => Math.round(totalV*x||12));
  const gC = [.10,.14,.12,.16,.18,.15,.15].map(x => Math.round(totalCo*x||3));

  const startEdit = o => {
    setForm({
      ...o,
      valeur_reduction: String(o.valeur_reduction),
      prix_original: String(o.prix_original),
      prix_promo: String(o.prix_promo),
      stock_initial: String(o.stock_initial||""),
      commission_pct: String(o.commission_pct||8),
    });
    setEditO(o); setTab("creer");
  };

  const duplicate = async o => {
    const { id, created_date, updated_date, created_by, nb_vues, nb_clics, nb_conversions, ...rest } = o;
    const created = await Offre.create({ ...rest, titre: rest.titre+" (copie)", est_active: false, nb_vues:0, nb_clics:0, nb_conversions:0, stock_restant: rest.stock_initial||0 });
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
        stock_restant: editO ? form.stock_restant : parseInt(form.stock_initial)||0,
        commission_pct: parseFloat(form.commission_pct)||8,
      };
      if (editO) {
        const updated = await Offre.update(editO.id, payload);
        setOffres(p => p.map(o => o.id === editO.id ? updated : o));
      } else {
        const created = await Offre.create(payload);
        setOffres(p => [created, ...p]);
      }
      setSaved(true); setForm(empty); setEditO(null); setTab("stats");
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const delO = async id => { await Offre.delete(id); setOffres(p => p.filter(o => o.id !== id)); setDelConf(null); };

  if (loading) return (
    <div style={{ background: DS.dark, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, background: DS.brand, borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>C&P</span>
        </div>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Chargement…</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: DS.dark, minHeight: "100vh", fontFamily: DS.fontBase, color: DS.white }}>

      {/* Header */}
      <div style={{ padding: `calc(${DS.safeTop} + 8px) 16px 16px`, background: DS.dark2, borderBottom: `1px solid ${DS.darkBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: DS.white, letterSpacing: -0.8 }}>Tableau de Bord</div>
            {user && <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 2 }}>Marchand · {user.email}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} style={{ width: 38, height: 38, borderRadius: DS.pill, border: `2px solid ${DS.brand}` }} />
              : <div style={{ width: 38, height: 38, borderRadius: DS.pill, background: DS.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                  {(user?.full_name||user?.email||"M")[0].toUpperCase()}
                </div>
            }
          </div>
        </div>
      </div>

      {/* Toast */}
      {saved && (
        <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", background: DS.success, color: DS.white, borderRadius: DS.pill, padding: "10px 20px", fontSize: 13, fontWeight: 700, zIndex: 999, boxShadow: DS.e3 }}>
          ✓ Sauvegardé !
        </div>
      )}

      <div style={{ padding: "16px 16px 100px" }}>

        {/* ── STATS ── */}
        {tab === "stats" && (
          <>
            {/* 3 cartes stats en ligne */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <StatCard label="vues" value={totalV.toLocaleString()} trend={8.2} data={gV} col={DS.brand2} />
              <StatCard label="conversions" value={totalCo} trend={15.3} data={gC} col={DS.brand2} />
              <StatCard label="taux de conversion" value={`${taux}%`} trend={2.1} data={[3,4,3.5,4.5,5,4.8,5.2]} col={DS.success} />
            </div>

            {/* Graphes 7j */}
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <BarChart7D stats={get7DayStats(offres)} label="vues" />
              <BarChart7D stats={get7DayStats(offres)} label="conversions" />
            </div>

            {/* Offres actives */}
            <div style={{ fontSize: 18, fontWeight: 800, color: DS.white, marginBottom: 12 }}>Offres Actives</div>
            {offres.filter(o => o.est_active).slice(0, 5).map(o => <DarkOffreRow key={o.id} o={o} onEdit={() => startEdit(o)} onDel={() => setDelConf(o.id)} delConf={delConf} onDelConfirm={() => delO(o.id)} onDelCancel={() => setDelConf(null)} />)}

            {/* Export CSV */}
            <button onClick={() => exportCSV(offres)} style={{
              width: "100%", marginTop: 12,
              background: DS.dark3, border: `1px solid ${DS.darkBorder}`,
              borderRadius: DS.lg, padding: "13px",
              fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {Ic.download("rgba(255,255,255,.6)", 16)} Exporter les stats (CSV)
            </button>
          </>
        )}

        {/* ── MES OFFRES ── */}
        {tab === "liste" && (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: DS.white, marginBottom: 12 }}>
              Mes offres ({offres.length})
            </div>
            {offres.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,.3)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Aucune offre</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Créez votre première offre</div>
              </div>
            ) : offres.map(o => (
              <DarkOffreRow key={o.id} o={o} onEdit={() => startEdit(o)} onDel={() => setDelConf(o.id)} delConf={delConf} onDelConfirm={() => delO(o.id)} onDelCancel={() => setDelConf(null)} onDuplicate={() => duplicate(o)} />
            ))}
          </>
        )}

        {/* ── CRÉER / MODIFIER ── */}
        {tab === "creer" && (
          <form onSubmit={submit}>
            <div style={{ fontSize: 20, fontWeight: 800, color: DS.white, marginBottom: 18 }}>
              {editO ? "Modifier l'offre" : "Nouvelle offre"}
            </div>

            {/* Aperçu image */}
            {form.image_url && (
              <div style={{ borderRadius: DS.lg, overflow: "hidden", height: 140, marginBottom: 16, position: "relative" }}>
                <img src={form.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.5),transparent)" }} />
                <span style={{ position: "absolute", bottom: 10, left: 12, color: DS.white, fontSize: 11, fontWeight: 700, background: "rgba(0,0,0,.4)", borderRadius: DS.pill, padding: "3px 8px" }}>Aperçu</span>
              </div>
            )}

            {/* Catégorie */}
            <Label>Catégorie</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {CATS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, categorie: c, image_url: IMGS[c]||IMGS["Autre"] })} style={{
                  background: form.categorie === c ? DS.brand : DS.dark3,
                  color: form.categorie === c ? DS.white : "rgba(255,255,255,.6)",
                  border: `1.5px solid ${form.categorie === c ? DS.brand : DS.darkBorder}`,
                  borderRadius: DS.pill, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{c}</button>
              ))}
            </div>

            <Label>Titre de l'offre *</Label>
            <DarkInput value={form.titre} onChange={v => setForm({...form,titre:v})} placeholder="Ex: Menu Midi -30%" required />

            <Label>Nom du commerce *</Label>
            <DarkInput value={form.commercant_nom} onChange={v => setForm({...form,commercant_nom:v})} placeholder="Ex: Le Bistrot de Paris" required />

            <Label>Description</Label>
            <DarkTextarea value={form.description} onChange={v => setForm({...form,description:v})} placeholder="Décrivez l'offre..." />

            <Label>Type de réduction</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["pourcentage","montant"].map(t => (
                <button key={t} type="button" onClick={() => setForm({...form,type_reduction:t})} style={{
                  flex:1, padding:"10px", borderRadius:DS.md, fontSize:13, fontWeight:700, cursor:"pointer",
                  background: form.type_reduction===t ? DS.brand : DS.dark3,
                  color: form.type_reduction===t ? DS.white : "rgba(255,255,255,.5)",
                  border:`1.5px solid ${form.type_reduction===t ? DS.brand : DS.darkBorder}`,
                }}>{t==="pourcentage"?"% Pourcentage":"€ Montant"}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <Label>Réduction *</Label>
                <DarkInput type="number" value={form.valeur_reduction} onChange={v => setForm({...form,valeur_reduction:v})} placeholder="30" required />
              </div>
              <div>
                <Label>Prix original</Label>
                <DarkInput type="number" value={form.prix_original} onChange={v => setForm({...form,prix_original:v})} placeholder="29.90" />
              </div>
              <div>
                <Label>Prix promo</Label>
                <DarkInput type="number" value={form.prix_promo} onChange={v => setForm({...form,prix_promo:v})} placeholder="20.90" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <Label>Date de fin</Label>
                <DarkInput type="date" value={form.date_fin?.slice?.(0,10)||""} onChange={v => setForm({...form,date_fin:v})} />
              </div>
              <div>
                <Label>Stock</Label>
                <DarkInput type="number" value={form.stock_initial} onChange={v => setForm({...form,stock_initial:v})} placeholder="100" />
              </div>
            </div>

            <Label>Adresse</Label>
            <DarkInput value={form.adresse} onChange={v => setForm({...form,adresse:v})} placeholder="12 rue de la Paix" />

            <Label>Ville</Label>
            <DarkInput value={form.ville} onChange={v => setForm({...form,ville:v})} placeholder="Paris" />

            <Label>Conditions</Label>
            <DarkTextarea value={form.conditions} onChange={v => setForm({...form,conditions:v})} placeholder="Non cumulable, valable sur place..." />

            {/* Toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <Toggle label="⚡ Offre flash urgente" val={form.est_urgente} onChange={v => setForm({...form,est_urgente:v})} />
              <Toggle label="✅ Offre active" val={form.est_active} onChange={v => setForm({...form,est_active:v})} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => { setTab("stats"); setEditO(null); setForm(empty); }} style={{
                flex:1, background: DS.dark3, border:`1px solid ${DS.darkBorder}`,
                borderRadius:DS.lg, padding:"14px", fontSize:14, fontWeight:700,
                color:"rgba(255,255,255,.5)", cursor:"pointer",
              }}>Annuler</button>
              <button type="submit" disabled={saving} style={{
                flex:2, background: DS.brand, border:"none",
                borderRadius:DS.lg, padding:"14px", fontSize:15, fontWeight:800,
                color:DS.white, cursor:saving?"not-allowed":"pointer", boxShadow:DS.eBrand,
              }}>{saving ? "Enregistrement…" : editO ? "Modifier" : "Publier l'offre"}</button>
            </div>
          </form>
        )}

        {/* ── ANALYSES ── */}
        {tab === "analyses" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: DS.white, marginBottom: 16 }}>Analyses 7 jours</div>
            <div style={{ background: DS.darkCard, borderRadius: DS.lg, padding: 16, marginBottom: 12, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>Vues — 7 derniers jours</div>
              <Sparkline data={gV} col={DS.brand2} h={80} />
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                {["L","M","M","J","V","S","D"].map((d,i)=><span key={i} style={{fontSize:10,color:"rgba(255,255,255,.3)",textAlign:"center",flex:1}}>{d}</span>)}
              </div>
            </div>
            <div style={{ background: DS.darkCard, borderRadius: DS.lg, padding: 16, marginBottom: 12, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>Conversions — 7 derniers jours</div>
              <Sparkline data={gC} col={DS.success} h={80} />
            </div>
            <div style={{ background: DS.darkCard, borderRadius: DS.lg, padding: 16, border:`1px solid ${DS.darkBorder}` }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>Taux de conversion</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: DS.white }}>{taux}%</div>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: DS.pill, height: 6, marginTop: 10 }}>
                <div style={{ background: parseFloat(taux)>15?DS.success:DS.brand2, height:"100%", borderRadius:DS.pill, width:`${Math.min(parseFloat(taux)*3,100)}%`, transition:"width 1.2s" }}/>
              </div>
            </div>
            <button onClick={() => exportCSV(offres)} style={{
              width:"100%",marginTop:16,background:DS.dark3,border:`1px solid ${DS.darkBorder}`,
              borderRadius:DS.lg,padding:"13px",fontSize:13,fontWeight:700,
              color:"rgba(255,255,255,.6)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            }}>
              {Ic.download("rgba(255,255,255,.6)",16)} Exporter CSV
            </button>
          </div>
        )}
      </div>

      <DarkNavBar active={tab} />
      {/* Override DarkNavBar pour lier aux tabs */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,
        background:DS.dark2,
        borderTop:`1px solid ${DS.darkBorder}`,
        display:"flex",
        paddingBottom:"env(safe-area-inset-bottom, 12px)",
        zIndex:100,
      }}>
        {[
          {id:"stats",label:"Tableau de Bord",icon:Ic.grid},
          {id:"liste",label:"Mes Offres",icon:Ic.offers},
          {id:"creer",label:"Créer Offre",icon:Ic.plus},
          {id:"analyses",label:"Analyses",icon:Ic.chart},
          {id:"profil_dash",label:"Profil",icon:Ic.user},
        ].map(t => {
          const isActive = tab===t.id;
          return (
            <button key={t.id} onClick={()=>t.id==="profil_dash"?window.location.href="/Profil":setTab(t.id)} style={{
              flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              padding:"10px 0 4px",gap:3,background:"none",border:"none",cursor:"pointer",
              color:isActive?DS.brand2:"rgba(255,255,255,.4)",
            }}>
              {t.icon(isActive?DS.brand2:"rgba(255,255,255,.4)",20)}
              <span style={{fontSize:9,fontWeight:isActive?700:500,fontFamily:DS.fontBase}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Sous-composants dark
function Label({children}) {
  return <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:.8,marginBottom:7}}>{children}</div>;
}
function DarkInput({value,onChange,type="text",placeholder="",required=false}) {
  return (
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} style={{
      width:"100%",boxSizing:"border-box",marginBottom:14,
      background:DS.dark3,border:`1px solid ${DS.darkBorder}`,borderRadius:DS.md,
      padding:"12px 14px",fontSize:14,color:DS.white,fontFamily:DS.fontBase,outline:"none",
    }}/>
  );
}
function DarkTextarea({value,onChange,placeholder=""}) {
  return (
    <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{
      width:"100%",boxSizing:"border-box",marginBottom:14,
      background:DS.dark3,border:`1px solid ${DS.darkBorder}`,borderRadius:DS.md,
      padding:"12px 14px",fontSize:14,color:DS.white,fontFamily:DS.fontBase,outline:"none",resize:"vertical",
    }}/>
  );
}
function Toggle({label,val,onChange}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:DS.dark3,borderRadius:DS.md,padding:"12px 14px",border:`1px solid ${DS.darkBorder}`}}>
      <span style={{fontSize:14,color:DS.white,fontWeight:600}}>{label}</span>
      <div onClick={()=>onChange(!val)} style={{
        width:44,height:24,borderRadius:DS.pill,cursor:"pointer",transition:"background .2s",position:"relative",
        background:val?DS.brand:"rgba(255,255,255,.15)",
      }}>
        <div style={{
          position:"absolute",top:3,left:val?22:3,width:18,height:18,
          borderRadius:DS.pill,background:DS.white,transition:"left .2s",
        }}/>
      </div>
    </div>
  );
}

function DarkOffreRow({ o, onEdit, onDel, delConf, onDelConfirm, onDelCancel, onDuplicate }) {
  const lowStock = o.stock_initial > 0 && o.stock_restant < o.stock_initial * 0.2;
  return (
    <div style={{
      background: DS.darkCard,
      borderRadius: DS.lg,
      marginBottom: 12,
      overflow: "hidden",
      border: `1px solid ${DS.darkBorder}`,
    }}>
      <div style={{ display: "flex", gap: 12, padding: 12 }}>
        {/* Miniature */}
        <div style={{ width: 80, height: 72, borderRadius: DS.md, overflow: "hidden", flexShrink: 0 }}>
          <img src={o.image_url} alt={o.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e=>e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: DS.white, lineHeight: 1.3 }}>{o.titre}</div>
            <div style={{
              background: DS.brand, color: DS.white,
              borderRadius: DS.sm, padding: "3px 8px", fontSize: 12, fontWeight: 800, flexShrink: 0, marginLeft: 8,
            }}>-{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
            {o.commercant_nom} · Expire: {o.date_fin ? new Date(o.date_fin).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) : "—"}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{o.nb_vues||0} <span style={{fontWeight:400}}>Vues</span></span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{o.nb_conversions||0} <span style={{fontWeight:400}}>Util.</span></span>
            {lowStock && <span style={{ fontSize: 11, color: DS.warning, fontWeight: 700 }}>⚠️ Stock faible</span>}
          </div>
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}>
        <button onClick={onEdit} style={{
          flex:1, background: DS.brand, border:"none", borderRadius:DS.md,
          padding:"9px", fontSize:12, fontWeight:700, color:DS.white, cursor:"pointer",
        }}>Gérer</button>
        {onDuplicate && (
          <button onClick={onDuplicate} style={{
            flex:1, background: DS.dark4, border:`1px solid ${DS.darkBorder}`, borderRadius:DS.md,
            padding:"9px", fontSize:12, fontWeight:700, color:"rgba(255,255,255,.6)", cursor:"pointer",
          }}>Dupliquer</button>
        )}
        {delConf === o.id ? (
          <>
            <button onClick={onDelConfirm} style={{flex:1,background:DS.danger,border:"none",borderRadius:DS.md,padding:"9px",fontSize:12,fontWeight:700,color:DS.white,cursor:"pointer"}}>Confirmer</button>
            <button onClick={onDelCancel} style={{flex:1,background:DS.dark4,border:`1px solid ${DS.darkBorder}`,borderRadius:DS.md,padding:"9px",fontSize:12,fontWeight:600,color:"rgba(255,255,255,.4)",cursor:"pointer"}}>Annuler</button>
          </>
        ) : (
          <button onClick={onDel} style={{
            width:38,background:"rgba(239,68,68,.1)",border:`1px solid rgba(239,68,68,.2)`,borderRadius:DS.md,
            padding:"9px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          }}>{Ic.trash(DS.danger,14)}</button>
        )}
      </div>
    </div>
  );
}