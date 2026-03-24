import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: splash, 1: onboarding, 2: go

  useEffect(() => {
    // Si déjà onboardé, aller direct au Feed
    const done = localStorage.getItem("cp_onboarded");
    if (done) { navigate("/Feed"); return; }

    const t1 = setTimeout(() => setStep(1), 1200);
    return () => clearTimeout(t1);
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem("cp_onboarded", "1");
    navigate("/Feed");
  };

  const slides = [
    {
      icon: "📍",
      title: "Offres près de chez vous",
      desc: "Découvrez des promotions exclusives dans vos commerces locaux, triées par distance en temps réel.",
      color: "#FF6B00"
    },
    {
      icon: "⏱️",
      title: "Offres limitées dans le temps",
      desc: "Des bons plans flash qui disparaissent vite — soyez parmi les premiers à en profiter.",
      color: "#FF3B30"
    },
    {
      icon: "🏪",
      title: "Soutenez le commerce local",
      desc: "Restaurants, coiffeurs, salles de sport… Des vrais commerçants de votre quartier.",
      color: "#34C759"
    },
  ];

  const [slideIdx, setSlideIdx] = useState(0);
  const slide = slides[slideIdx];

  if (step === 0) return (
    <div style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      height: "100vh", maxWidth: 430, margin: "0 auto",
      background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif"
    }}>
      <div style={{ fontSize: 72, marginBottom: 20, animation: "pulse 1s ease-in-out" }}>🏷️</div>
      <div style={{ color: "white", fontSize: 32, fontWeight: 900, letterSpacing: -0.5 }}>Click & Promo</div>
      <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, marginTop: 8 }}>
        Les meilleures promos près de vous
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i === 0 ? "white" : "rgba(255,255,255,0.4)",
            animation: `fadeIn 0.3s ${i * 0.2}s both`
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", maxWidth: 430, margin: "0 auto",
      background: "white", fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      overflow: "hidden"
    }}>
      {/* Visuel */}
      <div style={{
        flex: 1,
        background: `linear-gradient(135deg, ${slide.color}22, ${slide.color}44)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 40, transition: "background 0.4s"
      }}>
        <div style={{ fontSize: 100, marginBottom: 24 }}>{slide.icon}</div>
        <div style={{
          fontSize: 26, fontWeight: 800, color: "#1a1a1a",
          textAlign: "center", marginBottom: 14, lineHeight: 1.3
        }}>
          {slide.title}
        </div>
        <div style={{
          fontSize: 16, color: "#666",
          textAlign: "center", lineHeight: 1.7, maxWidth: 280
        }}>
          {slide.desc}
        </div>
      </div>

      {/* Contrôles */}
      <div style={{ padding: "30px 32px 48px" }}>
        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setSlideIdx(i)} style={{
              width: i === slideIdx ? 24 : 8, height: 8,
              borderRadius: 4, cursor: "pointer",
              background: i === slideIdx ? slide.color : "#e0e0e0",
              transition: "all 0.3s"
            }} />
          ))}
        </div>

        {slideIdx < slides.length - 1 ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={finishOnboarding} style={{
              flex: 1, background: "#f5f5f5", color: "#888",
              border: "none", borderRadius: 14, padding: "15px",
              fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>
              Passer
            </button>
            <button onClick={() => setSlideIdx(i => i + 1)} style={{
              flex: 2, background: `linear-gradient(135deg, ${slide.color}, #FF3B30)`,
              color: "white", border: "none", borderRadius: 14, padding: "15px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 16px ${slide.color}50`
            }}>
              Suivant →
            </button>
          </div>
        ) : (
          <button onClick={finishOnboarding} style={{
            width: "100%",
            background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
            color: "white", border: "none", borderRadius: 14, padding: "16px",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255,107,0,0.4)"
          }}>
            🚀 Découvrir les offres
          </button>
        )}
      </div>
    </div>
  );
}
