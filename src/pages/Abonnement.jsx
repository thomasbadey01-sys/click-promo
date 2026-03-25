import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DS, Ic, CPLogo } from "./Home";

const IcPremium = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcAlerte = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IcEuro = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9.354a4 4 0 100 5.292M8 12h6"/></svg>;
const IcRadar = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

const PLANS_COMMERCANT = [
  { id:"starter", nom:"Starter", prix:"29", couleur:"#22C55E", emoji:"starter", cible:"Pour démarrer",
    features:[{ok:true,l:"3 offres actives"},{ok:true,l:"Stats de base"},{ok:true,l:"Géolocalisation carte"},{ok:true,l:"Support email"},{ok:false,l:"Offres flash prioritaires"},{ok:false,l:"Badge vérifié ✓"},{ok:false,l:"Vente en ligne + commission"}] },
  { id:"pro", nom:"Pro", prix:"79", couleur:DS.brand, emoji:"pro", cible:"Commerçants actifs", badge:"Populaire",
    features:[{ok:true,l:"15 offres actives"},{ok:true,l:"Stats avancées + ROI"},{ok:true,l:"Offres flash prioritaires"},{ok:true,l:"Mise en avant Feed"},{ok:true,l:"Vente en ligne + commission"},{ok:true,l:"Support 7j/7"},{ok:false,l:"Badge vérifié ✓"}] },
  { id:"business", nom:"Business", prix:"149", couleur:"#7C3AED", emoji:"business", cible:"Franchises & multi-établissements",
    features:[{ok:true,l:"Offres illimitées"},{ok:true,l:"Dashboard ROI complet"},{ok:true,l:"Badge vérifié ✓"},{ok:true,l:"Mise en avant prioritaire"},{ok:true,l:"Vente en ligne — commission réduite à 5%"},{ok:true,l:"Account manager dédié"},{ok:true,l:"API + caisse"}] },
];

// Avantages Premium utilisateur détaillés
const PREMIUM_PERKS = [
  {
    icon: (c)=><span style={{color:c}}>{IcAlerte(18)}</span>,
    titre: "Alertes avant-première",
    desc: "Soyez notifié 30 min avant les autres utilisateurs dès qu'une offre flash apparaît près de chez vous.",
    tag: "Exclusif",
  },
  {
    icon: (c)=><svg width="18" height="18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    titre: "Offres exclusives Premium",
    desc: "Accédez à des offres à -50% et plus, réservées uniquement aux membres Premium. Invisibles pour les autres.",
    tag: "Accès exclusif",
  },
  {
    icon: (c)=><span style={{color:c}}>{IcEuro(18)}</span>,
    titre: "-5% supplémentaires partout",
    desc: "Sur toutes les offres disponibles en ligne, votre prix Premium est automatiquement 5% moins cher.",
    tag: "-5% auto",
  },
  {
    icon: (c)=><span style={{color:c}}>{IcRadar(18)}</span>,
    titre: "Rayon de recherche 50 km",
    desc: "Les utilisateurs classiques sont limités à 10 km. Premium vous donne accès jusqu'à 50 km à la ronde.",
    tag: "50 km",
  },
  {
    icon: (c)=>Ic.star(c,18,true),
    titre: "Badge Premium sur votre profil",
    desc: "Votre profil est mis en avant dans les avis et les commentaires avec un badge distinctif.",
    tag: "Visibilité",
  },
  {
    icon: (c)=>Ic.heart(c,18,true),
    titre: "Favoris illimités & synchronisés",
    desc: "Sauvegardez autant d'offres que vous voulez. Vos favoris sont synchronisés sur tous vos appareils.",
    tag: "Illimité",
  },
];

