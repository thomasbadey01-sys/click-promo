import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { ProfilUtilisateur } from "@/api/entities";
import { UserAuth } from "@/api/auth";
import { DS, Icon, CPLogo } from "./Home";

const BADGES = [
  { id:"first_deal", icon:null, label:"Premier deal",   desc:"1ère offre utilisée",    xp:50 },
  { id:"saver_10",   icon:null, label:"Économiseur",     desc:"10€ économisés",          xp:100 },
  { id:"explorer",   icon:null, label:"Explorateur",     desc:"5 commerces visités",     xp:150 },
  { id:"fan",        icon:null, label:"Fan",             desc:"5 favoris ajoutés",       xp:75 },
  { id:"speed",      icon:null, label:"Flash Hunter",   desc:"Offre urgente utilisée",  xp:200 },
  { id:"loyal",      icon:null, label:"Fidèle",          desc:"10 offres utilisées",     xp:300 },
];
const NIVEAUX = [
  { niveau:1, label:"Débutant",        color:DS.gray500, xp:0 },
  { niveau:2, label:"Bon Plan Jr.",    color:DS.green,   xp:100 },
  { niveau:3, label:"Expert Local",   color:DS.blue,    xp:250 },
  { niveau:4, label:"Pro des Deals",  color:DS.purple,  xp:500 },
  { niveau:5, label:"Légende",        color:DS.orange,  xp:1000 },
];
const CATS = ["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Services","Épicerie"];

const getNiv = p=>{ let n=NIVEAUX[0]; NIVEAUX.forEach(x=>{ if(p>=x.xp)n=x; }); return n; };
const getNext = p=>{ for(const n of NIVEAUX){ if(p<n.xp)return n; } return null; };

