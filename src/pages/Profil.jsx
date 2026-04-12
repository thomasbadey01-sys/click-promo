import { useState, useEffect } from "react";
import { ProfilUtilisateur, HistoriqueOffresVues } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, Ic, NavBar, toggleDarkMode, getDarkMode } from "./theme";

const LEVELS = [
  { min: 0,    max: 99,    nom: "Débutant",      emoji: "🌱", col: "#10B981" },
  { min: 100,  max: 299,   nom: "Bronze",        emoji: "🥉", col: "#CD7F32" },
  { min: 300,  max: 699,   nom: "Silver",        emoji: "🥈", col: "#C0C0C0" },
  { min: 700,  max: 1499,  nom: "Gold",          emoji: "🥇", col: "#F59E0B" },
  { min: 1500, max: 99999, nom: "Légende Click", emoji: "👑", col: DS.brand },
];

const BADGES = [
  { id: "first_deal", label: "First Deal",  emoji: "⚡", desc: "Première offre utilisée" },
  { id: "saver",      label: "Saver",       emoji: "💰", desc: "50€ économisés" },
  { id: "explorer",   label: "Explorer",    emoji: "🗺️", desc: "5 villes explorées" },
  { id: "fan",        label: "Fan",         emoji: "❤️", desc: "10 favoris ajoutés" },
  { id: "speed",      label: "Speed",       emoji: "🚀", desc: "Offre utilisée en < 1h" },
  { id: "loyal",      label: "Loyal",       emoji: "👑", desc: "30 offres utilisées" },
];

function getLevel(pts) {
  return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0];
}

function genCode(email) {
  return "CP" + (email || "USER").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4) + Math.floor(1000 + Math.random() * 9000);
}