export default function Abonnement() {
  const [sp] = useSearchParams(); const navigate = useNavigate();
  const success = sp.get("success");
  const [loading,setLoading] = useState(null); const [err,setErr] = useState(null);
  const [tab,setTab] = useState(sp.get("tab")==="user"?"user":"commercant");
  const [expandedPlan,setExpandedPlan] = useState(null);

  const subscribe = async planId => {
    setLoading(planId); setErr(null);
    try {
      const res = await fetch("/functions/createCheckout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ plan:planId, successUrl:window.location.origin+(planId==="premium"?"/Feed?subscribed=1":"/Dashboard?subscribed=1"), cancelUrl:window.location.origin+"/Abonnement" }) });
      const data = await res.json();
      if(data.url) window.location.href=data.url;
      else { setErr(data.error||"Erreur inattendue."); setLoading(null); }
    } catch { setErr("Impossible de contacter le serveur."); setLoading(null); }
  };

  return (
    <div style={{background:DS.ink05,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Header */}
      <div style={{background:DS.ink,padding:"52px 16px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:`radial-gradient(circle,${DS.brand}20,transparent 70%)`}}/>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:14,cursor:"pointer",marginBottom:14,padding:0,display:"flex",alignItems:"center",gap:6}}>
          {Ic.back("rgba(255,255,255,.4)",16)} Retour
        </button>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <CPLogo size={38} inverted/>
          <div style={{color:DS.white,fontSize:24,fontWeight:900,letterSpacing:-.5}}>Abonnements</div>
        </div>
        <div style={{color:"rgba(255,255,255,.3)",fontSize:13,marginBottom:20}}>Choisissez le plan adapté</div>
        <div style={{display:"flex",background:"rgba(255,255,255,.06)",borderRadius:DS.md,padding:4,gap:4}}>
          {[{k:"user",l:"Utilisateurs"},{k:"commercant",l:"Commerçants"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,background:tab===t.k?DS.white:"transparent",color:tab===t.k?DS.ink:"rgba(255,255,255,.5)",border:"none",borderRadius:DS.sm,padding:"11px",fontSize:13,fontWeight:tab===t.k?700:500,cursor:"pointer",transition:"all .2s"}}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 14px 60px"}}>

        {success && (
          <div style={{background:DS.success,borderRadius:DS.lg,padding:20,marginBottom:16,textAlign:"center",boxShadow:`0 8px 24px ${DS.success}44`}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>{Ic.check(DS.white,32)}</div>
            <div style={{color:DS.white,fontWeight:900,fontSize:18,marginBottom:4}}>Abonnement activé !</div>
            <div style={{color:"rgba(255,255,255,.8)",fontSize:13}}>Bienvenue dans Click & Promo.</div>
            <button onClick={()=>navigate("/Feed")} style={{marginTop:14,background:"rgba(255,255,255,.2)",border:"none",borderRadius:DS.md,padding:"10px 22px",color:DS.white,fontWeight:700,cursor:"pointer",fontSize:14}}>Découvrir les offres →</button>
          </div>
        )}
        {err && <div style={{background:"#FEF2F2",border:`1.5px solid ${DS.danger}33`,borderRadius:DS.md,padding:"12px 14px",marginBottom:14,color:DS.danger,fontSize:13}}>{err}</div>}

        {/* ── PREMIUM UTILISATEUR ── */}
        {tab==="user"&&(
          <>
            {/* Hero Premium */}
            <div style={{background:`linear-gradient(135deg,${DS.ink} 0%,#1A1A2E 100%)`,borderRadius:DS.xl,padding:"28px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:`radial-gradient(circle,${DS.brand}25,transparent 70%)`}}/>
              <div style={{position:"absolute",bottom:-60,left:-30,width:150,height:150,borderRadius:"50%",background:`radial-gradient(circle,#7C3AED18,transparent 70%)`}}/>
              <div style={{position:"relative",textAlign:"center"}}>
                <div style={{width:64,height:64,borderRadius:DS.xl,background:`linear-gradient(135deg,${DS.brand},#FF8C42)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:DS.eBrand,color:DS.white}}>{IcPremium(24)}</div>
                <div style={{color:DS.white,fontSize:28,fontWeight:900,letterSpacing:-.8,marginBottom:6}}>Premium</div>
                <div style={{color:"rgba(255,255,255,.45)",fontSize:13,marginBottom:20}}>L'expérience Click & Promo sans limite</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,justifyContent:"center",marginBottom:6}}>
                  <span style={{color:DS.white,fontSize:52,fontWeight:900,letterSpacing:-2}}>9,99€</span>
                  <span style={{color:"rgba(255,255,255,.4)",fontSize:16}}>/mois</span>
                </div>
                <div style={{color:"rgba(255,255,255,.25)",fontSize:11}}>Sans engagement · Résiliable à tout moment</div>
              </div>
            </div>

            {/* Avantages détaillés */}
            <div style={{background:DS.white,borderRadius:DS.xl,padding:18,marginBottom:14,boxShadow:DS.e1}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>Ce que vous obtenez</div>
              {PREMIUM_PERKS.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<PREMIUM_PERKS.length-1?`1px solid ${DS.ink05}`:"none"}}>
                  <div style={{width:40,height:40,borderRadius:DS.md,background:`${DS.brand}10`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:DS.brand}}>{p.icon(DS.brand)}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:700,color:DS.ink}}>{p.titre}</span>
                      <span style={{fontSize:9,fontWeight:800,color:DS.brand,background:`${DS.brand}10`,borderRadius:DS.pill,padding:"1px 7px",letterSpacing:.4}}>{p.tag}</span>
                    </div>
                    <div style={{fontSize:12,color:DS.ink40,lineHeight:1.7}}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparatif */}
            <div style={{background:DS.white,borderRadius:DS.lg,padding:16,marginBottom:14,boxShadow:DS.e1}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Gratuit vs Premium</div>
              {[
                {l:"Rayon de recherche",free:"10 km",premium:"50 km"},
                {l:"Alertes flash",free:"Non",premium:"30 min avant"},
                {l:"Offres exclusives",free:"Non",premium:"Oui"},
                {l:"Réduction supplémentaire",free:"Non",premium:"-5% auto"},
                {l:"Badge profil",free:"Non",premium:"✦ Premium"},
              ].map((r,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"9px 0",borderBottom:i<4?`1px solid ${DS.ink05}`:"none",alignItems:"center"}}>
                  <span style={{fontSize:12,color:DS.ink60}}>{r.l}</span>
                  <span style={{fontSize:12,color:DS.ink20,textAlign:"center"}}>{r.free}</span>
                  <span style={{fontSize:12,fontWeight:700,color:DS.success,textAlign:"center"}}>{r.premium}</span>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",paddingTop:8,borderTop:`1px solid ${DS.ink05}`}}>
                <span/>
                <span style={{fontSize:10,color:DS.ink20,textAlign:"center",fontWeight:600}}>Gratuit</span>
                <span style={{fontSize:10,color:DS.brand,textAlign:"center",fontWeight:700}}>Premium</span>
              </div>
            </div>

            <button onClick={()=>subscribe("premium")} disabled={loading==="premium"} style={{width:"100%",background:loading==="premium"?DS.ink10:DS.brand,color:loading==="premium"?DS.ink40:DS.white,border:"none",borderRadius:DS.xl,padding:"18px",fontSize:16,fontWeight:800,cursor:loading==="premium"?"not-allowed":"pointer",boxShadow:loading==="premium"?"none":DS.eBrand,marginBottom:8,letterSpacing:-.2}}>
              {loading==="premium"?"Redirection…":"Passer Premium — 9,99€/mois"}
            </button>
            <div style={{textAlign:"center",fontSize:12,color:DS.ink20}}>Sans engagement · Résiliable quand vous voulez</div>
          </>
        )}

        {/* ── PLANS COMMERÇANTS ── */}
        {tab==="commercant"&&(
          <>
            {/* Social proof */}
            <div style={{background:DS.white,borderRadius:DS.lg,padding:14,marginBottom:14,boxShadow:DS.e1}}>
              <div style={{fontWeight:700,fontSize:12,color:DS.ink,marginBottom:10,textTransform:"uppercase",letterSpacing:.7}}>Résultats de nos commerçants</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{v:"+40%",l:"clients/mois",c:DS.success},{v:"3.2x",l:"ROI vs pub",c:DS.brand},{v:"<48h",l:"1ères conv.",c:"#7C3AED"}].map((s,i)=>(
                  <div key={i} style={{textAlign:"center",background:DS.ink05,borderRadius:DS.md,padding:"10px 4px"}}>
                    <div style={{fontSize:17,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:DS.ink40,marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {PLANS_COMMERCANT.map(p=>(
              <div key={p.id} style={{background:DS.white,borderRadius:DS.xl,overflow:"hidden",marginBottom:12,boxShadow:p.badge?`0 6px 24px ${p.couleur}18`:DS.e1,border:`1.5px solid ${p.badge?p.couleur:DS.ink10}`,position:"relative"}}>
                {p.badge&&<div style={{position:"absolute",top:14,right:14,background:p.couleur,color:DS.white,borderRadius:DS.pill,padding:"3px 11px",fontSize:11,fontWeight:800,boxShadow:`0 2px 8px ${p.couleur}44`}}>{p.badge}</div>}
                <div style={{padding:"20px 18px 16px",background:`linear-gradient(135deg,${p.couleur}10,${p.couleur}04)`}}>
                  <div style={{fontSize:22,fontWeight:900,color:DS.ink,letterSpacing:-.5,marginBottom:4,textTransform:"capitalize"}}>{p.nom}</div>
                  <div style={{fontSize:12,color:DS.ink40,marginBottom:12}}>{p.cible}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontSize:40,fontWeight:900,color:p.couleur,letterSpacing:-1}}>{p.prix}€</span>
                    <span style={{fontSize:14,color:DS.ink40}}>/mois</span>
                  </div>
                </div>
                {/* Toggle features */}
                <div style={{padding:"10px 18px"}}>
                  <button onClick={()=>setExpandedPlan(expandedPlan===p.id?null:p.id)} style={{background:"none",border:"none",color:DS.ink40,fontSize:12,cursor:"pointer",padding:"4px 0",display:"flex",alignItems:"center",gap:5}}>
                    {Ic.chev(DS.ink40,14)} {expandedPlan===p.id?"Masquer":"Voir les fonctionnalités"}
                  </button>
                </div>
                {expandedPlan===p.id&&(
                  <div style={{padding:"0 18px 14px"}}>
                    {p.features.map((f,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{flexShrink:0,color:f.ok?DS.success:DS.ink10,display:"flex"}}>
                          {f.ok?Ic.check(DS.success,15):<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={DS.ink10} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                        </div>
                        <span style={{fontSize:13,color:f.ok?DS.ink:DS.ink20}}>{f.l}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{padding:"0 18px 18px"}}>
                  <button onClick={()=>subscribe(p.id)} disabled={loading===p.id} style={{width:"100%",background:loading===p.id?DS.ink10:`linear-gradient(135deg,${p.couleur},${p.couleur}cc)`,color:loading===p.id?DS.ink40:DS.white,border:"none",borderRadius:DS.md,padding:"14px",fontSize:14,fontWeight:700,cursor:loading===p.id?"not-allowed":"pointer",boxShadow:loading===p.id?"none":`0 6px 18px ${p.couleur}33`,transition:"all .2s"}}>
                    {loading===p.id?"Redirection…":`Choisir ${p.nom}`}
                  </button>
                  <div style={{textAlign:"center",marginTop:6,fontSize:11,color:DS.ink20}}>Sans engagement · Résiliable à tout moment</div>
                </div>
              </div>
            ))}

            <div style={{background:`${DS.brand}08`,borderRadius:DS.md,padding:14,textAlign:"center",border:`1px solid ${DS.brand}15`}}>
              <div style={{fontWeight:700,color:DS.brand,marginBottom:4,fontSize:13}}>14 jours d'essai gratuit</div>
              <div style={{fontSize:12,color:DS.ink40}}>Testez sans engagement. Aucune CB requise.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
