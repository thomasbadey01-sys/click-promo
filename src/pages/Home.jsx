import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/api/auth";

// ─── DESIGN SYSTEM 2025 ────────────────────────────────────────────────────
export const DS = {
  // Palette
  orange:    "#F97316",
  orangeD:   "#EA580C",
  red:       "#EF4444",
  black:     "#0F0F0F",
  gray900:   "#111827",
  gray700:   "#374151",
  gray500:   "#6B7280",
  gray300:   "#D1D5DB",
  gray100:   "#F3F4F6",
  gray50:    "#FAFAFA",
  white:     "#FFFFFF",
  green:     "#22C55E",
  purple:    "#A855F7",
  blue:      "#3B82F6",
  // Gradients
  gradMain:  "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
  gradDark:  "linear-gradient(135deg, #0F0F0F 0%, #1C0A00 100%)",
  gradCard:  "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)",
  // Typo
  font:      "'Inter', 'SF Pro Display', -apple-system, sans-serif",
  // Radius
  r4: 4, r8: 8, r12: 12, r16: 16, r20: 20, r24: 24, r99: 999,
  // Shadows
  s1: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
  s2: "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)",
  s3: "0 10px 30px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)",
  sOrange: "0 8px 24px rgba(249,115,22,0.38)",
};

// ─── ICÔNES SVG CUSTOM (remplace tous les emojis) ──────────────────────────
export const Icon = {
  tag: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  pin: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  flash: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  heart: (s=20, c="currentColor", filled=false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : "none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  map: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  user: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  search: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  refresh: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>
  ),
  clock: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  store: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  star: (s=20, c="currentColor", filled=false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  percent: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  chevronR: (s=16, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  back: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  share: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  bell: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  trash: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  ),
  check: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  lock: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  eye: (s=20, c="currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  nav: {
    feed:    (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?"#F97316":"none"} stroke={a?"#F97316":"#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    map:     (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#F97316":"#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
    favs:    (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?"#F97316":"none"} stroke={a?"#F97316":"#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    profile: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#F97316":"#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
};

// ─── LOGO SVG ──────────────────────────────────────────────────────────────
export function CPLogo({ size = 40, dark = false }) {
  const bg = dark ? "#0F0F0F" : "white";
  const fg = dark ? "white" : "#F97316";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill={dark ? "#F97316" : "#FFF7ED"}/>
      {/* Tag shape */}
      <path d="M10 10 L10 28 L24 38 L38 28 L38 10 Z" fill={fg} opacity="0.12"/>
      <path d="M10 10 L10 28 L24 38 L38 28 L38 10 Z" fill="none" stroke={fg} strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="24" cy="8" r="3" fill={fg}/>
      {/* % */}
      <text x="24" y="27" textAnchor="middle" fontSize="13" fontWeight="800" fill={fg} fontFamily="Inter,-apple-system,sans-serif">%</text>
    </svg>
  );
}

// ─── HOME / ONBOARDING ─────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const check = async () => {
      try { const u = await UserAuth.me(); if (u) { navigate("/Feed"); return; } } catch {}
      setTimeout(() => setStep(1), 1500);
    };
    check();
  }, []);

  const slides = [
    { title: "Promos autour de vous", sub: "Des offres exclusives dans vos commerces locaux, triées en temps réel par distance GPS.", accent: DS.orange, icon: "pin" },
    { title: "Deals flash limités", sub: "Ne ratez plus aucun bon plan. Soyez alerté en premier avant que les stocks s'épuisent.", accent: DS.red, icon: "flash" },
    { title: "Commerce local d'abord", sub: "Restaurants, coiffeurs, salles de sport… Consommez mieux, plus local, plus malin.", accent: "#22C55E", icon: "store" },
  ];
  const s = slides[slideIdx];

  if (step === 0) return (
    <div style={{ height:"100vh", maxWidth:430, margin:"0 auto", background:DS.black, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:DS.font, position:"relative", overflow:"hidden" }}>
      {/* Background glow */}
      <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}/>
      <div style={{ animation:"splashIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom:24 }}>
        <CPLogo size={72} dark />
      </div>
      <div style={{ color:"white", fontSize:30, fontWeight:800, letterSpacing:-1, marginBottom:6 }}>Click & Promo</div>
      <div style={{ color:"#6B7280", fontSize:14, letterSpacing:0.2 }}>Les meilleures promos près de vous</div>
      <div style={{ position:"absolute", bottom:48, display:"flex", gap:6 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:3, background:i===0?"#F97316":"#374151", transition:"background 0.3s" }}/>)}
      </div>
      <style>{`@keyframes splashIn{from{opacity:0;transform:scale(0.5) rotate(-10deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ height:"100vh", maxWidth:430, margin:"0 auto", background:"white", display:"flex", flexDirection:"column", fontFamily:DS.font, overflow:"hidden" }}>
      {/* Visuel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 32px 24px", background:DS.gray50, position:"relative" }}>
        {/* Logo top */}
        <div style={{ position:"absolute", top:20, left:24 }}><CPLogo size={30} /></div>

        {/* Icône centrale */}
        <div style={{
          width:120, height:120, borderRadius:32, background:"white",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 20px 60px rgba(249,115,22,0.18), ${DS.s3}`,
          marginBottom:36,
          border:`1px solid ${DS.gray100}`
        }}>
          <div style={{ color:s.accent, transform:"scale(1.6)" }}>
            {s.icon==="pin" && Icon.pin(36, s.accent)}
            {s.icon==="flash" && Icon.flash(36, s.accent)}
            {s.icon==="store" && Icon.store(36, s.accent)}
          </div>
        </div>

        <div style={{ fontSize:26, fontWeight:800, color:DS.black, textAlign:"center", marginBottom:12, lineHeight:1.2, letterSpacing:-0.5 }}>
          {s.title}
        </div>
        <div style={{ fontSize:15, color:DS.gray500, textAlign:"center", lineHeight:1.7, maxWidth:280 }}>
          {s.sub}
        </div>
      </div>

      {/* Contrôles */}
      <div style={{ padding:"28px 28px 48px", background:"white" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:28 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setSlideIdx(i)} style={{
              width:i===slideIdx?28:7, height:7, borderRadius:4, cursor:"pointer",
              background:i===slideIdx?s.accent:DS.gray200,
              transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)"
            }}/>
          ))}
        </div>

        {slideIdx < slides.length - 1 ? (
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>navigate("/Login")} style={{ flex:1, background:DS.gray100, color:DS.gray500, border:"none", borderRadius:DS.r16, padding:"15px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Passer</button>
            <button onClick={()=>setSlideIdx(i=>i+1)} style={{ flex:2, background:s.accent, color:"white", border:"none", borderRadius:DS.r16, padding:"15px", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 6px 20px ${s.accent}55` }}>Suivant</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={()=>navigate("/Login?mode=register")} style={{ width:"100%", background:DS.gradMain, color:"white", border:"none", borderRadius:DS.r16, padding:"16px", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:DS.sOrange }}>
              Créer un compte gratuit
            </button>
            <button onClick={()=>navigate("/Login")} style={{ width:"100%", background:"white", color:DS.orange, border:`2px solid ${DS.orange}`, borderRadius:DS.r16, padding:"14px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              J'ai déjà un compte
            </button>
            <button onClick={()=>{ localStorage.setItem("cp_onboarded","1"); navigate("/Feed"); }} style={{ background:"none", border:"none", color:DS.gray400, fontSize:13, cursor:"pointer", padding:"8px" }}>
              Continuer sans compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
