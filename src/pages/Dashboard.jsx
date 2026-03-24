import { useState, useEffect } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

const CATEGORIES = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Services", "Épicerie", "Pharmacie", "Autre"];

const IMAGE_SUGGESTIONS = {
  "Restaurant": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Boutique": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "Beauté & Coiffure": "https://images.unsplash.com/photo-1560066984-138daaa0e9cd?w=800&q=80",
  "Fitness & Sport": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "Services": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
  "Épicerie": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  "Pharmacie": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  "Autre": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
};

// Graphe SVG simple
function LineChart({ data, color, height = 100 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 90}`).join(" ");
  const area = data.map((v, i, arr) => {
    if (i === 0) return `M ${(i / (arr.length - 1)) * 100} ${100 - (v / max) * 90}`;
    return `L ${(i / (arr.length - 1)) * 100} ${100 - (v / max) * 90}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={`${area} L 100 100 L 0 100 Z`} fill="url(#grad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

  const emptyForm = {
    titre: "", description: "", categorie: "Restaurant",
    type_reduction: "pourcentage", valeur_reduction: "",
    prix_original: "", prix_promo: "",
    date_fin: "", stock_initial: "", conditions: "",
    commercant_nom: "", adresse: "", ville: "Paris",
    est_urgente: false, est_active: true,
    latitude: 48.8566, longitude: 2.3522, rayon_km: 2,
    image_url: IMAGE_SUGGESTIONS["Restaurant"]
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Offre.list().then(data => { setOffres(data); setLoading(false); });
  }, []);

  useEffect(() => {
    setForm(f => ({ ...f, image_url: IMAGE_SUGGESTIONS[f.categorie] || IMAGE_SUGGESTIONS["Autre"] }));
  }, [form.categorie]);

  // Données fictives pour le graphe 7 jours
  const generateWeekData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: ["L", "M", "M", "J", "V", "S", "D"][d.getDay()],
        vues: Math.floor(Math.random() * 80) + 20,
        clics: Math.floor(Math.random() * 40) + 5,
        conv: Math.floor(Math.random() * 15) + 1
      });
    }
    return days;
  };

  const weekData = generateWeekData();
  const weekVues = weekData.map(d => d.vues);
  const weekClics = weekData.map(d => d.clics);
  const weekConv = weekData.map(d => d.conv);

  const totalVues = offres.reduce((s, o) => s + (o.nb_vues || 0), 0);
  const totalClics = offres.reduce((s, o) => s + (o.nb_clics || 0), 0);
  const totalConv = offres.reduce((s, o) => s + (o.nb_conversions || 0), 0);
  const tauxConv = totalClics > 0 ? ((totalConv / totalClics) * 100).toFixed(1) : "0.0";
  const offresActives = offres.filter(o => o.est_active).length;
  const economiesTotales = offres.reduce((s, o) => {
    if (o.prix_original && o.prix_promo) return s + (o.prix_original - o.prix_promo) * (o.nb_conversions || 0);
    return s;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Offre.create({
        ...form,
        valeur_reduction: parseFloat(form.valeur_reduction) || 0,
        prix_original: parseFloat(form.prix_original) || 0,
        prix_promo: parseFloat(form.prix_promo) || 0,
        stock_initial: form.stock_initial ? parseInt(form.stock_initial) : null,
        stock_restant: form.stock_initial ? parseInt(form.stock_initial) : null,
        nb_vues: 0, nb_clics: 0, nb_conversions: 0,
        date_debut: new Date().toISOString()
      });
      const updated = await Offre.list();
      setOffres(updated);
      setSaved(true);
      setForm(emptyForm);
      setMode("dashboard");
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
    setSaving(false);
  };

  const toggleActive = async (offre) => {
    await Offre.update(offre.id, { est_active: !offre.est_active });
    setOffres(prev => prev.map(o => o.id === offre.id ? { ...o, est_active: !o.est_active } : o));
  };

  const deleteOffre = async (id) => {
    await Offre.delete(id);
    setOffres(prev => prev.filter(o => o.id !== id));
    setDeleteConfirm(null);
  };

  const inputStyle = {
    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
    padding: "12px 14px", fontSize: 14, outline: "none",
    boxSizing: "border-box", background: "white", fontFamily: "inherit"
  };

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", padding: "52px 20px 20px" }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 2 }}>Tableau de bord</div>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📊 Espace Commerçant</div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "dashboard", label: "📈 Stats" },
            { key: "creer", label: "➕ Créer" },
            { key: "liste", label: "📋 Offres" }
          ].map(t => (
            <button key={t.key} onClick={() => setMode(t.key)} style={{
              flex: 1,
              background: mode === t.key ? "#FF6B00" : "rgba(255,255,255,0.1)",
              color: "white", border: "none", borderRadius: 10,
              padding: "9px 4px", fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>

        {saved && (
          <div style={{
            background: "#34C759", color: "white", borderRadius: 12,
            padding: "13px 16px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14
          }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            Offre publiée avec succès !
          </div>
        )}

        {/* ===== DASHBOARD ===== */}
        {mode === "dashboard" && (
          <>
            {/* KPIs principaux */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { icon: "🏷️", val: offresActives, label: "Offres actives", color: "#FF6B00" },
                { icon: "👁", val: totalVues, label: "Vues totales", color: "#007AFF" },
                { icon: "👆", val: totalClics, label: "Utilisations", color: "#34C759" },
                { icon: "💶", val: `${economiesTotales.toFixed(0)}€`, label: "Économies générées", color: "#AF52DE" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: 14, padding: 14,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Graphe 7 jours */}
            <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📈 Performance 7 derniers jours</div>

              {/* Vues */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Vues</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#007AFF" }}>Σ {weekVues.reduce((a, b) => a + b, 0)}</span>
                </div>
                <LineChart data={weekVues} color="#007AFF" height={60} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
                  {weekData.map((d, i) => (
                    <span key={i} style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>{d.label}</span>
                  ))}
                </div>
              </div>

              {/* Clics */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Utilisations</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#FF9500" }}>Σ {weekClics.reduce((a, b) => a + b, 0)}</span>
                </div>
                <LineChart data={weekClics} color="#FF9500" height={60} />
              </div>

              {/* Conversions */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Conversions</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#34C759" }}>Σ {weekConv.reduce((a, b) => a + b, 0)}</span>
                </div>
                <LineChart data={weekConv} color="#34C759" height={60} />
              </div>
            </div>

            {/* Taux conversion global */}
            <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Taux de conversion</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: parseFloat(tauxConv) > 20 ? "#34C759" : "#FF9500" }}>
                  {tauxConv}%
                </span>
              </div>
              <div style={{ background: "#f2f2f7", borderRadius: 6, height: 10, overflow: "hidden" }}>
                <div style={{
                  background: parseFloat(tauxConv) > 20 ? "#34C759" : "#FF9500",
                  height: "100%", borderRadius: 6,
                  width: `${Math.min(parseFloat(tauxConv), 100)}%`
                }} />
              </div>
            </div>

            {/* Top offres */}
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🏆 Meilleures offres</div>
            {loading && <div style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Chargement...</div>}
            {!loading && offres.length === 0 && (
              <div style={{ background: "white", borderRadius: 14, padding: 24, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#555", marginBottom: 14 }}>Aucune offre</div>
                <button onClick={() => setMode("creer")} style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                  color: "white", border: "none", borderRadius: 12,
                  padding: "11px 24px", fontWeight: 700, cursor: "pointer"
                }}>Créer une offre</button>
              </div>
            )}
            {[...offres]
              .sort((a, b) => (b.nb_conversions || 0) - (a.nb_conversions || 0))
              .slice(0, 5)
              .map((offre, idx) => {
                const taux = offre.nb_clics > 0 ? ((offre.nb_conversions / offre.nb_clics) * 100).toFixed(0) : 0;
                return (
                  <div key={offre.id} style={{
                    background: "white", borderRadius: 14, padding: 14,
                    marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: idx === 0 ? "#FF9500" : "#ccc", minWidth: 24 }}>
                        #{idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{offre.titre}</div>
                        <div style={{ fontSize: 12, color: "#aaa" }}>{offre.commercant_nom || "—"}</div>
                      </div>
                      <div style={{
                        background: offre.est_active ? "#34C75918" : "#FF3B3018",
                        color: offre.est_active ? "#34C759" : "#FF3B30",
                        borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 700
                      }}>
                        {offre.est_active ? "Active" : "Off"}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #f5f5f5", paddingTop: 10 }}>
                      {[
                        { val: offre.nb_vues || 0, label: "vues", color: "#007AFF" },
                        { val: offre.nb_clics || 0, label: "clics", color: "#FF9500" },
                        { val: offre.nb_conversions || 0, label: "conv.", color: "#34C759" },
                        { val: `${taux}%`, label: "taux", color: "#AF52DE" },
                      ].map((s, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: "#aaa" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* ===== CRÉER ===== */}
        {mode === "creer" && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>✨ Nouvelle offre</div>

            {form.image_url && (
              <div style={{ borderRadius: 14, overflow: "hidden", height: 140, marginBottom: 14, position: "relative" }}>
                <img src={form.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", padding: 12 }}>
                  <div style={{ background: "#FF3B30", color: "white", borderRadius: 16, padding: "4px 12px", fontWeight: 800, fontSize: 14 }}>
                    -{form.valeur_reduction || "??"}%
                  </div>
                </div>
              </div>
            )}

            {[
              { label: "Commerce *", field: "commercant_nom", placeholder: "Ex: Boulangerie Martin" },
              { label: "Titre *", field: "titre", placeholder: "Ex: Pain -30%" },
            ].map(({ label, field, placeholder }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>{label}</label>
                <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                  placeholder={placeholder} required style={inputStyle} />
              </div>
            ))}

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez..." required rows={3} style={{ ...inputStyle, resize: "none" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Catégorie *</label>
              <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}
                style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Type réduction</label>
                <select value={form.type_reduction} onChange={e => setForm({ ...form, type_reduction: e.target.value })} style={inputStyle}>
                  <option value="pourcentage">% Pourcentage</option>
                  <option value="montant_fixe">€ Montant</option>
                  <option value="2pour1">2 pour 1</option>
                  <option value="offre_speciale">Spéciale</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Valeur *</label>
                <input type="number" value={form.valeur_reduction} onChange={e => setForm({ ...form, valeur_reduction: e.target.value })}
                  placeholder="30" required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Prix original (€)</label>
                <input type="number" step="0.01" value={form.prix_original} onChange={e => setForm({ ...form, prix_original: e.target.value })}
                  placeholder="20.00" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Prix promo (€)</label>
                <input type="number" step="0.01" value={form.prix_promo} onChange={e => setForm({ ...form, prix_promo: e.target.value })}
                  placeholder="14.00" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Fin *</label>
                <input type="datetime-local" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })}
                  required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Stock</label>
                <input type="number" value={form.stock_initial} onChange={e => setForm({ ...form, stock_initial: e.target.value })}
                  placeholder="∞" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Adresse</label>
              <input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
                placeholder="12 Rue du Marché" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Conditions</label>
              <input value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })}
                placeholder="Non cumulable..." style={inputStyle} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "white", borderRadius: 12, padding: "14px" }}>
              <div onClick={() => setForm({ ...form, est_urgente: !form.est_urgente })} style={{
                width: 50, height: 28, borderRadius: 14,
                background: form.est_urgente ? "#FF3B30" : "#ccc",
                cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0
              }}>
                <div style={{
                  position: "absolute", top: 3, left: form.est_urgente ? 25 : 3,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "white", transition: "left 0.2s"
                }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>🔥 Urgente</div>
                <div style={{ fontSize: 12, color: "#888" }}>Compte à rebours visible</div>
              </div>
            </div>

            <button type="submit" disabled={saving} style={{
              width: "100%",
              background: saving ? "#ccc" : "linear-gradient(135deg, #FF6B00, #FF3B30)",
              color: "white", border: "none", borderRadius: 14,
              padding: "16px", fontSize: 16, fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer"
            }}>
              {saving ? "⏳ Publication..." : "🚀 Publier l'offre"}
            </button>
          </form>
        )}

        {/* ===== LISTE ===== */}
        {mode === "liste" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Offres ({offres.length})</div>
              <button onClick={() => setMode("creer")} style={{
                background: "#FF6B00", color: "white", border: "none",
                borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>+ Créer</button>
            </div>

            {loading && <div style={{ textAlign: "center", padding: 30, color: "#aaa" }}>Chargement...</div>}
            {offres.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                <div style={{ color: "#666" }}>Aucune offre</div>
              </div>
            )}

            {offres.map(offre => (
              <div key={offre.id} style={{
                background: "white", borderRadius: 14, overflow: "hidden",
                marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex" }}>
                  <img src={offre.image_url} alt={offre.titre} style={{ width: 90, height: 90, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ padding: "10px 12px", flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{offre.titre}</div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{offre.commercant_nom}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ background: "#FF3B3020", color: "#FF3B30", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        -{offre.valeur_reduction}%
                      </span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{offre.nb_vues || 0} vues</span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{offre.nb_conversions || 0} conv.</span>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #f5f5f5", padding: "9px 12px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 12, color: "#aaa" }}>
                    Stock : {offre.stock_restant !== null && offre.stock_restant !== undefined ? offre.stock_restant : "∞"}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleActive(offre)} style={{
                      background: offre.est_active ? "#FF3B3012" : "#34C75912",
                      color: offre.est_active ? "#FF3B30" : "#34C759",
                      border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>
                      {offre.est_active ? "⏸ Off" : "▶️ On"}
                    </button>
                    <button onClick={() => setDeleteConfirm(offre.id)} style={{
                      background: "#f5f5f5", color: "#888",
                      border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer"
                    }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 1000, padding: "0 0 20px"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: "20px 20px 0 0",
            padding: "24px 20px 40px", width: "100%", maxWidth: 430, textAlign: "center"
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Supprimer cette offre ?</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>Irréversible.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, background: "#f5f5f5", border: "none", borderRadius: 12,
                padding: 14, fontSize: 15, fontWeight: 600, cursor: "pointer"
              }}>Annuler</button>
              <button onClick={() => deleteOffre(deleteConfirm)} style={{
                flex: 1, background: "#FF3B30", color: "white", border: "none",
                borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer"
              }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <NavBar active="dashboard" />
    </div>
  );
}
