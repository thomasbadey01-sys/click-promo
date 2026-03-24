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

function MiniChart({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" style={{ width: 80, height: 32 }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

  // Auto-update image quand catégorie change
  useEffect(() => {
    setForm(f => ({ ...f, image_url: IMAGE_SUGGESTIONS[f.categorie] || IMAGE_SUGGESTIONS["Autre"] }));
  }, [form.categorie]);

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
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", padding: "52px 20px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,107,0,0.15)" }} />
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 2 }}>Tableau de bord</div>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📊 Espace Commerçant</div>

        {/* Tabs */}
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
              padding: "9px 4px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s"
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>

        {/* Toast succès */}
        {saved && (
          <div style={{
            background: "#34C759", color: "white", borderRadius: 12,
            padding: "13px 16px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14,
            boxShadow: "0 4px 16px rgba(52,199,89,0.35)"
          }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            Offre publiée avec succès ! Elle est maintenant visible.
          </div>
        )}

        {/* ===== DASHBOARD ===== */}
        {mode === "dashboard" && (
          <>
            {/* KPIs principaux */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { icon: "🏷️", val: offresActives, label: "Offres actives", color: "#FF6B00", sub: `${offres.length} total` },
                { icon: "👁", val: totalVues, label: "Vues totales", color: "#007AFF", sub: "cette semaine" },
                { icon: "👆", val: totalClics, label: "Utilisations", color: "#34C759", sub: `${tauxConv}% conv.` },
                { icon: "💶", val: `${economiesTotales.toFixed(0)}€`, label: "Économies générées", color: "#AF52DE", sub: "pour vos clients" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: 14, padding: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#bbb", textAlign: "right" }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Taux de conversion visuel */}
            <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>📈 Taux de conversion global</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: parseFloat(tauxConv) > 20 ? "#34C759" : "#FF9500" }}>
                  {tauxConv}%
                </span>
              </div>
              <div style={{ background: "#f2f2f7", borderRadius: 6, height: 10, overflow: "hidden" }}>
                <div style={{
                  background: parseFloat(tauxConv) > 20
                    ? "linear-gradient(90deg, #34C759, #30D158)"
                    : "linear-gradient(90deg, #FF9500, #FF6B00)",
                  height: "100%", borderRadius: 6,
                  width: `${Math.min(parseFloat(tauxConv), 100)}%`,
                  transition: "width 1s"
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>
                {totalConv} conversions sur {totalClics} utilisations
              </div>
            </div>

            {/* Top offres */}
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 12 }}>
              🏆 Performance des offres
            </div>
            {loading && <div style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Chargement...</div>}
            {!loading && offres.length === 0 && (
              <div style={{ background: "white", borderRadius: 14, padding: 24, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#555", marginBottom: 14 }}>Aucune offre créée</div>
                <button onClick={() => setMode("creer")} style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                  color: "white", border: "none", borderRadius: 12,
                  padding: "11px 24px", fontWeight: 700, cursor: "pointer"
                }}>Créer ma première offre</button>
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
                        { val: offre.nb_clics || 0, label: "utilisations", color: "#FF9500" },
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

            {/* Aperçu image */}
            {form.image_url && (
              <div style={{ borderRadius: 14, overflow: "hidden", height: 140, marginBottom: 14, position: "relative" }}>
                <img src={form.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", padding: 12 }}>
                  <div style={{ background: "#FF3B30", color: "white", borderRadius: 16, padding: "4px 12px", fontWeight: 800, fontSize: 14 }}>
                    -{form.valeur_reduction || "??"}{form.type_reduction === "pourcentage" ? "%" : "€"}
                  </div>
                </div>
              </div>
            )}

            {/* Champs */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Nom du commerce *</label>
              <input value={form.commercant_nom} onChange={e => setForm({ ...form, commercant_nom: e.target.value })}
                placeholder="Ex: Boulangerie Martin" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Titre de l'offre *</label>
              <input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
                placeholder="Ex: Menu du midi -30%" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez votre offre en détail..." required rows={3} style={{ ...inputStyle, resize: "none" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Catégorie *</label>
              <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}
                style={{ ...inputStyle }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Type réduction</label>
                <select value={form.type_reduction} onChange={e => setForm({ ...form, type_reduction: e.target.value })} style={inputStyle}>
                  <option value="pourcentage">% Pourcentage</option>
                  <option value="montant_fixe">€ Montant fixe</option>
                  <option value="2pour1">2 pour 1</option>
                  <option value="offre_speciale">Offre spéciale</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>
                  Valeur {form.type_reduction === "pourcentage" ? "(%)" : "(€)"} *
                </label>
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
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Fin de l'offre *</label>
                <input type="datetime-local" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })}
                  required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Stock limité</label>
                <input type="number" value={form.stock_initial} onChange={e => setForm({ ...form, stock_initial: e.target.value })}
                  placeholder="∞ illimité" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Adresse du commerce</label>
              <input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
                placeholder="12 Rue du Marché, Paris" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>Conditions (optionnel)</label>
              <input value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })}
                placeholder="Non cumulable, valable sur présentation..." style={inputStyle} />
            </div>

            {/* Toggle urgente */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "white", borderRadius: 12, padding: "14px" }}>
              <div onClick={() => setForm({ ...form, est_urgente: !form.est_urgente })} style={{
                width: 50, height: 28, borderRadius: 14,
                background: form.est_urgente ? "#FF3B30" : "#ccc",
                cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0
              }}>
                <div style={{
                  position: "absolute", top: 3, left: form.est_urgente ? 25 : 3,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "white", transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>🔥 Offre urgente</div>
                <div style={{ fontSize: 12, color: "#888" }}>Affiche un compte à rebours — crée l'urgence</div>
              </div>
            </div>

            <button type="submit" disabled={saving} style={{
              width: "100%",
              background: saving ? "#ccc" : "linear-gradient(135deg, #FF6B00, #FF3B30)",
              color: "white", border: "none", borderRadius: 14,
              padding: "16px", fontSize: 16, fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 4px 16px rgba(255,107,0,0.4)"
            }}>
              {saving ? "⏳ Publication..." : "🚀 Publier l'offre"}
            </button>
          </form>
        )}

        {/* ===== LISTE ===== */}
        {mode === "liste" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Toutes mes offres ({offres.length})</div>
              <button onClick={() => setMode("creer")} style={{
                background: "#FF6B00", color: "white", border: "none",
                borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>+ Créer</button>
            </div>

            {loading && <div style={{ textAlign: "center", padding: 30, color: "#aaa" }}>Chargement...</div>}

            {offres.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                <div style={{ color: "#666" }}>Aucune offre. Créez la première !</div>
              </div>
            )}

            {offres.map(offre => (
              <div key={offre.id} style={{
                background: "white", borderRadius: 14, overflow: "hidden",
                marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex" }}>
                  <img src={offre.image_url || IMAGE_SUGGESTIONS[offre.categorie] || IMAGE_SUGGESTIONS["Autre"]}
                    alt={offre.titre} style={{ width: 90, height: 90, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ padding: "10px 12px", flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {offre.titre}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{offre.commercant_nom || "—"}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ background: "#FF3B3020", color: "#FF3B30", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                      </span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{offre.nb_vues || 0} vues</span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{offre.nb_conversions || 0} conv.</span>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #f5f5f5", padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
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

      {/* Modal suppression */}
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
            <div style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>Cette action est irréversible.</div>
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
