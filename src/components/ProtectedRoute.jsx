import {Navigate,Outlet,useLocation} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {useAuth} from "@/lib/AuthContext";
import {base44} from "@/api/base44Client";
import LocalShell from "@/components/local/LocalShell";
import {Link} from "react-router-dom";
export default function ProtectedRoute({role}) {
  const {user,isLoadingAuth}=useAuth();const location=useLocation();
  const merchant=useQuery({
    queryKey:["cp-merchant-access",user?.id],
    enabled:role==="merchant"&&Boolean(user)&&user.role!=="admin",
    queryFn:()=>base44.entities.Commercant.filter({user_id:user.id,est_actif:true,est_valide:true},"-created_date",1),
    retry:1,
    staleTime:0
  });
  if(isLoadingAuth) return <LocalShell><div className="cp-empty" role="status">Vérification de votre session…</div></LocalShell>;
  if(!user) return <Navigate to={"/Login?next="+encodeURIComponent(location.pathname+location.search)} replace/>;
  if(role==="admin"&&user.role!=="admin") return <LocalShell><div className="cp-container cp-auth-wrap cp-panel"><h1>Accès réservé</h1><p>Cette page est réservée à l’administration.</p><Link className="cp-button cp-button-primary" to="/">Retour à l’accueil</Link></div></LocalShell>;
  if(role==="merchant"&&user.role!=="admin") {
    if(merchant.isPending)return <LocalShell><div className="cp-empty" role="status">Vérification de votre commerce…</div></LocalShell>;
    if(merchant.isError||!merchant.data?.length)return <LocalShell><div className="cp-container cp-auth-wrap cp-panel"><h1>{merchant.isError?"Vérification indisponible":"Votre espace commerçant"}</h1><p>{merchant.isError?"Le statut de votre commerce n’a pas pu être vérifié.":"Un commerce actif et approuvé doit être associé à votre compte pour accéder à cet espace."}</p>{merchant.isError?<button className="cp-button cp-button-primary" disabled={merchant.isFetching} onClick={()=>merchant.refetch()}>{merchant.isFetching?"Vérification…":"Réessayer"}</button>:<Link className="cp-button cp-button-primary" to="/InscriptionCommercant">Ma demande de référencement</Link>}<div className="cp-inline-actions"><Link to="/">Retour aux commerces</Link></div></div></LocalShell>;
  }
  return <Outlet/>;
}