import {useEffect} from "react";
import {MapContainer,TileLayer,CircleMarker,Popup,useMap,Circle} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {Link} from "react-router-dom";
import {validCoordinates,formatDist} from "@/lib/local-discovery";
function Viewport({items,point}) {
  const map=useMap();
  useEffect(()=>{
    if(point) map.setView([point.lat,point.lon],13);
    else if(items.length) map.fitBounds(items.map(i=>[i.latitude,i.longitude]),{padding:[35,35],maxZoom:14});
    else map.setView([46.6,2.4],5);
    const resize=new ResizeObserver(()=>map.invalidateSize());resize.observe(map.getContainer());
    return ()=>resize.disconnect();
  },[map,items,point]);
  return null;
}
export default function LocalMap({items,mode,point,radius}) {
  const located=items.filter(i=>validCoordinates(i.latitude,i.longitude));
  return <div className="cp-map-section"><MapContainer center={[46.6,2.4]} zoom={5} scrollWheelZoom={false} className="cp-map" aria-label="Carte des résultats"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/><Viewport items={located} point={point}/>
    {located.map(item=><CircleMarker key={item.id} center={[item.latitude,item.longitude]} radius={10} pathOptions={{color:"#fff",weight:3,fillColor:"#6634dc",fillOpacity:1}}><Popup><strong>{item.nom||item.titre}</strong><p>{item.ville}{item._distance!=null?" · "+formatDist(item._distance):""}</p><Link to={(mode==="merchants"?"/CommercantProfil":"/OffreDetail")+"?id="+encodeURIComponent(item.id)}>Ouvrir la fiche →</Link></Popup></CircleMarker>)}
    {point&&<><Circle center={[point.lat,point.lon]} radius={radius*1000} pathOptions={{color:"#6634dc",weight:1,fillOpacity:.04}}/><CircleMarker center={[point.lat,point.lon]} radius={7} pathOptions={{color:"#fff",fillColor:"#1377bb",fillOpacity:1}}><Popup>{point.label}</Popup></CircleMarker></>}
    </MapContainer><p className="cp-muted">{located.length} point{located.length>1?"s":""} sur la carte.{items.length>located.length?" "+(items.length-located.length)+" fiche(s) sans coordonnées, consultables dans la liste.":""} Déplacez la carte pour explorer.</p></div>;
}
