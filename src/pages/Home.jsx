import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";

// Logo SVG Click & Promo — design system officiel
export function CPLogo({ size = 40, white = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill={white ? "rgba(255,255,255,0.15)" : "url(#grad)"} />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00"/>
          <stop offset="100%" stopColor="#FF3B30"/>
        </linearGradient>
      </defs>
      {/* Price tag shape */}
      <path d="M28 20 L28 62 L50 82 L72 62 L72 20 Z" fill="white" fillOpacity={white ? "1" : "0.95"} />
      <circle cx="50" cy="16" r="6" fill={white ? "rgba(255,255,255,0.4)" : "url(#grad)"} />
      {/* % symbol */}
      <text x="50" y="57" textAnchor="middle" fontSize="28" fontWeight="900" fill={white ? "white" : "#FF6B00"} fontFamily="SF Pro Display, -apple-system, sans-serif">%</text>
      {/* Pin dot */}
      <circle cx="50" cy="71" r="3" fill={white ? "rgba(255,255,255,0.6)" : "#FF6B00"} />
    </svg>
  );
}

// Design tokens
export const DS = {
  primary: "#FF6B00",
  primaryDark: "#E55A00",
  secondary: "#FF3B30",
  gradient: "linear-gradient(135deg, #FF6B00 0%, #FF3B30 100%)",
  gradientDark: "linear-gradient(135deg, #1a0a00 0%, #2d1200 100%)",
  bg: "#F7F7F9",
  card: "#FFFFFF",
  text: "#111111",
  textSub: "#6B6B6B",
  textMuted: "#ABABAB",
  border: "#EFEFEF",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#FF9500",
  radius: { sm: 10, md: 16, lg: 22, xl: 28, full: 999 },
  shadow: { sm: "0 1px 6px rgba(0,0,0,0.07)", md: "0 4px 16px rgba(0,0,0,0.09)", lg: "0 8px 32px rgba(0,0,0,0.13)" },
  font: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif",
};

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const user = await UserAuth.me();
        if (user) { navigate("/Feed"); return; }
      } catch {}
      const t = setTimeout(() => setStep(1), 1600);
      return () => clearTimeout(t);
    };
    check();
  }, []);

  const slides = [
    {
      emoji: "📍",
      title: "Offres près de chez vous",
      desc: "Des promotions exclusives dans vos commerces locaux, triées en temps réel par distance GPS.",
      accent: "#FF6B00",
    },
    {
      emoji: "⚡",
      title: "Flash deals limités",
      desc: "Des bons plans qui disparaissent vite. Soyez alerté en premier grâce aux notifications push.",
      accent: "#FF3B30",
    },
    {
      emoji: "🏪",
      title: "Commerce local boosté",
      desc: "Restaurants, coiffeurs, salles de sport… Soutenez vos vrais commerçants de quartier.",
      accent: "#FF9500",
    },
  ];

  const slide = slides[slideIdx];

  // Splash screen
  if (step === 0) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100vh", maxWidth: 430, margin: "0 auto",
      background: DS.gradient, fontFamily: DS.font, position: "relative", overflow: "hidden"
    }}>
      {/* Cercles déco */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", top: "30%", left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      {/* Logo animé */}
      <div style={{ marginBottom: 28, animation: "bounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <CPLogo size={96} white />
      </div>

      <div style={{ color: "white", fontSize: 36, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8 }}>
        Click & Promo
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, letterSpacing: 0.2 }}>
        Les meilleures promos près de vous
      </div>

      {/* Loader dots */}
      <div style={{ position: "absolute", bottom: 60, display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: i === 0 ? "white" : "rgba(255,255,255,0.35)",
            animation: `pulse 1.2s ${i * 0.3}s infinite`
          }} />
        ))}
      </div>
    </div>
  );

  // Onboarding
  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      maxWidth: 430, margin: "0 auto", background: "white",
      fontFamily: DS.font, overflow: "hidden"
    }}>
      {/* Visuel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 32px 24px",
        background: `linear-gradient(160deg, ${slide.accent}12 0%, ${slide.accent}28 100%)`,
        transition: "background 0.5s ease",
        position: "relative", overflow: "hidden"
      }}>
        {/* Blob déco */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: `${slide.accent}14`
        }} />

        {/* Logo mini */}
        <div style={{ position: "absolute", top: 20, left: 24 }}>
          <CPLogo size={32} />
        </div>

        {/* Emoji principal */}
        <div style={{ fontSize: 96, marginBottom: 32, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }}>
          {slide.emoji}
        </div>

        <div style={{ fontSize: 28, fontWeight: 800, color: DS.text, textAlign: "center", marginBottom: 16, lineHeight: 1.25, letterSpacing: -0.5 }}>
          {slide.title}
        </div>
        <div style={{ fontSize: 16, color: DS.textSub, textAlign: "center", lineHeight: 1.7, maxWidth: 280 }}>
          {slide.desc}
        </div>
      </div>

      {/* Contrôles */}
      <div style={{ padding: "28px 28px 48px", background: "white" }}>
        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {slides.map((s, i) => (
            <div key={i} onClick={() => setSlideIdx(i)} style={{
              width: i === slideIdx ? 28 : 8, height: 8,
              borderRadius: DS.radius.full, cursor: "pointer",
              background: i === slideIdx ? slide.accent : "#E5E5EA",
              transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)"
            }} />
          ))}
        </div>

        {slideIdx < slides.length - 1 ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/Login")} style={{
              flex: 1, background: "#F5F5F7", color: DS.textMuted, border: "none",
              borderRadius: DS.radius.lg, padding: "15px", fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>Passer</button>
            <button onClick={() => setSlideIdx(i => i + 1)} style={{
              flex: 2, background: `linear-gradient(135deg, ${slide.accent}, #FF3B30)`,
              color: "white", border: "none", borderRadius: DS.radius.lg, padding: "15px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 6px 20px ${slide.accent}55`
            }}>Suivant →</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => navigate("/Login?mode=register")} style={{
              width: "100%", background: DS.gradient,
              color: "white", border: "none", borderRadius: DS.radius.lg, padding: "16px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 24px rgba(255,107,0,0.42)", letterSpacing: 0.2
            }}>✨ Créer un compte gratuit</button>
            <button onClick={() => navigate("/Login")} style={{
              width: "100%", background: "white", color: DS.primary,
              border: `2px solid ${DS.primary}`, borderRadius: DS.radius.lg, padding: "14px",
              fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>J'ai déjà un compte</button>
            <button onClick={() => { localStorage.setItem("cp_onboarded", "1"); navigate("/Feed"); }} style={{
              background: "none", border: "none", color: DS.textMuted,
              fontSize: 13, cursor: "pointer", padding: "8px", marginTop: 2
            }}>Continuer sans compte →</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.3); } }
      `}</style>
    </div>
  );
}
