import { useState, useEffect } from "react";
import { Offre, Commercant } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

const CATEGORIES = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Services", "Épicerie", "Pharmacie", "Autre"];

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "16px 14px",
      textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1
    }}>
      <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || "#1a1a1a" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [offres, setOffres] = useState([]);
  const [mode, setMode] = useState("dashboard"); // dashboard | creer | liste
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    titre: "", description: "", categorie: "Restaurant",
    type_reduction: "pourcentage", valeur_reduction: "",
    prix_original: "", prix_promo: "",
    date_fin: "", stock_initial: "", conditions: "",
    commercant_nom: "Mon Commerce", adresse: "", ville: "Paris",
    est_urgente: false, est_active: true,
    latitude: 48.8566, longitude: 2.3522, rayon_km: 2,
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
  });

  useEffect(() => {
    Offre.list().then(data => {
      setOffres(data);
      setLoading(false);
    });
  }, []);

  const totalVues = offres.reduce((s, o) => s + (o.nb_vues || 0), 0);
  const totalClics = offres.reduce((s, o) => s + (o.nb_clics || 0), 0);
  const totalConv = offres.reduce((s, o) => s + (o.nb_conversions || 0), 0);
  const tauxConv = totalClics > 0 ? ((totalConv / totalClics) * 100).toFixed(1) : 0;
  const offresActives = offres.filter(o => o.est_active).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        valeur_reduction: parseFloat(form.valeur_reduction) || 0,
        prix_original: parseFloat(form.prix_original) || 0,
        prix_promo: parseFloat(form.prix_promo) || 0,
        stock_initial: parseInt(form.stock_initial) || null,
        stock_restant: parseInt(form.stock_initial) || null,
        nb_vues: 0, nb_clics: 0, nb_conversions: 0,
        date_debut: new Date().toISOString()
      };
      await Offre.create(data);
      const updated = await Offre.list();
      setOffres(updated);
      setSaved(true);
      setMode("dashboard");
      setForm({ ...form, titre: "", description: "", valeur_reduction: "", prix_original: "", prix_promo: "", date_fin: "", stock_initial: "", conditions: "" });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Erreur lors de la création : " + err.message);
    }
    setSaving(false);
  };

  const toggleActive = async (offre) => {
    await Offre.update(offre.id, { est_active: !offre.est_active });
    setOffres(prev => prev.map(o => o.id === offre.id ? { ...o, est_active: !o.est_active } : o));
  };

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        padding: "50px 20px 20px"
      }}>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>📊 Mon Espace Commerçant</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>Gérez vos offres et suivez vos performances</div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {[
            { key: "dashboard", label: "📈 Stats" },
            { key: "creer", label: "➕ Créer" },
            { key: "liste", label: "📋 Mes offres" }
          ].map(t => (
            <button key={t.key} onClick={() => setMode(t.key)} style={{
              flex: 1, background: mode === t.key ? "rgba(255,107,0,1)" : "rgba(255,255,255,0.1)",
              color: "white", border: "none", borderRadius: 10,
              padding: "8px 4px", fontSize: 12, fontWeight: 600, cursor: "pointer"
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
            padding: "12px 16px", marginBottom: 14, fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 8
          }}>
            ✅ Offre créée et publiée avec succès !
          </div>
        )}

        {/* DASHBOARD */}
        {mode === "dashboard" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>
              Vue d'ensemble — aujourd'hui
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <StatCard icon="🏷️" value={offresActives} label="Offres actives" color="#FF6B00" />
              <StatCard icon="👁" value={totalVues} label="Vues totales" color="#007AFF" />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <StatCard icon="👆" value={totalClics} label="Utilisations" color="#34C759" />
              <StatCard icon="📈" value={`${tauxConv}%`} label="Taux conv." color="#AF52DE" />
            </div>

            {/* Offres performantes */}
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 12 }}>
              🏆 Meilleures offres
            </div>
            {[...offres].sort((a, b) => (b.nb_conversions || 0) - (a.nb_conversions || 0)).slice(0, 3).map(offre => {
              const taux = offre.nb_clics > 0 ? ((offre.nb_conversions / offre.nb_clics) * 100).toFixed(0) : 0;
              return (
                <div key={offre.id} style={{
                  background: "white", borderRadius: 12, padding: "14px",
                  marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", marginBottom: 2 }}>{offre.titre}</div>
                      <div style={{ fontSize: 12, color: "#aaa" }}>{offre.commercant_nom}</div>
                    </div>
                    <div style={{
                      background: offre.est_active ? "#34C75920" : "#FF3B3020",
                      color: offre.est_active ? "#34C759" : "#FF3B30",
                      borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 600
                    }}>
                      {offre.est_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#007AFF" }}>{offre.nb_vues || 0}</div>
                      <div style={{ fontSize: 10, color: "#aaa" }}>vues</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#FF9500" }}>{offre.nb_clics || 0}</div>
                      <div style={{ fontSize: 10, color: "#aaa" }}>utilisations</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#34C759" }}>{offre.nb_conversions || 0}</div>
                      <div style={{ fontSize: 10, color: "#aaa" }}>conversions</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#AF52DE" }}>{taux}%</div>
                      <div style={{ fontSize: 10, color: "#aaa" }}>conv.</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* CRÉER UNE OFFRE */}
        {mode === "creer" && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>
              ✨ Nouvelle offre
            </div>

            {[
              { label: "Nom de votre commerce *", field: "commercant_nom", type: "text", placeholder: "Ex: Boulangerie Dupont" },
              { label: "Titre de l'offre *", field: "titre", type: "text", placeholder: "Ex: Menu du midi -30%" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  placeholder={placeholder}
                  required={label.includes("*")}
                  style={{
                    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
                    background: "white"
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez votre offre..."
                required
                rows={3}
                style={{
                  width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                  padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
                  resize: "none", background: "white", fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Catégorie *</label>
              <select
                value={form.categorie}
                onChange={e => setForm({ ...form, categorie: e.target.value })}
                style={{
                  width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                  padding: "12px 14px", fontSize: 14, outline: "none", background: "white", boxSizing: "border-box"
                }}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Type de réduction</label>
                <select
                  value={form.type_reduction}
                  onChange={e => setForm({ ...form, type_reduction: e.target.value })}
                  style={{
                    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                    padding: "12px 14px", fontSize: 14, outline: "none", background: "white"
                  }}
                >
                  <option value="pourcentage">Pourcentage (%)</option>
                  <option value="montant_fixe">Montant fixe (€)</option>
                  <option value="2pour1">2 pour 1</option>
                  <option value="offre_speciale">Offre spéciale</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Valeur *</label>
                <input
                  type="number" value={form.valeur_reduction}
                  onChange={e => setForm({ ...form, valeur_reduction: e.target.value })}
                  placeholder="30" required
                  style={{
                    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Prix original (€)", field: "prix_original", placeholder: "20" },
                { label: "Prix promo (€)", field: "prix_promo", placeholder: "14" }
              ].map(({ label, field, placeholder }) => (
                <div key={field} style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>{label}</label>
                  <input
                    type="number" value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                      padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white"
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Date de fin *</label>
                <input
                  type="datetime-local" value={form.date_fin}
                  onChange={e => setForm({ ...form, date_fin: e.target.value })}
                  required
                  style={{
                    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Stock (opt.)</label>
                <input
                  type="number" value={form.stock_initial}
                  onChange={e => setForm({ ...form, stock_initial: e.target.value })}
                  placeholder="20"
                  style={{
                    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Adresse</label>
              <input
                type="text" value={form.adresse}
                onChange={e => setForm({ ...form, adresse: e.target.value })}
                placeholder="12 Rue du Marché"
                style={{
                  width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                  padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white"
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Conditions (opt.)</label>
              <input
                type="text" value={form.conditions}
                onChange={e => setForm({ ...form, conditions: e.target.value })}
                placeholder="Non cumulable, valable sur présentation..."
                style={{
                  width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
                  padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <input
                type="checkbox" id="urgente"
                checked={form.est_urgente}
                onChange={e => setForm({ ...form, est_urgente: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="urgente" style={{ fontSize: 14, color: "#444", cursor: "pointer" }}>
                🔥 Marquer comme offre urgente (compte à rebours visible)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                background: saving ? "#ccc" : "linear-gradient(135deg, #FF6B00, #FF3B30)",
                color: "white", border: "none", borderRadius: 14,
                padding: "16px", fontSize: 16, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 16px rgba(255,107,0,0.4)"
              }}
            >
              {saving ? "⏳ Publication en cours..." : "🚀 Publier l'offre"}
            </button>
          </form>
        )}

        {/* LISTE DES OFFRES */}
        {mode === "liste" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>
              Toutes mes offres ({offres.length})
            </div>
            {loading && <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Chargement...</div>}
            {offres.map(offre => (
              <div key={offre.id} style={{
                background: "white", borderRadius: 14, overflow: "hidden",
                marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <div style={{ display: "flex" }}>
                  <img src={offre.image_url} alt={offre.titre} style={{ width: 90, height: 90, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ padding: "10px 12px", flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", marginBottom: 2 }}>{offre.titre}</div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{offre.commercant_nom}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        background: "#FF3B30", color: "white",
                        borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 700
                      }}>
                        -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                      </span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{offre.nb_vues || 0} vues</span>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #f5f5f5", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Stock: {offre.stock_restant ?? "∞"} • Conv: {offre.nb_conversions || 0}
                  </div>
                  <button
                    onClick={() => toggleActive(offre)}
                    style={{
                      background: offre.est_active ? "#FF3B3015" : "#34C75915",
                      color: offre.est_active ? "#FF3B30" : "#34C759",
                      border: "none", borderRadius: 8,
                      padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    {offre.est_active ? "⏸ Désactiver" : "▶️ Activer"}
                  </button>
                </div>
              </div>
            ))}
            {offres.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 15, color: "#666" }}>Aucune offre créée</div>
                <button onClick={() => setMode("creer")} style={{
                  marginTop: 16, background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                  color: "white", border: "none", borderRadius: 12,
                  padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer"
                }}>
                  Créer ma première offre
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <NavBar active="dashboard" />
    </div>
  );
}
