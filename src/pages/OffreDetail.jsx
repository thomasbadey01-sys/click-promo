import {useEffect,useRef,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {Heart,Share2,Copy,MapPin,ArrowLeft,ExternalLink} from "lucide-react";
import {base44} from "@/api/base44Client";
import {useAuth} from "@/lib/AuthContext";
import {directionsUrl,formatDist,haversine,offerAvailable,safeHref,validCoordinates} from "@/lib/local-discovery";
import LocalShell from "@/components/local/LocalShell";
import {CatalogueImage,OfferCard} from "@/components/local/CatalogueCards";
import {useLocalLocation} from "@/components/local/LocationContext";
const money=n=>typeof n==="number"&&Number.isFinite(n)?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n):null;
export default function OffreDetail() {
  const [params]=useSearchParams(),id=params.get("id");
  const {user}=useAuth(),{point}=useLocalLocation(),cache=useQueryClient();
  const [codeVisible,setCodeVisible]=useState(false),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now());
  const recorded=useRef(new Set());
  const query=useQuery({queryKey:["cp-offer",id],enabled:Boolean(id),retry:1,refetchInterval:60000,queryFn:async()=>{
    const offer=await base44.entities.Offre.get(id);
    if(!offer)throw new Error("Offre introuvable.");
    const merchant=offer.commercant_id?await base44.entities.Commercant.get(offer.commercant_id).catch(()=>null):null;
    return {offer,merchant};
  }});
  const fav=useQuery({queryKey:["cp-favorite",user?.id,id],enabled:Boolean(user&&id),queryFn:()=>base44.entities.FavoriUtilisateur.filter({user_id:user.id,offre_id:id})});
  const similar=useQuery({queryKey:["cp-similar",query.data?.offer.categorie],enabled:Boolean(query.data),queryFn:()=>base44.entities.Offre.filter({categorie:query.data.offer.categorie,est_active:true},"-created_date",24)});
  useEffect(()=>{setCodeVisible(false);setMessage("");const timer=setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(timer);},[id]);
  useEffect(()=>{
    const offer=query.data?.offer,key=user?.id+":"+id;
    if(!user||!offer||recorded.current.has(key))return;
    recorded.current.add(key);
    base44.entities.HistoriqueOffresVues.create({user_id:user.id,offre_id:id,offre_titre:offer.titre,commercant_nom:offer.commercant_nom||"",date_vue:new Date().toISOString(),image_url:offer.image_url||"",ville:offer.ville||""}).catch(()=>recorded.current.delete(key));
  },[query.data,id,user]);
  if(!id||query.isError)return <LocalShell><section className="cp-container cp-empty" role="alert"><h1>Cette offre est introuvable.</h1><p>Elle a peut-être été retirée par le commerçant.</p><Link className="cp-button cp-button-primary" to="/Feed">Découvrir les offres</Link></section></LocalShell>;
  if(query.isPending)return <LocalShell><div className="cp-container cp-empty" role="status">Chargement de l’offre…</div></LocalShell>;
  const {offer,merchant}=query.data;
  const merchantVisible=!offer.commercant_id||Boolean(merchant?.est_actif&&(merchant.est_valide||merchant.est_verifie));
  const available=offerAvailable(offer,now)&&merchantVisible;
  const location=validCoordinates(offer.latitude,offer.longitude)?offer:merchant||offer;
  const distance=point?haversine(point.lat,point.lon,location.latitude,location.longitude):null;
  const direction=directionsUrl(location);
  const photos=[...new Set([offer.image_url,...(offer.image_urls||[])].map(safeHref).filter(Boolean))].slice(0,8);
  const favourite=Boolean(fav.data?.length);
  const toggleFavorite=async()=>{
    if(!user){base44.auth.redirectToLogin(window.location.href);return;}
    setBusy(true);setMessage("");
    try{
      if(favourite)await Promise.all(fav.data.map(f=>base44.entities.FavoriUtilisateur.delete(f.id)));
      else await base44.entities.FavoriUtilisateur.create({user_id:user.id,offre_id:id});
      await cache.invalidateQueries({queryKey:["cp-favorite",user.id,id]});
      await cache.invalidateQueries({queryKey:["cp-favorites",user.id]});
      setMessage(favourite?"Offre retirée des favoris.":"Offre ajoutée aux favoris.");
    }catch{setMessage("Les favoris n’ont pas pu être enregistrés. Réessayez.");}finally{setBusy(false);}
  };
  const copy=async value=>{try{await navigator.clipboard.writeText(value);setMessage("Copié dans le presse-papiers.");}catch{setMessage("La copie automatique n’est pas disponible. Sélectionnez et copiez le texte.");}};
  const share=async()=>{if(!navigator.share){await copy(window.location.href);return;}try{await navigator.share({title:offer.titre,url:window.location.href});}catch(e){if(e.name!=="AbortError")setMessage("Le partage n’est pas disponible sur cet appareil.");}};
  return <LocalShell><section className="cp-container cp-detail">
    <Link className="cp-view-link" to="/Feed"><ArrowLeft size={17}/>Toutes les offres</Link>
    <div className="cp-detail-heading"><div><span className="cp-eyebrow">{offer.categorie}</span><h1>{offer.titre}</h1>{merchant?<Link className="cp-text-link" to={"/CommercantProfil?id="+encodeURIComponent(merchant.id)}>{merchant.nom}</Link>:<p>{offer.commercant_nom}</p>}</div>
    <div className="cp-detail-actions"><button className="cp-button cp-button-light" onClick={toggleFavorite} disabled={busy||fav.isFetching} aria-pressed={favourite}><Heart size={18} fill={favourite?"currentColor":"none"}/>{favourite?"En favoris":"Ajouter aux favoris"}</button><button className="cp-button cp-button-light" onClick={share}><Share2 size={18}/>Partager</button></div></div>
    <div className="cp-detail-grid"><div>
      {photos.length?<div className="cp-photo-gallery">{photos.map((src,i)=><img key={src} src={src} alt={offer.titre+" — photo "+(i+1)} loading={i?"lazy":"eager"}/>)}</div>:<CatalogueImage item={offer} title={offer.titre}/>}
      {offer.description&&<section className="cp-panel"><h2>Une belle occasion de découvrir</h2><p className="cp-preserve-lines">{offer.description}</p></section>}
      {offer.conditions&&<section className="cp-panel"><h2>Les conditions de l’offre</h2><p className="cp-preserve-lines">{offer.conditions}</p></section>}
    </div><aside className="cp-panel cp-offer-summary">
      <span className={"cp-status "+(available?"ok":"")}>{available?"Offre disponible":"Offre indisponible"}</span>
      <div className="cp-detail-price">{money(offer.prix_promo)?<strong>{money(offer.prix_promo)}</strong>:<strong>Prix à consulter sur place</strong>}{offer.prix_original>offer.prix_promo&&money(offer.prix_promo)&&<del>{money(offer.prix_original)}</del>}</div>
      {offer.valeur_reduction>0&&<p className="cp-text-link">−{offer.valeur_reduction}{offer.type_reduction==="pourcentage"?" %":" €"}</p>}
      {offer.date_debut&&<p>À partir du {new Date(offer.date_debut).toLocaleDateString("fr-FR")}</p>}
      {offer.date_fin&&<p>Valable jusqu’au {new Date(offer.date_fin).toLocaleString("fr-FR")}</p>}
      {offer.source_url&&<div className="cp-proof"><strong>Source officielle vérifiée</strong>{offer.date_verification&&<small>Contrôlée le {new Date(offer.date_verification).toLocaleDateString("fr-FR")}</small>}<a href={safeHref(offer.source_url)} target="_blank" rel="noopener noreferrer">Consulter la source <ExternalLink size={14}/></a></div>}
      {typeof offer.stock_restant==="number"&&<p>{offer.stock_restant} disponible{offer.stock_restant>1?"s":""}</p>}
      {available?offer.code_promo?<div>{!codeVisible?<button className="cp-button cp-button-primary" onClick={()=>setCodeVisible(true)}>Afficher le code promo</button>:<div className="cp-code-box"><span>Votre code à présenter en magasin</span><strong>{offer.code_promo}</strong><button className="cp-button cp-button-light" onClick={()=>copy(offer.code_promo)}><Copy size={16}/>Copier le code</button></div>}<p className="cp-muted">Présentez cette offre au commerçant et consultez ses conditions d’utilisation.</p></div>:<p>Présentez cette fiche au commerçant. Aucun code n’est renseigné pour cette offre.</p>:<p>Cette offre n’est pas utilisable actuellement. Consultez les autres offres du commerce.</p>}
      <hr/><h2><MapPin size={18}/> Rendez-vous sur place</h2><p>{location.adresse}<br/>{location.ville}</p>{distance!==null&&<p className="cp-muted">{formatDist(distance)} à vol d’oiseau depuis {point.source==="gps"?"votre position":point.label}</p>}{direction&&<a className="cp-button cp-button-light" href={direction} target="_blank" rel="noopener noreferrer">Voir l’itinéraire <ExternalLink size={15}/></a>}
    </aside></div>
    <p role="status" className="cp-feedback">{message}</p>
    {similar.data?.some(o=>o.id!==id&&offerAvailable(o,now))&&<section className="cp-detail-related"><h2>D’autres bons plans à découvrir</h2><div className="cp-grid">{similar.data.filter(o=>o.id!==id&&offerAvailable(o,now)).slice(0,3).map(o=><OfferCard key={o.id} item={o}/>)}</div></section>}
  </section></LocalShell>;
}