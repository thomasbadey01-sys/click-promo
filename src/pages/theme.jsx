// ─────────────────────────────────────────────────────────────
// CLICK & PROMO — Design System v2
// Style: screenshots de référence (violet #6C3BFF, dark dashboard,
//         feed blanc, badges pill violet, typo bold)
// ─────────────────────────────────────────────────────────────

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
  pill:999,

  // Shadows
  e1: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
  e2: "0 4px 16px rgba(108,59,255,.10), 0 1px 4px rgba(0,0,0,.06)",
  e3: "0 8px 32px rgba(108,59,255,.18), 0 2px 8px rgba(0,0,0,.08)",
  eBrand: "0 4px 20px rgba(108,59,255,.35)",
  eDark:  "0 4px 24px rgba(0,0,0,.4)",
};

// Icônes SVG inline — cohérence totale
export const Ic = {
  home:   (c="#6C3BFF",s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  map:    (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  heart:  (c,s=22,f=false)=><svg width={s} height={s} fill={f?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  user:   (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  search: (c,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:   (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  pin:    (c,s=14)=><svg width={s} height={s} fill={c} viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  back:   (c,s=20)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  share:  (c,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  star:   (c,s=14,f=false)=><svg width={s} height={s} fill={f?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check:  (c,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:  (c,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  tag:    (c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  eye:    (c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  copy:   (c,s=14)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  nav:    (c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  grid:   (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  offers: (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  plus:   (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chart:  (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:(c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  menu:   (c,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  arrow:  (c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  trash:  (c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  edit:   (c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  logout: (c,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  download:(c,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  copy2:  (c,s=14)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
};

// Logo C&P
export function CPLogo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      background: DS.brand,
      borderRadius: Math.round(size * 0.22),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ color: "#fff", fontWeight: 900, fontSize: size * 0.38, fontFamily: DS.fontBase, letterSpacing: -0.5 }}>C&P</span>
    </div>
  );
}

// Barre de navigation bottom — LIGHT (Feed, Carte, Favoris, Profil)
export function NavBar({ active }) {
  const tabs = [
    { id: "Feed",    label: "Accueil", icon: Ic.home },
    { id: "Carte",   label: "Carte",   icon: Ic.map  },
    { id: "Favoris", label: "Favoris", icon: Ic.heart},
    { id: "Profil",  label: "Profil",  icon: Ic.user },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: DS.white,
      borderTop: `1px solid ${DS.ink10}`,
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 12px)",
      zIndex: 100,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <a key={t.id} href={`/${t.id}`} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "10px 0 4px",
            textDecoration: "none",
            color: isActive ? DS.brand : DS.ink40,
            gap: 3,
          }}>
            {t.icon(isActive ? DS.brand : DS.ink40, 22)}
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, fontFamily: DS.fontBase }}>{t.label}</span>
          </a>
        );
      })}
    </div>
  );
}

// Barre de navigation bottom — DARK (Dashboard marchand)
export function DarkNavBar({ active }) {
  const tabs = [
    { id: "stats",   label: "Tableau de Bord", icon: Ic.grid   },
    { id: "liste",   label: "Mes Offres",       icon: Ic.offers },
    { id: "creer",   label: "Créer Offre",      icon: Ic.plus   },
    { id: "analyses",label: "Analyses",         icon: Ic.chart  },
    { id: "profil",  label: "Profil",           icon: Ic.user   },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: DS.dark2,
      borderTop: `1px solid ${DS.darkBorder}`,
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 12px)",
      zIndex: 100,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "10px 0 4px", gap: 3,
            background: "none", border: "none", cursor: "pointer",
            color: isActive ? DS.brand2 : "rgba(255,255,255,.4)",
          }}>
            {t.icon(isActive ? DS.brand2 : "rgba(255,255,255,.4)", 20)}
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, fontFamily: DS.fontBase }}>{t.label}</span>
          </button>
        );
      })}
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

// Utilitaires dark mode (conservé pour compat)
export function getDarkMode() { return localStorage.getItem("cp_darkmode") === "1"; }
export function toggleDarkMode() {
  localStorage.setItem("cp_darkmode", getDarkMode() ? "0" : "1");
  window.location.reload();
}

// Export default requis par Base44
export default function ThemePage() { return null; }
