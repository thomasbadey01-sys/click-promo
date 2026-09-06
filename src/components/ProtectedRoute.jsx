import {Navigate,Outlet,useLocation} from "react-router-dom";
import {useEffect,useState} from "react";
import {useAuth} from "@/lib/AuthContext";
import {base44} from "@/api/base44Client";
import LocalShell from "@/components/local/LocalShell";
import {Link} from "react-router-dom";
export default function ProtectedRoute({role}) {
  const {user,isLoadingAuth}=useAuth();const location=useLocation();
  const [merchant,setMerchant]=useState({loading:true,allowed:false,error:false});
  useEffect(()=>{
    let live=true;
    if(role!=="merchant"||!user||user.role==="admin") return;
    setMerchant({loading:true,allowed:false,error:false});
    base44.entities.Commercant.filter({user_id:user.id}).then(rows=>{if(live)setMerchant({loading:false,allowed:rows.some(m=>m.est_actif===true&&m.est_valide===true),error:false});}).catch(()=>{if(live)setMerchant({loading:false,allowed:false,error:true});});
    return ()=>{live=false;};
  },[role,user?.id,user?.role]);
  if(isLoadingAuth) return <LocalShell><div className="cp-empty" role="status">Vérification de votre session…</div></LocalShell>;
  if(!user) return <Navigate to={"/Login?next="+encodeURIComponent(location.pathname+location.search)} replace/>;
  if(role==="admin"&&user.role!=="admin") return <LocalShell><div className="cp-container cp-auth-wrap cp-panel"><h1>Accès réservé</h1><p>Cette page est réservée à l’administration.</p><Link className="cp-button cp-button-primary" to="/">Retour à l’accueil</Link></div></LocalShell>;
  if(role==="merchant"&&user.role!=="admin") {
    if(merchant.loading)return <LocalShell><div className="cp-empty" role="status">Vérification de votre commerce…</div></LocalShell>;
    if(!merchant.allowed)return <LocalShell><div className="cp-container cp-auth-wrap cp-panel"><h1>{merchant.error?"Vérification indisponible":"Votre espace commerçant"}</h1><p>{merchant.error?"Le statut de votre commerce n’a pas pu être vérifié. Réessayez dans un instant.":"Un commerce actif et approuvé doit être associé à votre compte pour accéder à cet espace."}</p><Link className="cp-button cp-button-primary" to="/InscriptionCommercant">Ma demande de référencement</Link><div className="cp-inline-actions"><Link to="/">Retour aux commerces</Link></div></div></LocalShell>;
  }
  return <Outlet/>;
}

