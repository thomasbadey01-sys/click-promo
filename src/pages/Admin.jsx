import { useState, useEffect } from "react";
import { Offre, CommandeCommission, Abonnement, DemandeCommercant, Commercant } from "@/api/entities";
import { DS, Ic, CPLogo } from "./theme";

const IcCheck = (c=DS.success,s=16) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IcX = (c=DS.danger,s=16) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcClock = (c="#F59E0B",s=16) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcEye = (c=DS.brand,s=15) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcTrend = (c=DS.success,s=16) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

const JOURS = ["lun","mar","mer","jeu","ven","sam","dim"];
const JOURS_L = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const CAT_EMOJI = { "Restaurant":"🍽️","Boutique":"👗","Beauté & Coiffure":"💅","Fitness & Sport":"💪","Services":"🔧","Épicerie":"🛒","Pharmacie":"💊","Autre":"🏪" };

export default function Admin() {
  const [offres, setOffres] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [abos, setAbos] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("demandes");
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [noteAdmin, setNoteAdmin] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatut, setFilterStatut] = useState("en_attente");

  const loadAll = () => Promise.all([
    Offre.list(),
    CommandeCommission.list().catch(() => []),
    Abonnement.list().catch(() => []),
    DemandeCommercant.list().catch(() => []),
  ]).then(([o, c, a, d]) => {
    setOffres(o); setCommandes(c); setAbos(a); setDemandes(d); setLoading(false);
  });

  useEffect(() => { loadAll(); }, []);

  // Stats
  const abosActifs = abos.filter(a => a.statut === "active");
  const mrrAbos = abosActifs.reduce((s, a) => s + (a.montant_mensuel || 0), 0);
  const commandesPaid = commandes.filter(c => c.statut === "paid");
  const totalCommissions = commandesPaid.reduce((s, c) => s + (c.montant_commission || 0), 0);
  const mrrTotal = mrrAbos + totalCommissions;
  const nbActives = offres.filter(o => o.est_active).length;
  const nbOnline = offres.filter(o => o.achat_en_ligne && o.est_active).length;
  const totalVues = offres.reduce((s, o) => s + (o.nb_vues || 0), 0);
  const totalConv = offres.reduce((s, o) => s + (o.nb_conversions || 0), 0);
  const OBJECTIF = 5000;
  const pctObj = Math.min((mrrTotal / OBJECTIF) * 100, 100);
  const parPlan = {};
  abosActifs.forEach(a => { parPlan[a.plan] = (parPlan[a.plan] || 0) + 1; });

  // Demandes stats
  const nbAttente = demandes.filter(d => d.statut === "en_attente").length;
  const nbAcceptes = demandes.filter(d => d.statut === "accepte").length;
  const nbRefuses = demandes.filter(d => d.statut === "refuse").length;

  const demandesFiltrees = demandes
    .filter(d => filterStatut === "all" ? true : d.statut === filterStatut)
    .sort((a, b) => new Date(b.date_soumission || b.created_date) - new Date(a.date_soumission || a.created_date));

  // Scorecard d'une demande
  const scoreChecklist = (d) => {
    const items = [
      d.checklist_siret_ok,
      d.checklist_adresse_ok,
      d.checklist_description_ok,
      d.checklist_horaires_ok,
      !!d.email_pro,
      !!d.telephone,
      !!(d.description?.length >= 80),
    ];
    return items.filter(Boolean).length;
  };

  // Accepter une demande → crée le Commercant + met statut accepte
  const accepter = async (d) => {
    setActionLoading("accepter_" + d.id);
    try {
      // 1. Créer le commerçant officiel
      await Commercant.create({
        nom: d.nom_commerce,
        description: d.description,
        categorie: d.categorie,
        adresse: d.adresse,
        ville: d.ville,
        code_postal: d.code_postal,
        latitude: d.latitude || null,
        longitude: d.longitude || null,
        telephone: d.telephone,
        email: d.email_pro,
        est_verifie: true,
        est_actif: true,
        abonnement: "gratuit",
        user_id: d.user_id || null,
        horaires_lun: d.horaires_lun,
        horaires_mar: d.horaires_mar,
        horaires_mer: d.horaires_mer,
        horaires_jeu: d.horaires_jeu,
        horaires_ven: d.horaires_ven,
        horaires_sam: d.horaires_sam,
        horaires_dim: d.horaires_dim,
      });
      // 2. Mettre à jour la demande
      await DemandeCommercant.update(d.id, {
        statut: "accepte",
        note_admin: noteAdmin || "Dossier validé ✅",
        date_decision: new Date().toISOString(),
      });
      setDemandes(prev => prev.map(x => x.id === d.id ? { ...x, statut: "accepte" } : x));
      setSelectedDemande(null);
      setNoteAdmin("");
    } catch (e) { alert("Erreur : " + e.message); }
    setActionLoading(null);
  };

  const refuser = async (d) => {
    if (!noteAdmin.trim()) { alert("Ajoutez un motif de refus avant de refuser."); return; }
    setActionLoading("refuser_" + d.id);
    try {
      await DemandeCommercant.update(d.id, {
        statut: "refuse",
        note_admin: noteAdmin,
        date_decision: new Date().toISOString(),
      });
      setDemandes(prev => prev.map(x => x.id === d.id ? { ...x, statut: "refuse" } : x));
      setSelectedDemande(null);
      setNoteAdmin("");
    } catch (e) { alert("Erreur : " + e.message); }
    setActionLoading(null);
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: DS.ink, gap: 16 }}>
      <CPLogo size={44} inverted />
      <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2.5px solid rgba(255,255,255,.1)`, borderTop: `2.5px solid ${DS.brand}`, animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── MODAL DÉTAIL DEMANDE ──
  if (selectedDemande) {
    const d = selectedDemande;
    const score = scoreChecklist(d);
    const scoreCol = score >= 6 ? DS.success : score >= 4 ? "#F59E0B" : DS.danger;

    return (
      <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>
        <header style={{ background: "#0A0A0A", padding: "52px 16px 14px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { setSelectedDemande(null); setNoteAdmin(""); }} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: DS.sm, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: DS.white }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div>
              <div style={{ color: DS.white, fontSize: 16, fontWeight: 800 }}>Dossier commerçant</div>
              <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>{d.nom_commerce}</div>
            </div>
            {/* Score */}
            <div style={{ marginLeft: "auto", background: `${scoreCol}20`, borderRadius: DS.pill, padding: "4px 12px" }}>
              <span style={{ color: scoreCol, fontSize: 13, fontWeight: 800 }}>{score}/7</span>
            </div>
          </div>
        </header>

        <div style={{ padding: "14px 14px 120px" }}>

          {/* Statut */}
          <div style={{ marginBottom: 12 }}>
            {d.statut === "en_attente" && <div style={{ background: "#F59E0B20", border: "1px solid #F59E0B44", borderRadius: DS.md, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>{IcClock()}<span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 13 }}>En attente de décision</span></div>}
            {d.statut === "accepte" && <div style={{ background: `${DS.success}20`, border: `1px solid ${DS.success}44`, borderRadius: DS.md, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>{IcCheck()}<span style={{ color: DS.success, fontWeight: 700, fontSize: 13 }}>Dossier accepté — Commerce créé ✅</span></div>}
            {d.statut === "refuse" && <div style={{ background: `${DS.danger}15`, border: `1px solid ${DS.danger}44`, borderRadius: DS.md, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>{IcX()}<span style={{ color: DS.danger, fontWeight: 700, fontSize: 13 }}>Dossier refusé</span></div>}
          </div>

          {/* Checklist auto */}
          <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>✅ Checklist automatique</div>
            {[
              { label: "SIRET 14 chiffres valide", ok: d.checklist_siret_ok },
              { label: "Adresse complète", ok: d.checklist_adresse_ok },
              { label: "Description ≥ 80 caractères", ok: d.checklist_description_ok },
              { label: "Horaires renseignés", ok: d.checklist_horaires_ok },
              { label: "Email professionnel", ok: !!d.email_pro },
              { label: "Téléphone renseigné", ok: !!d.telephone },
              { label: "Description complète (vérif. taille)", ok: d.description?.length >= 80 },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 6 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.ok ? `${DS.success}20` : `${DS.danger}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {c.ok ? IcCheck(DS.success, 10) : IcX(DS.danger, 10)}
                </div>
                <span style={{ fontSize: 12, color: c.ok ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.35)", fontWeight: c.ok ? 600 : 400 }}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* Infos commerce */}
          <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🏪 Commerce</div>
            {[
              ["Nom", d.nom_commerce],
              ["Catégorie", `${CAT_EMOJI[d.categorie] || ""} ${d.categorie}`],
              ["Adresse", `${d.adresse}, ${d.code_postal} ${d.ville}`],
              ["Téléphone", d.telephone],
              ["Email", d.email_pro],
              ["Site web", d.site_web || "—"],
              ["Instagram", d.instagram || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.04)", gap: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)", textAlign: "right", wordBreak: "break-all" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Gérant */}
          <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>👤 Gérant</div>
            {[
              ["Nom complet", `${d.prenom_gerant} ${d.nom_gerant}`],
              ["SIRET", d.siret],
              ["Année création", d.annee_creation],
              ["Employés", d.nb_employes],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.04)", gap: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)", fontFamily: k === "SIRET" ? "monospace" : DS.font }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📝 Description</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6, margin: 0 }}>{d.description}</p>
            {d.motivation && <>
              <div style={{ color: "rgba(255,255,255,.5)", fontWeight: 700, fontSize: 12, margin: "12px 0 6px", textTransform: "uppercase", letterSpacing: 0.6 }}>Motivation</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6, margin: 0 }}>{d.motivation}</p>
            </>}
          </div>

          {/* Horaires */}
          <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🕐 Horaires</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {JOURS.map((j, i) => {
                const h = d[`horaires_${j}`];
                const ferme = !h || h === "Fermé";
                return (
                  <div key={j} style={{ background: "rgba(255,255,255,.04)", borderRadius: DS.sm, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 2 }}>{JOURS_L[i]}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: ferme ? "rgba(255,255,255,.2)" : DS.success }}>{ferme ? "Fermé" : h}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date soumission */}
          {d.date_soumission && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", textAlign: "center", marginBottom: 10 }}>
              Soumis le {new Date(d.date_soumission).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}

          {/* Note admin existante */}
          {d.note_admin && d.statut !== "en_attente" && (
            <div style={{ background: `${DS.brand}15`, borderRadius: DS.md, padding: 12, marginBottom: 12, border: `1px solid ${DS.brand}30` }}>
              <div style={{ fontSize: 11, color: DS.brand, fontWeight: 700, marginBottom: 4 }}>Note admin</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{d.note_admin}</div>
            </div>
          )}

          {/* Actions (si en attente) */}
          {d.statut === "en_attente" && (
            <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>💬 Note admin (facultative pour accepter, obligatoire pour refuser)</div>
              <textarea
                value={noteAdmin}
                onChange={e => setNoteAdmin(e.target.value)}
                placeholder="Ex: Dossier complet, bon profil. / Manque informations légales..."
                rows={3}
                style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: DS.md, padding: "10px 12px", fontSize: 13, color: DS.white, fontFamily: DS.font, outline: "none", resize: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={() => accepter(d)}
                  disabled={!!actionLoading}
                  style={{ flex: 1, background: DS.success, color: DS.white, border: "none", borderRadius: DS.md, padding: "13px", fontSize: 14, fontWeight: 700, cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading ? 0.6 : 1 }}>
                  {actionLoading === "accepter_" + d.id ? "…" : <>{IcCheck(DS.white, 14)} Accepter</>}
                </button>
                <button
                  onClick={() => refuser(d)}
                  disabled={!!actionLoading}
                  style={{ flex: 1, background: `${DS.danger}20`, color: DS.danger, border: `1.5px solid ${DS.danger}44`, borderRadius: DS.md, padding: "13px", fontSize: 14, fontWeight: 700, cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading ? 0.6 : 1 }}>
                  {actionLoading === "refuser_" + d.id ? "…" : <>{IcX(DS.danger, 14)} Refuser</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <header style={{ background: "#0A0A0A", padding: "52px 16px 14px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <CPLogo size={32} inverted />
          <div>
            <div style={{ color: DS.white, fontSize: 17, fontWeight: 800, letterSpacing: -.4 }}>Admin</div>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>Tableau de bord interne</div>
          </div>
          {nbAttente > 0 && (
            <div style={{ marginLeft: "auto", background: "#F59E0B", borderRadius: DS.pill, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: DS.white, fontSize: 11, fontWeight: 800 }}>{nbAttente}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,.05)", borderRadius: DS.md, padding: 4, gap: 3 }}>
          {[{ k: "demandes", l: "Demandes" }, { k: "revenus", l: "Revenus" }, { k: "commissions", l: "Commissions" }, { k: "offres", l: "Offres" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: tab === t.k ? DS.brand : "transparent", color: DS.white, border: "none", borderRadius: DS.sm, padding: "9px 2px", fontSize: 11, fontWeight: tab === t.k ? 700 : 400, cursor: "pointer", fontFamily: DS.font, transition: "all .2s", position: "relative" }}>
              {t.l}
              {t.k === "demandes" && nbAttente > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, background: "#F59E0B", borderRadius: "50%" }} />}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: "14px 14px 60px" }}>

        {/* ── DEMANDES COMMERÇANTS ── */}
        {tab === "demandes" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "En attente", val: nbAttente, col: "#F59E0B" },
                { label: "Acceptés", val: nbAcceptes, col: DS.success },
                { label: "Refusés", val: nbRefuses, col: DS.danger },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1A1A1A", borderRadius: DS.md, padding: 12, border: "1px solid rgba(255,255,255,.06)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filtres */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
              {[{ v: "en_attente", l: "⏳ En attente" }, { v: "accepte", l: "✅ Acceptés" }, { v: "refuse", l: "❌ Refusés" }, { v: "all", l: "Tous" }].map(f => (
                <button key={f.v} onClick={() => setFilterStatut(f.v)} style={{ background: filterStatut === f.v ? DS.brand : "rgba(255,255,255,.06)", color: DS.white, border: "none", borderRadius: DS.pill, padding: "7px 14px", fontSize: 12, fontWeight: filterStatut === f.v ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {f.l}
                </button>
              ))}
            </div>

            {/* Liste */}
            {demandesFiltrees.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.3)" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                <div style={{ fontSize: 14 }}>Aucune demande {filterStatut === "en_attente" ? "en attente" : ""}</div>
              </div>
            ) : (
              demandesFiltrees.map(d => {
                const score = scoreChecklist(d);
                const scoreCol = score >= 6 ? DS.success : score >= 4 ? "#F59E0B" : DS.danger;
                const statusConf = {
                  en_attente: { col: "#F59E0B", label: "En attente", icon: IcClock("#F59E0B", 12) },
                  accepte: { col: DS.success, label: "Accepté", icon: IcCheck(DS.success, 12) },
                  refuse: { col: DS.danger, label: "Refusé", icon: IcX(DS.danger, 12) },
                }[d.statut] || {};

                return (
                  <div key={d.id} onClick={() => setSelectedDemande(d)} style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, marginBottom: 10, border: d.statut === "en_attente" ? "1px solid #F59E0B30" : "1px solid rgba(255,255,255,.06)", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 16 }}>{CAT_EMOJI[d.categorie] || "🏪"}</span>
                          <span style={{ color: DS.white, fontWeight: 700, fontSize: 14 }}>{d.nom_commerce}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{d.prenom_gerant} {d.nom_gerant} · {d.ville}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${statusConf.col}20`, borderRadius: DS.pill, padding: "3px 8px" }}>
                          {statusConf.icon}
                          <span style={{ fontSize: 10, fontWeight: 700, color: statusConf.col }}>{statusConf.label}</span>
                        </div>
                        <div style={{ background: `${scoreCol}20`, borderRadius: DS.pill, padding: "2px 8px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: scoreCol }}>{score}/7</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {d.checklist_siret_ok && <span style={{ fontSize: 10, background: `${DS.success}15`, color: DS.success, borderRadius: DS.pill, padding: "2px 7px" }}>✓ SIRET</span>}
                      {d.checklist_description_ok && <span style={{ fontSize: 10, background: `${DS.success}15`, color: DS.success, borderRadius: DS.pill, padding: "2px 7px" }}>✓ Description</span>}
                      {d.checklist_horaires_ok && <span style={{ fontSize: 10, background: `${DS.success}15`, color: DS.success, borderRadius: DS.pill, padding: "2px 7px" }}>✓ Horaires</span>}
                      {!d.checklist_siret_ok && <span style={{ fontSize: 10, background: `${DS.danger}15`, color: DS.danger, borderRadius: DS.pill, padding: "2px 7px" }}>✗ SIRET</span>}
                    </div>
                    {d.date_soumission && (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", marginTop: 8 }}>
                        Soumis {new Date(d.date_soumission).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* CTA inscription */}
            <div style={{ background: `linear-gradient(135deg,${DS.brand}20,transparent)`, borderRadius: DS.lg, padding: 14, marginTop: 10, border: `1px solid ${DS.brand}30` }}>
              <div style={{ color: DS.brand, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: .8, marginBottom: 6 }}>Formulaire public</div>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>Partagez ce lien aux commerçants qui souhaitent rejoindre Click & Promo :</div>
              <div style={{ background: "rgba(255,255,255,.06)", borderRadius: DS.sm, padding: "8px 12px", fontFamily: "monospace", fontSize: 11, color: DS.brand, wordBreak: "break-all" }}>
                /InscriptionCommercant
              </div>
            </div>
          </>
        )}

        {/* ── REVENUS ── */}
        {tab === "revenus" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "MRR Total", val: `${mrrTotal.toFixed(0)}€`, sub: "Abos + commissions", col: DS.brand },
                { label: "ARR projeté", val: `${(mrrTotal * 12).toFixed(0)}€`, sub: "Annuel estimé", col: "#7C3AED" },
                { label: "Abonnés actifs", val: abosActifs.length, sub: "Commerçants payants", col: DS.success },
                { label: "Commissions", val: `${totalCommissions.toFixed(2)}€`, sub: `${commandesPaid.length} ventes`, col: "#F59E0B" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.col, letterSpacing: -.5, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 16, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13 }}>Objectif MRR</span>
                <span style={{ color: DS.brand, fontWeight: 900, fontSize: 13 }}>{mrrTotal.toFixed(0)}€ / {OBJECTIF}€</span>
              </div>
              <div style={{ background: "rgba(255,255,255,.06)", borderRadius: DS.pill, height: 8, marginBottom: 7 }}>
                <div style={{ background: DS.brand, height: "100%", borderRadius: DS.pill, width: `${pctObj}%`, transition: "width 1.2s", boxShadow: `0 0 10px ${DS.brand}66` }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{pctObj.toFixed(1)}% atteint</div>
            </div>
            <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 16, marginBottom: 10, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Sources de revenus</div>
              {[
                { label: "Abonnements commerçants", val: `${mrrAbos.toFixed(0)}€/mois`, col: DS.brand, pct: mrrTotal > 0 ? (mrrAbos / mrrTotal) * 100 : 0 },
                { label: "Commissions ventes", val: `${totalCommissions.toFixed(2)}€`, col: "#F59E0B", pct: mrrTotal > 0 ? (totalCommissions / mrrTotal) * 100 : 0 },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: i === 0 ? 12 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.col }}>{r.val}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.06)", borderRadius: DS.pill, height: 4 }}>
                    <div style={{ background: r.col, height: "100%", borderRadius: DS.pill, width: `${Math.min(r.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(parPlan).length > 0 && (
              <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 16, border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Répartition des plans</div>
                {Object.entries(parPlan).map(([plan, count]) => (
                  <div key={plan} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textTransform: "capitalize" }}>Plan {plan}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: DS.brand }}>{count} abonné{count > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: `linear-gradient(135deg,${DS.brand}18,transparent)`, borderRadius: DS.lg, padding: 16, marginTop: 10, border: `1px solid ${DS.brand}22` }}>
              <div style={{ color: DS.brand, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: .8, marginBottom: 8 }}>Analyse rentabilité</div>
              <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, lineHeight: 1.8 }}>
                15 commerçants Pro → 1 185€/mois<br />
                Infrastructure → ~50€/mois<br />
                <strong style={{ color: DS.white }}>Breakeven dès 15 commerçants Pro</strong>
              </div>
            </div>
          </>
        )}

        {/* ── COMMISSIONS ── */}
        {tab === "commissions" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#F59E0B", letterSpacing: -.5 }}>{totalCommissions.toFixed(2)}€</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Total commissions</div>
              </div>
              <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: DS.success, letterSpacing: -.5 }}>{commandesPaid.length}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Ventes réalisées</div>
              </div>
              <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: DS.brand, letterSpacing: -.5 }}>{nbOnline}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Offres en ligne actives</div>
              </div>
              <div style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#7C3AED", letterSpacing: -.5 }}>{commandesPaid.length > 0 ? (totalCommissions / commandesPaid.length).toFixed(2) : "0.00"}€</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Commission moy./vente</div>
              </div>
            </div>
            {commandes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.25)", fontSize: 13 }}>Aucune transaction pour l'instant</div>
            ) : (
              commandes.slice(0, 20).map((c, i) => (
                <div key={i} style={{ background: "#1A1A1A", borderRadius: DS.md, padding: 12, marginBottom: 8, border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 600 }}>{c.offre_titre}</span>
                    <span style={{ color: c.statut === "paid" ? DS.success : "#F59E0B", fontSize: 11, fontWeight: 700 }}>{c.statut}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>{c.commercant_nom}</span>
                    <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700 }}>+{(c.montant_commission || 0).toFixed(2)}€</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── OFFRES ── */}
        {tab === "offres" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Offres actives", val: nbActives, col: DS.success },
                { label: "Total offres", val: offres.length, col: DS.brand },
                { label: "Total vues", val: totalVues.toLocaleString(), col: "#7C3AED" },
                { label: "Conversions", val: totalConv, col: "#F59E0B" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1A1A1A", borderRadius: DS.lg, padding: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.col, letterSpacing: -.5, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {offres.slice(0, 20).map((o, i) => (
              <div key={i} style={{ background: "#1A1A1A", borderRadius: DS.md, padding: 12, marginBottom: 8, border: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{o.titre}</div>
                  <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>{o.commercant_nom} · {o.ville}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: o.est_active ? DS.success : DS.danger, fontSize: 11, fontWeight: 700 }}>{o.est_active ? "Active" : "Inactive"}</div>
                  <div style={{ color: "rgba(255,255,255,.3)", fontSize: 10 }}>{o.nb_vues || 0} vues</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
