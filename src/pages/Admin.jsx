import { useState, useEffect } from "react";
import { Offre, CommandeCommission, Abonnement } from "@/api/entities";
import { DS, Ic, CPLogo } from "./Home";

const IcCard = (c=DS.white,s=18) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IcTrend = (c=DS.success,s=16) => <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

export default function Admin() {
  const [offres, setOffres] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [abos, setAbos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("revenus");

  useEffect(() => {
    Promise.all([
      Offre.list(),
      CommandeCommission.list().catch(() => []),
      Abonnement.list().catch(() => [])
    ]).then(([o, c, a]) => {
      setOffres(o); setCommandes(c); setAbos(a); setLoading(false);
    });
  }, []);

  const abosActifs = abos.filter(a => a.statut === "active");
  const mrrAbos = abosActifs.reduce((s, a) => s + (a.montant_mensuel || 0), 0);
  const commandesPaid = commandes.filter(c => c.statut === "paid");
  const totalCommissions = commandesPaid.reduce((s, c) => s + (c.montant_commission || 0), 0);
  const mrrTotal = mrrAbos + totalCommissions;

  const nbActives = offres.filter(o => o.est_active).length;
  const nbOnline = offres.filter(o => o.achat_en_ligne && o.est_active).length;
  const totalVues = offres.reduce((s, o) => s + (o.nb_vues || 0), 0);
  const totalConv = offres.reduce((s, o) => s + (o.nb_conversions || 0), 0);

  const OBJECTIF = 5000;
  const pctObj = Math.min((mrrTotal / OBJECTIF) * 100, 100);

  const parPlan = {};
  abosActifs.forEach(a => { parPlan[a.plan] = (parPlan[a.plan] || 0) + 1; });

  if (loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:DS.ink,gap:16}}>
      <CPLogo size={44} inverted/>
      <div style={{width:26,height:26,borderRadius:"50%",border:`2.5px solid rgba(255,255,255,.1)`,borderTop:`2.5px solid ${DS.brand}`,animation:"spin .8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{background:"#0A0A0A",minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Header */}
      <header style={{background:"#0A0A0A",padding:"52px 16px 14px",position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <CPLogo size={32} inverted/>
          <div>
            <div style={{color:DS.white,fontSize:17,fontWeight:800,letterSpacing:-.4}}>Admin</div>
            <div style={{color:"rgba(255,255,255,.3)",fontSize:11}}>Tableau de bord interne</div>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,.05)",borderRadius:DS.md,padding:4,gap:4}}>
          {[{k:"revenus",l:"Revenus"},{k:"commissions",l:"Commissions"},{k:"offres",l:"Offres"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,background:tab===t.k?DS.brand:"transparent",color:DS.white,border:"none",borderRadius:DS.sm,padding:"9px 4px",fontSize:12,fontWeight:tab===t.k?700:400,cursor:"pointer",fontFamily:DS.font,transition:"all .2s"}}>{t.l}</button>
          ))}
        </div>
      </header>

      <div style={{padding:"14px 14px 60px"}}>

        {/* ── REVENUS ── */}
        {tab==="revenus"&&(
          <>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {label:"MRR Total",val:`${mrrTotal.toFixed(0)}€`,sub:"Abos + commissions",col:DS.brand},
                {label:"ARR projeté",val:`${(mrrTotal*12).toFixed(0)}€`,sub:"Annuel estimé",col:"#7C3AED"},
                {label:"Abonnés actifs",val:abosActifs.length,sub:"Commerçants payants",col:DS.success},
                {label:"Commissions",val:`${totalCommissions.toFixed(2)}€`,sub:`${commandesPaid.length} ventes`,col:"#F59E0B"},
              ].map((s,i)=>(
                <div key={i} style={{background:"#1A1A1A",borderRadius:DS.lg,padding:14,border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:22,fontWeight:900,color:s.col,letterSpacing:-.5,marginBottom:3}}>{s.val}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.7)"}}>{s.label}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Objectif MRR */}
            <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:16,marginBottom:10,border:"1px solid rgba(255,255,255,.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:13}}>Objectif MRR</span>
                <span style={{color:DS.brand,fontWeight:900,fontSize:13}}>{mrrTotal.toFixed(0)}€ / {OBJECTIF}€</span>
              </div>
              <div style={{background:"rgba(255,255,255,.06)",borderRadius:DS.pill,height:8,marginBottom:7}}>
                <div style={{background:DS.brand,height:"100%",borderRadius:DS.pill,width:`${pctObj}%`,transition:"width 1.2s",boxShadow:`0 0 10px ${DS.brand}66`}}/>
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>{pctObj.toFixed(1)}% atteint</div>
            </div>

            {/* Mix revenus */}
            <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:16,marginBottom:10,border:"1px solid rgba(255,255,255,.06)"}}>
              <div style={{color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:13,marginBottom:12}}>Sources de revenus</div>
              {[
                {label:"Abonnements commerçants",val:`${mrrAbos.toFixed(0)}€/mois`,col:DS.brand,pct:mrrTotal>0?(mrrAbos/mrrTotal)*100:0},
                {label:"Commissions ventes",val:`${totalCommissions.toFixed(2)}€`,col:"#F59E0B",pct:mrrTotal>0?(totalCommissions/mrrTotal)*100:0},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:i===0?12:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{r.label}</span>
                    <span style={{fontSize:12,fontWeight:700,color:r.col}}>{r.val}</span>
                  </div>
                  <div style={{background:"rgba(255,255,255,.06)",borderRadius:DS.pill,height:4}}>
                    <div style={{background:r.col,height:"100%",borderRadius:DS.pill,width:`${Math.min(r.pct,100)}%`}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Plans */}
            {Object.keys(parPlan).length>0&&(
              <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:16,border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:13,marginBottom:12}}>Répartition des plans</div>
                {Object.entries(parPlan).map(([plan,count])=>(
                  <div key={plan} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"capitalize"}}>Plan {plan}</span>
                    <span style={{fontSize:12,fontWeight:700,color:DS.brand}}>{count} abonné{count>1?"s":""}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Breakeven */}
            <div style={{background:`linear-gradient(135deg,${DS.brand}18,transparent)`,borderRadius:DS.lg,padding:16,marginTop:10,border:`1px solid ${DS.brand}22`}}>
              <div style={{color:DS.brand,fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Analyse rentabilité</div>
              <div style={{color:"rgba(255,255,255,.6)",fontSize:13,lineHeight:1.8}}>
                15 commerçants Pro → 1 185€/mois<br/>
                Infrastructure → ~50€/mois<br/>
                <strong style={{color:DS.white}}>Breakeven dès 15 commerçants Pro</strong>
              </div>
            </div>
          </>
        )}

        {/* ── COMMISSIONS ── */}
        {tab==="commissions"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:14,border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#F59E0B",letterSpacing:-.5}}>{totalCommissions.toFixed(2)}€</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:3}}>Total commissions</div>
              </div>
              <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:14,border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontSize:22,fontWeight:900,color:DS.success,letterSpacing:-.5}}>{commandesPaid.length}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:3}}>Ventes réalisées</div>
              </div>
              <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:14,border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontSize:22,fontWeight:900,color:DS.brand,letterSpacing:-.5}}>{nbOnline}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:3}}>Offres achat en ligne</div>
              </div>
              <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:14,border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#7C3AED",letterSpacing:-.5}}>
                  {commandesPaid.length>0?(totalCommissions/commandesPaid.length).toFixed(2):0}€
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:3}}>Commission moy./vente</div>
              </div>
            </div>

            <div style={{color:"rgba(255,255,255,.3)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>
              Dernières transactions
            </div>

            {commandes.length===0&&(
              <div style={{background:"#1A1A1A",borderRadius:DS.lg,padding:24,textAlign:"center",border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>{IcCard("rgba(255,255,255,.2)",32)}</div>
                <div style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Aucune vente en ligne encore</div>
                <div style={{color:"rgba(255,255,255,.2)",fontSize:11,marginTop:4}}>Activez "Achat en ligne" sur vos offres pour recevoir des commissions</div>
              </div>
            )}

            {commandes.slice(0,20).map(c=>(
              <div key={c.id} style={{background:"#1A1A1A",borderRadius:DS.md,padding:"12px 14px",marginBottom:7,border:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:DS.sm,background:c.statut==="paid"?`${DS.success}18`:c.statut==="failed"?`${DS.danger}18`:`${DS.brand}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {c.statut==="paid"?Ic.check(DS.success,16):c.statut==="failed"?Ic.x(DS.danger,16):IcCard(DS.brand,16)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:DS.white,fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.offre_titre||"—"}</div>
                  <div style={{color:"rgba(255,255,255,.3)",fontSize:10,marginTop:2}}>{c.commercant_nom}</div>
                </div>
                <div style={{flexShrink:0,textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#F59E0B"}}>+{c.montant_commission?.toFixed(2)||0}€</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{c.commission_pct||8}% commission</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── OFFRES ── */}
        {tab==="offres"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{v:offres.length,l:"Total",c:DS.white},{v:nbActives,l:"Actives",c:DS.success},{v:nbOnline,l:"En ligne",c:"#F59E0B"}].map((s,i)=>(
                <div key={i} style={{background:"#1A1A1A",borderRadius:DS.md,padding:"12px 10px",textAlign:"center",border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            {offres.sort((a,b)=>(b.nb_vues||0)-(a.nb_vues||0)).slice(0,20).map(o=>(
              <div key={o.id} style={{background:"#1A1A1A",borderRadius:DS.md,padding:"11px 12px",marginBottom:7,border:"1px solid rgba(255,255,255,.06)",display:"flex",gap:10,alignItems:"center"}}>
                <img src={o.image_url} alt="" style={{width:40,height:40,borderRadius:DS.sm,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:DS.white,fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.titre}</div>
                  <div style={{color:"rgba(255,255,255,.3)",fontSize:10,marginTop:2}}>{o.nb_vues||0} vues · {o.nb_conversions||0} conv.{o.achat_en_ligne?" · En ligne":""}</div>
                </div>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  <span style={{background:`${DS.brand}18`,color:DS.brand,borderRadius:DS.xs,padding:"2px 7px",fontSize:11,fontWeight:800}}>-{o.valeur_reduction}%</span>
                  {o.achat_en_ligne&&<span style={{fontSize:9,color:"#F59E0B",fontWeight:700}}>ONLINE</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
