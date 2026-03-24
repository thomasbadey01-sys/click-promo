import { useState, useEffect } from "react";
import { Abonnement } from "../api/entities";
import { Link } from "react-router-dom";

const PLAN_PRIX = { starter: 29, pro: 79, business: 149, premium: 9.99 };
const PLAN_LABEL = { starter: "Starter", pro: "Pro", business: "Business", premium: "Premium User" };
const PLAN_COLOR = { starter: "#34C759", pro: "#FF6B00", business: "#AF52DE", premium: "#FFD700" };

function MRRChart({ abonnements }) {
  // Grouper par mois
  const byMonth = {};
  abonnements.filter(a => a.statut === "actif").forEach(a => {
    const d = new Date(a.date_debut);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    byMonth[key] = (byMonth[key] || 0) + (PLAN_PRIX[a.plan] || 0);
  });
  const months = Object.keys(byMonth).sort().slice(-6);
  if (!months.length) return null;
  const max = Math.max(...months.map(m => byMonth[m]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginTop: 10 }}>
      {months.map(m => (
        <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: "#FF6B00", borderRadius: "4px 4px 0 0", height: `${(byMonth[m]/max)*52}px`, minHeight: 4 }} />
          <div style={{ fontSize: 9, color: "#aaa" }}>{m.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    Abonnement.list().then(data => { setAbonnements(data); setLoading(false); });
  }, []);

  const actifs = abonnements.filter(a => a.statut === "actif");
  const mrr = actifs.reduce((s, a) => s + (PLAN_PRIX[a.plan] || 0), 0);
  const arr = mrr * 12;
  const commercants = actifs.filter(a => a.type_abonne === "commercant").length;
  const users = actifs.filter(a => a.type_abonne === "user").length;
  const churn = abonnements.filter(a => a.statut === "annulé").length;
  const churnRate = abonnements.length > 0 ? ((churn / abonnements.length) * 100).toFixed(1) : "0.0";

  // Distribution des plans
  const planDist = {};
  actifs.forEach(a => { planDist[a.plan] = (planDist[a.plan]||0)+1; });

  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f3460, #1a1a2e)", padding: "52px 20px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,107,0,0.15)" }} />
        <Link to="/Feed"><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 10 }}>← App</div></Link>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Administration</div>
        <div style={{ color: "white", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>💰 Revenus & Abonnés</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{key:"overview",label:"Vue globale"},{key:"abonnes",label:"Abonnés"},{key:"plans",label:"Plans"}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex:1, background: tab===t.key?"#FF6B00":"rgba(255,255,255,0.1)", color:"white", border:"none", borderRadius:10, padding:"8px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 80px" }}>
        {loading && <div style={{ textAlign:"center", padding:40, color:"#aaa" }}>Chargement...</div>}

        {/* OVERVIEW */}
        {!loading && tab === "overview" && (
          <>
            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { icon:"💶", val:`${mrr.toFixed(0)}€`, label:"MRR", sub:"Revenu mensuel récurrent", color:"#34C759" },
                { icon:"📈", val:`${arr.toFixed(0)}€`, label:"ARR", sub:"Revenu annuel projeté", color:"#007AFF" },
                { icon:"🏪", val:commercants, label:"Commerçants", sub:"abonnements actifs", color:"#FF6B00" },
                { icon:"👤", val:users, label:"Users Premium", sub:"abonnements actifs", color:"#AF52DE" },
              ].map((s,i) => (
                <div key={i} style={{ background:"white", borderRadius:14, padding:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#333" }}>{s.label}</div>
                  <div style={{ fontSize:10, color:"#aaa" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* MRR Chart */}
            <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📊 Évolution MRR</div>
              <MRRChart abonnements={abonnements} />
              {!abonnements.length && <div style={{ textAlign:"center", color:"#ccc", fontSize:13, padding:20 }}>Aucun abonnement pour l'instant</div>}
            </div>

            {/* Churn */}
            <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>📉 Taux de churn</div>
                  <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{churn} résiliation{churn>1?"s":""} au total</div>
                </div>
                <div style={{ fontSize:28, fontWeight:900, color:parseFloat(churnRate)>10?"#FF3B30":"#34C759" }}>
                  {churnRate}%
                </div>
              </div>
            </div>

            {/* Lien vers page abonnement */}
            <Link to="/Abonnement" style={{ textDecoration:"none" }}>
              <div style={{ background:"linear-gradient(135deg, #FF6B00, #FF3B30)", borderRadius:14, padding:16, textAlign:"center" }}>
                <div style={{ color:"white", fontWeight:700, fontSize:14 }}>🔗 Voir la page d'abonnement</div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginTop:2 }}>Partager avec vos clients</div>
              </div>
            </Link>
          </>
        )}

        {/* ABONNÉS */}
        {!loading && tab === "abonnes" && (
          <>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>
              {actifs.length} abonné{actifs.length>1?"s":""} actif{actifs.length>1?"s":""}
            </div>

            {abonnements.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", background:"white", borderRadius:14 }}>
                <div style={{ fontSize:48, marginBottom:10 }}>💳</div>
                <div style={{ color:"#666", fontWeight:600 }}>Aucun abonnement</div>
                <div style={{ color:"#aaa", fontSize:13, marginTop:4 }}>Les abonnés apparaîtront ici après paiement</div>
              </div>
            )}

            {abonnements.map(a => (
              <div key={a.id} style={{ background:"white", borderRadius:14, padding:14, marginBottom:10, boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{a.email || "—"}</div>
                    <div style={{ fontSize:12, color:"#aaa", marginTop:1 }}>
                      {a.type_abonne === "commercant" ? "🏪 Commerçant" : "👤 Utilisateur"}
                      {a.nom_commerce ? ` · ${a.nom_commerce}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:PLAN_COLOR[a.plan]||"#FF6B00" }}>
                      {PLAN_PRIX[a.plan]||0}€/mois
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:PLAN_COLOR[a.plan]||"#FF6B00", background:`${PLAN_COLOR[a.plan]||"#FF6B00"}18`, borderRadius:8, padding:"2px 6px", marginTop:2 }}>
                      {PLAN_LABEL[a.plan]||a.plan}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, background: a.statut==="actif"?"#34C75918":"#FF3B3018", color: a.statut==="actif"?"#34C759":"#FF3B30", borderRadius:8, padding:"2px 8px", fontWeight:600 }}>
                    {a.statut==="actif"?"✅ Actif":"❌ Annulé"}
                  </span>
                  <span style={{ fontSize:11, color:"#aaa" }}>
                    Depuis {a.date_debut ? new Date(a.date_debut).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* PLANS */}
        {!loading && tab === "plans" && (
          <>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Distribution des plans</div>
            {Object.keys(PLAN_LABEL).map(planId => {
              const count = planDist[planId] || 0;
              const rev = count * (PLAN_PRIX[planId]||0);
              const pct = actifs.length > 0 ? (count/actifs.length)*100 : 0;
              return (
                <div key={planId} style={{ background:"white", borderRadius:14, padding:14, marginBottom:10, boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:PLAN_COLOR[planId] }}>{PLAN_LABEL[planId]}</div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, fontSize:15, color:"#1a1a1a" }}>{count} abonné{count>1?"s":""}</div>
                      <div style={{ fontSize:12, color:"#34C759", fontWeight:600 }}>{rev.toFixed(0)}€/mois</div>
                    </div>
                  </div>
                  <div style={{ background:"#f2f2f7", borderRadius:6, height:8 }}>
                    <div style={{ background:PLAN_COLOR[planId], height:"100%", borderRadius:6, width:`${Math.min(pct,100)}%`, transition:"width 0.8s" }} />
                  </div>
                  <div style={{ fontSize:11, color:"#aaa", marginTop:4 }}>{pct.toFixed(0)}% des abonnés</div>
                </div>
              );
            })}

            {/* Projection */}
            <div style={{ background:"linear-gradient(135deg,#1a1a2e,#0f3460)", borderRadius:14, padding:16, marginTop:6 }}>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:6 }}>🎯 Objectif 100 commerçants</div>
              {[
                { plan:"starter", target:60, rev:60*29 },
                { plan:"pro", target:30, rev:30*79 },
                { plan:"business", target:10, rev:10*149 },
              ].map((o,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>{PLAN_LABEL[o.plan]} × {o.target}</span>
                  <span style={{ color:"white", fontWeight:700, fontSize:12 }}>{o.rev}€/mois</span>
                </div>
              ))}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600 }}>Total projeté</span>
                <span style={{ color:"#FF6B00", fontWeight:900, fontSize:16 }}>6 110€/mois</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
