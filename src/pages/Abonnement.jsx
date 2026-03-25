import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DS, Icon, CPLogo } from "./Home";

const PLANS = [
  { id:"starter", nom:"Starter", prix:"29", couleur:"#22C55E", emoji:"🌱", cible:"Parfait pour démarrer",
    features:[{ok:true,l:"3 offres actives"},{ok:true,l:"Stats de base"},{ok:true,l:"Géolocalisation carte"},{ok:true,l:"Support email"},{ok:false,l:"Offres flash prioritaires"},{ok:false,l:"Badge vérifié ✓"}] },
  { id:"pro", nom:"Pro", prix:"79", couleur:DS.orange, emoji:"🚀", cible:"Pour les commerçants actifs", badge:"Populaire",
    features:[{ok:true,l:"15 offres actives"},{ok:true,l:"Stats avancées + CSV"},{ok:true,l:"Offres flash prioritaires"},{ok:true,l:"Mise en avant Feed"},{ok:true,l:"Support 7j/7"},{ok:false,l:"Badge vérifié ✓"}] },
  { id:"business", nom:"Business", prix:"149", couleur:DS.purple, emoji:"💎", cible:"Franchises & multi-établissements",
    features:[{ok:true,l:"Offres illimitées"},{ok:true,l:"Dashboard ROI complet"},{ok:true,l:"Badge vérifié ✓"},{ok:true,l:"Mise en avant prioritaire"},{ok:true,l:"Account manager dédié"},{ok:true,l:"API + caisse"}] },
];

const PREMIUM = {
  features:[
    {ico:Icon.flash(16,DS.orange), l:"Accès anticipé aux offres flash"},
    {ico:Icon.bell(16,DS.orange), l:"Alertes push en temps réel"},
    {ico:Icon.tag(16,DS.orange), l:"Offres exclusives Premium"},
    {ico:Icon.star(16,DS.orange,true), l:"Badge Premium sur le profil"},
    {ico:Icon.pin(16,DS.orange), l:"Tri ultra-précis par distance"},
    {ico:Icon.check(16,DS.orange), l:"Sans publicité"},
  ]
};

