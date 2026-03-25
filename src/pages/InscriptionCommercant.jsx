import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DemandeCommercant } from "@/api/entities";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo } from "./theme";

const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const JOURS = ["lun","mar","mer","jeu","ven","sam","dim"];
const JOURS_L = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

const STEPS = [
  { id: 1, title: "Votre commerce", icon: "🏪", desc: "Informations de base" },
  { id: 2, title: "Gérant & légal", icon: "📋", desc: "Identité + SIRET" },
  { id: 3, title: "Description", icon: "✍️", desc: "Présentez-vous" },
  { id: 4, title: "Horaires", icon: "🕐", desc: "Quand êtes-vous ouvert ?" },
  { id: 5, title: "Validation", icon: "✅", desc: "Récapitulatif & envoi" },
];

function IcCheck({ c, s=16 }) { const col = c || "#22C55E"; return <svg width={s} height={s} fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>; }
function IcAlert({ c, s=16 }) { const col = c || "#E53E3E"; return <svg width={s} height={s} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IcShield({ c, s=20 }) { const col = c || "#FF6B35"; return <svg width={s} height={s} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IcStar({ c="#F59E0B", s=14 }) { return <svg width={s} height={s} fill={c} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }

function FieldOk({ ok, msg }) {
  if (!ok && !msg) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 11 }}>
      {ok ? <IcCheck c={DS.success} s={12} /> : <IcAlert c={DS.danger} s={12} />}
      <span style={{ color: ok ? DS.success : DS.danger }}>{msg}</span>
    </div>
  );
}

function validate(step, form) {
  const errs = {};
  if (step === 1) {
    if (!form.nom_commerce?.trim()) errs.nom_commerce = "Nom requis";
    if (!form.categorie) errs.categorie = "Catégorie requise";
    if (!form.adresse?.trim()) errs.adresse = "Adresse requise";
    if (!form.ville?.trim()) errs.ville = "Ville requise";
    if (!form.code_postal || !/^\d{5}$/.test(form.code_postal)) errs.code_postal = "Code postal invalide (5 chiffres)";
    if (!form.telephone || !/^(\+33|0)[0-9]{9}$/.test(form.telephone.replace(/\s/g,""))) errs.telephone = "Téléphone invalide";
    if (!form.email_pro || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email_pro)) errs.email_pro = "Email invalide";
  }
  if (step === 2) {
    if (!form.nom_gerant?.trim()) errs.nom_gerant = "Nom requis";
    if (!form.prenom_gerant?.trim()) errs.prenom_gerant = "Prénom requis";
    if (!form.siret || !/^\d{14}$/.test(form.siret.replace(/\s/g,""))) errs.siret = "SIRET invalide (14 chiffres)";
    if (!form.annee_creation || !/^\d{4}$/.test(form.annee_creation) || parseInt(form.annee_creation) < 1900 || parseInt(form.annee_creation) > 2026) errs.annee_creation = "Année invalide";
    if (!form.nb_employes) errs.nb_employes = "Requis";
  }
  if (step === 3) {
    if (!form.description || form.description.trim().length < 80) errs.description = `Minimum 80 caractères (${form.description?.trim().length || 0}/80)`;
    if (!form.motivation || form.motivation.trim().length < 40) errs.motivation = `Minimum 40 caractères (${form.motivation?.trim().length || 0}/40)`;
  }
  if (step === 4) {
    const ouvert = JOURS.some(j => form[`horaires_${j}`] && form[`horaires_${j}`] !== "Fermé");
    if (!ouvert) errs.horaires = "Indiquez au moins un jour d'ouverture";
  }
  if (step === 5) {
    if (!form.cgu) errs.cgu = "Vous devez accepter les CGV";
    if (!form.charte) errs.charte = "Vous devez accepter la charte qualité";
    if (!form.rgpd) errs.rgpd = "Vous devez accepter la politique RGPD";
  }
  return errs;
}

const HORAIRES_DEFAUT = { lun:"09:00-19:00", mar:"09:00-19:00", mer:"09:00-19:00", jeu:"09:00-19:00", ven:"09:00-19:00", sam:"10:00-18:00", dim:"Fermé" };

