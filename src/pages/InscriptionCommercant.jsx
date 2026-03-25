import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DemandeCommercant } from "@/api/entities";
import { UserAuth } from "@/api/auth";

const BRAND = "#FF6B35";
const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const JOURS = ["lun","mar","mer","jeu","ven","sam","dim"];
const JOURS_L = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

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

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errs[k]) setErrs(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.nom_commerce?.trim()) e.nom_commerce = "Requis";
      if (!form.categorie) e.categorie = "Requis";
      if (!form.adresse?.trim()) e.adresse = "Requis";
      if (!form.ville?.trim()) e.ville = "Requis";
      if (!form.code_postal || !/^\d{5}$/.test(form.code_postal)) e.code_postal = "5 chiffres requis";
      if (!form.telephone) e.telephone = "Requis";
      if (!form.email_pro || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email_pro)) e.email_pro = "Email invalide";
    }
    if (s === 2) {
      if (!form.nom_gerant?.trim()) e.nom_gerant = "Requis";
      if (!form.prenom_gerant?.trim()) e.prenom_gerant = "Requis";
      if (!form.siret || !/^\d{14}$/.test(form.siret.replace(/\s/g,""))) e.siret = "14 chiffres requis";
      if (!form.annee_creation) e.annee_creation = "Requis";
      if (!form.nb_employes) e.nb_employes = "Requis";
    }
    if (s === 3) {
      if (!form.description || form.description.trim().length < 80) e.description = `Min 80 caractères (${form.description?.trim().length || 0}/80)`;
      if (!form.motivation || form.motivation.trim().length < 40) e.motivation = `Min 40 caractères (${form.motivation?.trim().length || 0}/40)`;
    }
    if (s === 5) {
      if (!form.cgu) e.cgu = "Requis";
      if (!form.charte) e.charte = "Requis";
      if (!form.rgpd) e.rgpd = "Requis";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrs(e);
    if (Object.keys(e).length === 0) { setStep(s => s + 1); window.scrollTo(0,0); }
  };

  const submit = async () => {
    const e = validate(5);
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      let userId = null;
      try { const u = await UserAuth.me(); userId = u?.id; } catch {}
      await DemandeCommercant.create({
        nom_commerce: form.nom_commerce.trim(), categorie: form.categorie,
        siret: form.siret.replace(/\s/g,""), adresse: form.adresse.trim(),
        ville: form.ville.trim(), code_postal: form.code_postal.trim(),
        telephone: form.telephone.replace(/\s/g,""), email_pro: form.email_pro.trim().toLowerCase(),
        nom_gerant: form.nom_gerant.trim(), prenom_gerant: form.prenom_gerant.trim(),
        description: form.description.trim(), motivation: form.motivation.trim(),
        site_web: form.site_web?.trim() || null, instagram: form.instagram?.trim() || null,
        nb_employes: form.nb_employes, annee_creation: form.annee_creation,
        horaires_lun: form.horaires_lun, horaires_mar: form.horaires_mar,
        horaires_mer: form.horaires_mer, horaires_jeu: form.horaires_jeu,
        horaires_ven: form.horaires_ven, horaires_sam: form.horaires_sam,
        horaires_dim: form.horaires_dim,
        statut: "en_attente", user_id: userId,
        date_soumission: new Date().toISOString(),
        checklist_siret_ok: /^\d{14}$/.test(form.siret.replace(/\s/g,"")),
        checklist_adresse_ok: !!(form.adresse && form.ville && form.code_postal),
        checklist_photos_ok: false,
        checklist_description_ok: form.description?.trim().length >= 80,
        checklist_horaires_ok: JOURS.some(j => form[`horaires_${j}`] && form[`horaires_${j}`] !== "Fermé"),
      });
      setDone(true);
    } catch (err) {
      alert("Erreur : " + (err.message || "Veuillez réessayer"));
    }
    setSubmitting(false);
  };

  const inp = (extra={}) => ({
    width: "100%", border: `1.5px solid ${errs ? "#E2E8F0" : "#E2E8F0"}`, borderRadius: 10,
    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
    background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A202C",
    ...extra
  });

  const btn = (primary=true) => ({
    padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: 15, fontFamily: "system-ui, sans-serif",
    background: primary ? BRAND : "#F7F8FA", color: primary ? "#fff" : "#4A5568",
    flex: 1
  });

  const label = { fontSize: 12, fontWeight: 700, color: "#718096", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };
  const errStyle = { color: "#E53E3E", fontSize: 11, marginTop: 4 };
  const field = { marginBottom: 16 };

  // ── SUCCESS ──
  if (done) return (
    <div style={{ minHeight: "100vh", maxWidth: 430, margin: "0 auto", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#1A202C", textAlign: "center", marginBottom: 10 }}>Demande envoyée !</div>
      <div style={{ fontSize: 14, color: "#718096", textAlign: "center", lineHeight: 1.7, marginBottom: 28 }}>
        Notre équipe examine votre dossier sous <strong>48h ouvrées</strong>.<br/>
        Réponse envoyée à <strong style={{ color: BRAND }}>{form.email_pro}</strong>.
      </div>
      <button onClick={() => navigate("/Feed")} style={{ ...btn(), padding: "14px 32px", borderRadius: 12 }}>
        Voir les offres →
      </button>
    </div>
  );

  // ── HEADER ──
  const STEPS = ["Commerce","Gérant","Description","Horaires","Validation"];
  const pct = ((step - 1) / 4) * 100;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 430, margin: "0 auto", background: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: BRAND, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button onClick={() => step > 1 ? setStep(s => s-1) : navigate(-1)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Étape {step}/5</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{STEPS[step-1]}</div>
          </div>
          <div style={{ fontSize: 24 }}>🏪</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 4, height: 5 }}>
          <div style={{ background: "#fff", borderRadius: 4, height: 5, width: `${pct + 25}%`, transition: "width .3s" }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>

        {/* STEP 1 — Commerce */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1A202C", marginBottom: 6 }}>Votre commerce</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Informations de base sur votre établissement</div>
            </div>

            <div style={field}>
              <label style={label}>Nom du commerce *</label>
              <input value={form.nom_commerce} onChange={e => set("nom_commerce", e.target.value)} placeholder="Ex: Boulangerie Martin" style={inp(errs.nom_commerce ? { borderColor: "#E53E3E" } : {})} />
              {errs.nom_commerce && <div style={errStyle}>⚠ {errs.nom_commerce}</div>}
            </div>

            <div style={field}>
              <label style={label}>Catégorie *</label>
              <select value={form.categorie} onChange={e => set("categorie", e.target.value)} style={inp({ appearance: "none", ...( errs.categorie ? { borderColor: "#E53E3E" } : {}) })}>
                <option value="">Sélectionnez une catégorie</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errs.categorie && <div style={errStyle}>⚠ {errs.categorie}</div>}
            </div>

            <div style={field}>
              <label style={label}>Adresse *</label>
              <input value={form.adresse} onChange={e => set("adresse", e.target.value)} placeholder="12 rue de la Paix" style={inp(errs.adresse ? { borderColor: "#E53E3E" } : {})} />
              {errs.adresse && <div style={errStyle}>⚠ {errs.adresse}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={label}>Ville *</label>
                <input value={form.ville} onChange={e => set("ville", e.target.value)} placeholder="Paris" style={inp(errs.ville ? { borderColor: "#E53E3E" } : {})} />
                {errs.ville && <div style={errStyle}>⚠ {errs.ville}</div>}
              </div>
              <div>
                <label style={label}>Code postal *</label>
                <input value={form.code_postal} onChange={e => set("code_postal", e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="75001" style={inp(errs.code_postal ? { borderColor: "#E53E3E" } : {})} />
                {errs.code_postal && <div style={errStyle}>⚠ {errs.code_postal}</div>}
              </div>
            </div>

            <div style={{ marginTop: 16, ...field }}>
              <label style={label}>Téléphone *</label>
              <input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="06 12 34 56 78" style={inp(errs.telephone ? { borderColor: "#E53E3E" } : {})} />
              {errs.telephone && <div style={errStyle}>⚠ {errs.telephone}</div>}
            </div>

            <div style={field}>
              <label style={label}>Email professionnel *</label>
              <input type="email" value={form.email_pro} onChange={e => set("email_pro", e.target.value)} placeholder="contact@moncommerce.fr" style={inp(errs.email_pro ? { borderColor: "#E53E3E" } : {})} />
              {errs.email_pro && <div style={errStyle}>⚠ {errs.email_pro}</div>}
            </div>

            <div style={field}>
              <label style={label}>Site web (optionnel)</label>
              <input value={form.site_web} onChange={e => set("site_web", e.target.value)} placeholder="https://moncommerce.fr" style={inp()} />
            </div>

            <div style={field}>
              <label style={label}>Instagram (optionnel)</label>
              <input value={form.instagram} onChange={e => set("instagram", e.target.value)} placeholder="@moncommerce" style={inp()} />
            </div>
          </div>
        )}

        {/* STEP 2 — Gérant & légal */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1A202C", marginBottom: 6 }}>Gérant & informations légales</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Ces informations sont vérifiées lors de la validation</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={label}>Prénom *</label>
                <input value={form.prenom_gerant} onChange={e => set("prenom_gerant", e.target.value)} placeholder="Jean" style={inp(errs.prenom_gerant ? { borderColor: "#E53E3E" } : {})} />
                {errs.prenom_gerant && <div style={errStyle}>⚠ {errs.prenom_gerant}</div>}
              </div>
              <div>
                <label style={label}>Nom *</label>
                <input value={form.nom_gerant} onChange={e => set("nom_gerant", e.target.value)} placeholder="Martin" style={inp(errs.nom_gerant ? { borderColor: "#E53E3E" } : {})} />
                {errs.nom_gerant && <div style={errStyle}>⚠ {errs.nom_gerant}</div>}
              </div>
            </div>

            <div style={field}>
              <label style={label}>Numéro SIRET *</label>
              <input value={form.siret} onChange={e => set("siret", e.target.value.replace(/[^\d\s]/g,"").slice(0,17))} placeholder="123 456 789 00012" style={inp(errs.siret ? { borderColor: "#E53E3E" } : {})} maxLength={17} />
              {errs.siret && <div style={errStyle}>⚠ {errs.siret}</div>}
              <div style={{ fontSize: 11, color: "#A0AEC0", marginTop: 4 }}>14 chiffres — visible sur votre Kbis</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={label}>Année de création *</label>
                <input value={form.annee_creation} onChange={e => set("annee_creation", e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="2018" style={inp(errs.annee_creation ? { borderColor: "#E53E3E" } : {})} />
                {errs.annee_creation && <div style={errStyle}>⚠ {errs.annee_creation}</div>}
              </div>
              <div>
                <label style={label}>Employés *</label>
                <select value={form.nb_employes} onChange={e => set("nb_employes", e.target.value)} style={inp({ appearance: "none", ...(errs.nb_employes ? { borderColor: "#E53E3E" } : {}) })}>
                  <option value="">---</option>
                  <option value="1">1 (seul)</option>
                  <option value="2-5">2-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-20">11-20</option>
                  <option value="21+">21+</option>
                </select>
                {errs.nb_employes && <div style={errStyle}>⚠ {errs.nb_employes}</div>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Description */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1A202C", marginBottom: 6 }}>Présentez votre commerce</div>
              <div style={{ fontSize: 13, color: "#718096" }}>C'est ce que verront vos futurs clients</div>
            </div>

            <div style={field}>
              <label style={label}>Description du commerce * (min. 80 caractères)</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Décrivez votre commerce, vos produits, votre ambiance, ce qui vous rend unique..." style={{ ...inp(errs.description ? { borderColor: "#E53E3E" } : {}), resize: "vertical" }} />
              <div style={{ fontSize: 11, color: form.description.trim().length >= 80 ? "#22C55E" : "#A0AEC0", marginTop: 4 }}>{form.description.trim().length}/80 caractères minimum</div>
              {errs.description && <div style={errStyle}>⚠ {errs.description}</div>}
            </div>

            <div style={field}>
              <label style={label}>Pourquoi rejoindre Click & Promo ? * (min. 40 caractères)</label>
              <textarea value={form.motivation} onChange={e => set("motivation", e.target.value)} rows={4} placeholder="Quels sont vos objectifs ? Attirer de nouveaux clients, fidéliser, faire connaître votre commerce..." style={{ ...inp(errs.motivation ? { borderColor: "#E53E3E" } : {}), resize: "vertical" }} />
              <div style={{ fontSize: 11, color: form.motivation.trim().length >= 40 ? "#22C55E" : "#A0AEC0", marginTop: 4 }}>{form.motivation.trim().length}/40 caractères minimum</div>
              {errs.motivation && <div style={errStyle}>⚠ {errs.motivation}</div>}
            </div>
          </div>
        )}

        {/* STEP 4 — Horaires */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1A202C", marginBottom: 6 }}>Horaires d'ouverture</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Indiquez "Fermé" pour les jours de repos</div>
            </div>

            {JOURS.map((j, i) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F7F8FA" }}>
                <div style={{ width: 70, fontWeight: 700, fontSize: 13, color: form[`horaires_${j}`] === "Fermé" ? "#CBD5E0" : "#1A202C" }}>{JOURS_L[i]}</div>
                <input
                  value={form[`horaires_${j}`]}
                  onChange={e => set(`horaires_${j}`, e.target.value)}
                  placeholder="09:00-19:00"
                  style={{ flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: "system-ui" }}
                />
                <button
                  onClick={() => set(`horaires_${j}`, form[`horaires_${j}`] === "Fermé" ? "09:00-19:00" : "Fermé")}
                  style={{ background: form[`horaires_${j}`] === "Fermé" ? "#FFF5F5" : "#F0FFF4", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: form[`horaires_${j}`] === "Fermé" ? "#E53E3E" : "#22C55E" }}
                >
                  {form[`horaires_${j}`] === "Fermé" ? "Fermé" : "Ouvert"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STEP 5 — Validation */}
        {step === 5 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1A202C", marginBottom: 6 }}>Récapitulatif</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Vérifiez vos informations avant d'envoyer</div>
            </div>

            <div style={{ background: "#F7F8FA", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              {[
                ["🏪 Commerce", form.nom_commerce],
                ["📍 Adresse", `${form.adresse}, ${form.code_postal} ${form.ville}`],
                ["📞 Téléphone", form.telephone],
                ["✉️ Email", form.email_pro],
                ["👤 Gérant", `${form.prenom_gerant} ${form.nom_gerant}`],
                ["🏢 SIRET", form.siret],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #EDF2F7", fontSize: 13 }}>
                  <span style={{ color: "#718096", fontWeight: 600 }}>{k}</span>
                  <span style={{ color: "#1A202C", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              {[
                { key: "cgu", label: "J'accepte les Conditions Générales de Vente" },
                { key: "charte", label: "J'accepte la Charte Qualité Click & Promo" },
                { key: "rgpd", label: "J'accepte la politique de confidentialité (RGPD)" },
              ].map(({ key, label: lbl }) => (
                <div key={key} onClick={() => set(key, !form[key])} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: form[key] ? "#F0FFF4" : "#F7F8FA", marginBottom: 8, cursor: "pointer", border: `1.5px solid ${form[key] ? "#22C55E" : (errs[key] ? "#E53E3E" : "#E2E8F0")}` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: form[key] ? "#22C55E" : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {form[key] && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: "#1A202C", lineHeight: 1.4 }}>{lbl}</span>
                </div>
              ))}
              {(errs.cgu || errs.charte || errs.rgpd) && <div style={errStyle}>⚠ Vous devez accepter tous les termes</div>}
            </div>
          </div>
        )}

        {/* NAV BUTTONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 1 && <button onClick={() => setStep(s => s-1)} style={btn(false)}>← Retour</button>}
          {step < 5 && <button onClick={next} style={btn()}>Continuer →</button>}
          {step === 5 && (
            <button onClick={submit} disabled={submitting} style={{ ...btn(), opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Envoi en cours..." : "🚀 Envoyer ma demande"}
            </button>
          )}
        </div>

        {/* Reassurance */}
        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 32, fontSize: 12, color: "#A0AEC0" }}>
          🔒 Vos données sont sécurisées · Réponse sous 48h ouvrées
        </div>
      </div>
    </div>
  );
}