export default function Abonnement() {
  const [sp] = useSearchParams(); const navigate = useNavigate();
  const success = sp.get("success");
  const [loading, setLoading] = useState(null); const [err, setErr] = useState(null);
  const [tab, setTab] = useState(sp.get("tab")==="user"?"user":"commercant");

  const subscribe = async planId => {
    setLoading(planId); setErr(null);
    try {
      const res = await fetch("/functions/createCheckout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ plan:planId, successUrl:window.location.origin+"/Feed?subscribed=1", cancelUrl:window.location.origin+"/Abonnement" }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setErr(data.error||"Erreur inattendue."); setLoading(null); }
    } catch { setErr("Impossible de contacter le serveur."); setLoading(null); }
  };

  return (
    <div style={{background:DS.gray50,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Header */}
      <div style={{background:DS.black,padding:"52px 16px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${DS.orange}18 0%,transparent 70%)`}}/>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:DS.gray500,fontSize:14,cursor:"pointer",marginBottom:14,padding:0,display:"flex",alignItems:"center",gap:6}}>
          {Icon.back(16,DS.gray500)} Retour
        </button>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <CPLogo size={38} dark/>
          <div style={{color:"white",fontSize:24,fontWeight:900,letterSpacing:-0.5}}>Abonnements</div>
        </div>
        <div style={{color:DS.gray500,fontSize:13,marginBottom:20}}>Choisissez le plan adapté</div>
        <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:DS.r12,padding:4,gap:4}}>
          {[{k:"commercant",l:"Commerçants"},{k:"user",l:"Utilisateurs"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,background:tab===t.k?"white":"transparent",color:tab===t.k?DS.black:"rgba(255,255,255,0.6)",border:"none",borderRadius:DS.r8,padding:"11px",fontSize:13,fontWeight:tab===t.k?700:500,cursor:"pointer",transition:"all 0.2s"}}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 14px 60px"}}>

        {success && (
          <div style={{background:DS.green,borderRadius:DS.r16,padding:20,marginBottom:16,textAlign:"center",boxShadow:`0 8px 24px ${DS.green}44`}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>{Icon.check(36,"white")}</div>
            <div style={{color:"white",fontWeight:900,fontSize:18,marginBottom:4}}>Abonnement activé !</div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>Bienvenue dans Click & Promo.</div>
            <button onClick={()=>navigate("/Feed")} style={{marginTop:14,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:DS.r12,padding:"10px 22px",color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>Voir les offres →</button>
          </div>
        )}

        {err && <div style={{background:"#FEF2F2",border:`1.5px solid ${DS.red}33`,borderRadius:DS.r12,padding:"12px 14px",marginBottom:14,color:DS.red,fontSize:13}}>{err}</div>}

        {/* Plans commerçants */}
        {tab==="commercant"&&(
          <>
            {/* Social proof */}
            <div style={{background:"white",borderRadius:DS.r16,padding:14,marginBottom:14,boxShadow:DS.s1}}>
              <div style={{fontWeight:700,fontSize:12,color:DS.black,marginBottom:10,textTransform:"uppercase",letterSpacing:0.7}}>Nos commerçants en moyenne</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{v:"+40%",l:"clients/mois",c:DS.green},{v:"3.2x",l:"ROI vs pub",c:DS.orange},{v:"<48h",l:"1ères conv.",c:DS.purple}].map((s,i)=>(
                  <div key={i} style={{textAlign:"center",background:DS.gray50,borderRadius:DS.r12,padding:"10px 4px"}}>
                    <div style={{fontSize:17,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:DS.gray400,marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {PLANS.map(p=>(
              <div key={p.id} style={{background:"white",borderRadius:DS.r20,overflow:"hidden",marginBottom:12,boxShadow:p.badge?`0 6px 24px ${p.couleur}22`:DS.s1,border:`1.5px solid ${p.badge?p.couleur:"transparent"}`,position:"relative"}}>
                {p.badge&&<div style={{position:"absolute",top:14,right:14,background:p.couleur,color:"white",borderRadius:DS.r99,padding:"3px 11px",fontSize:11,fontWeight:800,boxShadow:`0 2px 8px ${p.couleur}55`}}>{p.badge}</div>}
                <div style={{padding:"20px 18px 16px",background:`linear-gradient(135deg,${p.couleur}15,${p.couleur}06)`}}>
                  <div style={{fontSize:30,marginBottom:8}}>{p.emoji}</div>
                  <div style={{fontSize:22,fontWeight:900,color:DS.black,letterSpacing:-0.5}}>{p.nom}</div>
                  <div style={{fontSize:12,color:DS.gray500,marginBottom:12}}>{p.cible}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontSize:40,fontWeight:900,color:p.couleur,letterSpacing:-1}}>{p.prix}€</span>
                    <span style={{fontSize:14,color:DS.gray400}}>/mois</span>
                  </div>
                </div>
                <div style={{padding:"12px 18px 18px"}}>
                  {p.features.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{flexShrink:0,color:f.ok?DS.green:DS.gray300,display:"flex"}}>{f.ok?Icon.check(15,DS.green):<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}</div>
                      <span style={{fontSize:13,color:f.ok?DS.black:DS.gray300}}>{f.l}</span>
                    </div>
                  ))}
                  <button onClick={()=>subscribe(p.id)} disabled={loading===p.id} style={{width:"100%",marginTop:6,background:loading===p.id?DS.gray200:`linear-gradient(135deg,${p.couleur},${p.couleur}cc)`,color:loading===p.id?DS.gray400:"white",border:"none",borderRadius:DS.r12,padding:"14px",fontSize:14,fontWeight:700,cursor:loading===p.id?"not-allowed":"pointer",boxShadow:loading===p.id?"none":`0 6px 18px ${p.couleur}44`,transition:"all 0.2s"}}>
                    {loading===p.id?"Redirection...":` Choisir ${p.nom}`}
                  </button>
                  <div style={{textAlign:"center",marginTop:6,fontSize:11,color:DS.gray400}}>Sans engagement · Résiliable à tout moment</div>
                </div>
              </div>
            ))}

            <div style={{background:`${DS.orange}10`,borderRadius:DS.r12,padding:14,textAlign:"center",border:`1px solid ${DS.orange}22`}}>
              <div style={{fontWeight:700,color:DS.orange,marginBottom:4,fontSize:13}}>14 jours d'essai gratuit</div>
              <div style={{fontSize:12,color:DS.gray500}}>Testez sans engagement. Aucune CB requise.</div>
            </div>
          </>
        )}

        {/* Premium utilisateur */}
        {tab==="user"&&(
          <>
            <div style={{background:`linear-gradient(135deg,${DS.orange},${DS.red})`,borderRadius:DS.r20,padding:"28px 24px",marginBottom:14,textAlign:"center",boxShadow:DS.sOrange}}>
              <div style={{fontSize:54,marginBottom:12}}>✨</div>
              <div style={{color:"white",fontSize:26,fontWeight:900,letterSpacing:-0.5,marginBottom:6}}>Premium</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:13,marginBottom:16}}>L'expérience Click & Promo sans limites</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,justifyContent:"center"}}>
                <span style={{color:"white",fontSize:48,fontWeight:900,letterSpacing:-1}}>9,99€</span>
                <span style={{color:"rgba(255,255,255,0.7)",fontSize:16}}>/mois</span>
              </div>
            </div>

            <div style={{background:"white",borderRadius:DS.r16,padding:18,marginBottom:12,boxShadow:DS.s1}}>
              {PREMIUM.features.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<PREMIUM.features.length-1?`1px solid ${DS.gray100}`:"none"}}>
                  <div style={{width:34,height:34,borderRadius:DS.r8,background:`${DS.orange}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.ico}</div>
                  <span style={{fontSize:14,color:DS.black,fontWeight:500}}>{f.l}</span>
                </div>
              ))}
            </div>

            <button onClick={()=>subscribe("premium")} disabled={loading==="premium"} style={{width:"100%",background:loading==="premium"?DS.gray200:DS.gradMain,color:loading==="premium"?DS.gray400:"white",border:"none",borderRadius:DS.r16,padding:"17px",fontSize:16,fontWeight:800,cursor:loading==="premium"?"not-allowed":"pointer",boxShadow:loading==="premium"?"none":DS.sOrange,marginBottom:8,letterSpacing:0.2}}>
              {loading==="premium"?"Redirection...":"Passer Premium — 9,99€/mois"}
            </button>
            <div style={{textAlign:"center",fontSize:12,color:DS.gray400}}>Sans engagement · Résiliable quand vous voulez</div>
          </>
        )}
      </div>
    </div>
  );
}
