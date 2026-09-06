import {useState,useRef,useEffect} from "react";
import {MapPin,LocateFixed,X} from "lucide-react";
import {useLocalLocation} from "./LocationContext";
import {searchPlaces} from "@/lib/local-discovery";
export default function LocationControls() {
  const {point,choosePoint,radius,setRadius,locate,locating,locationError}=useLocalLocation();
  const [query,setQuery]=useState("");const [places,setPlaces]=useState([]);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const request=useRef(null);
  useEffect(()=>()=>request.current?.abort(),[]);
  useEffect(()=>{request.current?.abort();setBusy(false);setPlaces([]);setError("");setQuery(point?.source==="search"?point.label:"");},[point]);
  const search=async e=>{
    e.preventDefault();request.current?.abort();const controller=new AbortController();request.current=controller;
    if(query.trim().length<2) {setError("Saisissez au moins deux caractères.");return;}
    setBusy(true);setError("");setPlaces([]);
    try {const list=await searchPlaces(query.trim(),controller.signal);if(controller.signal.aborted)return;setPlaces(list);if(!list.length)setError("Aucun lieu trouvé. Essayez une ville ou un code postal.");}
    catch(e){if(!controller.signal.aborted)setError(e.message);}
    finally {if(!controller.signal.aborted)setBusy(false);}
  };
  return <div className="cp-location-block"><div className="cp-location-row">
    <form onSubmit={search} className="cp-place-form" aria-label="Choisir un lieu"><MapPin size={18}/><label className="cp-sr" htmlFor="cp-place">Ville ou adresse</label><input id="cp-place" value={query} onChange={e=>{setQuery(e.target.value);setPlaces([]);request.current?.abort();setBusy(false);}} placeholder={point?.label||"Ville ou code postal"} autoComplete="off"/><button type="submit" disabled={busy}>{busy?"Recherche…":"Choisir"}</button></form>
    <button className="cp-button cp-button-light" onClick={locate} disabled={locating}><LocateFixed size={17}/>{locating?"Localisation…":"Autour de moi"}</button>
    <label className="cp-radius">Rayon <select value={radius} disabled={!point} onChange={e=>setRadius(Number(e.target.value))}>{[1,2,5,10,25,50,100,200].map(n=><option key={n} value={n}>{n} km</option>)}</select></label>
    {point&&<button className="cp-location-chip" onClick={()=>{choosePoint(null);setQuery("");setPlaces([]);}} aria-label="Effacer le lieu sélectionné">{point.label}<X size={15}/></button>}
  </div>
  {places.length>0&&<ul className="cp-place-results" aria-label="Adresses proposées">{places.map((p,i)=><li key={i}><button onClick={()=>{choosePoint({...p,source:"search"});setQuery(p.label);setPlaces([]);}}><MapPin size={17}/>{p.label}</button></li>)}</ul>}
  {(locationError||error)&&<p className="cp-error" role="alert">{locationError||error}</p>}
  {point?.source==="gps"&&point.accuracy>1000&&<p className="cp-muted" role="status">Position approximative (± {Math.round(point.accuracy/1000)} km). Choisissez une adresse pour affiner les résultats.</p>}
  </div>;
}