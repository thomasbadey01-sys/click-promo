import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { ProfilUtilisateur } from "@/api/entities";
import { UserAuth } from "@/api/auth";
import { DS, Ic, CPLogo } from "./theme";

const NIVEAUX = [
  {n:1,label:"Débutant",    xp:0,    col:"#9CA3AF"},
  {n:2,label:"Bon Plan Jr.",xp:100,  col:DS.success},
  {n:3,label:"Expert Local",xp:250,  col:"#3B82F6"},
  {n:4,label:"Pro des Deals",xp:500, col:DS.brand},
  {n:5,label:"Légende",     xp:1000, col:"#F59E0B"},
];
const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie"];
const getNiv = p => { let n=NIVEAUX[0]; NIVEAUX.forEach(x=>{if(p>=x.xp)n=x;}); return n; };
const getNext = p => { for(const n of NIVEAUX){if(p<n.xp)return n;} return null; };
const defP = {prenom:"",nom:"",ville:"",categories_favorites:[],rayon_recherche_km:5,points:0,badges:[],total_economies:0,nb_offres_utilisees:0,est_premium:false,notifications_actives:true};

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); const [profil, setProfil] = useState(defP);
  const [pid, setPid] = useState(null); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); const [form, setForm] = useState(defP);
  const [tab, setTab] = useState("stats"); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);

  useEffect(()=>{
    const load=async()=>{
      try{
        const u=await UserAuth.me(); setUser(u);
        if(u){
          const ps=await ProfilUtilisateur.filter({user_id:u.id});
          if(ps.length){const p={...defP,...ps[0],prenom:ps[0].prenom||u.full_name?.split(" ")[0]||"",nom:ps[0].nom||"",email:u.email};setProfil(p);setForm(p);setPid(ps[0].id);}
          else{const np={...defP,user_id:u.id,prenom:(u.full_name||"").split(" ")[0]||""};const c=await ProfilUtilisateur.create(np);setPid(c.id);setProfil(np);setForm(np);}
        }
      }catch{}
      setLoading(false);
    };
    load();
  },[]);

  const save=async()=>{setSaving(true);const u={...profil,...form};setProfil(u);if(pid)await ProfilUtilisateur.update(pid,{prenom:form.prenom,nom:form.nom,ville:form.ville,categories_favorites:form.categories_favorites,rayon_recherche_km:form.rayon_recherche_km,notifications_actives:form.notifications_actives});setSaving(false);setSaved(true);setEditing(false);setTimeout(()=>setSaved(false),2500);};
  const logout=async()=>{await UserAuth.logout();navigate("/Login");};

  const niv=getNiv(profil.points); const next=getNext(profil.points);
  const xpPct=next?((profil.points-niv.xp)/(next.xp-niv.xp))*100:100;
  const initials=(profil.prenom?profil.prenom[0]:"")+(profil.nom?profil.nom[0]:"");

  if(loading) return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:DS.ink05,gap:16}}><CPLogo size={44}/><div style={{width:26,height:26,borderRadius:"50%",border:`2.5px solid ${DS.ink10}`,borderTop:`2.5px solid ${DS.brand}`,animation:"spin .8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  const inp={width:"100%",border:`1.5px solid ${DS.ink10}`,borderRadius:DS.md,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box",background:DS.ink05,fontFamily:DS.font,color:DS.ink,transition:"border-color .2s"};

  return (
    <div style={{background:DS.ink05,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Header sobre fond noir */}
      <div style={{background:DS.ink,padding:"52px 16px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:`radial-gradient(circle,${niv.col}18 0%,transparent 70%)`}}/>

        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,position:"relative"}}>
          {/* Avatar */}
          <div style={{width:60,height:60,borderRadius:DS.xl,background:niv.col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:DS.white,flexShrink:0,letterSpacing:-0.5}}>
            {initials || Ic.user(DS.white, 26)}
          </div>
          <div style={{flex:1}}>
            <div style={{color:DS.white,fontSize:17,fontWeight:700,letterSpacing:-0.3}}>{profil.prenom?`${profil.prenom} ${profil.nom}`.trim():user?user.email:"Mon Profil"}</div>
            {user&&<div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:2}}>{user.email}</div>}
            <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:`${niv.col}22`,border:`1px solid ${niv.col}44`,borderRadius:DS.pill,padding:"3px 10px"}}>
                {Ic.star(niv.col,10,true)}
                <span style={{color:niv.col,fontSize:11,fontWeight:700}}>{niv.label}</span>
              </div>
              {profil.est_premium&&<div style={{display:"inline-flex",alignItems:"center",gap:4,background:`${DS.brand}22`,border:`1px solid ${DS.brand}44`,borderRadius:DS.pill,padding:"3px 10px"}}><span style={{color:DS.brand,fontSize:11,fontWeight:700}}>Premium</span></div>}
            </div>
          </div>
          <button onClick={()=>setEditing(!editing)} style={{background:"rgba(255,255,255,0.08)",border:`1px solid rgba(255,255,255,0.12)`,borderRadius:DS.md,padding:"7px 12px",color:DS.white,cursor:"pointer",fontSize:12,fontWeight:600,flexShrink:0}}>
            {editing?"Annuler":"Modifier"}
          </button>
        </div>

        {/* XP bar */}
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{profil.points} XP</span>
            <span style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{next?`${next.label} à ${next.xp} XP`:"Niveau max"}</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:DS.pill,height:4}}>
            <div style={{background:niv.col,height:"100%",borderRadius:DS.pill,width:`${Math.min(xpPct,100)}%`,transition:"width 1.2s"}}/>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{display:"flex",background:DS.white,borderBottom:`1px solid ${DS.ink10}`}}>
        {[{v:profil.nb_offres_utilisees,l:"Offres",c:DS.brand},{v:`${profil.total_economies}€`,l:"Économies",c:DS.success},{v:profil.badges?.length||0,l:"Badges",c:"#7C3AED"}].map((s,i)=>(
          <div key={i} style={{flex:1,padding:"14px 6px",textAlign:"center",borderRight:i<2?`1px solid ${DS.ink10}`:"none"}}>
            <div style={{fontSize:20,fontWeight:900,color:s.c,letterSpacing:-0.5}}>{s.v}</div>
            <div style={{fontSize:10,color:DS.ink40,marginTop:2,textTransform:"uppercase",letterSpacing:0.5,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:DS.white,borderBottom:`1px solid ${DS.ink10}`}}>
        {[{k:"stats",l:"Activité"},{k:"badges",l:"Badges"},{k:"compte",l:"Compte"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,background:"none",border:"none",borderBottom:`2px solid ${tab===t.k?DS.brand:"transparent"}`,padding:"12px 4px",fontSize:12,fontWeight:tab===t.k?700:500,color:tab===t.k?DS.brand:DS.ink40,cursor:"pointer",fontFamily:DS.font,transition:"all .2s"}}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:"14px 14px 100px"}}>

        {saved&&<div style={{background:"#F0FFF9",border:`1px solid ${DS.success}`,borderRadius:DS.md,padding:"11px 14px",marginBottom:12,fontWeight:600,fontSize:13,color:DS.success,display:"flex",alignItems:"center",gap:8}}>{Ic.check(DS.success,14)} Profil sauvegardé</div>}

        {/* ÉDITION */}
        {editing&&(
          <div style={{background:DS.white,borderRadius:DS.lg,padding:18,marginBottom:12,boxShadow:DS.e1}}>
            <div style={{fontWeight:700,fontSize:14,color:DS.ink,marginBottom:14}}>Modifier le profil</div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <input placeholder="Prénom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} style={{...inp,flex:1}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
              <input placeholder="Nom" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} style={{...inp,flex:1}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
            </div>
            <input placeholder="Ville" value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})} style={{...inp,marginBottom:12}} onFocus={e=>e.target.style.borderColor=DS.brand} onBlur={e=>e.target.style.borderColor=DS.ink10}/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:0.7,marginBottom:7}}>Rayon : {form.rayon_recherche_km} km</div>
              <input type="range" min={1} max={30} value={form.rayon_recherche_km} onChange={e=>setForm({...form,rayon_recherche_km:parseInt(e.target.value)})} style={{width:"100%",accentColor:DS.brand}}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:0.7,marginBottom:8}}>Catégories favorites</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {CATS.map(c=>{const on=form.categories_favorites?.includes(c);return<button key={c} onClick={()=>{const cats=on?form.categories_favorites.filter(x=>x!==c):[...(form.categories_favorites||[]),c];setForm({...form,categories_favorites:cats});}} style={{background:on?DS.brand:DS.white,color:on?DS.white:DS.ink60,border:`1.5px solid ${on?DS.brand:DS.ink10}`,borderRadius:DS.pill,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s"}}>{c}</button>;})}
              </div>
            </div>
            <button onClick={save} disabled={saving} style={{width:"100%",background:saving?DS.ink10:DS.brand,color:saving?DS.ink40:DS.white,border:"none",borderRadius:DS.md,padding:"13px",fontSize:14,fontWeight:700,cursor:saving?"not-allowed":"pointer",boxShadow:saving?"none":DS.eBrand}}>
              {saving?"Enregistrement…":"Sauvegarder"}
            </button>
          </div>
        )}

        {/* ACTIVITÉ */}
        {tab==="stats"&&!editing&&(
          <>
            <div style={{background:DS.white,borderRadius:DS.lg,padding:18,marginBottom:10,boxShadow:DS.e1}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.ink,marginBottom:14}}>Objectifs du mois</div>
              {[{label:"Offres utilisées",cur:profil.nb_offres_utilisees,goal:10,col:DS.brand},{label:"Économies réalisées",cur:profil.total_economies,goal:50,col:DS.success,unit:"€"}].map((o,i)=>(
                <div key={i} style={{marginBottom:i===0?14:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,color:DS.ink60}}>{o.label}</span>
                    <span style={{fontSize:13,fontWeight:700,color:o.col}}>{o.cur}{o.unit||""}<span style={{color:DS.ink20,fontWeight:400}}> / {o.goal}{o.unit||""}</span></span>
                  </div>
                  <div style={{background:DS.ink10,borderRadius:DS.pill,height:5}}>
                    <div style={{background:o.col,height:"100%",borderRadius:DS.pill,width:`${Math.min((o.cur/o.goal)*100,100)}%`,transition:"width 1s"}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:DS.white,borderRadius:DS.lg,padding:18,boxShadow:DS.e1}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.ink,marginBottom:12}}>Informations</div>
              {[{l:"Ville",v:profil.ville||"—"},{l:"Rayon",v:`${profil.rayon_recherche_km||5} km`},{l:"Catégories",v:profil.categories_favorites?.length?profil.categories_favorites.slice(0,2).join(", ")+(profil.categories_favorites.length>2?"…":""):"Toutes"},{l:"Compte",v:user?"Connecté":"Hors ligne"}].map((r,i,a)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<a.length-1?`1px solid ${DS.ink05}`:"none"}}>
                  <span style={{fontSize:13,color:DS.ink40}}>{r.l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:DS.ink,textAlign:"right",maxWidth:"60%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BADGES */}
        {tab==="badges"&&(
          <>
            <div style={{fontSize:11,color:DS.ink40,marginBottom:12,fontWeight:600}}>{profil.badges?.length||0} badge{(profil.badges?.length||0)!==1?"s":""} obtenu{(profil.badges?.length||0)!==1?"s":""}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{id:"first_deal",l:"Premier deal",d:"1ère offre utilisée",xp:50},{id:"saver",l:"Économiseur",d:"10€ économisés",xp:100},{id:"explorer",l:"Explorateur",d:"5 commerces visités",xp:150},{id:"fan",l:"Fan",d:"5 favoris",xp:75},{id:"speed",l:"Flash Hunter",d:"Offre urgente utilisée",xp:200},{id:"loyal",l:"Fidèle",d:"10 offres utilisées",xp:300}].map(b=>{
                const on=profil.badges?.includes(b.id);
                return (
                  <div key={b.id} style={{background:on?DS.white:DS.ink05,borderRadius:DS.lg,padding:"16px 12px",textAlign:"center",boxShadow:on?DS.e2:DS.e1,border:`1.5px solid ${on?`${DS.brand}20`:DS.ink10}`,opacity:on?1:0.5}}>
                    <div style={{width:44,height:44,borderRadius:DS.md,background:on?`${DS.brand}12`:DS.ink10,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:on?DS.brand:DS.ink20}}>
                      {Ic.star(on?DS.brand:DS.ink20,22,on)}
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:DS.ink,marginBottom:2}}>{b.l}</div>
                    <div style={{fontSize:10,color:DS.ink40,marginBottom:6}}>{b.d}</div>
                    <div style={{fontSize:11,fontWeight:700,color:DS.brand}}>+{b.xp} XP</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* COMPTE */}
        {tab==="compte"&&(
          <>
            {!user?(
              <div style={{background:DS.ink,borderRadius:DS.xl,padding:28,marginBottom:12,textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>{Ic.lock(DS.brand,32)}</div>
                <div style={{color:DS.white,fontWeight:700,fontSize:16,marginBottom:6}}>Créez un compte</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:18}}>Synchronisez favoris et progression.</div>
                <button onClick={()=>navigate("/Login")} style={{background:DS.brand,color:DS.white,border:"none",borderRadius:DS.md,padding:"12px 24px",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:DS.eBrand}}>Se connecter</button>
              </div>
            ):(
              <div style={{background:DS.white,borderRadius:DS.lg,padding:18,marginBottom:10,boxShadow:DS.e1}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:0.7,marginBottom:12}}>Compte connecté</div>
                <div style={{fontSize:14,color:DS.ink,fontWeight:500,marginBottom:16}}>{user.email}</div>
                <button onClick={logout} style={{width:"100%",background:"#FEF2F2",color:DS.danger,border:`1px solid ${DS.danger}22`,borderRadius:DS.md,padding:"12px",fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {Ic.lock(DS.danger,15)} Se déconnecter
                </button>
              </div>
            )}

            {/* Notifs */}
            <div style={{background:DS.white,borderRadius:DS.lg,padding:16,marginBottom:10,boxShadow:DS.e1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:36,height:36,borderRadius:DS.md,background:`${DS.brand}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.bell(DS.brand,17)}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:DS.ink}}>Notifications push</div>
                    <div style={{fontSize:11,color:DS.ink40,marginTop:1}}>Alertes offres flash</div>
                  </div>
                </div>
                <div onClick={()=>setForm(f=>({...f,notifications_actives:!f.notifications_actives}))} style={{width:44,height:24,borderRadius:12,background:form.notifications_actives?DS.brand:DS.ink10,cursor:"pointer",position:"relative",transition:"background .3s"}}>
                  <div style={{position:"absolute",width:18,height:18,borderRadius:"50%",background:DS.white,top:3,left:form.notifications_actives?23:3,transition:"left .3s",boxShadow:DS.e1}}/>
                </div>
              </div>
            </div>

            {/* Liens */}
            {[{l:"Abonnements",p:"/Abonnement"},{l:"Confidentialité",p:"/PrivacyPolicy"}].map((lk,i)=>(
              <button key={i} onClick={()=>navigate(lk.p)} style={{width:"100%",background:DS.white,border:"none",borderRadius:DS.md,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,cursor:"pointer",boxShadow:DS.e1,fontFamily:DS.font}}>
                <span style={{fontSize:14,fontWeight:500,color:DS.ink}}>{lk.l}</span>
                {Ic.chev(DS.ink20,15)}
              </button>
            ))}
                        <div onClick={()=>navigate("/InscriptionCommercant")} style={{background:"#FFF5F0",border:"1.5px solid #FFD0B5",borderRadius:DS.lg,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginTop:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:DS.ink}}>🏪 Vous êtes commerçant ?</div>
                <div style={{fontSize:11,color:DS.ink40,marginTop:2}}>Référencez votre commerce et publiez vos promos</div>
              </div>
              {Ic.chev(DS.brand,15)}
            </div>
            <div style={{textAlign:"center",marginTop:14,color:DS.ink20,fontSize:11}}>Click & Promo v1.0 — 2025</div>
          </>
        )}
      </div>

      <NavBar active="profil"/>
    </div>
  );
}
