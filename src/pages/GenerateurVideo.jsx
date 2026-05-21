import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, NavBar } from "./theme";
import { Commercant, Offre } from "@/api/entities";

const STYLES_VIDEO = [
  { id: "promo_dynamique", label: "🎯 Promo Dynamique", desc: "Vidéo énergique avec textes et effets" },
  { id: "ambiance_boutique", label: "🏪 Ambiance Boutique", desc: "Atmosphère chaleureuse et accueillante" },
  { id: "produit_star", label: "⭐ Produit Star", desc: "Mise en valeur d'un produit ou service" },
  { id: "evenement", label: "🎉 Événement", desc: "Soldes, ouverture, anniversaire..." },
];

const DUREES = [
  { val: 4, label: "4s", credits: 20 },
  { val: 6, label: "6s", credits: 30 },
  { val: 8, label: "8s", credits: 40 },
];

const PLANS_AUTORISES = ["pro", "business"];

export default function GenerateurVideo() {
  const navigate = useNavigate();
  const [commercant, setCommercant] = useState(null);
  const [offres, setOffres] = useState([]);
  const [planActuel, setPlanActuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  // Form
  const [style, setStyle] = useState("promo_dynamique");
  const [duree, setDuree] = useState(6);
  const [offreSelectee, setOffreSelectee] = useState(null);
  const [texteCustom, setTexteCustom] = useState("");

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user) { navigate("/Login"); return; }

      const commercants = await Commercant.filter({ user_id: user.id });
      if (commercants.length > 0) {
        const c = commercants[0];
        setCommercant(c);
        setPlanActuel(c.plan_abonnement || "gratuit");

        const mesOffres = await Offre.filter({ commercant_id: c.id });
        setOffres(mesOffres.filter(o => o.est_active));
      } else {
        setPlanActuel("gratuit");
      }
      setLoading(false);
    };
    init();
  }, []);

  const peutGenerer = PLANS_AUTORISES.includes(planActuel);

  const genererVideo = async () => {
    setGenerating(true);
    setVideoUrl(null);

    const offre = offres.find(o => o.id === offreSelectee);
    const styleLabel = STYLES_VIDEO.find(s => s.id === style)?.label || style;

    const prompt = `
Créer une vidéo publicitaire courte et dynamique de ${duree} secondes pour un commerce local français.

Commerce : ${commercant?.nom || "Commerce local"}
Catégorie : ${commercant?.categorie || "Commerce"}
Ville : ${commercant?.ville || "France"}
${offre ? `Offre mise en avant : ${offre.titre} — Réduction : -${offre.valeur_reduction}${offre.type_reduction === "pourcentage" ? "%" : "€"}` : ""}
${texteCustom ? `Message personnalisé : ${texteCustom}` : ""}

Style demandé : ${styleLabel}

La vidéo doit montrer une atmosphère chaleureuse et professionnelle, des couleurs vives et attrayantes, 
une ambiance qui donne envie de visiter le commerce ou de profiter de l'offre.
Mouvement de caméra fluide, éclairage naturel et agréable.
    `.trim();

    const result = await base44.integrations.Core.GenerateVideo({
      prompt,
      duration: duree,
      aspect_ratio: "9:16",
    });

    setVideoUrl(result.url);
    setGenerating(false);
  };

  if (loading) {
    return (
      <div style={{ background: "#F5F5F7", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <div style={{ fontWeight: 700, color: DS.ink }}>Chargement…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)`,
        padding: `calc(${DS.safeTop} + 8px) 16px 24px`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>🎬 Vidéo Promo IA</div>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>Générez des vidéos pour vos réseaux sociaux</div>
          </div>
        </div>

        {/* Badge plan */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: peutGenerer ? "rgba(16, 185, 129, .2)" : "rgba(239, 68, 68, .2)",
          border: `1px solid ${peutGenerer ? "#10B981" : "#EF4444"}`,
          borderRadius: 100, padding: "6px 14px",
        }}>
          <span style={{ fontSize: 13 }}>{peutGenerer ? "✅" : "🔒"}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: peutGenerer ? "#10B981" : "#EF4444" }}>
            {peutGenerer ? `Plan ${planActuel} — Accès illimité` : `Plan ${planActuel || "gratuit"} — Réservé Pro & Business`}
          </span>
        </div>
      </div>

      <div style={{ padding: "20px 16px 100px" }}>

        {/* GATE : si pas Pro/Business */}
        {!peutGenerer && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.08)", marginBottom: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎬</div>
            <div style={{ fontWeight: 900, fontSize: 20, color: DS.ink, marginBottom: 8 }}>
              Fonctionnalité Pro & Business
            </div>
            <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7, marginBottom: 20 }}>
              Générez des vidéos publicitaires IA courtes (4-8s) parfaites pour Instagram Reels, TikTok et Facebook — directement depuis votre compte commerçant.
            </div>

            {/* Avantages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, textAlign: "left" }}>
              {[
                { emoji: "🎯", text: "Vidéos adaptées à votre commerce et vos offres" },
                { emoji: "📱", text: "Format vertical 9:16 pour Reels & TikTok" },
                { emoji: "⚡", text: "Génération en 30-60 secondes" },
                { emoji: "♾️", text: "Générations illimitées avec le plan Business" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: "#F5F5F7", borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ fontSize: 22 }}>{a.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: DS.ink }}>{a.text}</span>
                </div>
              ))}
            </div>

            {/* Comparaison plans */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              <div style={{ background: "#F5F5F7", borderRadius: 14, padding: 16, border: `2px solid ${DS.brand}` }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: DS.brand, marginBottom: 4 }}>Pro</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink }}>59€<span style={{ fontSize: 13, fontWeight: 500 }}>/mois</span></div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>🎬 10 vidéos/mois<br/>5 offres actives</div>
              </div>
              <div style={{ background: "#FFFBEB", borderRadius: 14, padding: 16, border: "2px solid #F59E0B" }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "#F59E0B", marginBottom: 4 }}>💎 Business</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink }}>99€<span style={{ fontSize: 13, fontWeight: 500 }}>/mois</span></div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>🎬 Illimité<br/>Offres illimitées</div>
              </div>
            </div>

            <button onClick={() => navigate("/Abonnement")} style={{
              width: "100%",
              background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
              color: "#fff", border: "none", borderRadius: 100,
              padding: "16px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              boxShadow: DS.eBrand,
            }}>
              ⬆️ Passer au plan Pro — 59€/mois
            </button>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>Annulation à tout moment · Garantie 30 jours</p>
          </div>
        )}

        {/* FORMULAIRE si autorisé */}
        {peutGenerer && !videoUrl && (
          <>
            {/* Offre à mettre en avant */}
            {offres.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Offre à mettre en avant (optionnel)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    onClick={() => setOffreSelectee(null)}
                    style={{
                      border: `2px solid ${!offreSelectee ? DS.brand : "#eee"}`,
                      borderRadius: 12, padding: "10px 14px", cursor: "pointer",
                      background: !offreSelectee ? DS.brandLight : "#fafafa",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: !offreSelectee ? DS.brand : DS.ink }}>
                      🏪 Présenter mon commerce en général
                    </span>
                  </div>
                  {offres.map(o => (
                    <div
                      key={o.id}
                      onClick={() => setOffreSelectee(o.id)}
                      style={{
                        border: `2px solid ${offreSelectee === o.id ? DS.brand : "#eee"}`,
                        borderRadius: 12, padding: "10px 14px", cursor: "pointer",
                        background: offreSelectee === o.id ? DS.brandLight : "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: offreSelectee === o.id ? DS.brand : DS.ink }}>{o.titre}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>-{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Style */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                Style de vidéo
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STYLES_VIDEO.map(s => (
                  <div key={s.id} onClick={() => setStyle(s.id)} style={{
                    border: `2px solid ${style === s.id ? DS.brand : "#eee"}`,
                    borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                    background: style === s.id ? DS.brandLight : "#fafafa",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: style === s.id ? DS.brand : DS.ink }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Durée */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                Durée
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {DUREES.map(d => (
                  <button key={d.val} onClick={() => setDuree(d.val)} style={{
                    flex: 1, padding: "14px 0", borderRadius: 14, cursor: "pointer",
                    border: `2px solid ${duree === d.val ? DS.brand : "#eee"}`,
                    background: duree === d.val ? DS.brand : "#fff",
                    color: duree === d.val ? "#fff" : DS.ink,
                    fontWeight: 700, fontSize: 14, fontFamily: DS.fontBase,
                  }}>
                    <div>{d.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{d.credits} crédits</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message custom */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                Message personnalisé (optionnel)
              </div>
              <textarea
                value={texteCustom}
                onChange={e => setTexteCustom(e.target.value)}
                placeholder="Ex: Soldes d'été -30% ce weekend seulement..."
                rows={2}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: "1.5px solid #eee", borderRadius: 12, padding: "12px 14px",
                  fontSize: 14, fontFamily: DS.fontBase, outline: "none", resize: "none",
                  color: DS.ink, background: "#fafafa",
                }}
              />
            </div>

            <button onClick={genererVideo} style={{
              width: "100%",
              background: `linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)`,
              color: "#fff", border: "none", borderRadius: 16, padding: "18px",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 20px rgba(15, 52, 96, .4)",
            }}>
              🎬 Générer la vidéo ({DUREES.find(d => d.val === duree)?.credits} crédits)
            </button>
          </>
        )}

        {/* GÉNÉRATION EN COURS */}
        {generating && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🎬</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: DS.ink, marginBottom: 8 }}>Génération en cours…</div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 4 }}>L'IA crée votre vidéo promo</div>
            <div style={{ fontSize: 13, color: "#aaa" }}>⏱ Environ 30-60 secondes</div>
            <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
          </div>
        )}

        {/* RÉSULTAT */}
        {videoUrl && !generating && (
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              style={{ width: "100%", display: "block", maxHeight: 500, objectFit: "cover" }}
            />
            <div style={{ padding: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: DS.ink, marginBottom: 16 }}>✅ Votre vidéo est prête !</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href={videoUrl}
                  download="video-promo.mp4"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
                    color: "#fff", borderRadius: 14, padding: "14px",
                    fontSize: 15, fontWeight: 800, textDecoration: "none",
                    boxShadow: DS.eBrand,
                  }}
                >
                  ⬇️ Télécharger la vidéo
                </a>
                <button
                  onClick={() => { setVideoUrl(null); }}
                  style={{
                    background: "#F5F5F7", color: DS.ink, border: "none",
                    borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  🔄 Générer une nouvelle vidéo
                </button>
              </div>

              <div style={{ marginTop: 16, background: "#F0FDF4", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46", marginBottom: 4 }}>💡 Conseils partage</div>
                <div style={{ fontSize: 12, color: "#047857", lineHeight: 1.7 }}>
                  📱 <strong>Instagram Reels</strong> : Publiez avec #promo #[votre-ville]<br/>
                  🎵 <strong>TikTok</strong> : Ajoutez une musique tendance en post-prod<br/>
                  👥 <strong>Facebook</strong> : Idéal pour les publicités boostées
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavBar active="Dashboard" />
    </div>
  );
}