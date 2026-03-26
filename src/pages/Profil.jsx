import { useState, useEffect } from "react";
import { ProfilUtilisateur, HistoriqueOffresVues } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, Ic, NavBar } from "./theme";

const LEVELS = [
  { min: 0,    max: 99,    nom: "Découvreur",   emoji: "🌱", col: "#10B981" },
  { min: 100,  max: 299,   nom: "Chasseur",     emoji: "🏹", col: "#3B82F6" },
  { min: 300,  max: 699,   nom: "Explorateur",  emoji: "🧭", col: DS.brand },
  { min: 700,  max: 1499,  nom: "Expert Promo", emoji: "⭐", col: "#F59E0B" },
  { min: 1500, max: 99999, nom: "Légende Click",emoji: "👑", col: "#EF4444" },
];

const BADGES = [
  { id: "first_deal", label: "Premier Deal",    emoji: "🎯", pts: 10 },
  { id: "saver",      label: "Économiseur",     emoji: "💰", pts: 50 },
  { id: "explorer",   label: "Explorateur",     emoji: "🧭", pts: 30 },
  { id: "fan",        label: "Fan",             emoji: "❤️", pts: 20 },
  { id: "speed",      label: "Speed",           emoji: "⚡", pts: 15 },
  { id: "loyal",      label: "Fidèle",          emoji: "🏆", pts: 100 },
  { id: "globe",      label: "Globe Trotter",   emoji: "🌍", pts: 40 },
  { id: "sack",       label: "Big Saver",       emoji: "🎒", pts: 60 },
];

function getLevel(pts) {
  return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0];
}

