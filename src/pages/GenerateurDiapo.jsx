import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, NavBar } from "./theme";

const TYPES_PRESENTATION = [
  { id: "pitch", label: "🚀 Pitch Investisseurs", desc: "Présentation pour lever des fonds" },
  { id: "partenaire", label: "🤝 Pitch Partenaires", desc: "Convaincre des commerçants de rejoindre" },
  { id: "produit", label: "📱 Présentation Produit", desc: "Fonctionnalités et bénéfices de l'app" },
  { id: "marketing", label: "📣 Plan Marketing", desc: "Stratégie d'acquisition et croissance" },
];

const NB_SLIDES = [5, 8, 10, 12];

export default function GenerateurDiapo() {
  const navigate = useNavigate();
  const [type, setType] = useState("pitch");
  const [nbSlides, setNbSlides] = useState(8);
  const [contexte, setContexte] = useState("");
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [allCopied, setAllCopied] = useState(false);

  const generer = async () => {
    setLoading(true);
    setSlides(null);

    const typeLabel = TYPES_PRESENTATION.find(t => t.id === type)?.label || type;

    const prompt = `Tu es expert en pitch deck et présentation professionnelle.
Génère exactement ${nbSlides} slides pour une présentation "${typeLabel}" de l'application Click & Promo.

Click & Promo est une application mobile qui connecte les consommateurs aux offres promotionnelles des commerces locaux proches d'eux en temps réel. 
Fonctionnalités clés :
- Feed d'offres géolocalisées par catégorie (Restaurant, Boutique, Beauté, Sport, Épicerie, Pharmacie...)
- Offres flash avec countdown et stock limité
- Carte interactive des commerces
- Système de favoris
- Profil utilisateur avec gamification (points, badges, niveaux)
- Programme de parrainage
- Dashboard commerçant avec statistiques (vues, clics, conversions)
- Abonnements Premium utilisateurs et Business commerçants

${contexte ? `Contexte supplémentaire fourni : ${contexte}` : ""}

Pour chaque slide, fournis :
- Un titre court et percutant
- 3 à 5 points bullet clairs et impactants
- Une note de design (couleur dominante suggérée, icône ou visuel recommandé)

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "titre_presentation": "...",
  "slides": [
    {
      "numero": 1,
      "titre": "...",
      "bullets": ["...", "...", "..."],
      "design_note": "..."
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          titre_presentation: { type: "string" },
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                numero: { type: "number" },
                titre: { type: "string" },
                bullets: { type: "array", items: { type: "string" } },
                design_note: { type: "string" },
              }
            }
          }
        }
      }
    });

    setSlides(result);
    setLoading(false);
  };

  const copySlide = (slide, idx) => {
    const text = `${slide.titre}\n\n${slide.bullets.map(b => `• ${b}`).join("\n")}\n\n💡 Design: ${slide.design_note}`;
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = () => {
    const text = slides.slides.map(s =>
      `--- SLIDE ${s.numero} : ${s.titre} ---\n${s.bullets.map(b => `• ${b}`).join("\n")}\n💡 ${s.design_note}`
    ).join("\n\n");
    navigator.clipboard?.writeText(`${slides.titre_presentation}\n\n${text}`);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${DS.brandDark} 0%, ${DS.brand} 60%, ${DS.brand2} 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 20px`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>🎨 Générateur de Diapo</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>Créé par IA · Prêt pour Canva</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 100px" }}>

        {/* Formulaire */}
        {!slides && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.07)", marginBottom: 16 }}>

            {/* Type de présentation */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Type de présentation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {TYPES_PRESENTATION.map(t => (
                <div key={t.id} onClick={() => setType(t.id)} style={{
                  border: `2px solid ${type === t.id ? DS.brand : "#eee"}`,
                  borderRadius: 14, padding: "12px 14px", cursor: "pointer",
                  background: type === t.id ? DS.brandLight : "#fafafa",
                  transition: "all .2s",
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: type === t.id ? DS.brand : DS.ink }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{t.desc}</div>
                </div>
              ))}
            </div>

            {/* Nombre de slides */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Nombre de slides
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {NB_SLIDES.map(n => (
                <button key={n} onClick={() => setNbSlides(n)} style={{
                  flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${nbSlides === n ? DS.brand : "#eee"}`,
                  background: nbSlides === n ? DS.brand : "#fff",
                  color: nbSlides === n ? "#fff" : DS.ink,
                  fontWeight: 700, fontSize: 14, fontFamily: DS.fontBase,
                }}>{n}</button>
              ))}
            </div>

            {/* Contexte optionnel */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Contexte supplémentaire (optionnel)
            </div>
            <textarea
              value={contexte}
              onChange={e => setContexte(e.target.value)}
              placeholder="Ex: Présentation pour une réunion avec des investisseurs en série A, focus sur la traction et le modèle économique..."
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid #eee", borderRadius: 12, padding: "12px 14px",
                fontSize: 14, fontFamily: DS.fontBase, outline: "none", resize: "none",
                color: DS.ink, background: "#fafafa",
              }}
            />

            <button onClick={generer} disabled={loading} style={{
              width: "100%", marginTop: 16,
              background: `linear-gradient(135deg, ${DS.brand} 0%, ${DS.brand2} 100%)`,
              color: "#fff", border: "none", borderRadius: 16, padding: "16px",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: DS.eBrand,
            }}>
              ✨ Générer la présentation
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 2s linear infinite" }}>✨</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: DS.ink, marginBottom: 8 }}>L'IA génère vos slides…</div>
            <div style={{ fontSize: 14, color: "#888" }}>Cela prend quelques secondes</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Résultats */}
        {slides && (
          <>
            {/* Titre + actions */}
            <div style={{ background: `linear-gradient(135deg, ${DS.brandDark} 0%, ${DS.brand} 100%)`, borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: DS.eBrand }}>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Présentation générée</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, marginBottom: 16, lineHeight: 1.3 }}>{slides.titre_presentation}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={copyAll} style={{
                  flex: 1, background: allCopied ? DS.success : "#fff",
                  color: allCopied ? "#fff" : DS.brand,
                  border: "none", borderRadius: 12, padding: "12px",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all .3s",
                }}>
                  {allCopied ? "✅ Tout copié !" : "📋 Copier tout pour Canva"}
                </button>
                <button onClick={() => setSlides(null)} style={{
                  background: "rgba(255,255,255,.2)", border: "none", borderRadius: 12,
                  padding: "12px 16px", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13,
                }}>
                  🔄 Regénérer
                </button>
              </div>
            </div>

            {/* Mode d'emploi Canva */}
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 4 }}>📌 Comment utiliser dans Canva</div>
              <div style={{ fontSize: 12, color: "#78350F", lineHeight: 1.7 }}>
                1. Clique <strong>"Copier tout pour Canva"</strong> ci-dessus<br/>
                2. Ouvre <strong>Canva.com</strong> → Créer un design → Présentation<br/>
                3. Choisis un template → Colle le contenu slide par slide<br/>
                4. Ou copie chaque slide individuellement avec le bouton 📋
              </div>
            </div>

            {/* Slides */}
            {slides.slides.map((slide, idx) => (
              <div key={idx} style={{
                background: "#fff", borderRadius: 20, padding: 18, marginBottom: 12,
                boxShadow: "0 2px 10px rgba(0,0,0,.06)",
                borderLeft: `4px solid ${DS.brand}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: DS.brand, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                      Slide {slide.numero}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 17, color: DS.ink, lineHeight: 1.3 }}>{slide.titre}</div>
                  </div>
                  <button onClick={() => copySlide(slide, idx)} style={{
                    background: copiedIdx === idx ? DS.success : DS.brandLight,
                    color: copiedIdx === idx ? "#fff" : DS.brand,
                    border: "none", borderRadius: 10, padding: "8px 12px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    flexShrink: 0, marginLeft: 10,
                    transition: "all .3s",
                  }}>
                    {copiedIdx === idx ? "✅ Copié" : "📋 Copier"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {slide.bullets.map((b, bi) => (
                    <div key={bi} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: DS.brand, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: 14, color: "#444", lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: "#F5F5F7", borderRadius: 10, padding: "8px 12px",
                  fontSize: 12, color: "#888", fontStyle: "italic",
                }}>
                  💡 Design : {slide.design_note}
                </div>
              </div>
            ))}

            <button onClick={() => setSlides(null)} style={{
              width: "100%", background: "#fff",
              color: DS.brand, border: `2px solid ${DS.brand}`,
              borderRadius: 16, padding: "14px",
              fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8,
            }}>
              ← Nouvelle présentation
            </button>
          </>
        )}
      </div>

      <NavBar active="Profil" />
    </div>
  );
}