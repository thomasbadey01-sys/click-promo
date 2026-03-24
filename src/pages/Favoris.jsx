import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { DS, CPLogo } from "./Home";

function CountdownBadge({ dateFin }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = new Date(dateFin) - new Date();
      if (diff <= 0) { setLabel("Expirée"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h > 24) setLabel(`${Math.floor(h / 24)}j restants`);
      else if (h > 0) setLabel(`${h}h ${m}m`);
      else setLabel(`${m}m`);
    };
    update();
    const t = setInterval(update, 15000);
    return () => clearInterval(t);
  }, [dateFin]);

  if (!label) return null;
  const expired = label === "Expirée";
  const urgent = !label.includes("j") && !label.includes("h") && label.includes("m");
  return (
    <span style={{
      background: expired ? "#f5f5f7" : urgent ? DS.danger : DS.primary,
      color: expired ? DS.textMuted : "white",
      borderRadius: DS.radius.full, padding: "3px 9px",
      fontSize: 11, fontWeight: 700,
      boxShadow: urgent && !expired ? `0 2px 6px ${DS.danger}55` : "none"
    }}>
      {expired ? "Expirée" : `⏱ ${label}`}
    </span>
  );
}

function SkeletonFav() {
  return (
    <div style={{ background: "white", borderRadius: DS.radius.lg, overflow: "hidden", marginBottom: 12, boxShadow: DS.shadow.sm, display: "flex", height: 110 }}>
      <div style={{ width: 110, background: "linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", flexShrink: 0 }} />
      <div style={{ flex: 1, padding: 14 }}>
        <div style={{ height: 14, background: "#f0f0f0", borderRadius: 6, marginBottom: 8, width: "80%" }} />
        <div style={{ height: 12, background: "#f0f0f0", borderRadius: 6, marginBottom: 8, width: "50%" }} />
        <div style={{ height: 12, background: "#f0f0f0", borderRadius: 6, width: "35%" }} />
      </div>
    </div>
  );
}

