import { useState, useEffect, useRef } from "react";
import { FavoriUtilisateur, Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, Ic, CPLogo, NavBar, BadgeReduction, getTheme } from "./theme";

const CATS = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Services","Pharmacie","Autre"];

export default function Favoris() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("Tout");
  const [loading, setLoading] = useState(true);
  const [swipeStates, setSwipeStates] = useState({});
  const touchStartX = useRef({});
  const t = getTheme();

  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const favs = await FavoriUtilisateur.filter({ user_id: u.id });
        const offresWithFav = await Promise.all(
          favs.map(async f => {
            const o = await Offre.get(f.offre_id).catch(() => null);
            return o ? { ...o, fav_id: f.id } : null;
          })
        );
        setItems(offresWithFav.filter(Boolean));
      } catch (e) { setUser(null); }
      setLoading(false);
    })();
  }, []);

  const filtered = cat === "Tout" ? items : items.filter(o => o.categorie === cat);
  const now = new Date();

  const removeFav = async (favId, offreId) => {
    await FavoriUtilisateur.delete(favId);
    setItems(p => p.filter(o => o.id !== offreId));
  };

  const handleTouchStart = (e, offreId) => { touchStartX.current[offreId] = e.touches[0].clientX; };
  const handleTouchMove = (e, offreId) => {
    if (!touchStartX.current[offreId]) return;
    const diff = touchStartX.current[offreId] - e.touches[0].clientX;
    if (diff > 0) setSwipeStates(p => ({ ...p, [offreId]: Math.min(diff, 100) }));
  };
  const handleTouchEnd = (offreId) => {
    const offset = swipeStates[offreId] || 0;
    setSwipeStates(p => ({ ...p, [offreId]: offset > 60 ? 100 : 0 }));
    touchStartX.current[offreId] = null;
  };

  if (!loading && !user) return (
    <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase, padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>❤️</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 10 }}>Connectez-vous</div>
        <div style={{ color: t.text2, marginBottom: 28, fontSize: 14 }}>Pour sauvegarder vos offres favorites</div>
        <button onClick={() => base44.auth.redirectToLogin(window.location.href)} style={{ background: DS.brand, color: "#fff", border: "none", borderRadius: 100, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: DS.eBrand }}>
          Se connecter
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>
      <div style={{ background: t.card, padding: `calc(${DS.safeTop} + 8px) 16px 12px`, marginBottom: 8 }}>
        <div className={t.shimmer} style={{ height: 28, width: 160, marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[70, 100, 90, 110, 85].map((w, i) => <div key={i} className={t.shimmer} style={{ height: 34, width: w, borderRadius: 100, flexShrink: 0 }} />)}
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {[1,2,3].map(i => <div key={i} style={{ background: t.card, borderRadius: 20, marginBottom: 12, overflow: "hidden" }}><div className={t.shimmer} style={{ height: 160 }} /></div>)}
      </div>
    </div>
  );

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{ background: t.card, padding: `calc(${DS.safeTop} + 8px) 16px 12px`, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: t.text, letterSpacing: -0.5 }}>
            Mes Favoris <span style={{ fontSize: 16, color: t.text2, fontWeight: 600 }}>({items.length})</span>
          </div>
          <CPLogo size={28} />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: DS.pill, padding: "7px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: cat === c ? DS.brand : (t.isDark ? DS.dark3 : DS.white),
              color: cat === c ? DS.white : t.text,
              border: `1.5px solid ${cat === c ? DS.brand : t.border}`,
              whiteSpace: "nowrap",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div style={{ padding: "14px 16px 100px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>❤️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 8 }}>
              {cat === "Tout" ? "Aucun favori" : "Aucun favori dans cette catégorie"}
            </div>
            <div style={{ fontSize: 14, color: t.text2, marginBottom: 24 }}>Sauvegardez vos offres préférées</div>
            <button onClick={() => navigate("/Feed")} style={{
              background: DS.brand, color: DS.white, border: "none",
              borderRadius: DS.pill, padding: "14px 28px",
              fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: DS.eBrand,
            }}>Découvrir des offres</button>
          </div>
        ) : filtered.map(o => {
          const expired = o.date_fin && new Date(o.date_fin) < now;
          const lowStock = o.stock_initial > 0 && (o.stock_restant / o.stock_initial) < 0.2;
          const swipeOffset = swipeStates[o.id] || 0;
          return (
            <div key={o.id} style={{
              borderRadius: DS.xl, marginBottom: 12, overflow: "hidden",
              boxShadow: DS.e1, border: `1px solid ${t.border}`,
              opacity: expired ? 0.6 : 1, position: "relative",
            }}>
              {/* Background swipe */}
              <div style={{
                position: "absolute", top: 0, right: 0, width: "100%", height: "100%",
                background: DS.danger, display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: 20, zIndex: 1, opacity: swipeOffset > 50 ? 1 : 0.4,
              }}>
                <span style={{ color: DS.white, fontWeight: 800, fontSize: 14 }}>🗑️ Supprimer</span>
              </div>
              {/* Card */}
              <div
                onTouchStart={(e) => handleTouchStart(e, o.id)}
                onTouchMove={(e) => handleTouchMove(e, o.id)}
                onTouchEnd={() => handleTouchEnd(o.id)}
                style={{
                  transform: `translateX(-${swipeOffset}px)`,
                  transition: swipeOffset === 0 || swipeOffset === 100 ? "transform 0.3s ease" : "none",
                  position: "relative", zIndex: 2, background: t.card,
                }}
              >
                <div onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{ cursor: "pointer" }}>
                  <div style={{ position: "relative", height: 150 }}>
                    <img src={o.image_url} alt={o.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"} />
                    <div style={{ position: "absolute", bottom: 10, right: 10 }}>
                      <BadgeReduction valeur={o.valeur_reduction} type={o.type_reduction} />
                    </div>
                    {expired && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,.6)", color: DS.white, borderRadius: DS.pill, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Expirée</div>
                    )}
                    {lowStock && !expired && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: DS.warning, color: DS.white, borderRadius: DS.pill, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>⚠️ Stock faible</div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 0" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: t.text, marginBottom: 2 }}>{o.commercant_nom || o.titre}</div>
                    <div style={{ fontSize: 13, color: t.text2 }}>{o.categorie}{o.ville ? ` · ${o.ville}` : ""}</div>
                    {o.prix_promo > 0 && (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 17, color: DS.brand }}>{o.prix_promo}€</span>
                        {o.prix_original > 0 && <span style={{ fontSize: 13, color: t.text2, textDecoration: "line-through" }}>{o.prix_original}€</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, padding: "10px 14px 14px" }}>
                  <button onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{
                    flex: 1, background: expired ? (t.isDark ? DS.dark3 : DS.ink05) : DS.brand,
                    color: expired ? t.text2 : DS.white,
                    border: "none", borderRadius: DS.lg, padding: "11px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    boxShadow: expired ? "none" : DS.eBrand,
                  }}>
                    {expired ? "Voir quand même" : "Voir l'offre"}
                  </button>
                  <button onClick={() => removeFav(o.fav_id, o.id)} style={{
                    background: "#FEF2F2", border: `1px solid ${DS.danger}22`,
                    borderRadius: DS.lg, padding: "11px 14px",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    minWidth: 44,
                  }}>
                    {Ic.heart(DS.danger, 18, true)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NavBar active="Favoris" />
    </div>
  );
}