import { useState, useEffect } from "react";
import { Offre } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DS, getTheme } from "./theme";

export default function FetchResults() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const t = getTheme();

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      if (u?.role !== "admin") {
        navigate("/Feed");
        return;
      }
      
      // Récupérer les offres du dernier mois
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const all = await Offre.list('-created_date', 500);
      const recent = all.filter(o => {
        if (!o.created_date) return false;
        const createdDate = new Date(o.created_date);
        return createdDate >= thirtyDaysAgo;
      });
      
      setOffres(recent);
      setLoading(false);
    }).catch(() => {
      navigate("/Feed");
    });
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DS.fontBase }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: t.text2, fontSize: 13 }}>Chargement…</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{ background: t.card, padding: `${DS.safeTop} 16px 12px`, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.text, letterSpacing: -0.5 }}>
              📊 Résultats FetchRealOffers
            </div>
            <div style={{ fontSize: 12, color: t.text2, marginTop: 2 }}>
              {offres.length} offres créées (30 derniers jours)
            </div>
          </div>
          <button onClick={() => navigate("/Feed")} style={{
            background: DS.brand, color: "#fff", border: "none", borderRadius: 100,
            padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
          }}>
            ← Feed
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: "16px 16px 40px" }}>
        {offres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>🤷</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 8 }}>
              Aucune offre créée
            </div>
            <div style={{ fontSize: 13, color: t.text2 }}>
              Le fetch n'a pas généré d'offres le dernier mois
            </div>
          </div>
        ) : (
          <div>
            {offres.map(o => (
              <div key={o.id} style={{
                background: t.card, borderRadius: 16, marginBottom: 12,
                overflow: "hidden", boxShadow: `0 2px 8px ${t.isDark ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"}`,
                border: `1px solid ${t.border}`,
              }}>
                <div style={{ display: "flex", gap: 12, padding: 12 }}>
                  {/* Image */}
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                    <img src={o.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"}
                      alt={o.titre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => e.target.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"}
                    />
                  </div>
                  
                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.titre}
                      </div>
                      <div style={{ background: DS.brand, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>
                        -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: 12, color: t.text2, marginBottom: 6 }}>
                      {o.commercant_nom || "Commerce"} · {o.categorie}
                    </div>
                    
                    <div style={{ fontSize: 11, color: t.text2, marginBottom: 6 }}>
                      📍 {o.ville || "France"} {o.adresse ? `• ${o.adresse}` : ""}
                    </div>
                    
                    <div style={{ display: "flex", gap: 12, marginBottom: 6, fontSize: 11 }}>
                      {o.prix_promo > 0 && (
                        <span style={{ fontWeight: 800, color: DS.brand }}>{o.prix_promo}€</span>
                      )}
                      {o.prix_original > 0 && (
                        <span style={{ color: t.text2, textDecoration: "line-through" }}>{o.prix_original}€</span>
                      )}
                      {o.stock_initial > 0 && (
                        <span style={{ color: t.text2 }}>Stock: {o.stock_restant}/{o.stock_initial}</span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: 10, color: t.text2 }}>
                      Créée: {new Date(o.created_date).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: "0 12px 12px", display: "flex", gap: 8 }}>
                  <button onClick={() => navigate(`/OffreDetail?id=${o.id}`)} style={{
                    flex: 1, background: DS.brand, color: "#fff",
                    border: "none", borderRadius: 8, padding: "8px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}>
                    Voir l'offre
                  </button>
                  <button onClick={() => navigate(`/Dashboard?edit=${o.id}`)} style={{
                    flex: 1, background: t.isDark ? DS.dark3 : "#f5f5f7", color: t.text,
                    border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}>
                    Gérer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}