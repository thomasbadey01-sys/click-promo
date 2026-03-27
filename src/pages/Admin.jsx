import { useState, useEffect } from "react";
import { Offre, Commercant, DemandeCommercant, Abonnement, AvisCommercant } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo } from "./theme";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({ offres: 0, commercants: 0, demandes: 0, abonnements: 0 });
  const [demandes, setDemandes] = useState([]);
  const [offres, setOffres] = useState([]);
  const [commercants, setCommercants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u.role !== "admin") { navigate("/Feed"); return; }
        const [o, c, d, a] = await Promise.all([
          Offre.list(), Commercant.list(), DemandeCommercant.list(), Abonnement.list()
        ]);
        setStats({ offres: o.length, commercants: c.length, demandes: d.length, abonnements: a.length });
        setOffres(o);
        setCommercants(c);
        setDemandes(d.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch { navigate("/Feed"); }
      setLoading(false);
    })();
  }, []);

  const validerDemande = async (id, statut) => {
    await DemandeCommercant.update(id, { statut });
    setDemandes(p => p.map(d => d.id === id ? { ...d, statut } : d));
  };

  const toggleOffre = async (o) => {
    await Offre.update(o.id, { est_active: !o.est_active });
    setOffres(p => p.map(x => x.id === o.id ? { ...x, est_active: !o.est_active } : x));
  };

  const toggleCommercant = async (c) => {
    await Commercant.update(c.id, { est_actif: !c.est_actif, est_valide: !c.est_actif });
    setCommercants(p => p.map(x => x.id === c.id ? { ...x, est_actif: !c.est_actif } : x));
  };

  if (loading) return (
    <div style={{ background: DS.dark, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center" }}>
        <CPLogo size={44} />
        <div style={{ marginTop: 14, color: "rgba(255,255,255,.4)", fontSize: 13 }}>Chargement admin…</div>
      </div>
    </div>
  );

  const TABS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "demandes",  label: `Demandes (${demandes.filter(d => d.statut === "en_attente").length})` },
    { id: "offres",    label: `Offres (${offres.length})` },
    { id: "commercants", label: `Commercants (${commercants.length})` },
  ];

  return (
    <div style={{ background: DS.dark, minHeight: "100vh", fontFamily: DS.fontBase, color: DS.white }}>

      {/* Header */}
      <div style={{ background: DS.dark2, padding: `calc(${DS.safeTop} + 8px) 16px 0`, borderBottom: `1px solid ${DS.darkBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: DS.white, letterSpacing: -0.5 }}>⚙️ Admin Panel</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{user?.email}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => navigate("/Feed")} style={{ background: DS.brand, color: "#fff", border: "none", borderRadius: 100, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              🛒 Feed
            </button>
          </div>
        </div>
        <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
              color: tab === t.id ? DS.white : "rgba(255,255,255,.4)",
              fontWeight: tab === t.id ? 800 : 500, fontSize: 12,
              borderBottom: `2px solid ${tab === t.id ? DS.brand : "transparent"}`,
              fontFamily: DS.fontBase, whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 80px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Offres", value: stats.offres, emoji: "🏷️", col: DS.brand2 },
                { label: "Commerçants", value: stats.commercants, emoji: "🏪", col: DS.success },
                { label: "Demandes", value: stats.demandes, emoji: "📋", col: DS.warning },
                { label: "Abonnements", value: stats.abonnements, emoji: "💳", col: "#F472B6" },
              ].map(s => (
                <div key={s.label} style={{ background: DS.darkCard, borderRadius: DS.lg, padding: 16, border: `1px solid ${DS.darkBorder}` }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.emoji}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: s.col, letterSpacing: -1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Alertes */}
            {offres.some(o => o.est_active && o.stock_restant < 5 && o.stock_restant >= 0) && (
              <div style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)", borderRadius: DS.md, padding: "12px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600, color: DS.warning }}>
                ⚠️ {offres.filter(o => o.est_active && o.stock_restant < 5).length} offre(s) avec stock critique
              </div>
            )}

            {demandes.filter(d => d.statut === "en_attente").length > 0 && (
              <>
                <div style={{ fontSize: 15, fontWeight: 800, color: DS.white, marginBottom: 10 }}>🔔 En attente de validation</div>
                {demandes.filter(d => d.statut === "en_attente").slice(0, 3).map(d => (
                  <DemandeCard key={d.id} d={d} onValider={validerDemande} />
                ))}
                {demandes.filter(d => d.statut === "en_attente").length > 3 && (
                  <button onClick={() => setTab("demandes")} style={{ width: "100%", background: DS.dark3, border: `1px solid ${DS.darkBorder}`, borderRadius: DS.md, padding: 12, fontSize: 13, color: "rgba(255,255,255,.5)", cursor: "pointer", marginTop: 4 }}>
                    Voir toutes →
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* DEMANDES */}
        {tab === "demandes" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: DS.white, marginBottom: 14 }}>
              Toutes les demandes ({demandes.length})
            </div>
            {demandes.length === 0
              ? <EmptyState emoji="📭" text="Aucune demande" />
              : demandes.map(d => <DemandeCard key={d.id} d={d} onValider={validerDemande} />)
            }
          </>
        )}

        {/* OFFRES */}
        {tab === "offres" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: DS.white, marginBottom: 14 }}>
              Toutes les offres ({offres.length})
            </div>
            {offres.length === 0
              ? <EmptyState emoji="📭" text="Aucune offre" />
              : offres.map(o => (
                <div key={o.id} style={{ background: DS.darkCard, borderRadius: DS.lg, padding: "12px 14px", marginBottom: 10, border: `1px solid ${DS.darkBorder}`, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 52, height: 46, borderRadius: DS.md, overflow: "hidden", flexShrink: 0 }}>
                    <img src={o.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{o.commercant_nom} · {o.ville}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
                      {o.nb_vues || 0} vues · {o.nb_conversions || 0} conv.
                      {o.stock_restant < 5 && o.stock_initial > 0 ? " · ⚠️ Stock bas" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    <div style={{ background: o.est_active ? `${DS.success}25` : `${DS.danger}25`, color: o.est_active ? DS.success : DS.danger, borderRadius: DS.pill, padding: "3px 10px", fontSize: 10, fontWeight: 800, textAlign: "center" }}>
                      {o.est_active ? "Active" : "Inactive"}
                    </div>
                    <button onClick={() => toggleOffre(o)} style={{ background: DS.dark4, border: `1px solid ${DS.darkBorder}`, borderRadius: DS.md, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.55)", cursor: "pointer" }}>
                      {o.est_active ? "Désactiver" : "Activer"}
                    </button>
                  </div>
                </div>
              ))
            }
          </>
        )}

        {/* COMMERÇANTS */}
        {tab === "commercants" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: DS.white, marginBottom: 14 }}>
              Commerçants ({commercants.length})
            </div>
            {commercants.length === 0
              ? <EmptyState emoji="🏪" text="Aucun commerçant" />
              : commercants.map(c => (
                <div key={c.id} style={{ background: DS.darkCard, borderRadius: DS.lg, padding: "14px", marginBottom: 10, border: `1px solid ${DS.darkBorder}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: DS.white }}>{c.nom}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{c.categorie} · {c.ville}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{c.email}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                      {c.est_verifie && (
                        <div style={{ background: `${DS.success}25`, color: DS.success, borderRadius: DS.pill, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>✓ Vérifié</div>
                      )}
                      <div style={{ background: c.est_actif ? `${DS.brand}25` : `${DS.danger}25`, color: c.est_actif ? DS.brand : DS.danger, borderRadius: DS.pill, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>
                        {c.plan_abonnement || "gratuit"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleCommercant(c)} style={{ flex: 1, background: c.est_actif ? "rgba(239,68,68,.12)" : DS.brand, border: c.est_actif ? `1px solid rgba(239,68,68,.2)` : "none", borderRadius: DS.md, padding: "8px", fontSize: 12, fontWeight: 700, color: c.est_actif ? DS.danger : "#fff", cursor: "pointer" }}>
                      {c.est_actif ? "Désactiver" : "Activer"}
                    </button>
                    {!c.est_verifie && (
                      <button onClick={() => Commercant.update(c.id, { est_verifie: true }).then(() => setCommercants(p => p.map(x => x.id === c.id ? { ...x, est_verifie: true } : x)))} style={{ flex: 1, background: DS.success, border: "none", borderRadius: DS.md, padding: "8px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                        Vérifier ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
}

function DemandeCard({ d, onValider }) {
  const cfg = {
    en_attente: { col: DS.warning, label: "En attente" },
    approuve:   { col: DS.success, label: "Approuvée" },
    refuse:     { col: DS.danger,  label: "Refusée" },
  };
  const { col, label } = cfg[d.statut] || { col: DS.ink40, label: d.statut };
  return (
    <div style={{ background: DS.darkCard, borderRadius: DS.lg, padding: 16, marginBottom: 12, border: `1px solid ${DS.darkBorder}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: DS.white, marginBottom: 2 }}>{d.nom_commerce}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{d.categorie} · {d.ville}</div>
          {d.email_contact && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{d.email_contact}</div>}
        </div>
        <div style={{ background: `${col}25`, color: col, borderRadius: DS.pill, padding: "4px 12px", fontSize: 10, fontWeight: 800, flexShrink: 0, marginLeft: 10 }}>
          {label}
        </div>
      </div>
      {d.description && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 12, lineHeight: 1.7 }}>
          {d.description.slice(0, 120)}{d.description.length > 120 ? "…" : ""}
        </div>
      )}
      {d.statut === "en_attente" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onValider(d.id, "approuve")} style={{ flex: 1, background: DS.success, border: "none", borderRadius: DS.md, padding: "10px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            ✅ Approuver
          </button>
          <button onClick={() => onValider(d.id, "refuse")} style={{ flex: 1, background: "rgba(239,68,68,.12)", border: `1px solid rgba(239,68,68,.25)`, borderRadius: DS.md, padding: "10px", fontSize: 13, fontWeight: 700, color: DS.danger, cursor: "pointer" }}>
            ❌ Refuser
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <div style={{ color: "rgba(255,255,255,.3)", fontSize: 15, fontWeight: 600 }}>{text}</div>
    </div>
  );
}