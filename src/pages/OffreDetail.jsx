import { useState, useEffect } from "react";
import { Offre, FavoriUtilisateur, HistoriqueOffresVues, UtilisationOffre } from "@/api/entities";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DS, Ic, BadgeReduction, getTheme } from "./theme";
import { base44 } from "@/api/base44Client";
import { gagnerPoints } from "@/functions/gagnerPoints";
import { haversine, formatDist } from "./Feed";

function Countdown({ dateFin }) {
  const [t, setT] = useState(Math.max(0, new Date(dateFin) - new Date()));
  useEffect(() => {
    const iv = setInterval(() => setT(Math.max(0, new Date(dateFin) - new Date())), 1000);
    return () => clearInterval(iv);
  }, [dateFin]);
  const days = Math.floor(t / 86400000);
  const h = Math.floor((t % 86400000) / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: DS.ink40, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>⚡ Offre flash — expire dans</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {[{v:days,l:"Jours"},{v:pad(h),l:"Heures"},{v:pad(m),l:"Min"},{v:pad(s),l:"Sec"}].map(({v,l}) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ background: DS.brand, color: DS.white, borderRadius: DS.md, padding: "10px 12px", fontSize: 20, fontWeight: 900, minWidth: 42 }}>{v}</div>
            <div style={{ fontSize: 9, color: DS.ink40, marginTop: 4, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarCard({ o, onPress }) {
  return (
    <div onClick={onPress} style={{
      width: 140, flexShrink: 0, background: "#fff", borderRadius: 14, overflow: "hidden",
      cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.07)",
    }}>
      <div style={{ position: "relative", height: 90 }}>
        <img src={o.image_url} alt={o.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"} />
        {o.valeur_reduction > 0 && (
          <div style={{ position: "absolute", bottom: 6, right: 6, background: DS.brand, color: "#fff", borderRadius: 12, padding: "2px 7px", fontSize: 10, fontWeight: 800 }}>
            -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.commercant_nom}</div>
        {o.prix_promo > 0 && <div style={{ fontSize: 12, fontWeight: 800, color: DS.brand }}>{o.prix_promo}€</div>}
      </div>
    </div>
  );
}

export default function OffreDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const [offre, setOffre] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [codeVis, setCodeVis] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pointsGagnes, setPointsGagnes] = useState(null);
  const t = getTheme();

  useEffect(() => {
    if (!id) return;
    Offre.get(id).then(o => {
      setOffre(o);
      Offre.filter({ categorie: o.categorie, est_active: true }).then(list =>
        setSimilar(list.filter(x => x.id !== id).slice(0, 8))
      );
    });
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos({ lat: 48.8566, lon: 2.3522 })
    );
    base44.auth.me().then(async user => {
      try {
        const favs = await FavoriUtilisateur.filter({ offre_id: id, user_id: user.id });
        if (favs.length > 0) { setIsFav(true); setFavId(favs[0].id); }
      } catch {}
      try {
        const o = await Offre.get(id);
        await HistoriqueOffresVues.create({
          user_id: user.id, offre_id: id,
          offre_titre: o.titre, commercant_nom: o.commercant_nom,
          date_vue: new Date().toISOString(), image_url: o.image_url, ville: o.ville,
        });
        await Offre.update(id, { nb_vues: (o.nb_vues || 0) + 1 });
      } catch {}
    }).catch(() => {});
  }, [id]);

  if (!offre) return (
    <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <div style={{ color: t.text2 }}>Chargement…</div>
      </div>
    </div>
  );

  const expired = offre.date_fin && new Date(offre.date_fin) < new Date();
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lon, offre.latitude, offre.longitude) : null;
  const pct = offre.stock_initial > 0 ? Math.round((offre.stock_restant / offre.stock_initial) * 100) : null;
  const lowStock = pct !== null && pct < 20;

  const toggleFav = async () => {
    try {
      const user = await base44.auth.me();
      if (isFav && favId) {
        await FavoriUtilisateur.delete(favId);
        setIsFav(false); setFavId(null);
      } else {
        const f = await FavoriUtilisateur.create({ offre_id: id, user_id: user.id });
        setIsFav(true); setFavId(f.id);
      }
    } catch { navigate("/Login"); }
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: offre.titre, url: window.location.href }); } catch {}
    } else { navigator.clipboard?.writeText(window.location.href); }
  };

  const useOffer = async () => {
    setCodeVis(true);
    try {
      const user = await base44.auth.me();
      await UtilisationOffre.create({
        offre_id: id, user_id: user.id, commercant_id: offre.commercant_id,
        date_utilisation: new Date().toISOString(),
        code_utilise: offre.code_promo || "CLICKPROMO",
        economie_realisee: (offre.prix_original || 0) - (offre.prix_promo || 0),
        statut: "utilise",
      });
      await Offre.update(id, {
        nb_conversions: (offre.nb_conversions || 0) + 1,
        stock_restant: Math.max(0, (offre.stock_restant || 1) - 1),
      });
      // Gamification : gagner des points
      const economie = (offre.prix_original || 0) - (offre.prix_promo || 0);
      const res = await gagnerPoints({
        action: "utilisation_offre",
        data: { est_urgente: offre.est_urgente, economie: Math.max(0, economie) }
      });
      if (res?.data?.points_gagnes > 0) {
        setPointsGagnes(res.data.points_gagnes);
        setTimeout(() => setPointsGagnes(null), 4000);
      }
    } catch {}
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(offre.code_promo || "CLICKPROMO");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const fabBtn = (top, left, right) => ({
    position: "absolute", top, left, right,
    width: 44, height: 44, borderRadius: 999,
    background: "rgba(0,0,0,.4)", backdropFilter: "blur(10px)",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Toast points gagnés */}
      {pointsGagnes && (
        <div style={{
          position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
          background: DS.brand, color: "#fff", borderRadius: 100,
          padding: "10px 22px", fontSize: 14, fontWeight: 800, zIndex: 999,
          boxShadow: DS.eBrand, animation: "popIn .3s ease",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ⭐ +{pointsGagnes} points gagnés !
        </div>
      )}

      {/* Image hero */}
      <div style={{ position: "relative", height: 300 }}>
        <img src={offre.image_url} alt={offre.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.3) 0%,transparent 40%,rgba(0,0,0,.6) 100%)" }} />
        <button onClick={() => navigate(-1)} style={fabBtn(52, 16)}>{Ic.back(DS.white, 20)}</button>
        <button onClick={share} style={fabBtn(52, undefined, 64)}>{Ic.share(DS.white, 17)}</button>
        <button onClick={toggleFav} style={{ ...fabBtn(52, undefined, 16), transform: isFav ? "scale(1.15)" : "scale(1)", transition: "transform .2s" }}>
          {Ic.heart(isFav ? "#FF4D6D" : DS.white, 20, isFav)}
        </button>
        <div style={{ position: "absolute", bottom: 14, left: 16 }}>
          {expired
            ? <div style={{ background: "rgba(0,0,0,.7)", color: DS.white, borderRadius: DS.md, padding: "6px 14px", fontWeight: 800, fontSize: 16 }}>Expirée</div>
            : <BadgeReduction valeur={offre.valeur_reduction} type={offre.type_reduction} style={{ fontSize: 18, padding: "7px 16px" }} />
          }
        </div>
        {dist !== null && (
          <div style={{
            position: "absolute", bottom: 14, right: 16,
            background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)",
            color: DS.white, borderRadius: DS.pill, padding: "5px 12px",
            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
          }}>
            {Ic.pin(DS.white, 12)} {formatDist(dist)}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ padding: "16px 16px 80px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Bloc principal */}
        <div style={{ background: t.card, borderRadius: DS.xl, padding: 20, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DS.brand, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{offre.categorie}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: t.text, lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 6 }}>{offre.titre}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.text2, fontSize: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🏪</span>
            {offre.commercant_id
              ? <button onClick={() => navigate(`/CommercantProfil?id=${offre.commercant_id}`)} style={{ background: "none", border: "none", cursor: "pointer", color: DS.brand, fontSize: 14, fontWeight: 700, padding: 0, fontFamily: DS.fontBase }}>{offre.commercant_nom}</button>
              : <span>{offre.commercant_nom}</span>
            }
          </div>

          {/* Prix */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: pct !== null ? 14 : 0 }}>
            {offre.prix_promo > 0
              ? <span style={{ fontSize: 36, fontWeight: 900, color: DS.brand, letterSpacing: -1.5, lineHeight: 1 }}>{offre.prix_promo}€</span>
              : <span style={{ fontSize: 28, fontWeight: 800, color: DS.success }}>Gratuit</span>
            }
            {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
              <span style={{ fontSize: 17, color: t.isDark ? "rgba(255,255,255,.3)" : "#ccc", textDecoration: "line-through" }}>{offre.prix_original}€</span>
            )}
          </div>

          {/* Stock */}
          {pct !== null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: lowStock ? DS.danger : t.text2, fontWeight: 700 }}>
                  {lowStock ? "⚠️ " : ""}{offre.stock_restant} restant{offre.stock_restant > 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: 11, color: t.text2 }}>/{offre.stock_initial}</span>
              </div>
              <div style={{ background: t.isDark ? "rgba(255,255,255,.1)" : DS.ink10, borderRadius: DS.pill, height: 5 }}>
                <div style={{ background: lowStock ? DS.danger : DS.success, height: "100%", borderRadius: DS.pill, width: `${Math.min(pct, 100)}%`, transition: "width 1.2s" }} />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {offre.description && (
          <div style={{ background: t.card, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Description</div>
            <div style={{ fontSize: 14, color: t.text2, lineHeight: 1.8 }}>{offre.description}</div>
          </div>
        )}

        {/* Countdown flash */}
        {offre.est_urgente && offre.date_fin && !expired && (
          <div style={{ background: t.card, borderRadius: DS.lg, padding: "12px 18px", boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
            <Countdown dateFin={offre.date_fin} />
          </div>
        )}

        {/* CTA */}
        {!expired && (
          <div>
            {!codeVis ? (
              <button onClick={useOffer} style={{
                width: "100%", background: DS.brand, color: DS.white, border: "none",
                borderRadius: DS.xl, padding: "18px",
                fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: DS.eBrand,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                🎫 Obtenir le code promo
              </button>
            ) : (
              <div style={{ background: t.card, borderRadius: DS.xl, padding: 22, textAlign: "center", boxShadow: DS.e2, border: `2px solid ${DS.brand}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Code promo</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: t.text, letterSpacing: 6, fontFamily: "monospace", marginBottom: 14 }}>
                  {offre.code_promo || "CLICKPROMO"}
                </div>
                <button onClick={copyCode} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: copied ? DS.success : DS.ink, color: DS.white,
                  border: "none", borderRadius: DS.md, padding: "10px 20px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .3s",
                }}>
                  {copied ? Ic.check(DS.white, 14) : Ic.copy2(DS.white, 14)} {copied ? "Copié !" : "Copier"}
                </button>
                <div style={{ fontSize: 12, color: t.text2, marginTop: 12 }}>Présentez ce code au commerçant</div>
              </div>
            )}
          </div>
        )}

        {/* Expirée */}
        {expired && (
          <div style={{ background: t.card, borderRadius: DS.lg, padding: 22, textAlign: "center", boxShadow: DS.e1 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
            <div style={{ fontWeight: 700, color: t.text2, marginBottom: 14, fontSize: 15 }}>Cette offre est expirée</div>
            <button onClick={() => navigate("/Feed")} style={{ background: DS.brand, color: DS.white, border: "none", borderRadius: DS.lg, padding: "12px 24px", fontWeight: 700, cursor: "pointer", boxShadow: DS.eBrand }}>
              Voir les offres
            </button>
          </div>
        )}

        {/* Localisation */}
        {offre.adresse && (
          <div style={{ background: t.card, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>📍 Adresse</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{offre.adresse}</div>
                <div style={{ fontSize: 13, color: t.text2, marginTop: 2 }}>{offre.ville}</div>
                {dist !== null && (
                  <div style={{ fontSize: 12, color: DS.success, fontWeight: 600, marginTop: 5 }}>
                    📍 {formatDist(dist)} de vous
                  </div>
                )}
              </div>
              <button onClick={() => window.open(`https://maps.google.com/?q=${offre.latitude},${offre.longitude}`, "_blank")} style={{
                background: DS.ink, color: DS.white, border: "none", borderRadius: DS.md,
                padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                {Ic.nav(DS.white, 14)} Y aller
              </button>
            </div>
          </div>
        )}

        {/* Conditions */}
        {offre.conditions && (
          <div style={{ background: "#FFFBEB", borderRadius: DS.md, padding: 14, border: "1px solid #FDE68A" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: .8, marginBottom: 6 }}>Conditions</div>
            <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.75 }}>{offre.conditions}</div>
          </div>
        )}

        {/* Offres similaires */}
        {similar.length > 0 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 12 }}>🎯 Offres similaires</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" }}>
              {similar.map(o => (
                <SimilarCard key={o.id} o={o} onPress={() => navigate(`/OffreDetail?id=${o.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}