export default function Profil() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [user, setUser] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [tab, setTab] = useState("profil");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profils = await ProfilUtilisateur.filter({ user_id: u.id });
        if (profils.length > 0) {
          setProfil(profils[0]);
        } else {
          const p = await ProfilUtilisateur.create({
            user_id: u.id, prenom: u.full_name?.split(" ")[0] || "",
            nom: u.full_name?.split(" ").slice(1).join(" ") || "",
            points: 0, niveau: 1, badges: [], total_economies: 0, nb_offres_utilisees: 0,
          });
          setProfil(p);
        }
        const hist = await HistoriqueOffresVues.filter({ user_id: u.id });
        hist.sort((a, b) => new Date(b.date_vue) - new Date(a.date_vue));
        setHistorique(hist.slice(0, 30));
      } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{
      background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 50%, #A855F7 100%)`,
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🌍</div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Chargement…</div>
      </div>
    </div>
  );

  if (!user) return (
    <div style={{
      background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 50%, #A855F7 100%)`,
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>👤</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Connectez-vous</div>
        <div style={{ color: "rgba(255,255,255,.7)", marginBottom: 24 }}>Pour accéder à votre profil</div>
        <button onClick={() => navigate("/Login")} style={{ background: "#fff", color: DS.brand, border: "none", borderRadius: 100, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
          Se connecter
        </button>
      </div>
    </div>
  );

  const pts = profil?.points || 0;
  const level = getLevel(pts);
  const nextLevel = LEVELS.find(l => l.min > pts) || level;
  const progressPct = nextLevel !== level ? Math.round(((pts - level.min) / (nextLevel.min - level.min)) * 100) : 100;
  const userBadges = profil?.badges || [];
  const totalEco = profil?.total_economies || 0;
  const nbOffres = profil?.nb_offres_utilisees || 0;
  const nbBadges = userBadges.length;

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header violet */}
      <div style={{
        background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 50%, #A855F7 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 0`,
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.2)", borderRadius: 20,
              padding: "5px 12px",
            }}>
              <span style={{ color: "#00D4FF", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
                {level.nom.toUpperCase()} · NIVEAU {LEVELS.indexOf(level) + 1}
              </span>
            </div>
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Avatar globe */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%", margin: "0 auto 16px",
            background: "rgba(255,255,255,.15)",
            border: "2px solid rgba(255,255,255,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48,
            boxShadow: `0 0 30px rgba(0,212,255,.3)`,
          }}>
            {user.avatar_url
              ? <img src={user.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <span>{level.emoji}</span>
            }
          </div>

          {/* Barre XP ondulée */}
          <div style={{ padding: "0 20px", marginBottom: 16 }}>
            <div style={{
              background: "rgba(255,255,255,.15)", borderRadius: 10, height: 12,
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                background: "linear-gradient(90deg, #00D4FF, #A855F7)",
                height: "100%", borderRadius: 10,
                width: `${progressPct}%`,
                transition: "width 1.5s cubic-bezier(.4,0,.2,1)",
                boxShadow: "0 0 10px rgba(0,212,255,.5)",
              }} />
            </div>
          </div>

          {/* Icônes quick stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 36, marginBottom: 8 }}>
            {[
              { emoji: "🐷", label: "Économies" },
              { emoji: "🛒", label: "Offres" },
              { emoji: "⭐", label: "Badges" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setTab(["profil","historique","profil"][i])}>
                <span style={{ fontSize: 24 }}>{s.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {[
            { id: "profil", label: "Profil" },
            { id: "historique", label: "Historique" },
            { id: "compte", label: "Compte" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer",
              color: tab === t.id ? "#fff" : "rgba(255,255,255,.5)",
              fontWeight: tab === t.id ? 800 : 500, fontSize: 14,
              borderBottom: `3px solid ${tab === t.id ? "#fff" : "transparent"}`,
              fontFamily: DS.fontBase,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: "20px 16px 100px" }}>

        {tab === "profil" && (
          <>
            {/* Stats 3 colonnes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { val: `${totalEco.toFixed(0)}€`, label: "Économisés" },
                { val: nbOffres, label: "Offres utilisés" },
                { val: nbBadges, label: "Badges" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 16, padding: "16px 8px",
                  textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#1A1A2E" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Badges grille */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1A1A2E", marginBottom: 14 }}>Mes badges</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {BADGES.map(b => {
                  const unlocked = userBadges.includes(b.id);
                  return (
                    <div key={b.id} style={{ textAlign: "center" }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: 16, margin: "0 auto 6px",
                        background: unlocked ? DS.brand : "#F0F0F5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24,
                        boxShadow: unlocked ? `0 4px 12px ${DS.brand}40` : "none",
                      }}>
                        {unlocked ? <span>{b.emoji}</span> : <span style={{ opacity: 0.3 }}>{b.emoji}</span>}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: unlocked ? "#1A1A2E" : "#bbb" }}>{b.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA trouver offres */}
            <button onClick={() => navigate("/Feed")} style={{
              width: "100%", background: `linear-gradient(135deg, ${DS.brand} 0%, #A855F7 100%)`,
              color: "#fff", border: "none", borderRadius: 16, padding: "16px",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: `0 4px 16px ${DS.brand}40`,
            }}>
              🎯 Trouver de nouvelles offres
            </button>
          </>
        )}

        {tab === "historique" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#1A1A2E", marginBottom: 14 }}>Historique Récent</div>
            {historique.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, color: "#1A1A2E" }}>Aucune offre vue</div>
                <button onClick={() => navigate("/Feed")} style={{ marginTop: 16, background: DS.brand, color: "#fff", border: "none", borderRadius: 100, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
                  Voir les offres
                </button>
              </div>
            ) : historique.map(h => (
              <div key={h.id} onClick={() => navigate(`/OffreDetail?id=${h.offre_id}`)} style={{
                background: "#fff", borderRadius: 16, marginBottom: 10,
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                boxShadow: "0 2px 8px rgba(0,0,0,.05)", cursor: "pointer",
              }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: DS.brandLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {h.image_url ? <img src={h.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>🏷️</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.offre_titre}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{h.commercant_nom} · {h.ville}</div>
                </div>
                {Ic.arrow("#ccc", 16)}
              </div>
            ))}
          </>
        )}

        {tab === "compte" && (
          <>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 14 }}>
              {[
                { icon: "🔔", label: "Notifications", action: () => {} },
                { icon: "📍", label: "Ma localisation", action: () => {} },
                { icon: "⭐", label: "Passer Premium", action: () => navigate("/Abonnement"), highlight: true },
                { icon: "🏪", label: "Espace commerçant", action: () => navigate("/Dashboard") },
                { icon: "🔒", label: "Confidentialité", action: () => navigate("/PrivacyPolicy") },
              ].map((item, i) => (
                <div key={i} onClick={item.action} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px",
                  borderBottom: i < 4 ? "1px solid #f5f5f5" : "none",
                  cursor: "pointer",
                  background: item.highlight ? DS.brandLight : "#fff",
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: item.highlight ? DS.brand : "#1A1A2E" }}>{item.label}</span>
                  {Ic.arrow(item.highlight ? DS.brand : "#ccc", 16)}
                </div>
              ))}
            </div>
            <button onClick={() => base44.auth.logout().then(() => navigate("/Login"))} style={{
              width: "100%", background: "#FEF2F2", border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 20, padding: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontSize: 15, fontWeight: 700, color: "#EF4444", cursor: "pointer",
            }}>
              {Ic.logout("#EF4444", 18)} Se déconnecter
            </button>
          </>
        )}
      </div>

      <NavBar active="Profil" />
    </div>
  );
}