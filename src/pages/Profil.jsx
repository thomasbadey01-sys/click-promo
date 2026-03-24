import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "./Feed";

const BADGES_DEF = [
  { id: "first_deal", icon: "🎯", label: "Premier bon plan", desc: "Première offre utilisée", xp: 50 },
  { id: "saver_10", icon: "💰", label: "Économiseur", desc: "10€ économisés", xp: 100 },
  { id: "explorer", icon: "🗺️", label: "Explorateur", desc: "5 commerces visités", xp: 150 },
  { id: "fan", icon: "❤️", label: "Fan", desc: "5 favoris ajoutés", xp: 75 },
  { id: "speed", icon: "⚡", label: "Flash Deal", desc: "Offre urgente utilisée", xp: 200 },
  { id: "loyal", icon: "🏆", label: "Fidèle", desc: "10 offres utilisées", xp: 300 },
];

const CATEGORIES = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Services", "Épicerie"];

const NIVEAUX = [
  { niveau: 1, label: "Chasseur de promos", color: "#8E8E93", xp: 0 },
  { niveau: 2, label: "Bon Plan Jr.", color: "#34C759", xp: 100 },
  { niveau: 3, label: "Expert Local", color: "#007AFF", xp: 250 },
  { niveau: 4, label: "Pro des Deals", color: "#AF52DE", xp: 500 },
  { niveau: 5, label: "Légende Click", color: "#FF9500", xp: 1000 },
];

function getNiveau(points) {
  let niv = NIVEAUX[0];
  for (const n of NIVEAUX) {
    if (points >= n.xp) niv = n;
  }
  return niv;
}

function getNextNiveau(points) {
  for (const n of NIVEAUX) {
    if (points < n.xp) return n;
  }
  return null;
}

function AnimatedNumber({ value }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplayed(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayed}</span>;
}

