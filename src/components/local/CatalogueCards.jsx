import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowUpRight,MapPin,Store,Tag} from "lucide-react";
import {formatDist,safeHref} from "@/lib/local-discovery";
import TrustBadge from "@/components/local/TrustBadge";
export const CATEGORY_IMAGES={
  "Restaurant":"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  "Boutique":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "Beauté & Coiffure":"https://images.unsplash.com/photo-1560066984-138daaa0e9cd?auto=format&fit=crop&w=800&q=80",
  "Épicerie":"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  "Fitness & Sport":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
};
export function CatalogueImage({item,title}) {
  const [failed,setFailed]=useState(false);
  const actual=safeHref(item.image_url);const src=actual||CATEGORY_IMAGES[item.categorie];
  return <div className={"cp-card-image cp-image-"+(item.categorie==="Restaurant"?"warm":"cool")}>
    {src&&!failed?<img src={src} alt={actual?title:""} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<Store size={48} aria-hidden="true"/>}
    {!actual&&src&&!failed&&<span className="cp-illustration">Photo d’ambiance</span>}
  </div>;
}
export function MerchantCard({item,offerCount=0}) {
  return <article className="cp-catalogue-card"><Link to={"/CommercantProfil?id="+encodeURIComponent(item.id)}>
    <div className="cp-card-cover"><CatalogueImage item={item} title={item.nom}/><span className="cp-category-badge">{item.categorie||"Commerce local"}</span>{offerCount>0&&<span className="cp-offer-badge">{offerCount} offre{offerCount>1?"s":""}</span>}</div>
    <div className="cp-card-body"><div className="cp-card-title"><h3>{item.nom}</h3><ArrowUpRight size={20}/></div><p className="cp-card-location"><MapPin size={14}/>{item.ville||"Ville non renseignée"}{item._distance!=null&&<span>· {formatDist(item._distance)}</span>}</p><p className="cp-card-description">{item.description||"Découvrez ce commerce et les informations de sa fiche."}</p><span className="cp-text-link">Découvrir le commerce <span aria-hidden="true">→</span></span></div></Link></article>;
}
export function OfferCard({item}) {
  const price=typeof item.prix_promo==="number"&&item.prix_promo>=0?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(item.prix_promo):null;
  return <article className="cp-catalogue-card"><Link to={"/OffreDetail?id="+encodeURIComponent(item.id)}>
    <div className="cp-card-cover"><CatalogueImage item={item} title={item.titre}/>{item.valeur_reduction>0&&<span className="cp-offer-badge"><Tag size={13}/> −{item.valeur_reduction}{item.type_reduction==="pourcentage"?"%":" €"}</span>}{item.est_urgente&&<span className="cp-category-badge">Offre flash</span>}</div>
    <div className="cp-card-body"><span className="cp-eyebrow">{item.commercant_nom||item.categorie}</span><TrustBadge item={item}/><div className="cp-card-title"><h3>{item.titre}</h3><ArrowUpRight size={20}/></div><p className="cp-card-location"><MapPin size={14}/>{item.ville||"Ville non renseignée"}{item._distance!=null&&<span>· {formatDist(item._distance)}</span>}</p><div className="cp-price">{price&&<strong>{price}</strong>}{price&&item.prix_original>item.prix_promo&&<del>{item.prix_original.toLocaleString("fr-FR")} €</del>}{item.date_fin&&<small>Jusqu’au {new Date(item.date_fin).toLocaleDateString("fr-FR")}</small>}</div>{item.source_url&&<p className="cp-source-label">Source vérifiée · {item.source_nom||"Enseigne"}</p>}</div></Link></article>;
}