const defaultP = { prenom:"",nom:"",ville:"Paris",email:"",categories_favorites:[],rayon_recherche_km:5,points:0,badges:[],total_economies:0,nb_offres_utilisees:0,est_premium:false,notifications_actives:true };

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); const [profil, setProfil] = useState(defaultP);
  const [profilId, setProfilId] = useState(null); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); const [form, setForm] = useState(defaultP);
  const [tab, setTab] = useState("activite"); const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(()=>{
    const load=async()=>{
      try {
        const u=await UserAuth.me(); setUser(u);
        if(u){
          const ps=await ProfilUtilisateur.filter({user_id:u.id});
          if(ps.length>0){ const p=ps[0]; setProfilId(p.id); const m={...defaultP,...p,prenom:p.prenom||u.full_name?.split(" ")[0]||"",nom:p.nom||u.full_name?.split(" ").slice(1).join(" ")||"",email:u.email||""}; setProfil(m); setForm(m); }
          else { const np={...defaultP,user_id:u.id,prenom:(u.full_name||"").split(" ")[0]||"",nom:(u.full_name||"").split(" ").slice(1).join(" ")||"",email:u.email||""}; const c=await ProfilUtilisateur.create(np); setProfilId(c.id); setProfil(np); setForm(np); }
        } else { try{ const s=localStorage.getItem("cp_profil"); if(s){const p=JSON.parse(s);setProfil(p);setForm(p);} }catch{} }
      } catch{}
      setLoading(false);
    };
    load();
  },[]);

  const save=async()=>{ setSaving(true); const u={...profil,...form}; setProfil(u); if(profilId) await ProfilUtilisateur.update(profilId,{prenom:form.prenom,nom:form.nom,ville:form.ville,categories_favorites:form.categories_favorites,rayon_recherche_km:form.rayon_recherche_km,notifications_actives:form.notifications_actives}); else localStorage.setItem("cp_profil",JSON.stringify(u)); setSaving(false); setSaved(true); setEditing(false); setTimeout(()=>setSaved(false),2500); };
  const logout=async()=>{ await UserAuth.logout(); localStorage.removeItem("cp_onboarded"); navigate("/Login"); };

  const niv=getNiv(profil.points); const next=getNext(profil.points);
  const xpPct=next?((profil.points-niv.xp)/(next.xp-niv.xp))*100:100;

  if(loading) return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:DS.gray50,gap:16}}><CPLogo size={48}/><div style={{width:32,height:32,borderRadius:"50%",border:`3px solid ${DS.gray100}`,borderTop:`3px solid ${DS.orange}`,animation:"spin 0.8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  const inp={width:"100%",border:`1.5px solid ${DS.gray200}`,borderRadius:DS.r12,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box",background:DS.gray50,fontFamily:DS.font,color:DS.black};

  return (
    <div style={{background:DS.gray50,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Header */}
      <div style={{background:DS.black,padding:"52px 16px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${niv.color}22 0%,transparent 70%)`}}/>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,position:"relative"}}>
          <div style={{width:68,height:68,borderRadius:DS.r20,background:`${niv.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:niv.color,border:`2px solid ${niv.color}44`,flexShrink:0}}>
            {profil.prenom?profil.prenom[0].toUpperCase():Icon.user(28,niv.color)}
          </div>
          <div style={{flex:1}}>
            <div style={{color:"white",fontSize:18,fontWeight:800,letterSpacing:-0.3}}>{profil.prenom?`${profil.prenom} ${profil.nom}`:user?user.email:"Mon Profil"}</div>
            {user&&<div style={{color:DS.gray500,fontSize:11,marginTop:2}}>{user.email}</div>}
            <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:`${niv.color}22`,borderRadius:DS.r99,padding:"3px 10px"}}>{Icon.star(11,niv.color,true)}<span style={{color:niv.color,fontSize:11,fontWeight:700}}>{niv.label}</span></div>
              {profil.est_premium&&<div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(249,115,22,0.2)",borderRadius:DS.r99,padding:"3px 10px"}}><span style={{color:DS.orange,fontSize:11,fontWeight:700}}>Premium</span></div>}
              {!user&&<button onClick={()=>navigate("/Login")} style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",borderRadius:DS.r99,padding:"3px 10px",border:"none",cursor:"pointer",color:"white",fontSize:11,fontWeight:600}}>{Icon.lock(11,"white")} Se connecter</button>}
            </div>
          </div>
          <button onClick={()=>setEditing(!editing)} style={{background:"rgba(255,255,255,0.08)",border:`1px solid rgba(255,255,255,0.12)`,borderRadius:DS.r12,padding:"8px 13px",color:"white",cursor:"pointer",fontSize:12,fontWeight:600,flexShrink:0}}>
            {editing?"Annuler":"Modifier"}
          </button>
        </div>

        {/* XP Bar */}
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{color:DS.gray500,fontSize:11}}>{profil.points} XP</span>
            <span style={{color:DS.gray600,fontSize:11}}>{next?`→ ${next.label} (${next.xp} XP)`:"Niveau MAX"}</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:DS.r99,height:6}}>
            <div style={{background:`linear-gradient(90deg,${niv.color},${niv.color}cc)`,height:"100%",borderRadius:DS.r99,width:`${Math.min(xpPct,100)}%`,transition:"width 1.2s",boxShadow:`0 0 8px ${niv.color}88`}}/>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"flex",background:"white",borderBottom:`1px solid ${DS.gray100}`}}>
        {[{val:profil.nb_offres_utilisees,label:"Offres",color:DS.orange},{val:`${profil.total_economies}€`,label:"Économisés",color:DS.green},{val:profil.badges?.length||0,label:"Badges",color:DS.purple}].map((s,i)=>(
          <div key={i} style={{flex:1,padding:"14px 6px",textAlign:"center",borderRight:i<2?`1px solid ${DS.gray100}`:"none"}}>
            <div style={{fontSize:20,fontWeight:900,color:s.color,letterSpacing:-0.5}}>{s.val}</div>
            <div style={{fontSize:10,color:DS.gray400,marginTop:2,fontWeight:500}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"white",borderBottom:`1px solid ${DS.gray100}`}}>
        {[{k:"activite",l:"Activité"},{k:"badges",l:"Badges"},{k:"reglages",l:"Réglages"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,background:"none",border:"none",padding:"12px 4px",fontSize:12,fontWeight:tab===t.k?700:500,color:tab===t.k?DS.orange:DS.gray500,borderBottom:`2px solid ${tab===t.k?DS.orange:"transparent"}`,cursor:"pointer",transition:"all 0.2s",fontFamily:DS.font}}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:"14px 14px 100px"}}>

        {/* Toast */}
        {saved&&<div style={{background:DS.green,color:"white",borderRadius:DS.r12,padding:"12px 14px",marginBottom:12,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8}}>{Icon.check(15,"white")} Profil sauvegardé !</div>}

        {/* Édition */}
        {editing&&(
          <div style={{background:"white",borderRadius:DS.r16,padding:16,marginBottom:12,boxShadow:DS.s1}}>
            <div style={{fontWeight:700,fontSize:14,color:DS.black,marginBottom:14}}>Modifier mon profil</div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <input placeholder="Prénom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} style={{...inp,flex:1}}/>
              <input placeholder="Nom" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} style={{...inp,flex:1}}/>
            </div>
            <input placeholder="Ville" value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})} style={{...inp,marginBottom:12}}/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:600,color:DS.gray500,marginBottom:6}}>Rayon : {form.rayon_recherche_km} km</div>
              <input type="range" min="1" max="30" value={form.rayon_recherche_km} onChange={e=>setForm({...form,rayon_recherche_km:parseInt(e.target.value)})} style={{width:"100%",accentColor:DS.orange}}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:DS.gray500,marginBottom:8}}>Catégories favorites</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {CATS.map(c=>{const on=form.categories_favorites?.includes(c);return <button key={c} onClick={()=>{const cats=on?form.categories_favorites.filter(x=>x!==c):[...(form.categories_favorites||[]),c];setForm({...form,categories_favorites:cats});}} style={{background:on?DS.orange:"white",color:on?"white":DS.gray700,border:`1.5px solid ${on?DS.orange:DS.gray200}`,borderRadius:DS.r99,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{c}</button>;})}
              </div>
            </div>
            <button onClick={save} disabled={saving} style={{width:"100%",background:saving?DS.gray200:DS.gradMain,color:saving?DS.gray400:"white",border:"none",borderRadius:DS.r12,padding:"13px",fontSize:14,fontWeight:700,cursor:saving?"not-allowed":"pointer",boxShadow:saving?"none":DS.sOrange}}>
              {saving?"Enregistrement...":"Sauvegarder"}
            </button>
          </div>
        )}

        {/* ACTIVITÉ */}
        {tab==="activite"&&!editing&&(
          <>
            <div style={{background:"white",borderRadius:DS.r16,padding:16,marginBottom:12,boxShadow:DS.s1}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.black,marginBottom:12}}>Objectifs du mois</div>
              {[{label:"Offres utilisées",cur:profil.nb_offres_utilisees,goal:10,color:DS.orange},{label:"Économies",cur:profil.total_economies,goal:50,color:DS.green,unit:"€"}].map((o,i)=>(
                <div key={i} style={{marginBottom:i===0?12:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,color:DS.gray700}}>{o.label}</span><span style={{fontSize:13,fontWeight:700,color:o.color}}>{o.cur}{o.unit||""} / {o.goal}{o.unit||""}</span></div>
                  <div style={{background:DS.gray100,borderRadius:DS.r99,height:6}}><div style={{background:o.color,height:"100%",borderRadius:DS.r99,width:`${Math.min((o.cur/o.goal)*100,100)}%`,transition:"width 1s"}}/></div>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:DS.r16,padding:16,boxShadow:DS.s1}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.black,marginBottom:12}}>Infos</div>
              {[{l:"Ville",v:profil.ville||"Non renseignée"},{l:"Rayon",v:`${profil.rayon_recherche_km||5} km`},{l:"Catégories",v:profil.categories_favorites?.length?profil.categories_favorites.slice(0,2).join(", ")+(profil.categories_favorites.length>2?"…":""):"Toutes"},{l:"Compte",v:user?"Connecté":"Hors ligne"}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<3?`1px solid ${DS.gray100}`:"none"}}>
                  <span style={{fontSize:13,color:DS.gray500}}>{r.l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:DS.black,textAlign:"right",maxWidth:"60%"}}>{r.v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BADGES */}
        {tab==="badges"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {BADGES.map(b=>{const on=profil.badges?.includes(b.id);return(
              <div key={b.id} style={{background:on?"white":DS.gray50,borderRadius:DS.r16,padding:"16px 12px",textAlign:"center",boxShadow:on?DS.s2:DS.s1,border:`1.5px solid ${on?`${DS.orange}22`:DS.gray100}`,opacity:on?1:0.45}}>
                <div style={{width:48,height:48,borderRadius:DS.r12,background:on?`${DS.orange}15`:DS.gray100,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",color:on?DS.orange:DS.gray400}}>{Icon.star(24,on?DS.orange:DS.gray400,on)}</div>
                <div style={{fontSize:12,fontWeight:700,color:DS.black,marginBottom:3}}>{b.label}</div>
                <div style={{fontSize:10,color:DS.gray400,marginBottom:5}}>{b.desc}</div>
                <div style={{fontSize:11,fontWeight:700,color:DS.orange}}>+{b.xp} XP</div>
              </div>
            );})}
          </div>
        )}

        {/* RÉGLAGES */}
        {tab==="reglages"&&(
          <>
            {!user?(
              <div style={{background:DS.black,borderRadius:DS.r20,padding:24,marginBottom:12,textAlign:"center"}}>
                <div style={{width:56,height:56,borderRadius:DS.r16,background:"rgba(249,115,22,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>{Icon.lock(26,DS.orange)}</div>
                <div style={{color:"white",fontWeight:700,fontSize:16,marginBottom:6}}>Créez un compte</div>
                <div style={{color:DS.gray500,fontSize:13,marginBottom:16}}>Synchronisez vos favoris et votre progression.</div>
                <button onClick={()=>navigate("/Login")} style={{background:DS.gradMain,color:"white",border:"none",borderRadius:DS.r12,padding:"12px 24px",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:DS.sOrange}}>Se connecter</button>
              </div>
            ):(
              <div style={{background:"white",borderRadius:DS.r16,padding:16,marginBottom:12,boxShadow:DS.s1}}>
                <div style={{fontSize:11,fontWeight:700,color:DS.gray400,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Compte</div>
                <div style={{fontSize:13,color:DS.gray500,marginBottom:2}}>Connecté en tant que</div>
                <div style={{fontSize:14,fontWeight:600,color:DS.black,marginBottom:14}}>{user.email}</div>
                <button onClick={logout} style={{width:"100%",background:"#FEF2F2",color:DS.red,border:`1px solid ${DS.red}22`,borderRadius:DS.r12,padding:"12px",fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {Icon.lock(15,DS.red)} Se déconnecter
                </button>
              </div>
            )}

            {/* Notifs toggle */}
            <div style={{background:"white",borderRadius:DS.r16,padding:16,marginBottom:12,boxShadow:DS.s1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:DS.r12,background:`${DS.orange}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.bell(18,DS.orange)}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:DS.black}}>Notifications</div>
                    <div style={{fontSize:11,color:DS.gray400,marginTop:1}}>Alertes offres flash</div>
                  </div>
                </div>
                <div onClick={()=>setForm(f=>({...f,notifications_actives:!f.notifications_actives}))} style={{width:46,height:26,borderRadius:13,background:form.notifications_actives?DS.orange:DS.gray200,cursor:"pointer",position:"relative",transition:"background 0.3s"}}>
                  <div style={{position:"absolute",width:20,height:20,borderRadius:"50%",background:"white",top:3,left:form.notifications_actives?23:3,transition:"left 0.3s",boxShadow:DS.s1}}/>
                </div>
              </div>
            </div>

            {/* Liens */}
            {[{l:"Abonnement",path:"/Abonnement"},{l:"Politique de confidentialité",path:"/PrivacyPolicy"}].map((lnk,i)=>(
              <button key={i} onClick={()=>navigate(lnk.path)} style={{width:"100%",background:"white",border:"none",borderRadius:DS.r14,padding:"15px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,cursor:"pointer",boxShadow:DS.s1}}>
                <span style={{fontSize:14,fontWeight:600,color:DS.black}}>{lnk.l}</span>
                {Icon.chevronR(15,DS.gray400)}
              </button>
            ))}
            <div style={{textAlign:"center",marginTop:12,color:DS.gray300,fontSize:11}}>Click & Promo v1.0.0</div>
          </>
        )}
      </div>
      <NavBar active="profil"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
