// ─────────────────────────────────────────────────────────────
// CLICK & PROMO — Design System v3
// ─────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";

const isDark = () => typeof localStorage !== "undefined" && localStorage.getItem("cp_darkmode") === "1";

const style = document.createElement("style");
style.setAttribute("data-cp-v3", "1");
style.textContent = `
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn { 0%{opacity:0;transform:scale(.85)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes slideInFromRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInFromLeft { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .shimmer-card { background:linear-gradient(90deg,#f0eff6 25%,#e8e6f0 50%,#f0eff6 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:16px; }
  .shimmer-dark { background:linear-gradient(90deg,#1e1e35 25%,#252545 50%,#1e1e35 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:16px; }
  .fade-up { animation:fadeUp .4s cubic-bezier(.34,1.56,.64,1) both; }
  .pop-in  { animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both; }
  .slide-up { animation:slideUp .35s cubic-bezier(.34,1.56,.64,1) both; }
  * { -webkit-tap-highlight-color:transparent; }
  html { height:-webkit-fill-available; }
  button { font-family: inherit; }
`;
if (typeof document !== "undefined" && !document.querySelector("style[data-cp-v3]")) {
  document.head.appendChild(style);
}

export const DS = {
  brand: "#6C3BFF", brand2: "#8B5CF6", brandLight: "#EDE9FE", brandDark: "#4C1D95",
  neon: "#00D4FF",
  white: "#FFFFFF", bg: "#F0EFF6", bg2: "#E8E6F0",
  ink: "#1A1A2E", ink80: "#1A1A2Ecc", ink60: "#1A1A2E99", ink40: "#1A1A2E66", ink20: "#1A1A2E33", ink10: "#1A1A2E1A", ink05: "#1A1A2E0D",
  dark: "#0F0F1A", dark2: "#1A1A2E", dark3: "#252540", dark4: "#2E2E50", darkCard: "#1E1E35", darkBorder: "#FFFFFF14",
  success: "#10B981", danger: "#EF4444", warning: "#F59E0B", info: "#3B82F6",
  fontBase: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 100,
  e0: "0", e1: "0 1px 3px rgba(0,0,0,0.08)", e2: "0 4px 8px rgba(0,0,0,0.08)", e3: "0 8px 16px rgba(0,0,0,0.1)",
  eBrand: "0 4px 12px rgba(108,59,255,0.25)",
  safeTop: "env(safe-area-inset-top, 44px)", safeBottom: "env(safe-area-inset-bottom, 16px)",
};

// Dynamic theme (dark mode aware)
export function getTheme() {
  const dark = isDark();
  return {
    bg: dark ? DS.dark : DS.bg,
    card: dark ? DS.darkCard : DS.white,
    text: dark ? DS.white : DS.ink,
    text2: dark ? "rgba(255,255,255,.55)" : DS.ink60,
    border: dark ? DS.darkBorder : DS.ink10,
    header: dark ? DS.dark2 : DS.white,
    shimmer: dark ? "shimmer-dark" : "shimmer-card",
    isDark: dark,
  };
}

