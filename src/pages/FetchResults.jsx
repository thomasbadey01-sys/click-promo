import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {RefreshCw,Search,ShieldCheck} from "lucide-react";
import {base44} from "@/api/base44Client";
import {CATEGORIES,offerAvailable,readAll,validCoordinates} from "@/lib/local-discovery";
import LocalShell from "@/components/local/LocalShell";
import {OfferCard} from "@/components/local/CatalogueCards";

export default function FetchResults(){
  const [search,setSearch]=useState(""),[category,setCategory]=useState(""),[verified,setVerified]=useState(true);
  const query=useQuery({queryKey:["cp-admin-sourced-offers"],queryFn:()=>readAll(base44.entities.Offre),retry:1});
  const offers=(query.data||[]).filter(o=>offerAvailable(o)&&(!verified||Boolean(o.source_url&&o.date_verification&&validCoordinates(o.latitude,o.longitude)))&&(!category||o.categorie===category)&&(!search||[o.titre,o.commercant_nom,o.ville].some(v=>v?.toLowerCase().includes(search.toLowerCase()))));
  return <LocalShell><section className="cp-container cp-workspace"><div className="cp-page-title"><span className="cp-eyebrow"><ShieldCheck size={16}/>CONTRÔLE DES SOURCES</span><h1>Des offres qui peuvent être vérifiées.</h1><p>Ce tableau présente les offres actives et permet de distinguer celles qui disposent d’une source, d’un horodatage et de coordonnées.</p></div><div className="cp-search-bar"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Offre, commerce ou ville…"/><button className="cp-icon-button" onClick={()=>query.refetch()} aria-label="Actualiser"><RefreshCw size={18}/></button></div><div className="cp-category-list"><button className={verified?"selected":""} onClick={()=>setVerified(v=>!v)}>Sources complètes</button><button className={!category?"selected":""} onClick={()=>setCategory("")}>Toutes</button>{CATEGORIES.map(c=><button key={c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>{query.isPending?<div className="cp-empty">Chargement du contrôle…</div>:query.isError?<div className="cp-empty">Le contrôle n’a pas pu charger les offres.</div>:offers.length?<div className="cp-grid">{offers.map(o=><OfferCard item={o} key={o.id}/>)}</div>:<div className="cp-empty"><h2>Aucune offre ne correspond à ces critères.</h2></div>}</section></LocalShell>;
}