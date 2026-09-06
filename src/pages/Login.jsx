import {useState} from "react";
import {Link,useSearchParams,Navigate} from "react-router-dom";
import {ArrowRight,UserRound,Store,ShieldCheck} from "lucide-react";
import {base44} from "@/api/base44Client";
import {useAuth} from "@/lib/AuthContext";
import LocalShell from "@/components/local/LocalShell";
const ROUTES={client:"/Profil",merchant:"/Dashboard",admin:"/Admin"};
export function safeNext(value) {
  if(!value||!value.startsWith("/")||value.startsWith("//")||value.includes("\\"))return null;
  try {const u=new URL(value,window.location.origin);return u.origin===window.location.origin&&u.pathname.toLowerCase()!=="/login"?u.pathname+u.search:null;}catch{return null;}
}
export default function Login() {
  const [params]=useSearchParams();const next=safeNext(params.get("next"));
  const [space,setSpace]=useState(next?.startsWith("/Admin")?"admin":next?.startsWith("/Dashboard")||next?.startsWith("/InscriptionCommercant")?"merchant":"client");
  const [error,setError]=useState("");const {user}=useAuth();
  const initialSpace=next?.startsWith("/Admin")?"admin":next?.startsWith("/Dashboard")||next?.startsWith("/InscriptionCommercant")?"merchant":"client";
  const destination=(space===initialSpace&&next)||ROUTES[space];
  if(user)return <Navigate to={destination} replace/>;
  const connect=()=>{setError("");try{base44.auth.redirectToLogin(new URL(destination,window.location.origin).href);}catch{setError("La connexion est indisponible. Réessayez dans un instant.");}};
  return <LocalShell><div className="cp-container"><section className="cp-auth-wrap cp-panel"><span className="cp-eyebrow">BIENVENUE CHEZ CLICK & PROMO</span><h1>Le bon compte.<br/>Le bon espace.</h1><p>Connectez-vous ou créez votre compte pour retrouver vos favoris et votre espace.</p><div className="cp-auth-options" aria-label="Choisir son espace">{[[UserRound,"client","Client"],[Store,"merchant","Commerçant"],[ShieldCheck,"admin","Administration"]].map(([Icon,id,label])=><button key={id} className={space===id?"selected":""} aria-pressed={space===id} onClick={()=>setSpace(id)}><Icon size={16} style={{verticalAlign:"middle",marginRight:6}}/>{label}</button>)}</div><p>{space==="merchant"?"Votre espace s’ouvre après validation du référencement de votre commerce.":space==="admin"?"L’accès dépend des droits attribués à votre compte.":"Vos bonnes adresses et vos offres favorites, au même endroit."}</p>{error&&<p className="cp-error" role="alert">{error}</p>}<button onClick={connect} className="cp-button cp-button-primary" style={{width:"100%"}}>Continuer avec mon compte <ArrowRight size={18}/></button><p className="cp-muted" style={{marginTop:15}}>Connexion, inscription et récupération du mot de passe sont disponibles à l’étape suivante.</p><Link className="cp-text-link" to="/">Continuer à découvrir les commerces →</Link></section></div></LocalShell>;
}
