import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DemandeCommercant } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo } from "./theme";

const CATS = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Services", "Épicerie", "Pharmacie", "Autre"];
const STEPS = ["Infos", "Adresse", "Détails", "Confirmation"];

export default function InscriptionCommercant() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    nom_commerce: "", categorie: "Restaurant", siret: "",
    adresse: "", ville: "", code_postal: "",
    telephone: "", email_contact: "",
    nom_gerant: "", prenom_gerant: "",
    description: "", motivation: "",
    site_web: "", instagram: "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    try {
      let user_id = null;
      try { const u = await base44.auth.me(); user_id = u.id; } catch {}
      await DemandeCommercant.create({ ...form, user_id, statut: "en_attente" });
      setDone(true);
    } finally { setSubmitting(false); }
  };

  if (done) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 60%, ${DS.brand2} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: DS.fontBase }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 10, letterSpacing: -0.5 }}>Demande envoyée !</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,.7)", textAlign: "center", marginBottom: 32, lineHeight: 1.7 }}>
        Notre équipe examine votre dossier sous 48h.<br />Vous recevrez une réponse par email.
      </div>
      <button onClick={() => navigate("/Feed")} style={{ background: "#fff", color: DS.brand, border: "none", borderRadius: 100, padding: "16px 32px", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
        Retour à l'accueil
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`, padding: `calc(${DS.safeTop} + 8px) 16px 20px` }}>
        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: 100, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 14 }}>
          {Ic.back("#fff", 18)}
        </button>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Devenir commerçant</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginBottom: 14 }}>Étape {step + 1} / {STEPS.length} — {STEPS[step]}</div>
        {/* Progress */}
        <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 100, height: 4 }}>
          <div style={{ background: "#fff", height: "100%", borderRadius: 100, width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width .4s" }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 16px 110px" }}>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card title="Informations générales">
              <Label>Nom du commerce *</Label>
              <Input value={form.nom_commerce} onChange={v => set("nom_commerce", v)} placeholder="Le Bistrot de Paris" />
              <Label>Catégorie *</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                {CATS.map(c => (
                  <button key={c} type="button" onClick={() => set("categorie", c)} style={{
                    background: form.categorie === c ? DS.brand : "#fff",
                    color: form.categorie === c ? "#fff" : DS.ink,
                    border: `1.5px solid ${form.categorie === c ? DS.brand : DS.ink10}`,
                    borderRadius: 100, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>{c}</button>
                ))}
              </div>
              <Label>SIRET *</Label>
              <Input value={form.siret} onChange={v => set("siret", v)} placeholder="123 456 789 00010" />
              <Label>Téléphone *</Label>
              <Input value={form.telephone} onChange={v => set("telephone", v)} placeholder="06 00 00 00 00" />
              <Label>Email professionnel *</Label>
              <Input value={form.email_contact} onChange={v => set("email_contact", v)} placeholder="contact@commerce.fr" />
            </Card>
            <Card title="Gérant">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><Label>Prénom</Label><Input value={form.prenom_gerant} onChange={v => set("prenom_gerant", v)} placeholder="Jean" /></div>
                <div><Label>Nom</Label><Input value={form.nom_gerant} onChange={v => set("nom_gerant", v)} placeholder="Dupont" /></div>
              </div>
            </Card>
          </div>
        )}

        {step === 1 && (
          <Card title="Adresse du commerce">
            <Label>Adresse *</Label>
            <Input value={form.adresse} onChange={v => set("adresse", v)} placeholder="12 rue de la Paix" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><Label>Ville *</Label><Input value={form.ville} onChange={v => set("ville", v)} placeholder="Paris" /></div>
              <div><Label>Code postal *</Label><Input value={form.code_postal} onChange={v => set("code_postal", v)} placeholder="75001" /></div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card title="Présentation">
              <Label>Décrivez votre commerce *</Label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} placeholder="Votre activité, histoire, ce qui vous rend unique..." style={taStyle} />
              <Label>Pourquoi rejoindre Click & Promo ?</Label>
              <textarea value={form.motivation} onChange={e => set("motivation", e.target.value)} rows={3} placeholder="Vos objectifs, attentes..." style={taStyle} />
            </Card>
            <Card title="Réseaux sociaux (optionnel)">
              <Label>Site web</Label>
              <Input value={form.site_web} onChange={v => set("site_web", v)} placeholder="https://monsite.fr" />
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={v => set("instagram", v)} placeholder="@moncommerce" />
            </Card>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card title="Récapitulatif">
              {[
                ["Commerce", form.nom_commerce],
                ["Catégorie", form.categorie],
                ["Adresse", `${form.adresse}, ${form.ville}`],
                ["Email", form.email_contact],
                ["SIRET", form.siret],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${DS.ink05}` }}>
                  <span style={{ fontSize: 13, color: DS.ink40, fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13, color: DS.ink, fontWeight: 700, maxWidth: "60%", textAlign: "right" }}>{v || "—"}</span>
                </div>
              ))}
            </Card>
            <div style={{ background: DS.brandLight, borderRadius: DS.xl, padding: 18, border: `1px solid ${DS.brand}30` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: DS.brand, marginBottom: 8 }}>📋 Et ensuite ?</div>
              <div style={{ fontSize: 13, color: DS.ink60, lineHeight: 1.8 }}>
                Validation sous 48h ouvrées · Email de confirmation · Accès à votre espace commerçant
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${DS.ink10}`, padding: `14px 16px calc(max(${DS.safeBottom}, 12px) + 14px)`, display: "flex", gap: 10 }}>
        {step > 0 && (
          <button onClick={() => setStep(p => p - 1)} style={{ flex: 1, background: "#fff", border: `1.5px solid ${DS.ink10}`, borderRadius: 100, padding: 15, fontSize: 15, fontWeight: 700, color: DS.ink, cursor: "pointer" }}>
            Retour
          </button>
        )}
        {step < STEPS.length - 1
          ? <button onClick={() => setStep(p => p + 1)} style={{ flex: 2, background: DS.brand, border: "none", borderRadius: 100, padding: 15, fontSize: 15, fontWeight: 800, color: "#fff", cursor: "pointer", boxShadow: DS.eBrand }}>
              Continuer →
            </button>
          : <button onClick={submit} disabled={submitting} style={{ flex: 2, background: submitting ? DS.ink10 : DS.brand, border: "none", borderRadius: 100, padding: 15, fontSize: 15, fontWeight: 800, color: submitting ? DS.ink40 : "#fff", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : DS.eBrand }}>
              {submitting ? "Envoi…" : "Envoyer ma demande 🚀"}
            </button>
        }
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: DS.xl, padding: 18, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}
function Label({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: DS.ink40, textTransform: "uppercase", letterSpacing: .8, marginBottom: 7 }}>{children}</div>;
}
function Input({ value, onChange, placeholder = "" }) {
  return <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", boxSizing: "border-box", marginBottom: 14, background: "#F5F5F7", border: `1px solid ${DS.ink10}`, borderRadius: DS.md, padding: "12px 14px", fontSize: 14, color: DS.ink, fontFamily: DS.fontBase, outline: "none" }} />;
}
const taStyle = { width: "100%", boxSizing: "border-box", background: "#F5F5F7", border: `1px solid ${DS.ink10}`, borderRadius: DS.md, padding: "12px 14px", fontSize: 14, color: DS.ink, fontFamily: DS.fontBase, outline: "none", resize: "vertical", marginBottom: 14 };