export default function Favoris() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState([]);
  const [tri, setTri] = useState("all");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("cp_favs") || "[]");
    setFavIds(ids);
    if (ids.length === 0) { setLoading(false); return; }
    Offre.list().then(all => {
      setOffres(all.filter(o => ids.includes(o.id)));
      setLoading(false);
    });
  }, []);

  const removeFav = (id) => {
    setRemoving(id);
    setTimeout(() => {
      const newFavs = favIds.filter(f => f !== id);
      setFavIds(newFavs);
      setOffres(prev => prev.filter(o => o.id !== id));
      localStorage.setItem("cp_favs", JSON.stringify(newFavs));
      setRemoving(null);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 250);
  };

  const filtered = offres.filter(o => {
    if (tri === "actives") return o.est_active && !(o.date_fin && new Date(o.date_fin) < new Date());
    if (tri === "urgentes") return o.est_urgente && o.est_active;
    if (tri === "expirees") return !o.est_active || (o.date_fin && new Date(o.date_fin) < new Date());
    return true;
  });

  const nbActives = offres.filter(o => o.est_active && !(o.date_fin && new Date(o.date_fin) < new Date())).length;
  const nbUrgentes = offres.filter(o => o.est_urgente && o.est_active).length;
  const nbExpirees = offres.filter(o => !o.est_active || (o.date_fin && new Date(o.date_fin) < new Date())).length;

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.font, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: DS.gradient, padding: "50px 16px 14px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <CPLogo size={32} white />
          <div>
            <div style={{ color: "white", fontSize: 17, fontWeight: 900, letterSpacing: -0.3 }}>Mes Favoris</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
              {offres.length} offre{offres.length !== 1 ? "s" : ""} sauvegardée{offres.length !== 1 ? "s" : ""}
            </div>
          </div>
          {nbUrgentes > 0 && (
            <div style={{ marginLeft: "auto", background: DS.danger, borderRadius: DS.radius.full, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>⚡ {nbUrgentes} flash</span>
            </div>
          )}
        </div>

        {/* Filtres */}
        {offres.length > 0 && (
          <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {[
              { key: "all", label: `🏷️ Tout (${offres.length})` },
              { key: "actives", label: `✅ Actives (${nbActives})` },
              { key: "urgentes", label: `⚡ Urgentes (${nbUrgentes})` },
              { key: "expirees", label: `⏱ Expirées (${nbExpirees})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTri(t.key)} style={{
                flexShrink: 0, background: tri === t.key ? "white" : "rgba(255,255,255,0.18)",
                color: tri === t.key ? DS.primary : "rgba(255,255,255,0.85)",
                border: "none", borderRadius: DS.radius.full, padding: "7px 13px",
                fontSize: 11, fontWeight: tri === t.key ? 800 : 500, cursor: "pointer",
                transition: "all 0.2s", boxShadow: tri === t.key ? DS.shadow.sm : "none"
              }}>{t.label}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px 100px" }}>

        {/* Skeleton */}
        {loading && [1, 2, 3].map(i => <SkeletonFav key={i} />)}

        {/* Vide */}
        {!loading && offres.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 24px" }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🤍</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: DS.text, marginBottom: 10, letterSpacing: -0.3 }}>Pas encore de favoris</div>
            <div style={{ fontSize: 14, color: DS.textSub, marginBottom: 28, lineHeight: 1.7 }}>
              Appuyez sur ❤️ sur une offre pour la retrouver ici instantanément.
            </div>
            <button onClick={() => navigate("/Feed")} style={{
              background: DS.gradient, color: "white", border: "none",
              borderRadius: DS.radius.lg, padding: "14px 32px",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              boxShadow: `0 6px 22px ${DS.primary}44`
            }}>
              🏷️ Découvrir les offres
            </button>
          </div>
        )}

        {/* Aucun dans ce filtre */}
        {!loading && offres.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: DS.textSub }}>Aucune offre dans ce filtre</div>
            <button onClick={() => setTri("all")} style={{ marginTop: 16, background: "none", border: `1.5px solid ${DS.border}`, borderRadius: DS.radius.lg, padding: "10px 22px", fontSize: 13, fontWeight: 600, color: DS.textSub, cursor: "pointer" }}>
              Voir tout
            </button>
          </div>
        )}

        {/* Liste */}
        {filtered.map(offre => {
          const isExpired = offre.date_fin && new Date(offre.date_fin) < new Date();
          const stockPct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial) * 100 : 100;
          return (
            <div key={offre.id} style={{
              background: DS.card, borderRadius: DS.radius.lg, overflow: "hidden",
              marginBottom: 12, boxShadow: DS.shadow.sm,
              opacity: removing === offre.id ? 0 : isExpired ? 0.65 : 1,
              transform: removing === offre.id ? "translateX(60px)" : "none",
              transition: "opacity 0.25s, transform 0.25s",
              border: offre.est_urgente && !isExpired ? `1.5px solid ${DS.danger}44` : `1.5px solid transparent`
            }}>
              <Link to={`/OffreDetail?id=${offre.id}`} style={{ textDecoration: "none", display: "flex" }}>
                {/* Image */}
                <div style={{ position: "relative", width: 110, flexShrink: 0 }}>
                  <img src={offre.image_url} alt={offre.titre}
                    style={{ width: "100%", height: 110, objectFit: "cover" }}
                    onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200"}
                  />
                  {/* Badge % */}
                  <div style={{
                    position: "absolute", top: 7, left: 7,
                    background: isExpired ? "#888" : offre.valeur_reduction >= 40 ? DS.danger : DS.primary,
                    color: "white", borderRadius: DS.radius.full, padding: "2px 8px",
                    fontSize: 11, fontWeight: 900, boxShadow: "0 1px 6px rgba(0,0,0,0.25)"
                  }}>
                    -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
                  </div>
                  {offre.est_urgente && !isExpired && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(255,59,48,0.85)", padding: "3px 0", textAlign: "center" }}>
                      <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>⚡ FLASH</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div style={{ padding: "11px 13px", flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: DS.text, marginBottom: 3, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {offre.titre}
                  </div>
                  <div style={{ fontSize: 11, color: DS.textSub, marginBottom: 7 }}>{offre.commercant_nom} · {offre.ville}</div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {offre.prix_promo > 0 && (
                      <span style={{ fontSize: 15, fontWeight: 900, color: DS.primary }}>{offre.prix_promo}€</span>
                    )}
                    {offre.prix_original > 0 && (
                      <span style={{ fontSize: 12, color: DS.textMuted, textDecoration: "line-through" }}>{offre.prix_original}€</span>
                    )}
                    {offre.date_fin && <CountdownBadge dateFin={offre.date_fin} />}
                  </div>

                  {/* Barre stock */}
                  {offre.stock_restant != null && !isExpired && (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ background: DS.border, borderRadius: DS.radius.full, height: 3 }}>
                        <div style={{ background: stockPct < 30 ? DS.danger : DS.success, height: "100%", borderRadius: DS.radius.full, width: `${Math.min(stockPct, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              {/* Footer actions */}
              <div style={{ borderTop: `1px solid ${DS.border}`, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isExpired ? DS.danger : offre.est_active ? DS.success : DS.warning }}>
                  {isExpired ? "⚠️ Expirée" : offre.est_active ? "✅ Disponible" : "⏸ Inactive"}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => navigate(`/OffreDetail?id=${offre.id}`)} style={{ background: `${DS.primary}15`, border: "none", borderRadius: DS.radius.full, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: DS.primary, cursor: "pointer" }}>
                    Voir →
                  </button>
                  <button onClick={() => removeFav(offre.id)} style={{ background: "#FFF0F0", border: "none", borderRadius: DS.radius.full, width: 30, height: 30, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Tip si favoris */}
        {!loading && offres.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 8, color: DS.textMuted, fontSize: 12 }}>
            💡 Glissez vers la gauche pour supprimer (bientôt)
          </div>
        )}
      </div>

      <NavBar active="favoris" />

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        ::-webkit-scrollbar { display: none }
      `}</style>
    </div>
  );
}