export default function Profil() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [user, setUser] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [tab, setTab] = useState("profil");
  const [loading, setLoading] = useState(true);
  const [darkMode] = useState(getDarkMode());
  const [codeCopied, setCodeCopied] = useState(false);
  const [notifActive, setNotifActive] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profils = await ProfilUtilisateur.filter({ user_id: u.id });
        if (profils.length > 0) {
          setProfil(profils[0]);
          setNotifActive(profils[0].notifications_actives !== false);
        } else {
          const code = genCode(u.email);
          const p = await ProfilUtilisateur.create({
            user_id: u.id,
            prenom: u.full_name?.split(" ")[0] || "",
            nom: u.full_name?.split(" ").slice(1).join(" ") || "",
            points: 0, niveau: 1, badges: [], total_economies: 0, nb_offres_utilisees: 0,
            code_parrainage: code, nb_filleuls: 0,
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
      background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 50%, ${DS.brand2} 100%)`,
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Chargement…</div>
      </div>
    </div>
  );

  if (!user) return (
    <div style={{
      background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 100%)`,
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
  const levelIdx = LEVELS.indexOf(level);
  const nextLevel = LEVELS[levelIdx + 1] || level;
  const progressPct = nextLevel !== level
    ? Math.round(((pts - level.min) / (nextLevel.min - level.min)) * 100) : 100;
  const userBadges = profil?.badges || [];
  const totalEco = profil?.total_economies || 0;
  const nbOffres = profil?.nb_offres_utilisees || 0;
  const codeParrainage = profil?.code_parrainage || genCode(user.email);

  const copyCode = () => {
    navigator.clipboard?.writeText(codeParrainage);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareParrainage = () => {
    const msg = `🎁 Rejoins Click & Promo avec mon code *${codeParrainage}* et profite d'offres exclusives près de chez toi ! 🛍️`;
    if (navigator.share) {
      navigator.share({ title: "Click & Promo", text: msg });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    }
  };

  const toggleNotif = async () => {
    const newVal = !notifActive;
    setNotifActive(newVal);
    if (profil?.id) {
      await ProfilUtilisateur.update(profil.id, { notifications_actives: newVal });
    }
  };

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header violet */}
      <div style={{
        background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 50%, ${DS.brand2} 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 0`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "5px 14px",
          }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
              {level.emoji} {level.nom.toUpperCase()} · NIVEAU {levelIdx + 1}
            </span>
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Avatar + stats */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{
            width: 90, height: 90, borderRadius: "50%", margin: "0 auto 14px",
            background: "rgba(255,255,255,.15)", border: "2px solid rgba(255,255,255,.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
          }}>
            {user.avatar_url
              ? <img src={user.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <span>{level.emoji}</span>
            }
          </div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 2 }}>
            {user.full_name || user.email?.split("@")[0]}
          </div>
          <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginBottom: 14 }}>
            {pts} points · {userBadges.length} badges
          </div>

          {/* Barre XP */}
          <div style={{ padding: "0 24px", marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 600 }}>{pts} pts</span>
              <span style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 600 }}>
                {nextLevel !== level ? `${nextLevel.min} pts` : "MAX"}
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 10, height: 10, overflow: "hidden" }}>
              <div style={{
                background: "linear-gradient(90deg, #00D4FF, #A855F7)",
                height: "100%", borderRadius: 10, width: `${progressPct}%`,
                transition: "width 1.5s cubic-bezier(.4,0,.2,1)",
                boxShadow: "0 0 10px rgba(0,212,255,.4)",
              }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {[
            { id: "profil",     label: "Profil" },
            { id: "historique", label: "Historique" },
            { id: "parrainage", label: "Parrainage" },
            { id: "compte",     label: "Compte" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer",
              color: tab === t.id ? "#fff" : "rgba(255,255,255,.5)",
              fontWeight: tab === t.id ? 800 : 500, fontSize: 12,
              borderBottom: `3px solid ${tab === t.id ? "#fff" : "transparent"}`,
              fontFamily: DS.fontBase, whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: "20px 16px 100px" }}>

        {tab === "profil" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { val: `${totalEco.toFixed(0)}€`, label: "Économisés" },
                { val: nbOffres, label: "Offres" },
                { val: userBadges.length, label: "Badges" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 16, padding: "16px 8px",
                  textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: DS.ink, marginBottom: 14 }}>🏅 Mes badges</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {BADGES.map(b => {
                  const unlocked = userBadges.includes(b.id);
                  return (
                    <div key={b.id} style={{ textAlign: "center" }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: 18, margin: "0 auto 6px",
                        background: unlocked ? `linear-gradient(135deg, ${DS.brand} 0%, ${DS.brand2} 100%)` : "#F0F0F5",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                        boxShadow: unlocked ? `0 4px 12px ${DS.brand}40` : "none",
                      }}>
                        <span style={{ opacity: unlocked ? 1 : 0.25 }}>{b.emoji}</span>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: unlocked ? DS.ink : "#bbb" }}>{b.label}</div>
                      <div style={{ fontSize: 9, color: "#bbb", marginTop: 1 }}>{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => navigate("/Feed")} style={{
              width: "100%", background: `linear-gradient(135deg, ${DS.brand} 0%, ${DS.brand2} 100%)`,
              color: "#fff", border: "none", borderRadius: 16, padding: "16px",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: DS.eBrand,
            }}>
              🎯 Trouver de nouvelles offres
            </button>
          </>
        )}

        {tab === "historique" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 17, color: DS.ink, marginBottom: 14 }}>Historique Récent</div>
            {historique.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, color: DS.ink }}>Aucune offre vue</div>
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
                <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: DS.brandLight }}>
                  {h.image_url
                    ? <img src={h.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>🏷️</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: DS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.offre_titre}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{h.commercant_nom} · {h.ville}</div>
                </div>
                {Ic.arrow("#ccc", 16)}
              </div>
            ))}
          </>
        )}

        {tab === "parrainage" && (
          <>
            {/* Hero parrainage */}
            <div style={{
              background: `linear-gradient(135deg, ${DS.brandDark} 0%, ${DS.brand} 100%)`,
              borderRadius: 20, padding: 22, marginBottom: 16, textAlign: "center",
              boxShadow: DS.eBrand,
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Parrainez vos amis</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 14, lineHeight: 1.5 }}>
                Partagez votre code et gagnez <strong style={{ color: "#fff" }}>50 points</strong> par filleul !
              </div>
            </div>

            {/* Code */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Votre code de parrainage</div>
              <div style={{
                background: DS.brandLight, borderRadius: 14, padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 14,
              }}>
                <span style={{ fontWeight: 900, fontSize: 24, color: DS.brand, letterSpacing: 3, fontFamily: "monospace" }}>
                  {codeParrainage}
                </span>
                <button onClick={copyCode} style={{
                  background: codeCopied ? DS.success : DS.brand, color: "#fff",
                  border: "none", borderRadius: 10, padding: "9px 14px",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "background .3s",
                }}>
                  {codeCopied ? Ic.check("#fff", 14) : Ic.copy2("#fff", 14)}
                  {codeCopied ? "Copié !" : "Copier"}
                </button>
              </div>
              <button onClick={shareParrainage} style={{
                width: "100%", background: DS.ink, color: "#fff",
                border: "none", borderRadius: 14, padding: "14px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {Ic.share("#fff", 16)} Partager sur WhatsApp
              </button>
            </div>

            {/* Stats parrainage */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: DS.ink, marginBottom: 14 }}>Mes parrainages</div>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: DS.brand }}>{profil?.nb_filleuls || 0}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Filleuls</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: DS.success }}>{(profil?.nb_filleuls || 0) * 50}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Pts gagnés</div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "compte" && (
          <>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 14 }}>
              {[
                { icon: notifActive ? "🔔" : "🔕", label: notifActive ? "Notifications activées" : "Notifications désactivées", action: toggleNotif, toggle: notifActive },
                { icon: "📍", label: "Ma localisation", action: () => {} },
                { icon: "⭐", label: "Passer Premium", action: () => navigate("/Abonnement"), highlight: true },
                { icon: "🏪", label: "Espace commerçant", action: () => navigate("/Dashboard") },
                { icon: "🔒", label: "Confidentialité", action: () => navigate("/PrivacyPolicy") },
                { icon: darkMode ? "☀️" : "🌙", label: darkMode ? "Mode clair" : "Mode sombre", action: toggleDarkMode },
              ].map((item, i, arr) => (
                <div key={i} onClick={item.action} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px",
                  borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                  cursor: "pointer",
                  background: item.highlight ? DS.brandLight : "#fff",
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: item.highlight ? DS.brand : DS.ink }}>{item.label}</span>
                  {item.toggle !== undefined
                    ? <div style={{ width: 40, height: 22, borderRadius: 100, background: item.toggle ? DS.brand : "#ddd", position: "relative", transition: "background .2s" }}>
                        <div style={{ position: "absolute", top: 3, left: item.toggle ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                      </div>
                    : Ic.arrow(item.highlight ? DS.brand : "#ccc", 16)
                  }
                </div>
              ))}
            </div>
            <button onClick={() => base44.auth.logout().then(() => navigate("/Login"))} style={{
              width: "100%", background: "#FEF2F2", border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 20, padding: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontSize: 15, fontWeight: 700, color: DS.danger, cursor: "pointer",
            }}>
              {Ic.logout(DS.danger, 18)} Se déconnecter
            </button>
          </>
        )}
      </div>

      <NavBar active="Profil" />
    </div>
  );
}