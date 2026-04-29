import { useState, useEffect } from "react";
import { Commercant, Offre, AvisCommercant } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { gagnerPoints } from "@/functions/gagnerPoints";
import { DS, Ic, BadgeReduction, getTheme, CPLogo } from "./theme";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HORAIRES_KEYS = ["horaires_lun","horaires_mar","horaires_mer","horaires_jeu","horaires_ven","horaires_sam","horaires_dim"];

function Stars({ note, size = 14 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(note) ? "#F59E0B" : "none"}
          stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function CommercantProfil() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const t = getTheme();

  const [commercant, setCommercant] = useState(null);
  const [offres, setOffres] = useState([]);
  const [avis, setAvis] = useState([]);
  const [user, setUser] = useState(null);
  const [myNote, setMyNote] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingAvis, setSubmittingAvis] = useState(false);
  const [avisEnvoye, setAvisEnvoye] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      Commercant.get(id),
      Offre.filter({ commercant_id: id, est_active: true }),
      AvisCommercant.filter({ commercant_id: id }),
    ]).then(([c, o, a]) => {
      setCommercant(c);
      setOffres(o);
      setAvis(a.sort((x,y) => new Date(y.created_date) - new Date(x.created_date)));
      setLoading(false);
    });
    base44.auth.me().then(setUser).catch(() => {});
  }, [id]);

  const submitAvis = async () => {
    if (!myNote || !user) return;
    setSubmittingAvis(true);
    try {
      const created = await AvisCommercant.create({
        user_id: user.id,
        commercant_id: id,
        note: myNote,
        commentaire: myComment,
        date_avis: new Date().toISOString(),
      });
      // Update note moyenne on commercant
      const allAvis = [...avis, created];
      const moyenne = allAvis.reduce((s, a) => s + a.note, 0) / allAvis.length;
      await Commercant.update(id, { note_moyenne: Math.round(moyenne * 10) / 10, nb_avis: allAvis.length });
      setAvis([created, ...avis]);
      setCommercant(p => ({ ...p, note_moyenne: Math.round(moyenne * 10) / 10, nb_avis: allAvis.length }));
      setMyNote(0); setMyComment(""); setAvisEnvoye(true);
      setTimeout(() => setAvisEnvoye(false), 3000);
      // Gamification : points pour l'avis
      gagnerPoints({ action: "avis_laisse", data: {} }).catch(() => {});
    } finally { setSubmittingAvis(false); }
  };

  if (loading) return (
    <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center" }}>
        <CPLogo size={44} />
        <div style={{ color: t.text2, marginTop: 14 }}>Chargement…</div>
      </div>
    </div>
  );

  if (!commercant) return (
    <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Commerce introuvable</div>
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, background: DS.brand, color: "#fff", border: "none", borderRadius: 100, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>Retour</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Hero */}
      <div style={{ position: "relative", height: 220 }}>
        <img
          src={commercant.image_url || `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800`}
          alt={commercant.nom}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.35) 0%, transparent 40%, rgba(0,0,0,.7) 100%)" }} />
        <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 52, left: 16, width: 40, height: 40, borderRadius: 999, background: "rgba(0,0,0,.4)", backdropFilter: "blur(10px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Ic.back("#fff", 20)}
        </button>
        {commercant.est_verifie && (
          <div style={{ position: "absolute", top: 52, right: 16, background: DS.success, color: "#fff", borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 800 }}>
            ✓ Vérifié
          </div>
        )}
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>{commercant.nom}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,.2)", color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{commercant.categorie}</span>
            {commercant.ville && <span style={{ color: "rgba(255,255,255,.8)", fontSize: 12 }}>📍 {commercant.ville}</span>}
            {commercant.note_moyenne > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Stars note={commercant.note_moyenne} size={12} />
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{commercant.note_moyenne} ({commercant.nb_avis})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 90px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Infos de contact */}
        <div style={{ background: t.card, borderRadius: DS.xl, padding: 18, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 12 }}>Informations</div>
          {[
            commercant.adresse && { icon: "📍", text: `${commercant.adresse}, ${commercant.ville}` },
            commercant.telephone && { icon: "📞", text: commercant.telephone, href: `tel:${commercant.telephone}` },
            commercant.email && { icon: "✉️", text: commercant.email, href: `mailto:${commercant.email}` },
            commercant.site_web && { icon: "🌐", text: commercant.site_web, href: commercant.site_web },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${t.border}` : "none" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.href
                ? <a href={item.href} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: DS.brand, fontWeight: 500, textDecoration: "none" }}>{item.text}</a>
                : <span style={{ fontSize: 13, color: t.text2 }}>{item.text}</span>
              }
            </div>
          ))}
        </div>

        {/* Description */}
        {commercant.description && (
          <div style={{ background: t.card, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 8 }}>À propos</div>
            <div style={{ fontSize: 14, color: t.text2, lineHeight: 1.8 }}>{commercant.description}</div>
          </div>
        )}

        {/* Horaires */}
        {HORAIRES_KEYS.some(k => commercant[k]) && (
          <div style={{ background: t.card, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 12 }}>🕐 Horaires</div>
            {HORAIRES_KEYS.map((k, i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 6 ? `1px solid ${t.border}` : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{JOURS[i]}</span>
                <span style={{ fontSize: 13, color: commercant[k] ? t.text2 : DS.danger }}>{commercant[k] || "Fermé"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Offres actives */}
        {offres.length > 0 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>🏷️ Offres en cours ({offres.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {offres.map(o => (
                <div key={o.id} onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{ background: t.card, borderRadius: DS.lg, overflow: "hidden", cursor: "pointer", boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
                  <div style={{ position: "relative", height: 100 }}>
                    <img src={o.image_url} alt={o.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
                    <div style={{ position: "absolute", bottom: 6, right: 6 }}>
                      <BadgeReduction valeur={o.valeur_reduction} type={o.type_reduction} style={{ fontSize: 11, padding: "2px 7px" }} />
                    </div>
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                    {o.prix_promo > 0 && <div style={{ fontSize: 13, fontWeight: 800, color: DS.brand }}>{o.prix_promo}€</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avis */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>
              ⭐ Avis ({avis.length})
            </div>
            {commercant.note_moyenne > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Stars note={commercant.note_moyenne} />
                <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{commercant.note_moyenne}/5</span>
              </div>
            )}
          </div>

          {/* Laisser un avis */}
          {user && !avisEnvoye && (
            <div style={{ background: t.card, borderRadius: DS.lg, padding: 16, marginBottom: 12, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10 }}>Laisser un avis</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setMyNote(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24"
                      fill={i <= myNote ? "#F59E0B" : "none"}
                      stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                placeholder="Votre commentaire (optionnel)..."
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", background: t.isDark ? DS.dark3 : DS.bg, border: `1px solid ${t.border}`, borderRadius: DS.md, padding: "10px 12px", fontSize: 13, color: t.text, fontFamily: DS.fontBase, outline: "none", resize: "none", marginBottom: 10 }}
              />
              <button
                onClick={submitAvis}
                disabled={!myNote || submittingAvis}
                style={{ background: myNote ? DS.brand : DS.ink10, color: myNote ? "#fff" : t.text2, border: "none", borderRadius: DS.md, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: myNote ? "pointer" : "not-allowed", boxShadow: myNote ? DS.eBrand : "none" }}
              >
                {submittingAvis ? "Envoi…" : "Publier mon avis"}
              </button>
            </div>
          )}

          {avisEnvoye && (
            <div style={{ background: "#D1FAE5", borderRadius: DS.md, padding: "12px 16px", marginBottom: 12, fontSize: 13, fontWeight: 700, color: "#065F46" }}>
              ✅ Merci pour votre avis !
            </div>
          )}

          {avis.length === 0
            ? <div style={{ textAlign: "center", padding: "24px", color: t.text2, fontSize: 14 }}>Aucun avis pour l'instant</div>
            : avis.map(a => (
              <div key={a.id} style={{ background: t.card, borderRadius: DS.md, padding: "14px 16px", marginBottom: 8, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <Stars note={a.note} size={13} />
                  <span style={{ fontSize: 11, color: t.text2 }}>{new Date(a.date_avis || a.created_date).toLocaleDateString("fr-FR")}</span>
                </div>
                {a.commentaire && <div style={{ fontSize: 13, color: t.text2, lineHeight: 1.7 }}>{a.commentaire}</div>}
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
}