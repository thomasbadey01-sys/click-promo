import { useState, useEffect } from "react";
import { Offre, Commercant, Abonnement } from "@/api/entities";
import { DS, CPLogo } from "./Home";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      const [offres, commercants, abonnements] = await Promise.all([
        Offre.list(),
        Commercant.list().catch(() => []),
        Abonnement.list().catch(() => [])
      ]);

      const abosActifs = abonnements.filter(a => a.statut === "active");
      const mrr = abosActifs.reduce((s, a) => s + (a.montant_mensuel || 0), 0);
      const arr = mrr * 12;

      const parPlan = {};
      abosActifs.forEach(a => {
        parPlan[a.plan] = (parPlan[a.plan] || 0) + 1;
      });

      setStats({
        offres, commercants, abonnements, abosActifs,
        mrr, arr,
        nbOffresActives: offres.filter(o => o.est_active).length,
        totalVues: offres.reduce((s, o) => s + (o.nb_vues || 0), 0),
        totalConv: offres.reduce((s, o) => s + (o.nb_conversions || 0), 0),
        parPlan,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0d0d", gap: 16 }}>
      <CPLogo size={52} white />
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #333", borderTop: `3px solid ${DS.primary}`, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const { mrr, arr, nbOffresActives, totalVues, totalConv, abosActifs, parPlan, offres } = stats;
  const OBJECTIF_MRR = 5000;
  const pctMrr = Math.min((mrr / OBJECTIF_MRR) * 100, 100);

  const projections = [
    { label: "50 commerçants Pro", mrr: 50 * 79, color: DS.primary },
    { label: "100 commerçants Pro", mrr: 100 * 79, color: "#AF52DE" },
    { label: "Mix optimal", mrr: 40 * 29 + 50 * 79 + 10 * 149, color: DS.success },
  ];

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d0d0d, #1a0800)", padding: "52px 16px 18px", borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <CPLogo size={32} white />
          <div>
            <div style={{ color: "white", fontSize: 17, fontWeight: 900 }}>Admin — Click & Promo</div>
            <div style={{ color: "#666", fontSize: 11 }}>Dashboard interne</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "#1a1a1a", borderRadius: DS.radius.md, padding: 4 }}>
          {[{ key: "overview", label: "📊 Vue d'ensemble" }, { key: "revenue", label: "💰 Revenue" }, { key: "offres", label: "🏷️ Offres" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, background: tab === t.key ? DS.primary : "transparent",
              color: "white", border: "none", borderRadius: DS.radius.sm,
              padding: "9px 4px", fontSize: 11, fontWeight: tab === t.key ? 700 : 400, cursor: "pointer",
              transition: "all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 60px" }}>

        {/* ======= OVERVIEW ======= */}
        {tab === "overview" && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "MRR", val: `${mrr.toFixed(0)}€`, sub: "Revenus mensuels récurrents", color: DS.primary },
                { label: "ARR", val: `${arr.toFixed(0)}€`, sub: "Revenus annuels projetés", color: "#AF52DE" },
                { label: "Abonnés actifs", val: abosActifs.length, sub: "Commerçants payants", color: DS.success },
                { label: "Offres actives", val: nbOffresActives, sub: `${offres.length} total`, color: "#007AFF" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1a1a1a", borderRadius: DS.radius.lg, padding: 14, border: "1px solid #2a2a2a" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: -0.5 }}>{s.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Objectif MRR */}
            <div style={{ background: "#1a1a1a", borderRadius: DS.radius.lg, padding: 16, marginBottom: 14, border: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#ccc", fontWeight: 700, fontSize: 13 }}>🎯 Objectif MRR</span>
                <span style={{ color: DS.primary, fontWeight: 900, fontSize: 13 }}>{mrr.toFixed(0)}€ / {OBJECTIF_MRR}€</span>
              </div>
              <div style={{ background: "#2a2a2a", borderRadius: DS.radius.full, height: 10, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ background: DS.gradient, height: "100%", borderRadius: DS.radius.full, width: `${pctMrr}%`, transition: "width 1.5s", boxShadow: `0 0 12px ${DS.primary}88` }} />
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>{pctMrr.toFixed(1)}% de l'objectif mensuel atteint</div>
            </div>

            {/* Stats globales */}
            <div style={{ background: "#1a1a1a", borderRadius: DS.radius.lg, padding: 16, border: "1px solid #2a2a2a", marginBottom: 14 }}>
              <div style={{ color: "#ccc", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📈 Engagement</div>
              {[
                { label: "Total vues", val: totalVues.toLocaleString(), icon: "👁️" },
                { label: "Total conversions", val: totalConv, icon: "🎁" },
                { label: "Taux conv.", val: totalVues > 0 ? `${((totalConv / totalVues) * 100).toFixed(2)}%` : "0%", icon: "📊" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid #222" : "none" }}>
                  <span style={{ color: "#888", fontSize: 13 }}>{r.icon} {r.label}</span>
                  <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Plans */}
            {Object.keys(parPlan).length > 0 && (
              <div style={{ background: "#1a1a1a", borderRadius: DS.radius.lg, padding: 16, border: "1px solid #2a2a2a" }}>
                <div style={{ color: "#ccc", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>💳 Répartition des plans</div>
                {Object.entries(parPlan).map(([plan, count]) => (
                  <div key={plan} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #222" }}>
                    <span style={{ color: "#888", fontSize: 13, textTransform: "capitalize" }}>Plan {plan}</span>
                    <span style={{ color: DS.primary, fontWeight: 700 }}>{count} abonné{count > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ======= REVENUE ======= */}
        {tab === "revenue" && (
          <>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 14 }}>
              Projections de revenus selon différents scénarios de croissance.
            </div>
            {projections.map((p, i) => (
              <div key={i} style={{ background: "#1a1a1a", borderRadius: DS.radius.lg, padding: 16, marginBottom: 10, border: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>{p.label}</span>
                  <span style={{ color: p.color, fontWeight: 900, fontSize: 18 }}>{p.mrr.toLocaleString()}€/m</span>
                </div>
                <div style={{ background: "#2a2a2a", borderRadius: DS.radius.full, height: 6 }}>
                  <div style={{ background: `linear-gradient(90deg, ${p.color}99, ${p.color})`, height: "100%", borderRadius: DS.radius.full, width: `${Math.min((p.mrr / 15000) * 100, 100)}%` }} />
                </div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 5 }}>ARR estimé : {(p.mrr * 12).toLocaleString()}€</div>
              </div>
            ))}

            <div style={{ background: `linear-gradient(135deg, ${DS.primary}22, ${DS.secondary}11)`, borderRadius: DS.radius.lg, padding: 16, marginTop: 14, border: `1px solid ${DS.primary}33` }}>
              <div style={{ color: DS.primary, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>💡 Breakeven estimé</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>
                Avec 15 commerçants Pro (79€) = 1 185€/mois<br />
                Infrastructure Base44 = ~50€/mois<br />
                <strong style={{ color: "white" }}>→ Rentable dès le 1er mois avec 20 commerçants</strong>
              </div>
            </div>
          </>
        )}

        {/* ======= OFFRES ======= */}
        {tab === "offres" && (
          <>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 14 }}>
              {offres.filter(o => o.est_active).length} actives · {offres.filter(o => !o.est_active).length} inactives
            </div>
            {offres.sort((a, b) => (b.nb_vues || 0) - (a.nb_vues || 0)).slice(0, 20).map(o => (
              <div key={o.id} style={{ background: "#1a1a1a", borderRadius: DS.radius.md, padding: 12, marginBottom: 8, border: "1px solid #222", display: "flex", gap: 10, alignItems: "center" }}>
                <img src={o.image_url} alt="" style={{ width: 44, height: 44, borderRadius: DS.radius.sm, objectFit: "cover", flexShrink: 0 }}
                  onError={e => e.target.style.display = "none"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "white", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                  <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>{o.ville} · {o.nb_vues || 0} vues · {o.nb_conversions || 0} conv.</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: DS.primary }}>-{o.valeur_reduction}%</div>
                  <div style={{ fontSize: 10, color: o.est_active ? DS.success : "#555" }}>{o.est_active ? "● actif" : "○ inactif"}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
