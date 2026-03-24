import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { ProfilUtilisateur } from "@/api/entities";
import { UserAuth } from "@/api/auth";

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
  for (const n of NIVEAUX) { if (points >= n.xp) niv = n; }
  return niv;
}
function getNextNiveau(points) {
  for (const n of NIVEAUX) { if (points < n.xp) return n; }
  return null;
}

function AnimatedNumber({ value }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplayed(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayed}</span>;
}

const defaultProfil = {
  prenom: "", nom: "", ville: "Paris", email: "",
  categories_favorites: [], rayon_recherche_km: 5,
  points: 0, badges: [], total_economies: 0,
  nb_offres_utilisees: 0, est_premium: false,
  notifications_actives: true
};

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profil, setProfil] = useState(defaultProfil);
  const [profilId, setProfilId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultProfil);
  const [activeTab, setActiveTab] = useState("stats");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await UserAuth.me();
        setUser(u);
        if (u) {
          // Charger profil depuis la base
          const profils = await ProfilUtilisateur.filter({ user_id: u.id });
          if (profils.length > 0) {
            const p = profils[0];
            setProfilId(p.id);
            const merged = {
              prenom: p.prenom || u.full_name?.split(" ")[0] || "",
              nom: p.nom || u.full_name?.split(" ")[1] || "",
              ville: p.ville || "Paris",
              email: u.email || "",
              categories_favorites: p.categories_favorites || [],
              rayon_recherche_km: p.rayon_recherche_km || 5,
              points: p.points || 0,
              badges: p.badges || [],
              total_economies: p.total_economies || 0,
              nb_offres_utilisees: p.nb_offres_utilisees || 0,
              est_premium: p.est_premium || false,
              notifications_actives: p.notifications_actives !== false,
            };
            setProfil(merged);
            setForm(merged);
          } else {
            // Créer un profil vide en base
            const names = (u.full_name || "").split(" ");
            const newProfil = {
              ...defaultProfil,
              user_id: u.id,
              prenom: names[0] || "",
              nom: names.slice(1).join(" ") || "",
              email: u.email || "",
            };
            const created = await ProfilUtilisateur.create(newProfil);
            setProfilId(created.id);
            setProfil(newProfil);
            setForm(newProfil);
          }
        } else {
          // Pas connecté — fallback localStorage
          try {
            const stored = localStorage.getItem("cp_profil");
            if (stored) { const p = JSON.parse(stored); setProfil(p); setForm(p); }
          } catch {}
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const updated = { ...profil, ...form };
    setProfil(updated);
    if (profilId) {
      await ProfilUtilisateur.update(profilId, {
        prenom: form.prenom,
        nom: form.nom,
        ville: form.ville,
        categories_favorites: form.categories_favorites,
        rayon_recherche_km: form.rayon_recherche_km,
        notifications_actives: form.notifications_actives,
      });
    } else {
      localStorage.setItem("cp_profil", JSON.stringify(updated));
    }
    setSaving(false);
    setSaveOk(true);
    setEditing(false);
    setTimeout(() => setSaveOk(false), 2500);
  };

  const handleLogout = async () => {
    await UserAuth.logout();
    localStorage.removeItem("cp_onboarded");
    navigate("/Login");
  };

  const niveauActuel = getNiveau(profil.points);
  const niveauSuivant = getNextNiveau(profil.points);
  const xpProgress = niveauSuivant
    ? ((profil.points - niveauActuel.xp) / (niveauSuivant.xp - niveauActuel.xp)) * 100
    : 100;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12, background: "#F2F2F7" }}>
      <div style={{ fontSize: 40, animation: "spin 1s linear infinite" }}>⏳</div>
      <div style={{ color: "#aaa", fontSize: 14 }}>Chargement...</div>
    </div>
  );

  const inputStyle = {
    width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12,
    padding: "11px 14px", fontSize: 14, outline: "none",
    boxSizing: "border-box", background: "white", fontFamily: "inherit"
  };

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${niveauActuel.color}, #FF3B30)`,
        padding: "52px 20px 24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, position: "relative" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, border: "3px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)", flexShrink: 0, fontWeight: 800
          }}>
            {profil.prenom ? profil.prenom[0].toUpperCase() : "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
              {profil.prenom ? `${profil.prenom} ${profil.nom}` : user ? user.email : "Mon Profil"}
            </div>
            {user && (
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>{user.email}</div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: "3px 10px" }}>
                <span style={{ fontSize: 12 }}>⭐</span>
                <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{niveauActuel.label}</span>
              </div>
              {profil.est_premium && (
                <div style={{ display: "inline-flex", background: "rgba(255,215,0,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                  <span style={{ color: "#FFD700", fontSize: 11, fontWeight: 700 }}>✨ Premium</span>
                </div>
              )}
              {!user && (
                <div onClick={() => navigate("/Login")} style={{ display: "inline-flex", background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>
                  <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>🔓 Se connecter</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "8px 12px", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {editing ? "Annuler" : "✏️ Modifier"}
          </button>
        </div>

        {/* XP Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>{profil.points} XP</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {niveauSuivant ? `${niveauSuivant.xp} XP → ${niveauSuivant.label}` : "Niveau MAX 🏆"}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ background: "white", height: "100%", borderRadius: 6, width: `${Math.min(xpProgress, 100)}%`, transition: "width 1s ease", boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display: "flex" }}>
        {[
          { val: profil.nb_offres_utilisees, label: "Offres", icon: "🎁", color: "#FF6B00" },
          { val: profil.total_economies, label: "€ économisés", icon: "💰", color: "#34C759" },
          { val: profil.badges?.length || 0, label: "Badges", icon: "🏅", color: "#AF52DE" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: "white", padding: "14px 6px", textAlign: "center", borderRight: i < 2 ? "1px solid #f0f0f0" : "none" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 2 }}>
              <AnimatedNumber value={typeof s.val === "number" ? s.val : 0} />
              {s.label.includes("€") ? "€" : ""}
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{s.label.replace("€ ", "")}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "white", borderBottom: "1px solid #f0f0f0" }}>
        {[{ key: "stats", label: "Activité" }, { key: "badges", label: "Badges" }, { key: "settings", label: "Paramètres" }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            flex: 1, background: "none", border: "none", padding: "12px 4px",
            fontSize: 12, fontWeight: activeTab === t.key ? 700 : 500,
            color: activeTab === t.key ? "#FF6B00" : "#888",
            borderBottom: activeTab === t.key ? "2px solid #FF6B00" : "2px solid transparent",
            cursor: "pointer", transition: "all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 100px" }}>

        {/* Toast save */}
        {saveOk && (
          <div style={{ background: "#34C759", color: "white", borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            ✅ Profil sauvegardé !
          </div>
        )}

        {/* Formulaire édition */}
        {editing && (
          <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>✏️ Modifier mon profil</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input placeholder="Ville" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 8, fontWeight: 600 }}>Rayon de recherche : {form.rayon_recherche_km} km</div>
              <input type="range" min="1" max="30" value={form.rayon_recherche_km} onChange={e => setForm({ ...form, rayon_recherche_km: parseInt(e.target.value) })} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 8, fontWeight: 600 }}>Catégories favorites</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => {
                    const cats = form.categories_favorites?.includes(cat)
                      ? form.categories_favorites.filter(c => c !== cat)
                      : [...(form.categories_favorites || []), cat];
                    setForm({ ...form, categories_favorites: cats });
                  }} style={{
                    background: form.categories_favorites?.includes(cat) ? "#FF6B00" : "#f5f5f7",
                    color: form.categories_favorites?.includes(cat) ? "white" : "#555",
                    border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>{cat}</button>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={saving} style={{
              width: "100%", background: saving ? "#e0e0e0" : "linear-gradient(135deg, #FF6B00, #FF3B30)",
              color: saving ? "#aaa" : "white", border: "none", borderRadius: 12, padding: "13px",
              fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer"
            }}>
              {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
            </button>
          </div>
        )}

        {/* ACTIVITÉ */}
        {activeTab === "stats" && !editing && (
          <>
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
                    <div style={{ background: obj.color, height: "100%", borderRadius: 6, width: `${Math.min((obj.current / obj.goal) * 100, 100)}%`, transition: "width 1s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📍 Mes infos</div>
              {[
                { label: "Ville", val: profil.ville || "Non renseignée" },
                { label: "Rayon de recherche", val: `${profil.rayon_recherche_km || 5} km` },
                { label: "Catégories favorites", val: profil.categories_favorites?.length ? profil.categories_favorites.join(", ") : "Toutes" },
                { label: "Compte", val: user ? "✅ Connecté" : "❌ Hors ligne (localStorage)" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid #f5f5f5" : "none" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#333", textAlign: "right", maxWidth: "60%" }}>{row.val}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BADGES */}
        {activeTab === "badges" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 12 }}>
              🏅 {profil.badges?.length || 0} badge{(profil.badges?.length || 0) > 1 ? "s" : ""} débloqué{(profil.badges?.length || 0) > 1 ? "s" : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {BADGES_DEF.map(b => {
                const unlocked = profil.badges?.includes(b.id);
                return (
                  <div key={b.id} style={{
                    background: unlocked ? "white" : "#f8f8f8",
                    borderRadius: 14, padding: "16px 12px", textAlign: "center",
                    boxShadow: unlocked ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
                    border: unlocked ? "2px solid #FF6B0020" : "2px solid transparent",
                    opacity: unlocked ? 1 : 0.45
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{b.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 3 }}>{b.label}</div>
                    <div style={{ fontSize: 10, color: "#aaa", marginBottom: 6 }}>{b.desc}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00" }}>+{b.xp} XP</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PARAMÈTRES */}
        {activeTab === "settings" && (
          <>
            {/* Connexion */}
            {!user ? (
              <div style={{ background: "linear-gradient(135deg, #FF6B00, #FF3B30)", borderRadius: 16, padding: 20, marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔓</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Créez un compte</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 16 }}>Synchronisez vos favoris et votre progression sur tous vos appareils.</div>
                <button onClick={() => navigate("/Login")} style={{ background: "white", color: "#FF6B00", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Se connecter / S'inscrire
                </button>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>👤 Compte</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>Connecté en tant que</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 14 }}>{user.email}</div>
                <button onClick={handleLogout} style={{ width: "100%", background: "#FFF0F0", color: "#FF3B30", border: "none", borderRadius: 12, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  🚪 Se déconnecter
                </button>
              </div>
            )}

            {/* Abonnement */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💳 Abonnement</div>
              {profil.est_premium ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 28 }}>✨</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#FF9500" }}>Premium actif</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Accès prioritaire aux offres flash</div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Passez Premium pour des offres exclusives et un accès anticipé.</div>
                  <button onClick={() => navigate("/Abonnement?tab=user")} style={{ width: "100%", background: "linear-gradient(135deg, #FF9500, #FF6B00)", color: "white", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    ✨ Passer Premium — 9,99€/mois
                  </button>
                </>
              )}
            </div>

            {/* Notifications */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>🔔 Notifications</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Alertes offres flash et favoris</div>
                </div>
                <div onClick={() => setForm(f => ({ ...f, notifications_actives: !f.notifications_actives }))} style={{
                  width: 48, height: 28, borderRadius: 14,
                  background: form.notifications_actives ? "#34C759" : "#ddd",
                  cursor: "pointer", position: "relative", transition: "background 0.3s"
                }}>
                  <div style={{ position: "absolute", width: 22, height: 22, borderRadius: "50%", background: "white", top: 3, left: form.notifications_actives ? 23 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>

            {/* Liens */}
            {[
              { label: "🔒 Politique de confidentialité", href: "/PrivacyPolicy" },
              { label: "💳 Gérer mon abonnement", href: "/Abonnement" },
            ].map((l, i) => (
              <button key={i} onClick={() => navigate(l.href)} style={{
                width: "100%", background: "white", border: "none", borderRadius: 14,
                padding: "15px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 10, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{l.label}</span>
                <span style={{ color: "#ccc" }}>›</span>
              </button>
            ))}

            <div style={{ textAlign: "center", marginTop: 10, color: "#ccc", fontSize: 12 }}>
              Click & Promo v1.0.0
            </div>
          </>
        )}
      </div>

      <NavBar active="profil" />
    </div>
  );
}