export default function Profil() {
  const [profil, setProfil] = useState(() => {
    try {
      const stored = localStorage.getItem("cp_profil");
      return stored ? JSON.parse(stored) : {
        prenom: "", nom: "", ville: "Paris", email: "",
        categories_favorites: [],
        rayon_recherche_km: 5,
        points: 0, badges: [],
        total_economies: 0,
        nb_offres_utilisees: 0,
        est_premium: false,
        notifications_actives: true,
        historique: []
      };
    } catch {
      return { prenom: "", nom: "", ville: "Paris", email: "", categories_favorites: [], rayon_recherche_km: 5, points: 0, badges: [], total_economies: 0, nb_offres_utilisees: 0, est_premium: false, notifications_actives: true, historique: [] };
    }
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profil);
  const [activeTab, setActiveTab] = useState("stats"); // stats | badges | historique | settings
  const [badgePopup, setBadgePopup] = useState(null);

  const niveauActuel = getNiveau(profil.points);
  const niveauSuivant = getNextNiveau(profil.points);
  const xpProgress = niveauSuivant
    ? ((profil.points - niveauActuel.xp) / (niveauSuivant.xp - niveauActuel.xp)) * 100
    : 100;

  const save = () => {
    const updated = { ...profil, ...form };
    setProfil(updated);
    localStorage.setItem("cp_profil", JSON.stringify(updated));
    setEditing(false);
  };

  const toggleCat = (cat) => {
    const cats = form.categories_favorites.includes(cat)
      ? form.categories_favorites.filter(c => c !== cat)
      : [...form.categories_favorites, cat];
    setForm({ ...form, categories_favorites: cats });
  };

  const toggleNotif = () => {
    const updated = { ...profil, notifications_actives: !profil.notifications_actives };
    setProfil(updated);
    localStorage.setItem("cp_profil", JSON.stringify(updated));
  };

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>

      {/* Header hero */}
      <div style={{
        background: `linear-gradient(160deg, ${niveauActuel.color}, #FF3B30)`,
        padding: "52px 20px 24px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Cercles déco */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16, position: "relative" }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, border: "3px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)", flexShrink: 0
          }}>
            {profil.prenom ? profil.prenom[0].toUpperCase() : "👤"}
          </div>
          <div>
            <div style={{ color: "white", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
              {profil.prenom ? `${profil.prenom} ${profil.nom}` : "Mon Profil"}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 13 }}>⭐</span>
              <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{niveauActuel.label}</span>
            </div>
            {profil.est_premium && (
              <div style={{ display: "inline-flex", marginLeft: 6, background: "rgba(255,215,0,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                <span style={{ color: "#FFD700", fontSize: 12, fontWeight: 700 }}>✨ Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
              {profil.points} XP
            </span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {niveauSuivant ? `${niveauSuivant.xp} XP → ${niveauSuivant.label}` : "Niveau MAX 🏆"}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{
              background: "white", height: "100%", borderRadius: 6,
              width: `${Math.min(xpProgress, 100)}%`,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 8px rgba(255,255,255,0.6)"
            }} />
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display: "flex", gap: 0, padding: "0 16px", marginTop: -1 }}>
        {[
          { val: profil.nb_offres_utilisees, label: "Offres", icon: "🎁", color: "#FF6B00" },
          { val: `${profil.total_economies}€`, label: "Économisés", icon: "💰", color: "#34C759" },
          { val: profil.badges?.length || 0, label: "Badges", icon: "🏅", color: "#AF52DE" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: "white", padding: "14px 6px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
            borderRight: i < 2 ? "1px solid #f0f0f0" : "none",
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 2 }}>
              <AnimatedNumber value={typeof s.val === "number" ? s.val : 0} />
              {typeof s.val === "string" && s.val.includes("€") ? "€" : ""}
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "white", borderBottom: "1px solid #f0f0f0", padding: "0 16px" }}>
        {[
          { key: "stats", label: "Activité" },
          { key: "badges", label: "Badges" },
          { key: "historique", label: "Historique" },
          { key: "settings", label: "Paramètres" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            flex: 1, background: "none", border: "none",
            padding: "12px 4px",
            fontSize: 12, fontWeight: activeTab === t.key ? 700 : 500,
            color: activeTab === t.key ? "#FF6B00" : "#888",
            borderBottom: activeTab === t.key ? "2px solid #FF6B00" : "2px solid transparent",
            cursor: "pointer", transition: "all 0.2s"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 100px" }}>

        {/* ACTIVITÉ */}
        {activeTab === "stats" && (
          <>
            {/* Jauge objectif */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🎯 Objectif du mois</div>
              {[
                { label: "Offres utilisées", current: profil.nb_offres_utilisees, goal: 10, color: "#FF6B00" },
                { label: "Économies réalisées", current: profil.total_economies, goal: 50, color: "#34C759", unit: "€" },
              ].map((obj, i) => (
                <div key={i} style={{ marginBottom: i === 0 ? 14 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{obj.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: obj.color }}>
                      {obj.current}{obj.unit || ""} / {obj.goal}{obj.unit || ""}
                    </span>
                  </div>
                  <div style={{ background: "#f2f2f7", borderRadius: 6, height: 8 }}>
                    <div style={{
                      background: obj.color, height: "100%", borderRadius: 6,
                      width: `${Math.min((obj.current / obj.goal) * 100, 100)}%`,
                      transition: "width 0.8s"
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Catégories favorites */}
            {profil.categories_favorites?.length > 0 && (
              <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>❤️ Mes catégories favorites</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profil.categories_favorites.map(c => (
                    <span key={c} style={{ background: "#FFF0E8", color: "#FF6B00", borderRadius: 12, padding: "5px 12px", fontSize: 13, fontWeight: 600 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Call to action si profil vide */}
            {!profil.prenom && (
              <div style={{
                background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                borderRadius: 16, padding: 20, textAlign: "center"
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Complétez votre profil</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 14 }}>
                  Personnalisez vos recommandations et gagnez +50 XP
                </div>
                <button onClick={() => setActiveTab("settings")} style={{
                  background: "white", color: "#FF6B00", border: "none",
                  borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer"
                }}>
                  Compléter mon profil
                </button>
              </div>
            )}
          </>
        )}

        {/* BADGES */}
        {activeTab === "badges" && (
          <>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
              {profil.badges?.length || 0} / {BADGES_DEF.length} badges débloqués
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {BADGES_DEF.map(b => {
                const unlocked = profil.badges?.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => setBadgePopup(b)}
                    style={{
                      background: unlocked ? "white" : "#f8f8f8",
                      borderRadius: 14, padding: 14,
                      border: unlocked ? "1.5px solid #FF6B00" : "1.5px solid transparent",
                      opacity: unlocked ? 1 : 0.5,
                      cursor: "pointer",
                      boxShadow: unlocked ? "0 2px 10px rgba(255,107,0,0.15)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{b.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{b.desc}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: unlocked ? "#FF6B00" : "#aaa" }}>
                      +{b.xp} XP {unlocked ? "✅" : "🔒"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Popup badge */}
            {badgePopup && (
              <div
                onClick={() => setBadgePopup(null)}
                style={{
                  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "flex-end", justifyContent: "center",
                  zIndex: 1000, padding: "0 0 20px"
                }}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: "white", borderRadius: "20px 20px 0 0",
                    padding: "24px 20px 40px", width: "100%", maxWidth: 430,
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: 60, marginBottom: 12 }}>{badgePopup.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{badgePopup.label}</div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>{badgePopup.desc}</div>
                  <div style={{ display: "inline-block", background: "#FFF0E8", color: "#FF6B00", borderRadius: 20, padding: "6px 16px", fontWeight: 700 }}>
                    +{badgePopup.xp} XP
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: profil.badges?.includes(badgePopup.id) ? "#34C759" : "#aaa", fontWeight: 600 }}>
                    {profil.badges?.includes(badgePopup.id) ? "✅ Badge débloqué !" : "🔒 Non encore débloqué"}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* HISTORIQUE */}
        {activeTab === "historique" && (
          <>
            {(!profil.historique || profil.historique.length === 0) ? (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 6 }}>Aucune offre utilisée</div>
                <div style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>
                  Votre historique d'offres apparaîtra ici
                </div>
                <Link to="/Feed" style={{ textDecoration: "none" }}>
                  <div style={{ display: "inline-block", background: "linear-gradient(135deg, #FF6B00, #FF3B30)", color: "white", borderRadius: 12, padding: "12px 24px", fontWeight: 700 }}>
                    Découvrir les offres
                  </div>
                </Link>
              </div>
            ) : (
              profil.historique.map((h, i) => (
                <div key={i} style={{ background: "white", borderRadius: 12, padding: "14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h.titre}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{h.commerce} • {h.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#34C759" }}>-{h.economie}€</div>
                    <div style={{ fontSize: 11, color: "#FF6B00" }}>+{h.points} XP</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* PARAMÈTRES */}
        {activeTab === "settings" && (
          <div>
            <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>👤 Mon compte</div>
                <button onClick={() => editing ? save() : setEditing(true)} style={{
                  background: editing ? "#34C759" : "#FF6B00",
                  color: "white", border: "none", borderRadius: 8,
                  padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>
                  {editing ? "✅ Enregistrer" : "✏️ Modifier"}
                </button>
              </div>

              {editing ? (
                <div>
                  {[
                    { label: "Prénom", field: "prenom", placeholder: "Thomas" },
                    { label: "Nom", field: "nom", placeholder: "Badey" },
                    { label: "Email", field: "email", placeholder: "thomas@gmail.com" },
                    { label: "Ville", field: "ville", placeholder: "Paris" },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>{label}</label>
                      <input
                        value={form[field] || ""}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        placeholder={placeholder}
                        style={{ width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>
                      Rayon de recherche : {form.rayon_recherche_km || 5} km
                    </label>
                    <input type="range" min="1" max="20" value={form.rayon_recherche_km || 5}
                      onChange={e => setForm({ ...form, rayon_recherche_km: parseInt(e.target.value) })}
                      style={{ width: "100%", accentColor: "#FF6B00" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 8 }}>Catégories favorites</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => toggleCat(cat)} style={{
                          background: (form.categories_favorites || []).includes(cat) ? "#FF6B00" : "#f0f0f0",
                          color: (form.categories_favorites || []).includes(cat) ? "white" : "#555",
                          border: "none", borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>{cat}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { label: "Prénom", val: profil.prenom || "—" },
                    { label: "Nom", val: profil.nom || "—" },
                    { label: "Email", val: profil.email || "—" },
                    { label: "Ville", val: profil.ville || "Paris" },
                    { label: "Rayon", val: `${profil.rayon_recherche_km || 5} km` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 14, color: "#888" }}>{label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>🔔 Notifications push</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Alertes offres proches de vous</div>
                </div>
                <div onClick={toggleNotif} style={{
                  width: 50, height: 28, borderRadius: 14,
                  background: profil.notifications_actives ? "#34C759" : "#ccc",
                  cursor: "pointer", position: "relative", transition: "background 0.2s"
                }}>
                  <div style={{
                    position: "absolute", top: 3,
                    left: profil.notifications_actives ? 25 : 3,
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
                background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                borderRadius: 16, padding: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>✨</span>
                  <div>
                    <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>Passer en Premium</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>9,99€/mois</div>
                  </div>
                </div>
                {["Accès anticipé aux offres flash", "Alertes push prioritaires", "Meilleures offres en premier", "Sans publicité"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#FFD700", fontSize: 14 }}>★</span>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{f}</span>
                  </div>
                ))}
                <button style={{
                  width: "100%", marginTop: 14,
                  background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
                  color: "white", border: "none", borderRadius: 12,
                  padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}>
                  Essai gratuit 7 jours
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NavBar active="profil" />
    </div>
  );
}
