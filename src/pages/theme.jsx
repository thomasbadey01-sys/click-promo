// ─────────────────────────────────────────────────────────────
//  DESIGN SYSTEM — Click & Promo 2025
// ─────────────────────────────────────────────────────────────
export const DS = {
  // Brand
  brand:    "#FF5C00",
  brandDark:"#CC4900",
  brandBg:  "#FFF5F0",
  // Neutrals
  ink:      "#0A0A0A",
  ink80:    "#1A1A1A",
  ink60:    "#3D3D3D",
  ink40:    "#7A7A7A",
  ink20:    "#BBBBBB",
  ink10:    "#E8E8E8",
  ink05:    "#F5F5F5",
  white:    "#FFFFFF",
  // Status
  success:  "#00B37E",
  danger:   "#E53E3E",
  warning:  "#F6AD55",
  info:     "#3B82F6",
  // Type
  font:     "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  // Radius
  xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, pill:999,
  // Elevation
  e1: "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  e2: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
  e3: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
  e4: "0 20px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.08)",
  eBrand: "0 8px 32px rgba(255,92,0,0.30)",
};

// ─────────────────────────────────────────────────────────────
//  ICON SYSTEM — SVG strokes uniquement, pas d'emojis
// ─────────────────────────────────────────────────────────────
export const Ic = {
  // Navigation
  grid:   (c=DS.ink60,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  map:    (c=DS.ink60,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>,
  heart:  (c=DS.ink60,s=22,f=false)=><svg width={s} height={s} fill={f?c:"none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  user:   (c=DS.ink60,s=22)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  // UI
  search: (c=DS.ink40,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  pin:    (c=DS.ink60,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock:  (c=DS.ink40,s=14)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  bolt:   (c=DS.brand,s=14)=><svg width={s} height={s} fill={c} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>,
  back:   (c=DS.ink80,s=20)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7"/></svg>,
  share:  (c=DS.ink60,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  copy:   (c=DS.ink60,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  check:  (c=DS.success,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  x:      (c=DS.ink40,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  star:   (c=DS.warning,s=16,f=false)=><svg width={s} height={s} fill={f?c:"none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  lock:   (c=DS.ink60,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:    (c=DS.ink40,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  bell:   (c=DS.ink60,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  trash:  (c=DS.danger,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  chev:   (c=DS.ink40,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  tag:    (c=DS.ink60,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  refresh:(c=DS.ink60,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  nav:    (c=DS.ink60,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  percent:(c=DS.brand,s=18)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  store:  (c=DS.ink60,s=16)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  // Catégories — icônes distinctives
  cat: {
    restaurant: (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    boutique:   (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    beaute:     (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    sport:      (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    epicerie:   (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M12 12a3 3 0 100-6 3 3 0 000 6z"/><path d="M8 22v-4a4 4 0 018 0v4"/></svg>,
    pharmacie:  (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    services:   (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
    tout:       (c,s=15)=><svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  }
};

// ─────────────────────────────────────────────────────────────
//  LOGO
// ─────────────────────────────────────────────────────────────
export function CPLogo({ size=36, inverted=false }) {
  const bg = inverted ? DS.white : DS.brand;
  const fg = inverted ? DS.brand : DS.white;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill={bg}/>
      {/* percent sign */}
      <line x1="26" y1="14" x2="14" y2="26" stroke={fg} strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="15" cy="15" r="3" stroke={fg} strokeWidth="2"/>
      <circle cx="25" cy="25" r="3" stroke={fg} strokeWidth="2"/>
    </svg>
  );
}
