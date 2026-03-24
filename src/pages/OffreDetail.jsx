import { useState, useEffect } from "react";
import { Offre, Commercant } from "../api/entities";
import { Link, useSearchParams } from "react-router-dom";

function CountdownTimer({ dateFin }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(dateFin);
      const diff = end - now;
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [dateFin]);

  if (timeLeft.expired) return (
    <div style={{ textAlign: "center", padding: "12px", background: "#f8f8f8", borderRadius: 12, color: "#999" }}>
      Cette offre est expirée
    </div>
  );

  const units = [
    { val: String(timeLeft.h).padStart(2, "0"), label: "heures" },
    { val: String(timeLeft.m).padStart(2, "0"), label: "min" },
    { val: String(timeLeft.s).padStart(2, "0"), label: "sec" },
  ];

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {units.map((u, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{
            background: "#FF3B30", color: "white",
            borderRadius: 10, padding: "8px 14px",
            fontSize: 24, fontWeight: 800, minWidth: 52
          }}>{u.val}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{u.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function OffreDetail() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeVisible, setCodeVisible] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [utilisee, setUtilisee] = useState(false);

  useEffect(() => {
    if (!id) return;
    Offre.get(id).then(data => {
      setOffre(data);
      setLoading(false);
      const favs = JSON.parse(localStorage.getItem("cp_favs") || "[]");
      setIsFav(favs.includes(id));
      // Incrémenter les vues
      Offre.update(id, { nb_vues: (data.nb_vues || 0) + 1 });
    });
  }, [id]);

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("cp_favs") || "[]");
    const newFavs = isFav ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem("cp_favs", JSON.stringify(newFavs));
    setIsFav(!isFav);
  };

  const utiliserOffre = () => {
    setCodeVisible(true);
    setUtilisee(true);
    if (offre) {
      Offre.update(id, {
        nb_clics: (offre.nb_clics || 0) + 1,
        nb_conversions: (offre.nb_conversions || 0) + 1,
        stock_restant: Math.max(0, (offre.stock_restant || 0) - 1)
      });
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8f8f8" }}>
      <div style={{ fontSize: 40 }}>⏳</div>
    </div>
  );

  if (!offre) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div>Offre introuvable</div>
      <Link to="/Feed">Retour</Link>
    </div>
  );

  const stockPct = offre.stock_initial ? (offre.stock_restant / offre.stock_initial) * 100 : 100;

  return (
    <div style={{ background: "#F8F8F8", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Image hero */}
      <div style={{ position: "relative", height: 280 }}>
        <img src={offre.image_url} alt={offre.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />
        
        {/* Back */}
        <Link to="/Feed" style={{ textDecoration: "none" }}>
          <div style={{
            position: "absolute", top: 50, left: 16,
            background: "rgba(255,255,255,0.9)", borderRadius: "50%",
            width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18
          }}>←</div>
        </Link>

        {/* Favori */}
        <button onClick={toggleFav} style={{
          position: "absolute", top: 50, right: 16,
          background: "rgba(255,255,255,0.9)", borderRadius: "50%",
          width: 38, height: 38, border: "none", cursor: "pointer",
          fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center"
        }}>{isFav ? "❤️" : "🤍"}</button>

        {/* Badge */}
        <div style={{
          position: "absolute", bottom: 16, left: 16,
          background: "#FF3B30", color: "white",
          borderRadius: 20, padding: "6px 14px",
          fontWeight: 800, fontSize: 16
        }}>
          -{offre.valeur_reduction}{offre.type_reduction === "pourcentage" ? "%" : "€"}
        </div>
      </div>

      <div style={{ padding: "20px 16px 120px" }}>
        {/* Titre & commerçant */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#FF6B00", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {offre.categorie}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.3 }}>
            {offre.titre}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {offre.commercant_logo && (
              <img src={offre.commercant_logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
            )}
            <span style={{ fontSize: 14, color: "#555", fontWeight: 600 }}>{offre.commercant_nom}</span>
            <span style={{ fontSize: 13, color: "#aaa" }}>• {offre.adresse}</span>
          </div>
        </div>

        {/* Prix */}
        <div style={{
          background: "white", borderRadius: 14, padding: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>Prix promotionnel</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              {offre.prix_promo > 0 && (
                <span style={{ fontSize: 28, fontWeight: 800, color: "#FF3B30" }}>{offre.prix_promo}€</span>
              )}
              {offre.prix_original > 0 && (
                <span style={{ fontSize: 16, color: "#aaa", textDecoration: "line-through" }}>{offre.prix_original}€</span>
              )}
            </div>
          </div>
          {offre.prix_original > offre.prix_promo && (
            <div style={{ textAlign: "center", background: "#FFF3F0", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FF3B30" }}>
                -{(offre.prix_original - offre.prix_promo).toFixed(2)}€
              </div>
              <div style={{ fontSize: 11, color: "#FF6B00" }}>d'économie</div>
            </div>
          )}
        </div>

        {/* Compte à rebours si urgente */}
        {offre.est_urgente && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ textAlign: "center", marginBottom: 10, fontWeight: 700, color: "#FF3B30", fontSize: 14 }}>
              🔥 Offre limitée — se termine dans :
            </div>
            <CountdownTimer dateFin={offre.date_fin} />
          </div>
        )}

        {/* Stock */}
        {offre.stock_restant !== undefined && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Stock disponible</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: stockPct < 30 ? "#FF3B30" : "#34C759" }}>
                {offre.stock_restant} / {offre.stock_initial}
              </span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 6, height: 8 }}>
              <div style={{
                background: stockPct < 30 ? "#FF3B30" : "#34C759",
                height: "100%", borderRadius: 6,
                width: `${Math.min(stockPct, 100)}%`,
                transition: "width 0.3s"
              }} />
            </div>
            {stockPct < 30 && (
              <div style={{ fontSize: 12, color: "#FF3B30", marginTop: 6, fontWeight: 600 }}>
                ⚠️ Plus que {offre.stock_restant} disponible{offre.stock_restant > 1 ? "s" : ""} !
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>📝 Description</div>
          <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{offre.description}</div>
        </div>

        {/* Conditions */}
        {offre.conditions && (
          <div style={{ background: "#FFF9F0", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #FFE5CC" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#FF6B00" }}>⚠️ Conditions</div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{offre.conditions}</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { icon: "👁", val: offre.nb_vues || 0, label: "vues" },
            { icon: "👆", val: offre.nb_clics || 0, label: "utilisations" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "white", borderRadius: 12, padding: "12px",
              textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Code promo affiché */}
        {codeVisible && (
          <div style={{
            background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
            borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 16
          }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 8 }}>
              Montrez ce code au commerçant
            </div>
            <div style={{
              background: "white", borderRadius: 10, padding: "12px 20px",
              fontSize: 22, fontWeight: 800, letterSpacing: 4, color: "#FF3B30",
              display: "inline-block"
            }}>
              {offre.code_promo || "CP-" + id?.slice(-6).toUpperCase()}
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8 }}>
              ✅ Validez auprès du commerçant
            </div>
          </div>
        )}
      </div>

      {/* CTA fixe */}
      {!utilisee && (
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "white", padding: "12px 16px 32px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
        }}>
          <button
            onClick={utiliserOffre}
            style={{
              width: "100%", background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
              color: "white", border: "none", borderRadius: 14,
              padding: "16px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(255,107,0,0.4)"
            }}
          >
            🎁 Profiter de cette offre
          </button>
        </div>
      )}
    </div>
  );
}