export default function InscriptionCommercant() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom_commerce: "", categorie: "", adresse: "", ville: "", code_postal: "",
    telephone: "", email_pro: "", nom_gerant: "", prenom_gerant: "", siret: "",
    annee_creation: "", nb_employes: "", description: "", motivation: "",
    site_web: "", instagram: "",
    horaires_lun: "09:00-19:00", horaires_mar: "09:00-19:00", horaires_mer: "09:00-19:00",
    horaires_jeu: "09:00-19:00", horaires_ven: "09:00-19:00", horaires_sam: "10:00-18:00",
    horaires_dim: "Fermé",
    cgu: false, charte: false, rgpd: false
  });
  const [errs, setErrs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
    if (errs[k]) setErrs(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const next = () => {
    const e = validate(step, form);
    setErrs(e);
    setTouched(Object.fromEntries(Object.keys(form).map(k => [k, true])));
    if (Object.keys(e).length === 0) setStep(s => s + 1);
    else window.scrollTo(0, 0);
  };

  const submit = async () => {
    const e = validate(5, form);
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      let userId = null;
      try { const u = await UserAuth.me(); userId = u?.id; } catch {}
      const siretClean = form.siret.replace(/\s/g, "");
      const checklist_siret_ok = /^\d{14}$/.test(siretClean);
      const checklist_adresse_ok = !!(form.adresse && form.ville && form.code_postal);
      const checklist_photos_ok = false; // pas de photos en v1
      const checklist_description_ok = form.description?.trim().length >= 80;
      const checklist_horaires_ok = JOURS.some(j => form[`horaires_${j}`] && form[`horaires_${j}`] !== "Fermé");

      await DemandeCommercant.create({
        nom_commerce: form.nom_commerce.trim(),
        categorie: form.categorie,
        siret: siretClean,
        adresse: form.adresse.trim(),
        ville: form.ville.trim(),
        code_postal: form.code_postal.trim(),
        telephone: form.telephone.replace(/\s/g, ""),
        email_pro: form.email_pro.trim().toLowerCase(),
        nom_gerant: form.nom_gerant.trim(),
        prenom_gerant: form.prenom_gerant.trim(),
        description: form.description.trim(),
        motivation: form.motivation.trim(),
        site_web: form.site_web?.trim() || null,
        instagram: form.instagram?.trim() || null,
        nb_employes: form.nb_employes,
        annee_creation: form.annee_creation,
        horaires_lun: form.horaires_lun,
        horaires_mar: form.horaires_mar,
        horaires_mer: form.horaires_mer,
        horaires_jeu: form.horaires_jeu,
        horaires_ven: form.horaires_ven,
        horaires_sam: form.horaires_sam,
        horaires_dim: form.horaires_dim,
        statut: "en_attente",
        user_id: userId,
        date_soumission: new Date().toISOString(),
        checklist_siret_ok,
        checklist_adresse_ok,
        checklist_photos_ok,
        checklist_description_ok,
        checklist_horaires_ok,
      });
      setDone(true);
    } catch (err) {
      alert("Erreur : " + (err.message || "Veuillez réessayer"));
    }
    setSubmitting(false);
  };

  const inp = (extra = {}) => ({
    width: "100%", border: `1.5px solid ${DS.ink10}`, borderRadius: DS.md,
    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
    background: DS.white, fontFamily: DS.font, color: DS.ink, transition: "border-color .2s",
    ...extra
  });

  // ── DONE ──
  if (done) return (
    <div style={{ minHeight: "100vh", maxWidth: 430, margin: "0 auto", background: DS.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: DS.font }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${DS.success}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 36 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink, textAlign: "center", marginBottom: 10, letterSpacing: -0.5 }}>Demande envoyée !</div>
      <div style={{ fontSize: 14, color: DS.ink60, textAlign: "center", lineHeight: 1.7, marginBottom: 28 }}>
        Votre dossier est en cours d'examen.<br/>
        Notre équipe vérifie chaque candidature sous <strong>48h ouvrées</strong>.<br/>
        Vous recevrez une réponse à <strong style={{ color: DS.brand }}>{form.email_pro}</strong>.
      </div>
      <div style={{ background: DS.ink05, borderRadius: DS.lg, padding: 16, width: "100%", marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Ce que nous vérifions</div>
        {[
          { label: "Validité du SIRET", ok: true },
          { label: "Adresse et localisation", ok: true },
          { label: "Description du commerce", ok: true },
          { label: "Horaires renseignés", ok: true },
          { label: "Acceptation de la charte", ok: true },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 4 ? `1px solid ${DS.ink10}` : "none" }}>
            {<IcCheck c={DS.success} s={14} />}
            <span style={{ fontSize: 13, color: DS.ink }}>{c.label}</span>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/Feed")} style={{ background: DS.brand, color: DS.white, border: "none", borderRadius: DS.lg, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxShadow: DS.eBrand }}>
        Retour à l'accueil
      </button>
    </div>
  );

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentErrs = validate(step, form);
  const stepValid = Object.keys(currentErrs).length === 0;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 430, margin: "0 auto", background: DS.ink05, fontFamily: DS.font }}>

      {/* Header */}
      <header style={{ background: DS.ink, padding: "48px 16px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: DS.sm, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: DS.white }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ color: DS.white, fontSize: 16, fontWeight: 800, letterSpacing: -0.4 }}>Rejoindre Click & Promo</div>
            <div style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>Étape {step}/{STEPS.length} — {STEPS[step-1].title}</div>
          </div>
          <div style={{ background: `${DS.brand}20`, borderRadius: DS.pill, padding: "4px 10px" }}>
            <span style={{ color: DS.brand, fontSize: 12, fontWeight: 700 }}>{Math.round(progressPct)}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: "rgba(255,255,255,.1)", borderRadius: DS.pill, height: 4 }}>
          <div style={{ background: DS.brand, height: "100%", borderRadius: DS.pill, width: `${progressPct + 20}%`, transition: "width .4s ease", boxShadow: `0 0 8px ${DS.brand}66` }} />
        </div>
        {/* Steps dots */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          {STEPS.map(s => (
            <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.id < step ? DS.success : s.id === step ? DS.brand : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: s.id === step ? `2px solid ${DS.brand}` : "none", transition: "all .3s" }}>
                {s.id < step ? <IcCheck c={DS.white} s={12} /> : <span style={{ fontSize: 10 }}>{s.icon}</span>}
              </div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ padding: "16px 16px 100px" }}>

        {/* ── STEP 1 : Infos commerce ── */}
        {step === 1 && (
          <div>
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: DS.ink, marginBottom: 4 }}>🏪 Votre commerce</div>
              <div style={{ fontSize: 13, color: DS.ink40, marginBottom: 16 }}>Ces informations seront visibles par les utilisateurs</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Nom du commerce *</label>
                <input value={form.nom_commerce} onChange={e => set("nom_commerce", e.target.value)} placeholder="Ex: Boulangerie Martin" style={inp(errs.nom_commerce ? { borderColor: DS.danger } : {})} />
                <FieldOk ok={!errs.nom_commerce && form.nom_commerce.length > 2} msg={errs.nom_commerce || (form.nom_commerce.length > 2 ? "✓ Parfait" : "")} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Catégorie *</label>
                <select value={form.categorie} onChange={e => set("categorie", e.target.value)} style={inp({ appearance: "none", ...(errs.categorie ? { borderColor: "#E53E3E" } : {}) })}>
                  <option value="">Sélectionnez une catégorie</option>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldOk ok={!errs.categorie && !!form.categorie} msg={errs.categorie} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Adresse *</label>
                <input value={form.adresse} onChange={e => set("adresse", e.target.value)} placeholder="12 Rue de la Paix" style={inp(errs.adresse ? { borderColor: DS.danger } : {})} />
                <FieldOk ok={!errs.adresse && form.adresse.length > 5} msg={errs.adresse} />
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Ville *</label>
                  <input value={form.ville} onChange={e => set("ville", e.target.value)} placeholder="Paris" style={inp(errs.ville ? { borderColor: DS.danger } : {})} />
                  <FieldOk ok={!errs.ville && form.ville.length > 1} msg={errs.ville} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Code postal *</label>
                  <input value={form.code_postal} onChange={e => set("code_postal", e.target.value)} placeholder="75001" maxLength={5} style={inp(errs.code_postal ? { borderColor: DS.danger } : {})} />
                  <FieldOk ok={!errs.code_postal && /^\d{5}$/.test(form.code_postal)} msg={errs.code_postal} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Téléphone *</label>
                <input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="06 12 34 56 78" style={inp(errs.telephone ? { borderColor: DS.danger } : {})} />
                <FieldOk ok={!errs.telephone && /^(\+33|0)[0-9]{9}$/.test(form.telephone.replace(/\s/g,""))} msg={errs.telephone || (!form.telephone ? "" : !/^(\+33|0)[0-9]{9}$/.test(form.telephone.replace(/\s/g,"")) ? "" : "✓ Valide")} />
              </div>

              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Email professionnel *</label>
                <input type="email" value={form.email_pro} onChange={e => set("email_pro", e.target.value)} placeholder="contact@moncommerce.fr" style={inp(errs.email_pro ? { borderColor: DS.danger } : {})} />
                <FieldOk ok={!errs.email_pro && /^[^@]+@[^@]+\.[^@]+$/.test(form.email_pro)} msg={errs.email_pro} />
              </div>
            </div>

            {/* Optionnel */}
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink60, marginBottom: 12 }}>Optionnel — mais recommandé</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: DS.ink60, display: "block", marginBottom: 5 }}>Site web</label>
                <input value={form.site_web} onChange={e => set("site_web", e.target.value)} placeholder="https://www.moncommerce.fr" style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: DS.ink60, display: "block", marginBottom: 5 }}>Instagram</label>
                <input value={form.instagram} onChange={e => set("instagram", e.target.value)} placeholder="@moncommerce" style={inp()} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 : Gérant & légal ── */}
        {step === 2 && (
          <div>
            <div style={{ background: `${DS.brand}08`, borderRadius: DS.lg, padding: 14, marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
              {<IcShield c={DS.brand} s={20} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink, marginBottom: 2 }}>Vérification légale</div>
                <div style={{ fontSize: 12, color: DS.ink60, lineHeight: 1.5 }}>Ces informations sont confidentielles et servent uniquement à vérifier l'authenticité de votre établissement. Elles ne sont jamais affichées publiquement.</div>
              </div>
            </div>

            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 14 }}>📋 Identité du gérant</div>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Prénom *</label>
                  <input value={form.prenom_gerant} onChange={e => set("prenom_gerant", e.target.value)} placeholder="Marie" style={inp(errs.prenom_gerant ? { borderColor: DS.danger } : {})} />
                  <FieldOk ok={!errs.prenom_gerant && form.prenom_gerant.length > 1} msg={errs.prenom_gerant} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Nom *</label>
                  <input value={form.nom_gerant} onChange={e => set("nom_gerant", e.target.value)} placeholder="Dupont" style={inp(errs.nom_gerant ? { borderColor: DS.danger } : {})} />
                  <FieldOk ok={!errs.nom_gerant && form.nom_gerant.length > 1} msg={errs.nom_gerant} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Numéro SIRET * <span style={{ fontWeight: 400 }}>(14 chiffres)</span></label>
                <input value={form.siret} onChange={e => set("siret", e.target.value.replace(/[^0-9\s]/g, ""))} placeholder="123 456 789 00012" maxLength={17} style={inp(errs.siret ? { borderColor: DS.danger } : {})} />
                <FieldOk ok={!errs.siret && /^\d{14}$/.test(form.siret.replace(/\s/g,""))} msg={errs.siret || (!form.siret ? "" : /^\d{14}$/.test(form.siret.replace(/\s/g,"")) ? "✓ Format valide" : "")} />
                <div style={{ fontSize: 11, color: DS.ink40, marginTop: 4 }}>Trouvez votre SIRET sur <a href="https://www.infogreffe.fr" target="_blank" style={{ color: DS.brand }}>infogreffe.fr</a></div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Année de création *</label>
                  <input value={form.annee_creation} onChange={e => set("annee_creation", e.target.value.replace(/\D/g,""))} placeholder="2018" maxLength={4} style={inp(errs.annee_creation ? { borderColor: DS.danger } : {})} />
                  <FieldOk ok={!errs.annee_creation && /^\d{4}$/.test(form.annee_creation)} msg={errs.annee_creation} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>Nb. employés *</label>
                  <select value={form.nb_employes} onChange={e => set("nb_employes", e.target.value)} style={inp(errs.nb_employes ? { borderColor: DS.danger } : {})}>
                    <option value="">Choisir</option>
                    {["1","2-5","6-10","11-20","20+"].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <FieldOk ok={!errs.nb_employes && !!form.nb_employes} msg={errs.nb_employes} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Description ── */}
        {step === 3 && (
          <div>
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 14 }}>✍️ Présentez votre commerce</div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>
                  Description publique * <span style={{ fontWeight: 400, color: form.description?.trim().length >= 80 ? DS.success : DS.ink40 }}>({form.description?.trim().length || 0}/80 min)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Décrivez votre commerce, votre ambiance, vos spécialités, ce qui vous rend unique…"
                  rows={5}
                  style={{ ...inp(errs.description ? { borderColor: DS.danger } : {}), resize: "none" }}
                />
                <FieldOk ok={!errs.description && form.description?.trim().length >= 80} msg={errs.description} />
                <div style={{ fontSize: 11, color: DS.ink40, marginTop: 4 }}>Cette description sera visible sur votre profil dans l'app.</div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: DS.ink60, display: "block", marginBottom: 5 }}>
                  Pourquoi rejoindre Click & Promo ? * <span style={{ fontWeight: 400, color: form.motivation?.trim().length >= 40 ? DS.success : DS.ink40 }}>({form.motivation?.trim().length || 0}/40 min)</span>
                </label>
                <textarea
                  value={form.motivation}
                  onChange={e => set("motivation", e.target.value)}
                  placeholder="Expliquez vos objectifs : attirer de nouveaux clients, écouler des stocks, fidéliser…"
                  rows={4}
                  style={{ ...inp(errs.motivation ? { borderColor: DS.danger } : {}), resize: "none" }}
                />
                <FieldOk ok={!errs.motivation && form.motivation?.trim().length >= 40} msg={errs.motivation} />
              </div>
            </div>

            {/* Conseils */}
            <div style={{ background: `${DS.brand}08`, borderRadius: DS.lg, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DS.brand, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.7 }}>💡 Conseils</div>
              {["Soyez précis sur vos spécialités et votre zone", "Mentionnez ce qui vous différencie de la concurrence", "Les commerçants avec une bonne description reçoivent 3x plus de clics"].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, fontSize: 12, color: DS.ink60, alignItems: "flex-start" }}>
                  <IcStar />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4 : Horaires ── */}
        {step === 4 && (
          <div>
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 4 }}>🕐 Horaires d'ouverture</div>
              <div style={{ fontSize: 12, color: DS.ink40, marginBottom: 16 }}>Format : 09:00-19:00 ou tapez "Fermé"</div>

              {errs.horaires && (
                <div style={{ background: `${DS.danger}10`, border: `1px solid ${DS.danger}`, borderRadius: DS.md, padding: "10px 12px", marginBottom: 12, display: "flex", gap: 7, alignItems: "center" }}>
                  {<IcAlert c={DS.danger} s={14} />}
                  <span style={{ fontSize: 12, color: DS.danger }}>{errs.horaires}</span>
                </div>
              )}

              {/* Reset rapide */}
              <button onClick={() => { JOURS.forEach(j => set(`horaires_${j}`, HORAIRES_DEFAUT[j])); }} style={{ background: `${DS.brand}10`, color: DS.brand, border: "none", borderRadius: DS.sm, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}>
                Appliquer horaires standard
              </button>

              {JOURS.map((j, i) => {
                const val = form[`horaires_${j}`];
                const ferme = val === "Fermé" || !val;
                return (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 6 ? `1px solid ${DS.ink05}` : "none" }}>
                    <div style={{ width: 72, fontSize: 13, fontWeight: 700, color: DS.ink }}>{JOURS_L[i]}</div>
                    <div style={{ flex: 1 }}>
                      <input
                        value={ferme ? "Fermé" : val}
                        onChange={e => set(`horaires_${j}`, e.target.value)}
                        placeholder="09:00-19:00"
                        style={{ ...inp(), padding: "8px 12px", fontSize: 13, background: ferme ? DS.ink05 : DS.white, color: ferme ? DS.ink40 : DS.ink }}
                      />
                    </div>
                    <button onClick={() => set(`horaires_${j}`, ferme ? "09:00-19:00" : "Fermé")} style={{ background: ferme ? DS.ink10 : `${DS.success}15`, border: "none", borderRadius: DS.sm, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: ferme ? DS.ink40 : DS.success, whiteSpace: "nowrap" }}>
                      {ferme ? "Ouvrir" : "Fermé"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 5 : Validation ── */}
        {step === 5 && (
          <div>
            {/* Récap */}
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 14 }}>📋 Récapitulatif</div>
              {[
                { label: "Commerce", val: form.nom_commerce },
                { label: "Catégorie", val: form.categorie },
                { label: "Adresse", val: `${form.adresse}, ${form.code_postal} ${form.ville}` },
                { label: "Gérant", val: `${form.prenom_gerant} ${form.nom_gerant}` },
                { label: "SIRET", val: form.siret },
                { label: "Email", val: form.email_pro },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${DS.ink05}`, gap: 8 }}>
                  <span style={{ fontSize: 12, color: DS.ink40, flexShrink: 0 }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: DS.ink, textAlign: "right" }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Checklist auto */}
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 12 }}>✅ Checklist de qualité</div>
              {[
                { label: "SIRET format valide (14 chiffres)", ok: /^\d{14}$/.test(form.siret.replace(/\s/g,"")) },
                { label: "Adresse complète renseignée", ok: !!(form.adresse && form.ville && form.code_postal) },
                { label: "Description ≥ 80 caractères", ok: form.description?.trim().length >= 80 },
                { label: "Motivation ≥ 40 caractères", ok: form.motivation?.trim().length >= 40 },
                { label: "Au moins 1 jour d'ouverture", ok: JOURS.some(j => form[`horaires_${j}`] && form[`horaires_${j}`] !== "Fermé") },
                { label: "Email professionnel valide", ok: /^[^@]+@[^@]+\.[^@]+$/.test(form.email_pro) },
                { label: "Téléphone valide", ok: /^(\+33|0)[0-9]{9}$/.test(form.telephone.replace(/\s/g,"")) },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 6 ? `1px solid ${DS.ink05}` : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.ok ? `${DS.success}15` : `${DS.danger}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {c.ok ? <IcCheck c={DS.success} s={11} /> : <IcAlert c={DS.danger} s={11} />}
                  </div>
                  <span style={{ fontSize: 12, color: c.ok ? DS.ink : DS.ink40, fontWeight: c.ok ? 600 : 400 }}>{c.label}</span>
                </div>
              ))}
            </div>

            {/* Acceptations */}
            <div style={{ background: DS.white, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 12 }}>🔒 Engagements</div>
              {[
                { key: "cgu", label: "J'accepte les Conditions Générales de Vente et d'Utilisation de Click & Promo", err: errs.cgu },
                { key: "charte", label: "Je m'engage à respecter la Charte Qualité : offres réelles, stocks à jour, informations exactes", err: errs.charte },
                { key: "rgpd", label: "J'accepte que mes données soient traitées conformément à la politique RGPD", err: errs.rgpd },
              ].map(item => (
                <div key={item.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                    <input type="checkbox" checked={form[item.key]} onChange={e => set(item.key, e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: DS.brand, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: DS.ink, lineHeight: 1.5 }}>{item.label}</span>
                  </label>
                  {item.err && <div style={{ fontSize: 11, color: DS.danger, marginTop: 4, marginLeft: 28 }}>{item.err}</div>}
                </div>
              ))}
            </div>

            {/* Délai */}
            <div style={{ background: `${DS.brand}08`, borderRadius: DS.lg, padding: 14, marginBottom: 12, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⏱</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink }}>Délai de traitement : 48h ouvrées</div>
                <div style={{ fontSize: 12, color: DS.ink60, marginTop: 3 }}>Notre équipe examine chaque dossier manuellement pour garantir la qualité de la plateforme.</div>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={submitting || !form.cgu || !form.charte || !form.rgpd}
              style={{ width: "100%", background: submitting || !form.cgu || !form.charte || !form.rgpd ? DS.ink10 : DS.brand, color: submitting || !form.cgu || !form.charte || !form.rgpd ? DS.ink40 : DS.white, border: "none", borderRadius: DS.lg, padding: "16px", fontSize: 16, fontWeight: 800, cursor: submitting || !form.cgu || !form.charte || !form.rgpd ? "not-allowed" : "pointer", boxShadow: form.cgu && form.charte && form.rgpd ? DS.eBrand : "none", transition: "all .2s", letterSpacing: -0.3 }}>
              {submitting ? "Envoi en cours…" : "📨 Envoyer ma candidature"}
            </button>
          </div>
        )}
      </div>

      {/* Bouton Suivant (pas step 5) */}
      {step < 5 && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "12px 16px 28px", background: DS.white, borderTop: `1px solid ${DS.ink10}`, boxShadow: "0 -4px 20px rgba(0,0,0,.08)" }}>
          <button onClick={next} style={{ width: "100%", background: DS.brand, color: DS.white, border: "none", borderRadius: DS.lg, padding: "15px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: DS.eBrand }}>
            Continuer →
          </button>
        </div>
      )}
    </div>
  );
}
