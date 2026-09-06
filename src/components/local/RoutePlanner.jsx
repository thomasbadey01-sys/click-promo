import {useEffect,useState} from "react";
import {MapPinned,Navigation} from "lucide-react";
import {haversine,validCoordinates} from "@/lib/local-discovery";

export default function RoutePlanner({offers}){
  const eligible=offers.filter(o=>validCoordinates(o.latitude,o.longitude)).slice(0,8),[selected,setSelected]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>setSelected(eligible.map(o=>o.id)),[offers]);
  if(eligible.length<2)return null;
  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const start=()=>{if(selected.length<2){setError("Choisissez au moins deux offres.");return;}setBusy(true);setError("");navigator.geolocation.getCurrentPosition(({coords})=>{const ordered=[],remaining=eligible.filter(o=>selected.includes(o.id));let point={latitude:coords.latitude,longitude:coords.longitude};while(remaining.length){remaining.sort((a,b)=>haversine(point.latitude,point.longitude,a.latitude,a.longitude)-haversine(point.latitude,point.longitude,b.latitude,b.longitude));point=remaining.shift();ordered.push(point);}const last=ordered.at(-1),waypoints=ordered.slice(0,-1).map(o=>o.latitude+","+o.longitude).join("|");const url="https://www.google.com/maps/dir/?api=1&origin="+coords.latitude+","+coords.longitude+"&destination="+last.latitude+","+last.longitude+(waypoints?"&waypoints="+encodeURIComponent(waypoints):"");window.open(url,"_blank","noopener,noreferrer");setBusy(false);},()=>{setError("Autorisez la position pour créer l’itinéraire.");setBusy(false);},{enableHighAccuracy:true,timeout:10000});};
  return <section className="cp-panel cp-route"><h2><MapPinned size={20}/>Mon parcours bons plans</h2><p>Sélectionnez vos arrêts ; l’ordre est optimisé depuis votre position actuelle.</p><div>{eligible.map(o=><label key={o.id}><input type="checkbox" checked={selected.includes(o.id)} onChange={()=>toggle(o.id)}/><span>{o.titre}</span></label>)}</div>{error&&<p className="cp-error">{error}</p>}<button className="cp-button cp-button-primary" onClick={start} disabled={busy}><Navigation size={17}/>{busy?"Localisation…":"Créer mon itinéraire"}</button></section>;
}