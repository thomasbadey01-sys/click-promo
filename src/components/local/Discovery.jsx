import {useState,useMemo,lazy,Suspense} from "react";
import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {Search,Store,Utensils,Scissors,ShoppingBag,Dumbbell,ShoppingBasket,SlidersHorizontal,Map as MapIcon,LayoutGrid,RefreshCw} from "lucide-react";
import {base44} from "@/api/base44Client";
import {CATEGORIES,readAll,offerAvailable,filterLocal,validCoordinates} from "@/lib/local-discovery";
import LocalShell from "./LocalShell";
import LocationControls from "./LocationControls";
import {useLocalLocation} from "./LocationContext";
import {MerchantCard,OfferCard} from "./CatalogueCards";
import HomeIntro from "@/components/local/HomeIntro";
import HomeMerchantInvite from "@/components/local/HomeMerchantInvite";
import "@/components/local/home.css";
const LocalMap=lazy(()=>import("./LocalMap"));
const ICONS={"Restaurant":Utensils,"Boutique":ShoppingBag,"Beauté & Coiffure":Scissors,"Fitness & Sport":Dumbbell,"Épicerie":ShoppingBasket};
export default function Discovery({initialMode="merchants",mapMode=false}) {
  const [mode,setMode]=useState(initialMode);const [search,setSearch]=useState("");const [category,setCategory]=useState("");const [flash,setFlash]=useState(false);const [shown,setShown]=useState(12);
  const {point,radius,choosePoint,setRadius}=useLocalLocation();
  const catalogue=useQuery({queryKey:["cp-catalogue-v4"],queryFn:async()=>{const [merchants,offers]=await Promise.all([readAll(base44.entities.Commercant),readAll(base44.entities.Offre,{est_active:true})]);return {merchants:merchants.filter(m=>m.est_actif===true&&(m.est_valide===true||m.est_verifie===true)),offers};},staleTime:60000,retry:1});
  const merchants=catalogue.data?.merchants||[];
  const offers=useMemo(()=>(catalogue.data?.offers||[]).filter(o=>offerAvailable(o)),[catalogue.data,catalogue.dataUpdatedAt]);
  const activeOffers=offers.filter(o=>!o.commercant_id || merchants.some(m=>m.id===o.commercant_id));
  const linkedOffers=activeOffers.map(o=>{const m=merchants.find(m=>m.id===o.commercant_id);return m&&!validCoordinates(o.latitude,o.longitude)&&validCoordinates(m.latitude,m.longitude)?{...o,latitude:m.latitude,longitude:m.longitude}:o;});
  const filtered=filterLocal(mode==="merchants"?merchants:linkedOffers,{search,category,point,radius,flash:mode==="offers"&&flash});
  const counts=activeOffers.reduce((a,o)=>{if(o.commercant_id)a[o.commercant_id]=(a[o.commercant_id]||0)+1;return a;},{});
  const changeMode=m=>{setMode(m);setShown(12);};
  const home=initialMode==="merchants"&&!mapMode;
  return <LocalShell className={home?"cp-home":""}>
    {home&&<HomeIntro/>}
    <section className="cp-container cp-discovery" id="catalogue"><div className="cp-section-heading"><div><span className="cp-eyebrow">{mapMode?"EXPLORER LA CARTE":home?"LE CARNET D’ADRESSES":"LES BONS PLANS LOCAUX"}</span><h2>{mapMode?"Trouvez votre prochain arrêt.":home?"Les adresses à découvrir.":"Une bonne occasion de sortir."}</h2></div><Link className="cp-view-link" to={mapMode?"/":"/Carte"}>{mapMode?<LayoutGrid size={17}/>:<MapIcon size={17}/>} {mapMode?"Voir la liste":"Voir la carte"}</Link></div>
      <div className="cp-search-bar"><Search size={21}/><label className="cp-sr" htmlFor="cp-search">Rechercher un commerce ou une offre</label><input id="cp-search" placeholder="Un commerce, une envie, un quartier…" value={search} onChange={e=>{setSearch(e.target.value);setShown(12);}}/><SlidersHorizontal size={19} aria-hidden="true"/></div>
      <LocationControls/>
      <div className="cp-category-list" aria-label="Catégories"><button onClick={()=>{setCategory("");setShown(12);}} aria-pressed={!category} className={!category?"selected":""}><Store size={18}/>Tout découvrir</button>{CATEGORIES.map(c=>{const Icon=ICONS[c]||ShoppingBag;return <button key={c} onClick={()=>{setCategory(c===category?"":c);setShown(12);}} aria-pressed={category===c} className={category===c?"selected":""}><Icon size={18}/>{c}</button>;})}</div>
      <div className="cp-results-heading"><div className="cp-segment" aria-label="Type de résultat"><button className={mode==="merchants"?"selected":""} aria-pressed={mode==="merchants"} onClick={()=>changeMode("merchants")}>Commerces</button><button className={mode==="offers"?"selected":""} aria-pressed={mode==="offers"} onClick={()=>changeMode("offers")}>Offres du moment</button></div><div className="cp-results-tools">{mode==="offers"&&<label className="cp-check"><input type="checkbox" checked={flash} onChange={e=>setFlash(e.target.checked)}/>Offres flash</label>}<span className="cp-muted" role="status">{catalogue.isPending?"Chargement…":catalogue.isError?"":filtered.length+" résultat"+(filtered.length>1?"s":"")}</span></div></div>
      {catalogue.isError?<div className="cp-empty" role="alert"><h3>Le catalogue n’a pas pu se charger.</h3><p>Vérifiez votre connexion puis réessayez.</p><button className="cp-button cp-button-primary" onClick={()=>catalogue.refetch()}><RefreshCw size={17}/>Réessayer</button></div>:catalogue.isPending?<div className="cp-grid" aria-label="Chargement du catalogue" aria-busy="true">{[1,2,3,4,5,6].map(i=><div key={i} className="cp-skeleton"/>)}</div>:<>
        {point&&<p className="cp-muted cp-distance-note">Distances à vol d’oiseau depuis {point.source==="gps"?"votre position":point.label}. Les fiches sans coordonnées sont accessibles en effaçant le lieu.</p>}
        {mapMode&&<Suspense fallback={<div className="cp-skeleton cp-map-loading">Chargement de la carte…</div>}><LocalMap items={filtered} mode={mode} point={point} radius={radius}/></Suspense>}
        {!filtered.length?<div className="cp-empty"><Store size={34}/><h3>{mode==="offers"?"Pas d’offre disponible pour cette recherche.":"Aucun commerce ne correspond à ces filtres."}</h3><p>Élargissez le rayon ou explorez une autre catégorie.</p><button className="cp-button cp-button-light" onClick={()=>{setCategory("");setSearch("");setFlash(false);choosePoint(null);setRadius(5);setShown(12);}}>Effacer les filtres</button></div>:<><div className="cp-grid">{filtered.slice(0,shown).map(item=>mode==="merchants"?<MerchantCard key={item.id} item={item} offerCount={counts[item.id]||0}/>:<OfferCard key={item.id} item={item}/>)}</div>{shown<filtered.length&&<div className="cp-load-more"><button className="cp-button cp-button-light" onClick={()=>setShown(n=>n+12)}>Voir plus de {mode==="merchants"?"commerces":"bons plans"}</button></div>}</>}
      </>}
    </section>
    {home&&<HomeMerchantInvite/>}
  </LocalShell>;
}