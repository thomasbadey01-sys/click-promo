// ─────────────────────────────────────────────────────────────
// CLICK & PROMO — Design System v2
import { useNavigate } from "react-router-dom";
// Style: screenshots de référence (violet #6C3BFF, dark dashboard,
//         feed blanc, badges pill violet, typo bold)
// ─────────────────────────────────────────────────────────────

// Inject global CSS for page transitions
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideOutDown {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  [data-page-animate] {
    animation: slideInUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('style[data-cp-anim]')) {
  style.setAttribute('data-cp-anim', '1');
  document.head.appendChild(style);
}

export const DS = {
  // Brand
  brand:    "#6C3BFF",
  brand2:   "#8B5CF6",
  brandLight:"#EDE9FE",
  brandDark: "#4C1D95",
  neon:     "#00D4FF",

  // Neutrals light
  white:    "#FFFFFF",
  bg:       "#F5F5F7",
  bg2:      "#EBEBF0",
  ink:      "#1A1A2E",
  ink80:    "#1A1A2Ecc",
  ink60:    "#1A1A2E99",
  ink40:    "#1A1A2E66",
  ink20:    "#1A1A2E33",
  ink10:    "#1A1A2E1A",
  ink05:    "#1A1A2E0D",

  // Dark mode (Dashboard)
  dark:     "#0F0F1A",
  dark2:    "#1A1A2E",
  dark3:    "#252540",
  dark4:    "#2E2E50",
  darkCard: "#1E1E35",
  darkBorder:"#FFFFFF14",

  // Status
  success:  "#10B981",
  danger:   "#EF4444",
  warning:  "#F59E0B",
  info:     "#3B82F6",

  // Typography
  fontBase: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",

  // Radius
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
  pill:100,

  // Shadows
  e0:  "0",
  e1:  "0 1px 3px rgba(0,0,0,0.08)",
  e2:  "0 4px 8px rgba(0,0,0,0.08)",
  e3:  "0 8px 16px rgba(0,0,0,0.1)",
  eBrand: `0 4px 12px rgba(108, 59, 255, 0.25)`,
};

// Icônes
export const Ic = {
  search: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  location: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  bell: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  menu: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  heart: (color, size, filled = false) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  map: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  user: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  gift: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <path d="M12 7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2" />
      <path d="M4 12h16" />
    </svg>
  ),
  settings: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24" />
    </svg>
  ),
  trash: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  star: (color, size, filled = false) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  arrowRight: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  calendar: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  back: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  check: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// Logo Click & Promo
export function CPLogo({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 3,
      background: `linear-gradient(135deg, ${DS.brand} 0%, ${DS.brand2} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: DS.white, fontWeight: 900, fontSize: size * 0.55,
      letterSpacing: -0.5,
    }}>
      C&P
    </div>
  );
}

// Navbar main
export function NavBar({ active = "Feed" }) {
  const navigate = useNavigate();
  const isDark = typeof localStorage !== 'undefined' && localStorage.getItem("cp_darkmode") === "1";
  const bg = isDark ? DS.dark2 : DS.white;
  const color = isDark ? DS.white : DS.ink;
  const inactiveColor = isDark ? "rgba(255,255,255,.4)" : DS.ink40;

  const tabs = [
    { id: "Feed", label: "Offres", icon: Ic.search },
    { id: "Carte", label: "Carte", icon: Ic.map },
    { id: "Favoris", label: "Favoris", icon: Ic.heart },
    { id: "Profil", label: "Profil", icon: Ic.user },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: bg, borderTop: `1px solid ${isDark ? DS.darkBorder : DS.ink10}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: 70, paddingBottom: 12, fontFamily: DS.fontBase, zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => navigate?.(`/${t.id}`)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          color: active === t.id ? DS.brand : inactiveColor, fontWeight: 600,
          fontSize: 11, transition: "all 0.2s",
        }}>
          {t.icon(active === t.id ? DS.brand : inactiveColor, 20)}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// Dark Navbar
export function DarkNavBar({ active = "Dashboard" }) {
  const navigate = useNavigate();
  const tabs = [
    { id: "Dashboard", label: "Stats", icon: Ic.star },
    { id: "Profil", label: "Compte", icon: Ic.user },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: DS.dark2, borderTop: `1px solid ${DS.darkBorder}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: 70, paddingBottom: 12, fontFamily: DS.fontBase, zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => navigate?.(`/${t.id}`)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          color: active === t.id ? DS.brand : "rgba(255,255,255,.4)", fontWeight: 600,
          fontSize: 11, transition: "all 0.2s",
        }}>
          {t.icon(active === t.id ? DS.brand : "rgba(255,255,255,.4)", 20)}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// Badge réduction — style screenshots
export function BadgeReduction({ valeur, type, style = {} }) {
  if (!valeur) return null;
  return (
    <div style={{
      background: DS.brand,
      color: DS.white,
      borderRadius: DS.sm,
      padding: "5px 10px",
      fontSize: 14,
      fontWeight: 800,
      letterSpacing: -0.3,
      fontFamily: DS.fontBase,
      ...style,
    }}>
      -{valeur}{type === "pourcentage" ? "%" : "€"}
    </div>
  );
}

// Sparkline mini-graphe
export function Sparkline({ data = [], col = DS.brand2, h = 48 }) {
  if (!data || data.length < 2) return <div style={{ height: h }} />;
  const max = Math.max(...data, 1);
  const w = 200;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h * 0.85)}`).join(" ");
  const gid = `g${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".25" />
          <stop offset="100%" stopColor={col} stopOpacity=".02" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Utilitarie dark mode
export function getDarkMode() { return typeof localStorage !== 'undefined' && localStorage.getItem("cp_darkmode") === "1"; }
export function toggleDarkMode() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem("cp_darkmode", getDarkMode() ? "0" : "1");
    window.location.reload();
  }
}

// Export default requis par Base44
export default function ThemePage() { return null; }