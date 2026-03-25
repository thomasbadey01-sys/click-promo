import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { DS, Icon, CPLogo } from "./Home";

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

function MiniGraph({ data = [], color = DS.orange, h = 48 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 200;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h * 0.85)}`).join(" ");
  const area = `${pts} ${w},${h} 0,${h}`;
  const gid = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] / max) * (h * 0.85)} r="3" fill={color} />
    </svg>
  );
}

function KpiCard({ icon, val, label, color, sub, trend }) {
  return (
    <div style={{ background: "white", borderRadius: DS.r16, padding: "14px 14px 12px", boxShadow: DS.s1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: DS.r8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color, display: "flex" }}>{icon}</span>
        </div>
        {trend != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? DS.green : DS.red, background: trend >= 0 ? `${DS.green}15` : `${DS.red}15`, borderRadius: DS.r99, padding: "2px 7px" }}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: DS.black, letterSpacing: -0.5, marginBottom: 2 }}>{val}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: DS.gray700 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: DS.gray400, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [offres, setOffres] = useState([]);
  const [mode, setMode] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editOffre, setEditOffre] = useState(null);

  const empty = { titre:"",description:"",categorie:"Restaurant",type_reduction:"pourcentage",valeur_reduction:"",prix_original:"",prix_promo:"",date_fin:"",stock_initial:"",conditions:"",commercant_nom:"",adresse:"",ville:"Paris",est_urgente:false,est_active:true,latitude:48.8566,longitude:2.3522,rayon_km:2,image_url:IMAGE_SUGGESTIONS["Restaurant"] };
  const [form, setForm] = useState(empty);

  useEffect(() => { Offre.list().then(d => { setOffres(d); setLoading(false); }); }, []);
  useEffect(() => { setForm(f => ({ ...f, image_url: IMAGE_SUGGESTIONS[f.categorie] || IMAGE_SUGGESTIONS["Autre"] })); }, [form.categorie]);

  const totalVues = offres.reduce((s, o) => s + (o.nb_vues || 0), 0);
  const totalClics = offres.reduce((s, o) => s + (o.nb_clics || 0), 0);
  const totalConv = offres.reduce((s, o) => s + (o.nb_conversions || 0), 0);
  const tauxConv = totalClics > 0 ? ((totalConv / totalClics) * 100).toFixed(1) : "0.0";
  const actives = offres.filter(o => o.est_active).length;
  const economies = offres.reduce((s, o) => o.prix_original && o.prix_promo ? s + (o.prix_original - o.prix_promo) * (o.nb_conversions || 0) : s, 0);
  const roi = totalConv * 18;

  const gVues = [.08,.12,.10,.15,.18,.20,.17].map(x => Math.round(totalVues * x));
  const gConv = [.10,.14,.12,.16,.18,.15,.15].map(x => Math.round(totalConv * x));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const d = { ...form, valeur_reduction:parseFloat(form.valeur_reduction)||0, prix_original:parseFloat(form.prix_original)||0, prix_promo:parseFloat(form.prix_promo)||0, stock_initial:form.stock_initial?parseInt(form.stock_initial):null, stock_restant:form.stock_initial?parseInt(form.stock_initial):null, nb_vues:0, nb_clics:0, nb_conversions:0, date_debut:new Date().toISOString() };
      if (editOffre) await Offre.update(editOffre.id, d); else await Offre.create(d);
      setOffres(await Offre.list());
      setSaved(true); setForm(empty); setEditOffre(null); setMode("stats");
      setTimeout(() => setSaved(false), 3500);
    } catch(e) { alert(e.message); }
    setSaving(false);
  };
  const toggleActive = async o => { await Offre.update(o.id, { est_active: !o.est_active }); setOffres(p => p.map(x => x.id === o.id ? { ...x, est_active: !x.est_active } : x)); };
  const deleteO = async id => { await Offre.delete(id); setOffres(p => p.filter(o => o.id !== id)); setDeleteConfirm(null); };
  const startEdit = o => { setForm({ ...o, valeur_reduction:String(o.valeur_reduction), prix_original:String(o.prix_original), prix_promo:String(o.prix_promo), stock_initial:String(o.stock_initial||"") }); setEditOffre(o); setMode("creer"); };

  const inp = { width:"100%", border:`1.5px solid ${DS.gray200}`, borderRadius:DS.r12, padding:"12px 14px", fontSize:14, outline:"none", boxSizing:"border-box", background:DS.gray50, fontFamily:DS.font, color:DS.black, transition:"border-color 0.2s" };

  return (
    <div style={{ background: DS.gray50, minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: DS.black, padding: "52px 16px 14px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <CPLogo size={32} dark />
          <div>
            <div style={{ color: "white", fontSize: 17, fontWeight: 900, letterSpacing: -0.4 }}>Espace Commerçant</div>
            <div style={{ color: DS.gray500, fontSize: 11 }}>{actives} offre{actives !== 1 ? "s" : ""} active{actives !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: DS.r12, padding: 4, gap: 4 }}>
          {[{ k: "stats", l: "Statistiques" }, { k: "creer", l: editOffre ? "Modifier" : "Créer" }, { k: "liste", l: "Mes offres" }].map(t => (
            <button key={t.k} onClick={() => { setMode(t.k); if (t.k !== "creer") setEditOffre(null); }} style={{
              flex: 1, background: mode === t.k ? DS.orange : "transparent",
              color: "white", border: "none", borderRadius: DS.r8,
              padding: "9px 4px", fontSize: 12, fontWeight: mode === t.k ? 700 : 400,
              cursor: "pointer", fontFamily: DS.font,
              boxShadow: mode === t.k ? DS.sOrange : "none", transition: "all 0.2s"
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 14px 100px" }}>

        {saved && (
          <div style={{ background: DS.green, color: "white", borderRadius: DS.r12, padding: "12px 14px", marginBottom: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            {Icon.check(15, "white")} Offre {editOffre ? "modifiée" : "publiée"} avec succès !
          </div>
        )}

        {/* ── STATS ── */}
        {mode === "stats" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <KpiCard icon={Icon.tag(16, DS.orange)} val={actives} label="Offres actives" color={DS.orange} sub={`${offres.length} total`} trend={12} />
              <KpiCard icon={Icon.eye(16, DS.blue)} val={totalVues.toLocaleString()} label="Vues" color={DS.blue} sub="toutes offres" trend={8} />
              <KpiCard icon={Icon.check(16, DS.green)} val={totalConv} label="Conversions" color={DS.green} sub={`${tauxConv}% taux`} trend={5} />
              <KpiCard icon={Icon.star(16, DS.purple)} val={`${economies.toFixed(0)}€`} label="Économies clients" color={DS.purple} />
            </div>

            {/* Graphe vues */}
            <div style={{ background: "white", borderRadius: DS.r16, padding: "14px 16px", marginBottom: 10, boxShadow: DS.s1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: DS.black }}>Vues — 7 derniers jours</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: DS.orange }}>{totalVues.toLocaleString()}</span>
              </div>
              <MiniGraph data={gVues} color={DS.orange} h={52} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: DS.gray400, flex: 1, textAlign: "center" }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Graphe conv */}
            <div style={{ background: "white", borderRadius: DS.r16, padding: "14px 16px", marginBottom: 10, boxShadow: DS.s1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: DS.black }}>Conversions — 7 jours</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: DS.green }}>{totalConv}</span>
              </div>
              <MiniGraph data={gConv} color={DS.green} h={52} />
            </div>

            {/* Taux conv */}
            <div style={{ background: "white", borderRadius: DS.r16, padding: "14px 16px", marginBottom: 10, boxShadow: DS.s1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: DS.black }}>Taux de conversion</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: parseFloat(tauxConv) > 20 ? DS.green : DS.orange }}>{tauxConv}%</span>
              </div>
              <div style={{ background: DS.gray100, borderRadius: DS.r99, height: 8 }}>
                <div style={{ background: `linear-gradient(90deg,${parseFloat(tauxConv) > 20 ? DS.green : DS.orange},${parseFloat(tauxConv) > 20 ? "#16A34A" : DS.red})`, height: "100%", borderRadius: DS.r99, width: `${Math.min(parseFloat(tauxConv), 100)}%`, transition: "width 1.2s" }} />
              </div>
              <div style={{ fontSize: 11, color: DS.gray400, marginTop: 6 }}>{totalConv} conv. sur {totalClics} utilisations</div>
            </div>

            {/* ROI */}
            <div style={{ background: DS.black, borderRadius: DS.r16, padding: "14px 16px", boxShadow: DS.s2 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.orange, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>ROI estimé</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white", letterSpacing: -1 }}>{roi.toLocaleString()}€</div>
              <div style={{ fontSize: 11, color: DS.gray500, marginTop: 4 }}>Chiffre d'affaires généré (base 18€/conversion)</div>
            </div>
          </>
        )}

        {/* ── CRÉER / MODIFIER ── */}
        {mode === "creer" && (
          <form onSubmit={submit}>
            <div style={{ fontWeight: 700, fontSize: 15, color: DS.black, marginBottom: 14 }}>{editOffre ? "Modifier l'offre" : "Créer une offre"}</div>

            {form.image_url && (
              <div style={{ borderRadius: DS.r16, overflow: "hidden", height: 140, marginBottom: 14, position: "relative" }}>
                <img src={form.image_url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.45),transparent)" }} />
                <span style={{ position: "absolute", bottom: 10, left: 12, color: "white", fontSize: 12, fontWeight: 600 }}>Aperçu photo</span>
              </div>
            )}

            {/* Catégorie pills */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>Catégorie</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setForm({ ...form, categorie: cat })} style={{ background: form.categorie === cat ? DS.orange : "white", color: form.categorie === cat ? "white" : DS.gray700, border: `1.5px solid ${form.categorie === cat ? DS.orange : DS.gray200}`, borderRadius: DS.r99, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{cat}</button>
                ))}
              </div>
            </div>

            {[{ l: "Titre *", k: "titre", ph: "Ex: Ramen Tonkotsu -35%", req: true }, { l: "Commerce *", k: "commercant_nom", ph: "Brasserie du Marais", req: true }].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>{f.l}</div>
                <input value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} required={f.req} style={inp} onFocus={e => e.target.style.borderColor = DS.orange} onBlur={e => e.target.style.borderColor = DS.gray200} />
              </div>
            ))}

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>Description</div>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Détails de l'offre..." rows={3} style={{ ...inp, resize: "none" }} onFocus={e => e.target.style.borderColor = DS.orange} onBlur={e => e.target.style.borderColor = DS.gray200} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[{ l: "Prix original €", k: "prix_original", ph: "25.00" }, { l: "Prix promo €", k: "prix_promo", ph: "15.00" }, { l: "Réduction %", k: "valeur_reduction", ph: "40" }, { l: "Stock initial", k: "stock_initial", ph: "50" }].map(f => (
                <div key={f.k}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>{f.l}</div>
                  <input type="number" step="0.01" value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} style={inp} onFocus={e => e.target.style.borderColor = DS.orange} onBlur={e => e.target.style.borderColor = DS.gray200} />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[{ l: "Ville", k: "ville", ph: "Paris" }, { l: "Adresse", k: "adresse", ph: "12 Rue de..." }].map(f => (
                <div key={f.k}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>{f.l}</div>
                  <input value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} style={inp} onFocus={e => e.target.style.borderColor = DS.orange} onBlur={e => e.target.style.borderColor = DS.gray200} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>Date de fin</div>
              <input type="datetime-local" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })} style={inp} />
            </div>

            <div style={{ background: "white", borderRadius: DS.r12, padding: 14, marginBottom: 14, boxShadow: DS.s1 }}>
              {[{ l: "Offre flash / urgente", k: "est_urgente", col: DS.red }, { l: "Activer immédiatement", k: "est_active", col: DS.green }].map(t => (
                <div key={t.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.k === "est_urgente" ? 12 : 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: DS.black }}>{t.l}</span>
                  <div onClick={() => setForm(f => ({ ...f, [t.k]: !f[t.k] }))} style={{ width: 44, height: 24, borderRadius: 12, background: form[t.k] ? t.col : DS.gray200, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
                    <div style={{ position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "white", top: 3, left: form[t.k] ? 23 : 3, transition: "left 0.3s", boxShadow: DS.s1 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => { setMode("stats"); setEditOffre(null); setForm(empty); }} style={{ flex: 1, background: "white", border: `1.5px solid ${DS.gray200}`, borderRadius: DS.r16, padding: "13px", fontSize: 14, fontWeight: 600, color: DS.gray500, cursor: "pointer" }}>Annuler</button>
              <button type="submit" disabled={saving} style={{ flex: 2, background: saving ? DS.gray200 : DS.gradMain, color: saving ? DS.gray400 : "white", border: "none", borderRadius: DS.r16, padding: "13px", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : DS.sOrange }}>
                {saving ? "Enregistrement..." : editOffre ? "Mettre à jour" : "Publier l'offre"}
              </button>
            </div>
          </form>
        )}

        {/* ── LISTE ── */}
        {mode === "liste" && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.gray400, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
              {offres.length} offre{offres.length !== 1 ? "s" : ""}
            </div>
            {loading && [1, 2, 3].map(i => <div key={i} style={{ background: "white", borderRadius: DS.r12, height: 76, marginBottom: 8, boxShadow: DS.s1, overflow: "hidden" }}><div style={{ height: "100%", background: "linear-gradient(90deg,#f3f4f6 25%,#fafafa 50%,#f3f4f6 75%)", backgroundSize: "400% 100%", animation: "shimmer 1.4s infinite" }} /></div>)}
            {offres.map(o => (
              <div key={o.id} style={{ background: "white", borderRadius: DS.r12, padding: "12px 13px", marginBottom: 8, boxShadow: DS.s1 }}>
                <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <img src={o.image_url} alt="" style={{ width: 48, height: 48, borderRadius: DS.r8, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: DS.black, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                    <div style={{ fontSize: 11, color: DS.gray500, marginTop: 2 }}>{o.ville} · {o.nb_vues || 0} vues · {o.nb_conversions || 0} conv.</div>
                  </div>
                  <button onClick={() => toggleActive(o)} style={{ background: o.est_active ? `${DS.green}15` : DS.gray100, color: o.est_active ? DS.green : DS.gray400, border: "none", borderRadius: DS.r99, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                    {o.est_active ? "Actif" : "Pause"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => startEdit(o)} style={{ flex: 1, background: DS.gray50, border: `1px solid ${DS.gray200}`, borderRadius: DS.r8, padding: "7px", fontSize: 12, fontWeight: 600, color: DS.orange, cursor: "pointer" }}>Modifier</button>
                  {deleteConfirm === o.id ? (
                    <>
                      <button onClick={() => deleteO(o.id)} style={{ flex: 1, background: DS.red, border: "none", borderRadius: DS.r8, padding: "7px", fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer" }}>Confirmer</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: DS.gray100, border: "none", borderRadius: DS.r8, padding: "7px", fontSize: 12, fontWeight: 600, color: DS.gray500, cursor: "pointer" }}>Annuler</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(o.id)} style={{ flex: 1, background: "#FEF2F2", border: `1px solid ${DS.red}22`, borderRadius: DS.r8, padding: "7px", fontSize: 12, fontWeight: 600, color: DS.red, cursor: "pointer" }}>Supprimer</button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
