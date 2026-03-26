import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DemandeCommercant } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo } from "./theme";

const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie","Pharmacie","Autre"];
const STEPS = ["Infos", "Localisation", "Détails", "Confirmation"];

export default function InscriptionCommercant() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    nom_commerce:"", categorie:"Restaurant", siret:"",
    adresse:"", ville:"", code_postal:"",
    telephone:"", email_pro:"",
    nom_gerant:"", prenom_gerant:"",
    description:"", motivation:"",
    site_web:"", instagram:"",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    try {
      let user_id = null;
      try { const u = await base44.auth.me(); user_id = u.id; } catch {}
      await DemandeCommercant.create({
        ...form, user_id, statut: "en_attente",
        date_soumission: new Date().toISOString(),
        checklist_siret_ok: false, checklist_adresse_ok: false,
        checklist_photos_ok: false, checklist_description_ok: false,
        checklist_horaires_ok: false,
      });
      setDone(true);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${DS.brand} 0%,${DS.brand2} 60%,#A855F7 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, fontFamily:DS.fontBase }}>
      <div style={{ fontSize:80, marginBottom:24 }}>🎉</div>
      <div style={{ fontSize:26, fontWeight:900, color:DS.white, textAlign:"center", marginBottom:10, letterSpacing:-0.5 }}>Demande envoyée !</div>
      <div style={{ fontSize:15, color:"rgba(255,255,255,.75)", textAlign:"center", marginBottom:32 }}>
        Notre équipe examine votre dossier sous 48h.<br/>Vous recevrez une réponse par email.
      </div>
      <button onClick={()=>navigate("/Feed")} style={{ background:DS.white, color:DS.brand, border:"none", borderRadius:DS.pill, padding:"16px 32px", fontWeight:800, fontSize:16, cursor:"pointer" }}>
        Retour à l'accueil
      </button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:DS.bg, fontFamily:DS.fontBase }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${DS.brand},${DS.brand2})`, padding:"52px 16px 20px" }}>
        <button onClick={()=>navigate(-1)} style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius:DS.pill, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginBottom:16 }}>
          {Ic.back(DS.white,18)}
        </button>
        <div style={{ fontSize:22, fontWeight:900, color:DS.white, marginBottom:4 }}>Devenir commerçant</div>
        <div style={{ fontSize:14, color:"rgba(255,255,255,.7)" }}>Étape {step+1} sur {STEPS.length}</div>

        {/* Progress bar */}
        <div style={{ background:"rgba(255,255,255,.2)", borderRadius:DS.pill, height:4, marginTop:14 }}>
          <div style={{ background:DS.white, height:"100%", borderRadius:DS.pill, width:`${((step+1)/STEPS.length)*100}%`, transition:"width .4s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          {STEPS.map((s,i) => (
            <span key={s} style={{ fontSize:10, color:i<=step?"rgba(255,255,255,.9)":"rgba(255,255,255,.4)", fontWeight:i===step?800:500 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding:"20px 16px 100px" }}>

        {/* Étape 0 — Infos de base */}
        {step===0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card title="Informations générales">
              <Label>Nom du commerce *</Label>
              <Input value={form.nom_commerce} onChange={v=>set("nom_commerce",v)} placeholder="Ex: Le Bistrot de Paris" />

              <Label>Catégorie *</Label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                {CATS.map(c=>(
                  <button key={c} type="button" onClick={()=>set("categorie",c)} style={{
                    background:form.categorie===c?DS.brand:DS.white,
                    color:form.categorie===c?DS.white:DS.ink,
                    border:`1.5px solid ${form.categorie===c?DS.brand:DS.ink10}`,
                    borderRadius:DS.pill, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer",
                  }}>{c}</button>
                ))}
              </div>

              <Label>SIRET *</Label>
              <Input value={form.siret} onChange={v=>set("siret",v)} placeholder="123 456 789 00010" />

              <Label>Téléphone *</Label>
              <Input value={form.telephone} onChange={v=>set("telephone",v)} placeholder="06 00 00 00 00" />

              <Label>Email professionnel *</Label>
              <Input value={form.email_pro} onChange={v=>set("email_pro",v)} placeholder="contact@moncommerce.fr" />
            </Card>

            <Card title="Gérant">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><Label>Prénom</Label><Input value={form.prenom_gerant} onChange={v=>set("prenom_gerant",v)} placeholder="Jean" /></div>
                <div><Label>Nom</Label><Input value={form.nom_gerant} onChange={v=>set("nom_gerant",v)} placeholder="Dupont" /></div>
              </div>
            </Card>
          </div>
        )}

        {/* Étape 1 — Localisation */}
        {step===1 && (
          <Card title="Adresse du commerce">
            <Label>Adresse *</Label>
            <Input value={form.adresse} onChange={v=>set("adresse",v)} placeholder="12 rue de la Paix" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><Label>Ville *</Label><Input value={form.ville} onChange={v=>set("ville",v)} placeholder="Paris" /></div>
              <div><Label>Code postal *</Label><Input value={form.code_postal} onChange={v=>set("code_postal",v)} placeholder="75001" /></div>
            </div>
          </Card>
        )}

        {/* Étape 2 — Détails */}
        {step===2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card title="Description">
              <Label>Présentez votre commerce *</Label>
              <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4} placeholder="Décrivez votre activité, votre histoire, ce qui vous rend unique..." style={{ width:"100%", boxSizing:"border-box", background:DS.bg, border:`1px solid ${DS.ink10}`, borderRadius:DS.md, padding:"12px 14px", fontSize:14, color:DS.ink, fontFamily:DS.fontBase, outline:"none", resize:"vertical", marginBottom:14 }} />

              <Label>Pourquoi rejoindre Click & Promo ?</Label>
              <textarea value={form.motivation} onChange={e=>set("motivation",e.target.value)} rows={3} placeholder="Vos objectifs, attentes..." style={{ width:"100%", boxSizing:"border-box", background:DS.bg, border:`1px solid ${DS.ink10}`, borderRadius:DS.md, padding:"12px 14px", fontSize:14, color:DS.ink, fontFamily:DS.fontBase, outline:"none", resize:"vertical" }} />
            </Card>

            <Card title="Réseaux sociaux (optionnel)">
              <Label>Site web</Label>
              <Input value={form.site_web} onChange={v=>set("site_web",v)} placeholder="https://monsite.fr" />
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={v=>set("instagram",v)} placeholder="@moncommerce" />
            </Card>
          </div>
        )}

        {/* Étape 3 — Confirmation */}
        {step===3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card title="Récapitulatif">
              {[
                ["Commerce", form.nom_commerce],
                ["Catégorie", form.categorie],
                ["Adresse", `${form.adresse}, ${form.ville}`],
                ["Contact", form.email_pro],
                ["SIRET", form.siret],
              ].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${DS.ink05}` }}>
                  <span style={{ fontSize:13, color:DS.ink40, fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:13, color:DS.ink, fontWeight:700, maxWidth:"60%", textAlign:"right" }}>{v||"—"}</span>
                </div>
              ))}
            </Card>

            <div style={{ background:DS.brandLight, borderRadius:DS.xl, padding:20, border:`1px solid ${DS.brand}30` }}>
              <div style={{ fontSize:14, fontWeight:700, color:DS.brand, marginBottom:8 }}>📋 Et ensuite ?</div>
              <div style={{ fontSize:13, color:DS.ink60, lineHeight:1.8 }}>
                Notre équipe examine votre dossier sous 48h ouvrées.<br/>
                Vous recevrez un email de confirmation.<br/>
                Une fois validé, vous accédez à votre espace commerçant.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boutons nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:DS.white, borderTop:`1px solid ${DS.ink10}`, padding:"14px 16px calc(env(safe-area-inset-bottom,12px) + 14px)", display:"flex", gap:10 }}>
        {step>0 && (
          <button onClick={()=>setStep(p=>p-1)} style={{ flex:1, background:DS.white, border:`1.5px solid ${DS.ink10}`, borderRadius:DS.pill, padding:"15px", fontSize:15, fontWeight:700, color:DS.ink, cursor:"pointer" }}>
            Retour
          </button>
        )}
        {step<STEPS.length-1
          ? <button onClick={()=>setStep(p=>p+1)} style={{ flex:2, background:DS.brand, border:"none", borderRadius:DS.pill, padding:"15px", fontSize:15, fontWeight:800, color:DS.white, cursor:"pointer", boxShadow:DS.eBrand }}>
              Continuer →
            </button>
          : <button onClick={submit} disabled={submitting} style={{ flex:2, background:submitting?DS.ink10:DS.brand, border:"none", borderRadius:DS.pill, padding:"15px", fontSize:15, fontWeight:800, color:submitting?DS.ink40:DS.white, cursor:submitting?"not-allowed":"pointer", boxShadow:submitting?"none":DS.eBrand }}>
              {submitting?"Envoi en cours…":"Envoyer ma demande 🚀"}
            </button>
        }
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background:DS.white, borderRadius:DS.xl, padding:18, boxShadow:DS.e1, border:`1px solid ${DS.ink10}` }}>
      <div style={{ fontSize:14, fontWeight:800, color:DS.ink, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  );
}
function Label({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:DS.ink40, textTransform:"uppercase", letterSpacing:.8, marginBottom:7 }}>{children}</div>;
}
function Input({ value, onChange, placeholder="" }) {
  return (
    <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{
      width:"100%", boxSizing:"border-box", marginBottom:14,
      background:DS.bg, border:`1px solid ${DS.ink10}`, borderRadius:DS.md,
      padding:"12px 14px", fontSize:14, color:DS.ink, fontFamily:DS.fontBase, outline:"none",
    }}/>
  );
}