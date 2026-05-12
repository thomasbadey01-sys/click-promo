import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DS, getTheme } from "@/pages/theme";
import { smartSearch } from "@/functions/smartSearch";
import { base44 } from "@/api/base44Client";
import { ProfilUtilisateur } from "@/api/entities";

const SUGGESTIONS = [
  "Restaurant pas cher à Lyon ce soir",
  "Flash deals beauté Lyon",
  "Sport et fitness près de moi",
  "Épicerie bio moins de 10€",
  "Promo coiffeur cette semaine",
];

function OffreCard({ o, onPress }) {
  return (
    <div onClick={onPress} style={{
      display: "flex", gap: 12, padding: "12px 0",
      borderBottom: `1px solid ${DS.ink05}`,
      cursor: "pointer",
      alignItems: "center",
    }}>
      <div style={{ width: 60, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
        <img src={o.image_url} alt={o.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: DS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {o.commercant_nom}
        </div>
        <div style={{ fontSize: 12, color: DS.ink60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {o.titre}
        </div>
        {o.ville && (
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>📍 {o.ville}</div>
        )}
      </div>
      {o.valeur_reduction > 0 && (
        <div style={{
          background: DS.brand, color: "#fff", borderRadius: DS.pill,
          padding: "4px 10px", fontSize: 12, fontWeight: 900, flexShrink: 0,
        }}>
          -{o.valeur_reduction}{o.type_reduction === "pourcentage" ? "%" : "€"}
        </div>
      )}
    </div>
  );
}

export default function SmartSearch({ onClose }) {
  const navigate = useNavigate();
  const t = getTheme();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cp_search_history") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    inputRef.current?.focus();
    base44.auth.me().then(async u => {
      const profils = await ProfilUtilisateur.filter({ user_id: u.id });
      if (profils.length > 0) setUserProfile(profils[0]);
    }).catch(() => {});
  }, []);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    const trimmed = q.trim();
    // Sauvegarder dans l'historique
    const newHistory = [trimmed, ...history.filter(h => h !== trimmed)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("cp_search_history", JSON.stringify(newHistory));

    const res = await smartSearch({ query: trimmed, userProfile });
    setResults(res.data);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: t.isDark ? "rgba(15,15,26,.97)" : "rgba(255,255,255,.98)",
      backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
      fontFamily: DS.fontBase,
    }}>
      {/* Header */}
      <div style={{
        padding: `calc(${DS.safeTop} + 10px) 16px 12px`,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            {/* Icône IA */}
            <div style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 18, pointerEvents: "none",
            }}>✨</div>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex : resto pas cher à Lyon ce soir…"
              style={{
                width: "100%", boxSizing: "border-box",
                background: t.isDark ? DS.dark3 : DS.bg,
                border: `1.5px solid ${DS.brand}`,
                borderRadius: 100, padding: "12px 14px 12px 40px",
                fontSize: 15, color: t.text, fontFamily: DS.fontBase, outline: "none",
              }}
            />
          </div>
          <button onClick={onClose} type="button" style={{
            background: "none", border: "none", cursor: "pointer",
            color: t.text2, fontSize: 14, fontWeight: 700, padding: "0 4px", flexShrink: 0,
          }}>Annuler</button>
        </form>

        {/* Badge ville détectée */}
        {userProfile?.ville && !results && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: t.text2 }}>Profil :</span>
            <div style={{ background: DS.brandLight, color: DS.brand, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              📍 {userProfile.ville}
            </div>
            {userProfile.categories_favorites?.slice(0, 2).map(c => (
              <div key={c} style={{ background: DS.bg, color: DS.ink60, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{c}</div>
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
              margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              <span style={{ fontSize: 24 }}>✨</span>
            </div>
            <div style={{ color: t.text2, fontSize: 14, fontWeight: 600 }}>L'IA analyse votre recherche…</div>
            <div style={{ color: t.text2, fontSize: 12, marginTop: 4, opacity: 0.6 }}>Recherche dans les offres réelles</div>
          </div>
        )}

        {/* Résultats */}
        {results && !loading && (
          <>
            {/* Message IA */}
            <div style={{
              background: DS.brandLight, borderRadius: 16, padding: "12px 16px",
              marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>✨</span>
              <div style={{ fontSize: 14, color: DS.brand, fontWeight: 600, lineHeight: 1.5 }}>
                {results.message}
              </div>
            </div>

            {/* Préférences apprises */}
            {results.detected && (results.detected.ville || results.detected.categorie) && (
              <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "8px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>🧠</span>
                <div style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>
                  Préférences mémorisées
                  {results.detected.ville && results.detected.ville !== "null" ? ` · ${results.detected.ville}` : ""}
                  {results.detected.categorie && results.detected.categorie !== "null" ? ` · ${results.detected.categorie}` : ""}
                </div>
              </div>
            )}

            {/* Liste offres */}
            {results.offres?.length > 0 ? (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text2, marginBottom: 8 }}>
                  {results.offres.length} offre{results.offres.length > 1 ? "s" : ""} trouvée{results.offres.length > 1 ? "s" : ""}
                </div>
                {results.offres.map(o => (
                  <OffreCard key={o.id} o={o} onPress={() => { navigate(`/OffreDetail?id=${o.id}`); onClose(); }} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", paddingTop: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Aucune offre correspondante</div>
                <div style={{ fontSize: 13, color: t.text2, marginTop: 6 }}>Essayez une autre recherche</div>
              </div>
            )}
          </>
        )}

        {/* État initial : suggestions + historique */}
        {!results && !loading && (
          <>
            {history.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                  Recherches récentes
                </div>
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setQuery(h); doSearch(h); }} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "10px 0", borderBottom: `1px solid ${t.border}`,
                    textAlign: "left",
                  }}>
                    <span style={{ fontSize: 14, color: t.text2 }}>🕐</span>
                    <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{h}</span>
                  </button>
                ))}
              </div>
            )}

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                Suggestions
              </div>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); doSearch(s); }} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "10px 0", borderBottom: `1px solid ${t.border}`,
                  textAlign: "left",
                }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{s}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(.95)} }`}</style>
    </div>
  );
}