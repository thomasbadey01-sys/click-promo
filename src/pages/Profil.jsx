import { useState, useEffect } from "react";
import { ProfilUtilisateur, HistoriqueOffresVues, UtilisationOffre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo, NavBar } from "./theme";

// ── Niveaux & badges ─────────────────────────────────────────
const LEVELS = [
  { min:0,    max:99,   nom:"Découvreur",      emoji:"🌱", col:"#10B981" },
  { min:100,  max:299,  nom:"Chasseur",        emoji:"🏹", col:"#3B82F6" },
  { min:300,  max:699,  nom:"Explorateur",     emoji:"🧭", col:DS.brand },
  { min:700,  max:1499, nom:"Expert Promo",    emoji:"⭐", col:"#F59E0B" },
  { min:1500, max:99999,nom:"Légende Click",   emoji:"👑", col:"#EF4444" },
];

const BADGES = [
  { id:"first_deal",  label:"Premier Deal",       desc:"Première offre utilisée",      emoji:"🎯", pts:10  },
  { id:"saver",       label:"Économiseur Pro",     desc:"50€ économisés",               emoji:"🐷", pts:50  },
  { id:"explorer",    label:"Explorateur Urbain",  desc:"5 villes différentes",         emoji:"🧭", pts:30  },
  { id:"fan",         label:"Fan Click & Promo",   desc:"10 offres ajoutées en favoris",emoji:"❤️", pts:20  },
  { id:"speed",       label:"Speed Dealer",        desc:"Offre flash utilisée",         emoji:"⚡", pts:15  },
  { id:"loyal",       label:"Fidèle Click",        desc:"30 jours consécutifs",         emoji:"🏆", pts:100 },
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
        hist.sort((a,b) => new Date(b.date_vue) - new Date(a.date_vue));
        setHistorique(hist.slice(0, 30));
      } catch (e) {
        console.warn(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 40%, #A855F7 100%)`, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <CPLogo size={48} />
        <div style={{ marginTop: 16, color: "rgba(255,255,255,.6)", fontSize: 14 }}>Chargement…</div>
      </div>
    </div>
  );

  if (!user) return (
    <div style={{ background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 40%, #A855F7 100%)`, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>👤</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: DS.white, marginBottom: 10 }}>Connectez-vous</div>
        <div style={{ color: "rgba(255,255,255,.7)", marginBottom: 24 }}>Pour accéder à votre profil</div>
        <button onClick={() => navigate("/Login")} style={{ background: DS.white, color: DS.brand, border: "none", borderRadius: DS.pill, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Se connecter</button>
      </div>
    </div>
  );

  const pts = profil?.points || 0;
  const level = getLevel(pts);
  const nextLevel = LEVELS.find(l => l.min > pts) || level;
  const progressPct = nextLevel !== level ? Math.round(((pts - level.min) / (nextLevel.min - level.min)) * 100) : 100;
  const userBadges = profil?.badges || [];

  return (
    <div style={{ background: DS.white, minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header violet dégradé */}
      <div style={{
        background: `linear-gradient(160deg, ${DS.brand} 0%, ${DS.brand2} 50%, #A855F7 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 0`,
      }}>
        {/* Barre top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CPLogo size={24} />
            <span style={{ color: DS.white, fontWeight: 700, fontSize: 16 }}>Click & Promo</span>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            {Ic.settings("rgba(255,255,255,.7)", 22)}
          </button>
        </div>

        {/* Badge niveau — style néon */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          {/* Cercle néon */}
          <div style={{
            width: 110, height: 110, borderRadius: "50%", margin: "0 auto 14px",
            background: `radial-gradient(circle, ${DS.brand}80 0%, ${DS.brand}20 60%, transparent 100%)`,
            border: `3px solid ${DS.neon}`,
            boxShadow: `0 0 20px ${DS.neon}60, 0 0 40px ${DS.brand}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {/* Anneau externe */}
            <div style={{
              position: "absolute", inset: -8,
              borderRadius: "50%",
              border: `2px solid ${DS.brand2}40`,
            }}/>
            {user.avatar_url
              ? <img src={user.avatar_url} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
              : <span style={{ fontSize: 40 }}>{level.emoji}</span>
            }
          </div>

          {/* Nom de niveau */}
          <div style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${DS.brand}CC, ${DS.brand2}CC)`,
            backdropFilter: "blur(10px)",
            border: `2px solid ${DS.neon}60`,
            borderRadius: DS.lg,
            padding: "8px 20px",
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: DS.white, letterSpacing: 1, textTransform: "uppercase" }}>
              {level.nom}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: DS.neon }}>Niveau {LEVELS.indexOf(level) + 1}</div>
          </div>

          {/* Barre XP */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginBottom: 8, fontWeight: 600 }}>
              XP: {pts}/{nextLevel === level ? pts : nextLevel.min}
            </div>
            <div style={{ background: "rgba(255,255,255,.2)", borderRadius: DS.pill, height: 8 }}>
              <div style={{
                background: `linear-gradient(90deg, #FF6B9D, #C44CFF)`,
                height: "100%", borderRadius: DS.pill,
                width: `${progressPct}%`,
                transition: "width 1.5s cubic-bezier(.4,0,.2,1)",
                boxShadow: "0 0 8px rgba(196,76,255,.6)",
              }}/>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "none" }}>
          {[
            { id: "profil",     label: "Profil"    },
            { id: "historique", label: "Historique"},
            { id: "compte",     label: "Compte"    },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer",
              color: tab === t.id ? DS.white : "rgba(255,255,255,.5)",
              fontWeight: tab === t.id ? 800 : 500, fontSize: 14,
              borderBottom: `3px solid ${tab === t.id ? DS.white : "transparent"}`,
              fontFamily: DS.fontBase,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: "20px 16px 100px" }}>

        {/* ── PROFIL ── */}
        {tab === "profil" && (
          <>
            {/* Badges */}
            <div style={{ background: DS.white, borderRadius: DS.xl, padding: 16, marginBottom: 14, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: DS.ink, marginBottom: 14 }}>Mes badges</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {BADGES.map(b => {
                  const unlocked = userBadges.includes(b.id);
                  return (
                    <div key={b.id} style={{ textAlign: "center", opacity: unlocked ? 1 : 0.35 }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: DS.xl, margin: "0 auto 8px",
                        background: unlocked ? DS.brandLight : DS.ink05,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28,
                        border: unlocked ? `2px solid ${DS.brand}30` : "none",
                      }}>{b.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: DS.ink, marginBottom: 2 }}>{b.label}</div>
                      <div style={{ fontSize: 10, color: DS.ink40 }}>{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats économies */}
            <div style={{ background: DS.white, borderRadius: DS.xl, padding: 20, boxShadow: DS.e1, border: `1px solid ${DS.ink10}`, marginBottom: 14 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: DS.brand, letterSpacing: -1, marginBottom: 2 }}>
                {(profil?.total_economies || 0).toFixed(0)}€ ÉCONOMISÉS
              </div>
              <div style={{ fontSize: 14, color: DS.ink60 }}>Total des économies réalisées</div>
            </div>

            {/* Infos perso */}
            <div style={{ background: DS.white, borderRadius: DS.xl, padding: 16, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: DS.ink, marginBottom: 12 }}>
                {user.full_name || user.email}
              </div>
              <div style={{ fontSize: 13, color: DS.ink60, marginBottom: 4 }}>{user.email}</div>
              {profil?.ville && <div style={{ fontSize: 13, color: DS.ink60, display: "flex", alignItems: "center", gap: 4 }}>
                {Ic.pin(DS.brand, 12)} {profil.ville}
              </div>}
            </div>
          </>
        )}

        {/* ── HISTORIQUE ── */}
        {tab === "historique" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 17, color: DS.ink, marginBottom: 14 }}>Historique Récent</div>
            {historique.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: DS.ink40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, color: DS.ink }}>Aucune offre vue</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Explorez des offres près de chez vous</div>
                <button onClick={() => navigate("/Feed")} style={{ marginTop: 16, background: DS.brand, color: DS.white, border: "none", borderRadius: DS.pill, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>Voir les offres</button>
              </div>
            ) : historique.map(h => (
              <div key={h.id} onClick={() => navigate(`/OffreDetail?id=${h.offre_id}`)} style={{
                background: DS.white, borderRadius: DS.xl, marginBottom: 10,
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                boxShadow: DS.e1, border: `1px solid ${DS.ink10}`, cursor: "pointer",
              }}>
                {/* Avatar catégorie */}
                <div style={{
                  width: 46, height: 46, borderRadius: DS.lg, flexShrink: 0, overflow: "hidden",
                  background: DS.brandLight, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {h.image_url
                    ? <img src={h.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 20 }}>🏷️</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: DS.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.offre_titre}
                  </div>
                  <div style={{ fontSize: 12, color: DS.ink40 }}>
                    {h.commercant_nom} · {h.ville}
                  </div>
                </div>
                {Ic.arrow(DS.ink40, 16)}
              </div>
            ))}
          </>
        )}

        {/* ── COMPTE ── */}
        {tab === "compte" && (
          <>
            <div style={{ background: DS.white, borderRadius: DS.xl, overflow: "hidden", boxShadow: DS.e1, border: `1px solid ${DS.ink10}`, marginBottom: 14 }}>
              {[
                { icon: "🔔", label: "Notifications", action: () => {} },
                { icon: "📍", label: "Ma localisation", action: () => {} },
                { icon: "⭐", label: "Passer Premium", action: () => navigate("/Abonnement"), highlight: true },
                { icon: "🏪", label: "Espace commerçant", action: () => navigate("/Dashboard") },
                { icon: "🔒", label: "Politique de confidentialité", action: () => navigate("/PrivacyPolicy") },
              ].map((item, i) => (
                <div key={i} onClick={item.action} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px",
                  borderBottom: i < 4 ? `1px solid ${DS.ink05}` : "none",
                  cursor: "pointer",
                  background: item.highlight ? DS.brandLight : DS.white,
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: item.highlight ? DS.brand : DS.ink }}>{item.label}</span>
                  {Ic.arrow(item.highlight ? DS.brand : DS.ink40, 16)}
                </div>
              ))}
            </div>

            <button onClick={() => base44.auth.logout().then(() => navigate("/Login"))} style={{
              width: "100%", background: "#FEF2F2", border: `1px solid ${DS.danger}22`,
              borderRadius: DS.xl, padding: "16px",
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