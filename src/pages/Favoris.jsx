import {useMemo,useState} from "react";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {Heart,Trash2} from "lucide-react";
import {base44} from "@/api/base44Client";
import {useAuth} from "@/lib/AuthContext";
import {CATEGORIES,offerAvailable} from "@/lib/local-discovery";
import LocalShell from "@/components/local/LocalShell";
import {OfferCard} from "@/components/local/CatalogueCards";

export default function Favoris(){
  const {user}=useAuth(),cache=useQueryClient(),[category,setCategory]=useState("");
  const query=useQuery({queryKey:["cp-favorites",user?.id],enabled:Boolean(user),queryFn:async()=>{
    const favs=await base44.entities.FavoriUtilisateur.filter({user_id:user.id});
    const offers=await Promise.all(favs.map(async f=>{const offer=await base44.entities.Offre.get(f.offre_id).catch(()=>null);return offer?{...offer,_favoriteId:f.id}:null;}));
    return offers.filter(Boolean);
  }});
  const visible=useMemo(()=>(query.data||[]).filter(o=>offerAvailable(o)&&(!category||o.categorie===category)),[query.data,category]);
  const remove=async item=>{await base44.entities.FavoriUtilisateur.delete(item._favoriteId);await cache.invalidateQueries({queryKey:["cp-favorites",user.id]});};
  return <LocalShell><section className="cp-container cp-workspace"><div className="cp-page-title"><span className="cp-eyebrow"><Heart size={16}/>MES FAVORIS</span><h1>Les offres que vous voulez garder.</h1><p>Retrouvez ici uniquement les offres encore disponibles.</p></div>
    <div className="cp-category-list" aria-label="Filtrer les favoris"><button className={!category?"selected":""} onClick={()=>setCategory("")}>Tout</button>{CATEGORIES.map(c=><button key={c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    {query.isPending?<div className="cp-empty">Chargement de vos favoris…</div>:query.isError?<div className="cp-empty"><h2>Vos favoris sont indisponibles.</h2><button className="cp-button cp-button-light" onClick={()=>query.refetch()}>Réessayer</button></div>:!visible.length?<div className="cp-empty"><Heart size={34}/><h2>Aucune offre favorite disponible.</h2><p>Ajoutez une offre depuis sa fiche pour la retrouver ici.</p><a className="cp-button cp-button-primary" href="/Feed">Découvrir les offres</a></div>:<div className="cp-grid">{visible.map(item=><div className="cp-favorite" key={item.id}><OfferCard item={item}/><button className="cp-favorite-remove" onClick={()=>remove(item)} aria-label={"Retirer "+item.titre+" des favoris"}><Trash2 size={16}/>Retirer</button></div>)}</div>}
  </section></LocalShell>;
}