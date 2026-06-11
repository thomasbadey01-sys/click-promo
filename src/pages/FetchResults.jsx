import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { DS, getTheme } from "./theme";
import { useAuth } from "@/lib/AuthContext";

const CATS = ["Tout", "Épicerie", "Boutique", "Restaurant", "Beauté & Coiffure", "Fitness & Sport", "Pharmacie", "Services", "Autre"];

const CAT_EMOJI = {
  "Restaurant": "🍽️", "Boutique": "👗", "Beauté & Coiffure": "💅",
  "Fitness & Sport": "🏋️", "Épicerie": "🥐", "Services": "🛠️",
  "Pharmacie": "💊", "Autre": "🎁", "Tout": "🏠",
};

export default function FetchResults() {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const t = getTheme();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user || user.role !== "admin") { navigate("/Feed"); return; }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Offre.list('-created_date', 500).then(all => {
      const recent = all.filter(o => {
        if (!o.created_date) return false;
        return new Date(o.created_date) >= thirtyDaysAgo;
      });
      setOffres(recent);
      setLoading(false);
    });
  }, [user, isLoadingAuth, navigate]);

  const filtered = offres.filter(o => {
    if (cat !== "Tout" && o.categorie !== cat) return false;
    if (showVerifiedOnly && !(o.adresse && o.adresse.trim())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!o.titre?.toLowerCase().includes(q) && !o.commercant_nom?.toLowerCase().includes(q) && !o.ville?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const nbVerified = offres.filter(o => o.adresse && o.adresse.trim()).length;
  const nbFlash = offres.filter(o => o.est_urgente).length;
  const totalEconomies = offres.reduce((s, o) => s + (o.prix_original - o.prix_promo > 0 ? o.prix_original - o.prix_promo : 0), 0);

  if (isLoadingAuth || loading) return (
    <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${DS.brand}33`, borderTopColor: DS.brand, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <div style={{ color: t.text2, fontSize: 13 }}>Chargement des offres lyonnaises…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{ background: t.card, padding: `calc(${DS.safeTop} + 8px) 16px 14px`, borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: t.text }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: t.text, letterSpacing: -0.5 }}>
              🏙️ Offres Lyonnaises
            </div>
            <div style={{ fontSize: 11, color: t.text2, marginTop: 1 }}>
              {offres.length} offres réelles · {nbVerified} adresses vérifiées
            </div>
          </div>
          <button onClick={() => navigate("/Carte")} style={{
            background: "#10B981", color: "#fff", border: "none", borderRadius: 100,
            padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer"
          }}>
            🗺️ Carte
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Adresses GPS", value: nbVerified, emoji: "📍", col: "#10B981" },
            { label: "Offres Flash", value: nbFlash, emoji: "⚡", col: DS.danger },
            { label: "Économies moy.", value: `${Math.round(totalEconomies / Math.max(offres.filter(o=>o.prix_original>0).length,1))}€`, emoji: "💰", col: DS.brand },
          ].map(s => (
            <div key={s.label} style={{ background: t.isDark ? DS.dark3 : "#F7F7FB", borderRadius: 12, padding: "10px 8px", textAlign: "center", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 16 }}>{s.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.col }}>{s.value}</div>
              <div style={{ fontSize: 9, color: t.text2, fontWeight: 600, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Barre de recherche */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher commerce, ville…"
            style={{
              width: "100%", boxSizing: "border-box",
              background: t.isDark ? DS.dark3 : "#F5F5F7",
              border: `1px solid ${t.border}`, borderRadius: 100,
              padding: "9px 14px 9px 34px", fontSize: 13, color: t.text,
              fontFamily: DS.fontBase, outline: "none",
            }}
          />
        </div>

        {/* Filtres catégorie */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none" }}>
          <button
            onClick={() => setShowVerifiedOnly(v => !v)}
            style={{
              flexShrink: 0, borderRadius: 100, padding: "6px 12px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: showVerifiedOnly ? "#10B981" : (t.isDark ? DS.dark3 : "#fff"),
              color: showVerifiedOnly ? "#fff" : t.text,
              border: `1.5px solid ${showVerifiedOnly ? "#10B981" : t.border}`,
              whiteSpace: "nowrap",
            }}>
            ✓ GPS seulement
          </button>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, borderRadius: 100, padding: "6px 12px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: cat === c ? DS.brand : (t.isDark ? DS.dark3 : "#fff"),
              color: cat === c ? "#fff" : t.text,
              border: `1.5px solid ${cat === c ? DS.brand : t.border}`,
              whiteSpace: "nowrap",
            }}>
              {CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Compteur résultats */}
      <div style={{ padding: "10px 16px 4px", fontSize: 12, color: t.text2, fontWeight: 600 }}>
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </div>

      {/* Liste */}
      <div style={{ padding: "0 16px 40px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>🤷</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 8 }}>Aucune offre trouvée</div>
            <div style={{ fontSize: 13, color: t.text2 }}>Essayez d'autres filtres</div>
          </div>
        ) : filtered.map(o => {
          const hasAddr = !!(o.adresse && o.adresse.trim());
          const isExpired = o.date_fin && new Date(o.date_fin) < new Date();
          return (
            <div key={o.id} style={{
              background: t.card, borderRadius: 16, marginBottom: 10,
              overflow: "hidden",
              boxShadow: `0 2px 8px ${t.isDark ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"}`,
              border: `1.5px solid ${hasAddr ? "#10B98133" : t.border}`,
              opacity: isExpired ? 0.65 : 1,
            }}>
              <div style={{ display: "flex", gap: 12, padding: "12px 12px 0" }}>
                {/* Thumbnail */}
                <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  <img
                    src={o.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"}
                    alt={o.titre}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"}
                  />
                  {hasAddr && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#10B981EE", color: "#fff", fontSize: 8, fontWeight: 800, textAlign: "center", padding: "2px 0" }}>
                      ✓ GPS
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {o.titre}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {o.est_urgente && <span style={{ background: DS.danger, color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 800 }}>⚡ FLASH</span>}
                      {o.valeur_reduction > 0 && (
                        <span style={{ background: DS.brand, color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 10, fontWeight: 800 }}>
                          -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: t.text2, marginBottom: 2 }}>
                    {CAT_EMOJI[o.categorie] || "🏷️"} {o.commercant_nom || "Commerce"}
                  </div>

                  {hasAddr ? (
                    <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginBottom: 2 }}>
                      📍 {o.adresse}{o.ville ? `, ${o.ville}` : ""}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: t.text2, marginBottom: 2 }}>
                      🏙️ {o.ville || "Lyon"}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    {o.prix_promo > 0 && <span style={{ fontWeight: 800, fontSize: 14, color: DS.brand }}>{o.prix_promo}€</span>}
                    {o.prix_original > 0 && o.prix_original !== o.prix_promo && (
                      <span style={{ fontSize: 11, color: t.text2, textDecoration: "line-through" }}>{o.prix_original}€</span>
                    )}
                    {o.prix_original > 0 && o.prix_promo > 0 && (
                      <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>
                        -{Math.round(((o.prix_original - o.prix_promo) / o.prix_original) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Détails supplémentaires */}
              <div style={{ padding: "8px 12px 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {o.code_promo && (
                  <div style={{ background: t.isDark ? DS.dark3 : "#F0F9FF", border: "1px dashed #60A5FA", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#3B82F6" }}>
                    🎫 {o.code_promo}
                  </div>
                )}
                {o.stock_initial > 0 && (
                  <div style={{ background: t.isDark ? DS.dark3 : "#F5F5F7", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: t.text2 }}>
                    Stock: {o.stock_restant}/{o.stock_initial}
                  </div>
                )}
                {o.date_fin && (
                  <div style={{ background: isExpired ? "#FEF2F2" : "#FFF7ED", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: isExpired ? DS.danger : DS.warning, fontWeight: 600 }}>
                    {isExpired ? "✗ Expirée" : `⏰ ${new Date(o.date_fin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`}
                  </div>
                )}
                {hasAddr && o.latitude && o.longitude && (
                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${o.latitude},${o.longitude}`, "_blank")}
                    style={{ background: "#ECFDF5", border: "1px solid #10B98133", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: "#10B981", fontWeight: 700, cursor: "pointer" }}>
                    🗺️ Maps
                  </button>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: "8px 12px 12px", display: "flex", gap: 8 }}>
                <button onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{
                  flex: 2, background: DS.brand, color: "#fff",
                  border: "none", borderRadius: 10, padding: "9px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}>
                  Voir l'offre
                </button>
                {hasAddr && (
                  <button onClick={() => navigate(`/Carte`)} style={{
                    flex: 1, background: "#ECFDF5", color: "#10B981",
                    border: "1px solid #10B98133", borderRadius: 10, padding: "9px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}>
                    📍 Carte
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}