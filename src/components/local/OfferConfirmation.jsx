import {useQuery,useQueryClient} from "@tanstack/react-query";
import {CheckCircle2,XCircle} from "lucide-react";
import {offerConfirmation} from "@/functions/offerConfirmation";
import {base44} from "@/api/base44Client";
import {useAuth} from "@/lib/AuthContext";

export default function OfferConfirmation({offerId}){
  const {user}=useAuth(),cache=useQueryClient(),key=["cp-confirmations",offerId];
  const query=useQuery({queryKey:key,enabled:Boolean(user),queryFn:async()=>{const r=await offerConfirmation({offer_id:offerId,action:"get"});return r.data;}});
  const confirm=async statut=>{if(!user){base44.auth.redirectToLogin(window.location.href);return;}await offerConfirmation({offer_id:offerId,action:"confirm",statut});await cache.invalidateQueries({queryKey:key});};
  if(!user)return <div className="cp-confirm"><strong>Cette offre est-elle toujours disponible ?</strong><button className="cp-text-link" onClick={()=>base44.auth.redirectToLogin(window.location.href)}>Connectez-vous pour confirmer</button></div>;
  const data=query.data||{};
  return <div className="cp-confirm"><strong>Disponibilité confirmée par la communauté</strong><p>{data.disponible||0} disponible · {data.terminee||0} terminée</p><div><button className={data.mon_statut==="disponible"?"selected":""} onClick={()=>confirm("disponible")}><CheckCircle2 size={16}/>Encore disponible</button><button className={data.mon_statut==="terminee"?"selected danger":"danger"} onClick={()=>confirm("terminee")}><XCircle size={16}/>Offre terminée</button></div></div>;
}