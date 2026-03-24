import { useState, useEffect } from "react";
import { Offre } from "../api/entities";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

const BADGES = [
  { id: "first_deal", icon: "🎯", label: "Premier bon plan", desc: "Première offre utilisée" },
  { id: "saver", icon: "💰", label: "Économiseur", desc: "50€ économisés" },
  { id: "explorer", icon: "🗺️", label: "Explorateur", desc: "10 commerces différents" },
  { id: "fan", icon: "❤️", label: "Fan", desc: "20 favoris ajoutés" },
];

const CATEGORIES = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Services", "Épicerie"];

export default function Profil() {
  const [profil, setProfil] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cp_profil") || "null") || {
        prenom: "", nom: "", ville: "Paris", email: "",
        categories_favorites: [],
        rayon_recherche_km: 5,
        points: 0, niveau: 1,
        badges: ["first_deal"],
        total_economies: 0,
        nb_offres_utilisees: 0,
        est_premium: false,
        notifications_actives: true
      };
    } catch { return { prenom: "", nom: "", ville: "Paris", email: "", categories_favorites: [], rayon_recherche_km: 5, points: 0, niveau: 1, badges: ["first_deal"], total_economies: 0, nb_offres_utilisees: 0, est_premium: false, notifications_actives: true }; }
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profil);

  const xpToNext = (profil.niveau * 100);
  const xpProgress = (profil.points % 100);

  const saveProfil = () => {
    setProfil(form);
    localStorage.setItem("cp_profil", JSON.stringify(form));
    setEditing(false);
  };

  const toggleCat = (cat) => {
    const cats = form.categories_favorites.includes(cat)
      ? form.categories_favorites.filter(c => c !== cat)
      : [...form.categories_favorites, cat];
    setForm({ ...form, categories_favorites: cats });
  };

  const displayName = profil.prenom || "Utilisateur";

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
        padding: "50px 20px 30px",
        textAlign: "center"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, margin: "0 auto 12px",
          border: "3px solid rgba(255,255,255,0.5)"
        }}>
          {profil.prenom ? profil.prenom[0].toUpperCase() : "👤"}
        </div>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>
          {profil.prenom ? `${profil.prenom} ${profil.nom}` : "Mon Profil"}
        </div>
        {profil.est_premium && (
          <div style={{
            display: "inline-block",
            background: "rgba(255,215,0,0.3)",
            color: "#FFD700", borderRadius: 20,
            padding: "4px 12px", fontSize: 12, fontWeight: 700, marginTop: 6
          }}>
            ⭐ Premium
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>
          Niveau {profil.niveau} • {profil.points} points
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: 12, padding: "0 20px" }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 6 }}>
            <div style={{
              background: "white", height: "100%", borderRadius: 6,
              width: `${(xpProgress / 100) * 100}%`,
              transition: "width 0.5s"
            }} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 4 }}>
            {xpProgress}/100 XP pour niveau {profil.niveau + 1}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { val: profil.nb_offres_utilisees, label: "Offres utilisées", icon: "🎁" },
            { val: `${profil.total_economies}€`, label: "Économisés", icon: "💰" },
            { val: profil.badges?.length || 0, label: "Badges", icon: "🏅" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "white", borderRadius: 14, padding: "14px 8px",
              textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏅 Mes badges</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BADGES.map(b => {
              const unlocked = profil.badges?.includes(b.id);
              return (
                <div key={b.id} style={{
                  background: unlocked ? "#FFF3EC" : "#f8f8f8",
                  borderRadius: 12, padding: "12px",
                  border: unlocked ? "1.5px solid #FF6B00" : "1.5px solid transparent",
                  opacity: unlocked ? 1 : 0.4
                }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{b.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{b.label}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{b.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paramètres profil */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>⚙️ Mon profil</div>
            <button
              onClick={() => editing ? saveProfil() : setEditing(true)}
              style={{
                background: editing ? "#34C759" : "#FF6B00",
                color: "white", border: "none", borderRadius: 8,
                padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}
            >
              {editing ? "✅ Sauvegarder" : "✏️ Modifier"}
            </button>
          </div>

          {editing ? (
            <>
              {[
                { label: "Prénom", field: "prenom", placeholder: "Thomas" },
                { label: "Nom", field: "nom", placeholder: "Dupont" },
                { label: "Email", field: "email", placeholder: "thomas@gmail.com" },
                { label: "Ville", field: "ville", placeholder: "Paris" },
              ].map(({ label, field, placeholder }) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 10,
                      padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 8 }}>
                  Rayon de recherche : {form.rayon_recherche_km} km
                </label>
                <input
                  type="range" min="1" max="20" value={form.rayon_recherche_km}
                  onChange={e => setForm({ ...form, rayon_recherche_km: parseInt(e.target.value) })}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 8 }}>
                  Catégories favorites
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => toggleCat(cat)} style={{
                      background: form.categories_favorites.includes(cat) ? "#FF6B00" : "#f0f0f0",
                      color: form.categories_favorites.includes(cat) ? "white" : "#555",
                      border: "none", borderRadius: 20,
                      padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              {[
                { label: "Prénom", val: profil.prenom || "—" },
                { label: "Nom", val: profil.nom || "—" },
                { label: "Email", val: profil.email || "—" },
                { label: "Ville", val: profil.ville || "Paris" },
                { label: "Rayon", val: `${profil.rayon_recherche_km} km` },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{val}</span>
                </div>
              ))}
              {profil.categories_favorites?.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {profil.categories_favorites.map(c => (
                    <span key={c} style={{ background: "#FFF0E8", color: "#FF6B00", borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>🔔 Notifications</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Alertes offres à proximité</div>
            </div>
            <div
              onClick={() => {
                const updated = { ...profil, notifications_actives: !profil.notifications_actives };
                setProfil(updated);
                localStorage.setItem("cp_profil", JSON.stringify(updated));
              }}
              style={{
                width: 50, height: 28, borderRadius: 14,
                background: profil.notifications_actives ? "#34C759" : "#ccc",
                cursor: "pointer", position: "relative", transition: "background 0.2s"
              }}
            >
              <div style={{
                position: "absolute", top: 3,
                left: profil.notifications_actives ? 24 : 3,
                width: 22, height: 22, borderRadius: "50%",
                background: "white", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
              }} />
            </div>
          </div>
        </div>

        {/* Premium */}
        {!profil.est_premium && (
          <div style={{
            background: "linear-gradient(135deg, #FFD700, #FF9500)",
            borderRadius: 16, padding: 20, textAlign: "center",
            boxShadow: "0 4px 16px rgba(255,149,0,0.3)"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
            <div style={{ color: "white", fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Passer en Premium</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 14 }}>
              Accès anticipé aux offres • Alertes prioritaires • Pas de publicité
            </div>
            <button style={{
              background: "white", color: "#FF9500", border: "none",
              borderRadius: 12, padding: "12px 30px",
              fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
              9,99€/mois — Essai 7j gratuit
            </button>
          </div>
        )}
      </div>

      <NavBar active="profil" />
    </div>
  );
}
