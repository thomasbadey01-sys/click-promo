import { useState, useEffect } from "react";
import { Offre, FavoriUtilisateur, HistoriqueOffresVues, UtilisationOffre } from "@/api/entities";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DS, Ic, BadgeReduction } from "./theme";
import { base44 } from "@/api/base44Client";
import { haversine, formatDist } from "./Feed";

// QR Code
function QRCode({ url, size = 180 }) {
  const [show, setShow] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=svg&bgcolor=ffffff&color=1a1a2e&margin=2`;
  if (!show) return (
    <button onClick={() => setShow(true)} style={{
      width: "100%", background: DS.white, border: `1.5px solid ${DS.ink10}`,
      borderRadius: DS.lg, padding: "12px",
      fontSize: 13, fontWeight: 700, color: DS.ink60, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      <svg width="16" height="16" fill="none" stroke={DS.ink60} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h.01M15 18h.01M18 15h.01M18 18h.01"/></svg>
      Afficher le QR code
    </button>
  );
  return (
    <div style={{ background: DS.white, borderRadius: DS.xl, padding: 22, textAlign: "center", boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: DS.ink, marginBottom: 4 }}>QR Code de l'offre</div>
      <div style={{ fontSize: 12, color: DS.ink40, marginBottom: 16 }}>Scannez pour accéder à cette offre</div>
      <div style={{ display: "inline-block", background: DS.white, borderRadius: DS.md, padding: 10, border: `2px solid ${DS.ink05}` }}>
        <img src={qrUrl} alt="QR Code" width={size} height={size} style={{ display: "block" }} />
      </div>
      <button onClick={() => setShow(false)} style={{ marginTop: 12, background: "none", border: "none", color: DS.ink40, fontSize: 12, cursor: "pointer" }}>Masquer</button>
    </div>
  );
}

// Compte à rebours
function Countdown({ dateFin }) {
  const [t, setT] = useState(Math.max(0, new Date(dateFin) - new Date()));
  useEffect(() => {
    const iv = setInterval(() => setT(Math.max(0, new Date(dateFin) - new Date())), 1000);
    return () => clearInterval(iv);
  }, [dateFin]);
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: DS.ink40, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>⚡ Offre flash — expire dans</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {[{v:pad(h),l:"Heures"},{v:pad(m),l:"Min"},{v:pad(s),l:"Sec"}].map(({v,l}) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ background: DS.brand, color: DS.white, borderRadius: DS.md, padding: "10px 14px", fontSize: 22, fontWeight: 900, minWidth: 50 }}>{v}</div>
            <div style={{ fontSize: 10, color: DS.ink40, marginTop: 4, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OffreDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const [offre, setOffre] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [codeVis, setCodeVis] = useState(false);
  const [copied, setCopied] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyErr, setBuyErr] = useState("");
  const [used, setUsed] = useState(false);
  const [paymentSuccess] = useState(new URLSearchParams(window.location.search).get("payment") === "success");

  useEffect(() => {
    if (!id) return;
    Offre.get(id).then(setOffre);
    // GPS
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setUserPos({ lat: 48.8566, lon: 2.3522 })
    );
    // Favoris + tracking
    base44.auth.me().then(async user => {
      try {
        const favs = await FavoriUtilisateur.filter({ offre_id: id, user_id: user.id });
        if (favs.length > 0) { setIsFav(true); setFavId(favs[0].id); }
      } catch {}
      // Historique
      try {
        const o = await Offre.get(id);
        await HistoriqueOffresVues.create({
          user_id: user.id, offre_id: id,
          offre_titre: o.titre, commercant_nom: o.commercant_nom,
          categorie: o.categorie, date_vue: new Date().toISOString(),
          image_url: o.image_url, ville: o.ville,
        });
        // Incrémenter vues
        await Offre.update(id, { nb_vues: (o.nb_vues || 0) + 1 });
      } catch {}
    }).catch(() => {});
  }, [id]);

  if (!offre) return (
    <div style={{ background: DS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <div style={{ color: DS.ink40 }}>Chargement de l'offre…</div>
      </div>
    </div>
  );

  const expired = offre.date_fin && new Date(offre.date_fin) < new Date();
  const dist = userPos && offre.latitude ? haversine(userPos.lat, userPos.lon, offre.latitude, offre.longitude) : null;
  const pct = offre.stock_initial > 0 ? Math.round((offre.stock_restant / offre.stock_initial) * 100) : null;

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
        points_gagnes: 10, statut: "utilise",
      });
      await Offre.update(id, {
        nb_conversions: (offre.nb_conversions || 0) + 1,
        stock_restant: Math.max(0, (offre.stock_restant || 1) - 1),
      });
      setUsed(true);
    } catch {}
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(offre.code_promo || "CLICKPROMO");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const buyOnline = async () => {
    setBuying(true); setBuyErr("");
    try {
      await base44.auth.me();
      // Paiement Stripe — activer après configuration
      setBuyErr("Paiement en ligne bientôt disponible. Utilisez le code promo.");
    } catch {
      navigate("/Login");
    } finally { setBuying(false); }
  };

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Image hero */}
      <div style={{ position: "relative", height: 320 }}>
        <img src={offre.image_url} alt={offre.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3) 0%, transparent 40%, rgba(0,0,0,.65) 100%)" }} />

        {/* Boutons top */}
        <button onClick={() => navigate(-1)} style={fabBtn(52, 14)}>{Ic.back(DS.white, 20)}</button>
        <button onClick={share} style={fabBtn(52, undefined, 62)}>{Ic.share(DS.white, 17)}</button>
        <button onClick={toggleFav} style={{ ...fabBtn(52, undefined, 14), transform: isFav ? "scale(1.1)" : "scale(1)", transition: "transform .2s" }}>
          {Ic.heart(isFav ? "#FF4D6D" : DS.white, 20, isFav)}
        </button>

        {/* Badge bottom-left */}
        <div style={{ position: "absolute", bottom: 16, left: 16 }}>
          {expired
            ? <div style={{ background: "rgba(0,0,0,.7)", color: DS.white, borderRadius: DS.md, padding: "6px 14px", fontWeight: 800, fontSize: 16 }}>Expirée</div>
            : <BadgeReduction valeur={offre.valeur_reduction} type={offre.type_reduction} style={{ fontSize: 18, padding: "7px 16px" }} />
          }
        </div>

        {/* Distance bottom-right */}
        {dist !== null && (
          <div style={{
            position: "absolute", bottom: 16, right: 16,
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

        {/* Succès paiement */}
        {paymentSuccess && (
          <div style={{ background: "#F0FFF9", border: `1.5px solid ${DS.success}`, borderRadius: DS.xl, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: DS.ink, marginBottom: 4 }}>Paiement confirmé !</div>
            <div style={{ fontSize: 13, color: DS.ink60 }}>Le commerçant vous contactera pour la livraison.</div>
          </div>
        )}

        {/* Bloc principal */}
        <div style={{ background: DS.white, borderRadius: DS.xl, padding: 20, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DS.brand, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{offre.categorie}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink, lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 6 }}>{offre.titre}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: DS.ink60, fontSize: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🏪</span> {offre.commercant_nom}
          </div>

          {/* Prix */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: pct !== null ? 14 : 0 }}>
            {offre.prix_promo > 0
              ? <span style={{ fontSize: 36, fontWeight: 900, color: DS.brand, letterSpacing: -1.5, lineHeight: 1 }}>{offre.prix_promo}€</span>
              : <span style={{ fontSize: 28, fontWeight: 800, color: DS.success }}>Gratuit</span>
            }
            {offre.prix_original > 0 && offre.prix_original !== offre.prix_promo && (
              <span style={{ fontSize: 17, color: DS.ink20, textDecoration: "line-through" }}>{offre.prix_original}€</span>
            )}
          </div>

          {/* Stock */}
          {pct !== null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: pct < 30 ? DS.danger : DS.ink60, fontWeight: 600 }}>
                  {offre.stock_restant} restant{offre.stock_restant > 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: 11, color: DS.ink40 }}>/{offre.stock_initial}</span>
              </div>
              <div style={{ background: DS.ink10, borderRadius: DS.pill, height: 5 }}>
                <div style={{ background: pct < 30 ? DS.danger : DS.success, height: "100%", borderRadius: DS.pill, width: `${Math.min(pct, 100)}%`, transition: "width 1.2s" }} />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {offre.description && (
          <div style={{ background: DS.white, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.ink40, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Description</div>
            <div style={{ fontSize: 14, color: DS.ink60, lineHeight: 1.8 }}>{offre.description}</div>
          </div>
        )}

        {/* Countdown */}
        {offre.est_urgente && offre.date_fin && !expired && (
          <div style={{ background: DS.white, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
            <Countdown dateFin={offre.date_fin} />
          </div>
        )}

        {/* CTA */}
        {!expired && !paymentSuccess && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Achat en ligne */}
            {offre.achat_en_ligne && offre.prix_promo > 0 && (
              <div style={{ background: DS.white, borderRadius: DS.xl, padding: 16, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
                <button onClick={buyOnline} disabled={buying} style={{
                  width: "100%", background: buying ? DS.ink10 : DS.brand,
                  color: buying ? DS.ink40 : DS.white, border: "none",
                  borderRadius: DS.lg, padding: "16px",
                  fontSize: 16, fontWeight: 800, cursor: buying ? "not-allowed" : "pointer",
                  boxShadow: buying ? "none" : DS.eBrand,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                  {buying ? "Redirection…" : `💳 Payer en ligne — ${offre.prix_promo}€`}
                </button>
                <div style={{ textAlign: "center", fontSize: 11, color: DS.ink40, marginTop: 8 }}>
                  🔒 Paiement sécurisé Stripe
                </div>
                {buyErr && <div style={{ marginTop: 8, color: DS.danger, fontSize: 13, textAlign: "center" }}>{buyErr}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
                  <div style={{ flex: 1, height: 1, background: DS.ink10 }} />
                  <span style={{ color: DS.ink40, fontSize: 12 }}>ou</span>
                  <div style={{ flex: 1, height: 1, background: DS.ink10 }} />
                </div>
                {codeVis
                  ? <CodeBlock code={offre.code_promo} copied={copied} onCopy={copyCode} />
                  : <button onClick={useOffer} style={secondaryBtn}>🏷️ Utiliser un code promo</button>
                }
              </div>
            )}

            {/* Code promo uniquement */}
            {!offre.achat_en_ligne && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {!codeVis
                  ? <button onClick={useOffer} style={{
                      width: "100%", background: DS.brand, color: DS.white, border: "none",
                      borderRadius: DS.xl, padding: "18px",
                      fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: DS.eBrand,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}>
                      🎫 Obtenir le code promo
                    </button>
                  : <div style={{ background: DS.white, borderRadius: DS.xl, padding: 22, textAlign: "center", boxShadow: DS.e2, border: `2px solid ${DS.brand}` }}>
                      <CodeBlock code={offre.code_promo} copied={copied} onCopy={copyCode} />
                      <div style={{ fontSize: 12, color: DS.ink40, marginTop: 12 }}>Présentez ce code au commerçant</div>
                    </div>
                }
              </div>
            )}
          </div>
        )}

        {/* Expirée */}
        {expired && (
          <div style={{ background: DS.white, borderRadius: DS.lg, padding: 22, textAlign: "center", boxShadow: DS.e1 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
            <div style={{ fontWeight: 700, color: DS.ink60, marginBottom: 14, fontSize: 15 }}>Cette offre est expirée</div>
            <button onClick={() => navigate("/Feed")} style={{ background: DS.brand, color: DS.white, border: "none", borderRadius: DS.lg, padding: "12px 24px", fontWeight: 700, cursor: "pointer", boxShadow: DS.eBrand }}>
              Voir les offres
            </button>
          </div>
        )}

        {/* Localisation */}
        {offre.adresse && (
          <div style={{ background: DS.white, borderRadius: DS.lg, padding: 18, boxShadow: DS.e1, border: `1px solid ${DS.ink10}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.ink40, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Adresse</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, color: DS.ink, fontWeight: 500 }}>{offre.adresse}</div>
                <div style={{ fontSize: 13, color: DS.ink40, marginTop: 2 }}>{offre.ville}</div>
                {dist !== null && (
                  <div style={{ fontSize: 12, color: DS.success, fontWeight: 600, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                    {Ic.pin(DS.success, 11)} {formatDist(dist)} de vous
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

        {/* QR Code */}
        <QRCode url={window.location.href} />
      </div>
    </div>
  );
}

// Sous-composants
const fabBtn = (top, left, right) => ({
  position: "absolute", top, left, right,
  width: 40, height: 40, borderRadius: 999,
  background: "rgba(0,0,0,.4)", backdropFilter: "blur(10px)",
  border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
});

function CodeBlock({ code, copied, onCopy }) {
  return (
    <div style={{ background: DS.ink05, borderRadius: DS.lg, padding: "16px", textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: DS.ink40, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Code promo</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: DS.ink, letterSpacing: 6, fontFamily: "monospace", marginBottom: 12 }}>
        {code || "CLICKPROMO"}
      </div>
      <button onClick={onCopy} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: copied ? DS.success : DS.ink, color: DS.white,
        border: "none", borderRadius: DS.md, padding: "9px 16px",
        fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .3s",
      }}>
        {copied ? Ic.check(DS.white, 14) : Ic.copy2(DS.white, 14)} {copied ? "Copié !" : "Copier"}
      </button>
    </div>
  );
}

const secondaryBtn = {
  width: "100%", background: DS.white, color: DS.ink60,
  border: `1px solid ${DS.ink10}`, borderRadius: DS.md,
  padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
};