export const Ic = {
  search: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  location: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  bell: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  heart: (c, s, f = false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f ? c : "none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  map: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  user: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>,
  trash: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  star: (c, s, f = false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f ? c : "none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  back: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  check: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  pin: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  nav: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  share: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  copy2: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  plus: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chart: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  grid: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  offers: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  download: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  logout: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  moon: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  gift: (c, s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
};

export function CPLogo({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 3,
      background: `linear-gradient(135deg, ${DS.brand} 0%, ${DS.brand2} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 900, fontSize: size * 0.42, letterSpacing: -0.5, flexShrink: 0,
    }}>C&P</div>
  );
}

export function NavBar({ active = "Feed" }) {
  const navigate = useNavigate();
  const t = getTheme();
  const footerLinks = [
    { label: "À propos", path: "/About" },
    { label: "Contact", path: "/Contact" },
    { label: "Confidentialité", path: "/PrivacyPolicy" },
  ];
  const tabs = [
    { id: "Feed",    label: "Offres",   icon: Ic.search },
    { id: "Carte",   label: "Carte",    icon: Ic.map },
    { id: "Favoris", label: "Favoris",  icon: Ic.heart },
    { id: "Profil",  label: "Profil",   icon: Ic.user },
    { id: "Accueil", label: "Premium",  icon: (c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: t.header, borderTop: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column",
      fontFamily: DS.fontBase, zIndex: 100,
      boxShadow: "0 -4px 20px rgba(0,0,0,.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingTop: 6, paddingBottom: 2 }}>
        {footerLinks.map(l => (
          <button key={l.path} onClick={() => navigate(l.path)} style={{
            background: "none", border: "none", fontSize: 10, fontWeight: 500,
            color: t.isDark ? "rgba(255,255,255,.3)" : "#bbb",
            cursor: "pointer", fontFamily: DS.fontBase, padding: 0,
          }}>{l.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", paddingTop: 4, paddingBottom: "max(env(safe-area-inset-bottom,8px),8px)" }}>
      {tabs.map(tab => {
        const isA = active === tab.id;
        return (
          <button key={tab.id} onClick={() => navigate(`/${tab.id}`)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            minWidth: 44, minHeight: 44, justifyContent: "center", padding: "0 8px",
          }}>
            <div style={{
              background: isA ? DS.brandLight : "transparent",
              borderRadius: 12, padding: "6px 16px", marginBottom: 2, transition: "background .2s",
            }}>
              {tab.icon(isA ? DS.brand : (t.isDark ? "rgba(255,255,255,.35)" : "#bbb"), 20)}
            </div>
            <span style={{ fontSize: 10, fontWeight: isA ? 700 : 500, color: isA ? DS.brand : (t.isDark ? "rgba(255,255,255,.35)" : "#bbb") }}>{tab.label}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

export function DarkNavBar({ active = "Dashboard" }) {
  const navigate = useNavigate();
  const tabs = [
    { id: "Dashboard", label: "Stats",   icon: Ic.grid },
    { id: "Profil",    label: "Compte",  icon: Ic.user },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: DS.dark2, borderTop: `1px solid ${DS.darkBorder}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: 70, paddingBottom: "max(env(safe-area-inset-bottom,8px),8px)",
      fontFamily: DS.fontBase, zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => navigate?.(`/${t.id}`)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          color: active === t.id ? DS.brand : "rgba(255,255,255,.4)",
          fontWeight: 600, fontSize: 11, minWidth: 44, minHeight: 44, justifyContent: "center",
        }}>
          {t.icon(active === t.id ? DS.brand : "rgba(255,255,255,.4)", 20)}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export function BadgeReduction({ valeur, type, style: s = {} }) {
  if (!valeur) return null;
  return (
    <div style={{
      background: DS.brand, color: DS.white, borderRadius: DS.sm,
      padding: "5px 10px", fontSize: 14, fontWeight: 800, letterSpacing: -0.3,
      fontFamily: DS.fontBase, ...s,
    }}>
      -{valeur}{type === "pourcentage" ? "%" : "€"}
    </div>
  );
}

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

export function NotificationBadge({ count = 0 }) {
  if (!count) return null;
  return (
    <div style={{
      position: "absolute", top: -4, right: -4,
      background: DS.danger, color: DS.white, borderRadius: DS.pill,
      minWidth: 18, height: 18, fontSize: 10, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 4px", border: "2px solid #fff",
    }}>{count > 99 ? "99+" : count}</div>
  );
}

export function SkeletonCard({ dark = false }) {
  const cls = dark ? "shimmer-dark" : "shimmer-card";
  return (
    <div style={{ background: dark ? DS.darkCard : DS.white, borderRadius: DS.xl, marginBottom: 12, overflow: "hidden", boxShadow: DS.e1 }}>
      <div className={cls} style={{ height: 160 }} />
      <div style={{ padding: "12px 14px" }}>
        <div className={cls} style={{ height: 18, width: "70%", marginBottom: 8 }} />
        <div className={cls} style={{ height: 14, width: "50%", marginBottom: 6 }} />
        <div className={cls} style={{ height: 14, width: "30%" }} />
      </div>
    </div>
  );
}

export function getDarkMode() { return isDark(); }
export function toggleDarkMode() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cp_darkmode", isDark() ? "0" : "1");
    window.location.reload();
  }
}

export default function ThemePage() { return null; }