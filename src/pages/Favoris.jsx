import { useState, useEffect, useRef } from "react";
import { FavoriUtilisateur, Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo, NavBar, BadgeReduction } from "./theme";

const CATS = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Services"];

export default function Favoris() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("Tout");
  const [loading, setLoading] = useState(true);
  const [swipeStates, setSwipeStates] = useState({});
  const touchStartX = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const user = await UserAuth.me();
        const favs = await FavoriUtilisateur.filter({ user_id: user.id });
        const offres = await Promise.all(favs.map(f => Offre.get(f.offre_id).catch(() => null)));
        setItems(offres.filter(Boolean).map((o, i) => ({ ...o, fav_id: favs[i].id })));
      } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, []);

  const filtered = cat === "Tout" ? items : items.filter(o => o.categorie === cat);
  const now = new Date();

  const removeFav = async (favId, offreId) => {
    await FavoriUtilisateur.filter({ offre_id: offreId }).then(f => f.forEach(x => FavoriUtilisateur.delete(x.id)));
    setItems(p => p.filter(o => o.id !== offreId));
    setSwipeStates(p => ({ ...p, [offreId]: 0 }));
  };

  const handleTouchStart = (e, offreId) => {
    touchStartX.current[offreId] = e.touches[0].clientX;
  };

  const handleTouchMove = (e, offreId) => {
    if (!touchStartX.current[offreId]) return;
    const startX = touchStartX.current[offreId];
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setSwipeStates(p => ({ ...p, [offreId]: Math.min(diff, 100) }));
    }
  };

  const handleTouchEnd = (offreId) => {
    const offset = swipeStates[offreId] || 0;
    if (offset > 60) {
      setSwipeStates(p => ({ ...p, [offreId]: 100 }));
    } else {
      setSwipeStates(p => ({ ...p, [offreId]: 0 }));
    }
    touchStartX.current[offreId] = null;
  };

  if (loading) return (
    <div style={{ background: DS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center" }}>
        <CPLogo size={40} />
        <div style={{ marginTop: 12, color: DS.ink40, fontSize: 14 }}>Chargement…</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>

      {/* Header */}
      <div style={{ background: DS.white, padding: "52px 16px 12px", borderBottom: `1px solid ${DS.ink10}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: DS.ink, letterSpacing: -0.5 }}>
            Mes Favoris <span style={{ fontSize: 16, color: DS.ink40, fontWeight: 600 }}>({items.length})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CPLogo size={28} />
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: DS.pill, padding: "7px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: cat === c ? DS.brand : DS.white,
              color: cat === c ? DS.white : DS.ink,
              border: `1.5px solid ${cat === c ? DS.brand : DS.ink10}`,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div style={{ padding: "14px 16px 100px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>❤️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: DS.ink, marginBottom: 8 }}>
              {cat === "Tout" ? "Aucun favori" : "Aucun favori dans cette catégorie"}
            </div>
            <div style={{ fontSize: 14, color: DS.ink40, marginBottom: 24 }}>
              Sauvegardez vos offres préférées
            </div>
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
              background: DS.white, borderRadius: DS.xl, marginBottom: 12,
              overflow: "hidden", boxShadow: DS.e1, border: `1px solid ${DS.ink10}`,
              opacity: expired ? 0.6 : 1,
              position: "relative",
            }}>
              {/* Swipe Delete Background */}
              <div style={{
                position: "absolute", top: 0, right: 0, width: "100%", height: "100%",
                background: DS.danger, display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: 16, zIndex: 1, opacity: swipeOffset > 50 ? 1 : 0.3,
              }}>
                <span style={{ color: DS.white, fontWeight: 800, fontSize: 14 }}>Supprimer</span>
              </div>

              {/* Swipe Container */}
              <div
                onTouchStart={(e) => handleTouchStart(e, o.id)}
                onTouchMove={(e) => handleTouchMove(e, o.id)}
                onTouchEnd={() => handleTouchEnd(o.id)}
                style={{
                  transform: `translateX(-${swipeOffset}px)`,
                  transition: swipeOffset === 0 || swipeOffset === 100 ? "transform 0.3s ease" : "none",
                  position: "relative",
                  zIndex: 2,
                  background: DS.white,
                }}
              >
                <div onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{ cursor: "pointer" }}>
                  {/* Image */}
                  <div style={{ position: "relative", height: 160 }}>
                    <img src={o.image_url} alt={o.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"} />
                    <div style={{ position: "absolute", bottom: 10, right: 10 }}>
                      <BadgeReduction valeur={o.valeur_reduction} type={o.type_reduction} />
                    </div>
                    {expired && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,.6)", color: DS.white, borderRadius: DS.pill, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        Expirée
                      </div>
                    )}
                    {lowStock && !expired && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: DS.warning, color: DS.white, borderRadius: DS.pill, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        ⚠️ Stock faible
                      </div>
                    )}
                  </div>
                  {/* Infos */}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: DS.ink, marginBottom: 2 }}>{o.commercant_nom || o.titre}</div>
                    <div style={{ fontSize: 13, color: DS.ink60 }}>{o.categorie}{o.ville ? ` · ${o.ville}` : ""}</div>
                    {o.prix_promo > 0 && (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 18, color: DS.brand }}>{o.prix_promo}€</span>
                        {o.prix_original > 0 && <span style={{ fontSize: 13, color: DS.ink40, textDecoration: "line-through" }}>{o.prix_original}€</span>}
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 10, padding: "0 14px 12px" }}>
                  <button onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{
                    flex: 1, background: expired ? DS.ink05 : DS.brand,
                    color: expired ? DS.ink40 : DS.white,
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
                  }}>
                    {Ic.heart(DS.danger, 18, true)}
                  </button>
                </div>

                {/* Confirm Delete Button (shows on swipe) */}
                {swipeOffset > 50 && (
                  <div style={{
                    position: "absolute", bottom: 12, right: 14,
                    display: "flex", gap: 8,
                  }}>
                    <button onClick={() => removeFav(o.fav_id, o.id)} style={{
                      background: DS.danger, color: DS.white, border: "none",
                      borderRadius: DS.lg, padding: "8px 14px",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}>
                      Confirmer
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NavBar active="Favoris" />
    </div>
  );
}
