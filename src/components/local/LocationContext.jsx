import {createContext,useContext,useState,useRef,useEffect} from "react";
import {validCoordinates} from "@/lib/local-discovery";
const Context=createContext(null);
export function LocationProvider({children}) {
  const [point,setPoint]=useState(null);
  const [radius,setRadius]=useState(5);
  const [locating,setLocating]=useState(false);
  const [locationError,setLocationError]=useState("");
  const serial=useRef(0);
  useEffect(()=>()=>{serial.current++;},[]);
  const choosePoint=next=>{serial.current++;setLocating(false);setLocationError("");setPoint(next);};
  const locate=()=>{
    if(locating) return;
    if(!navigator.geolocation) {setLocationError("La localisation n’est pas disponible. Choisissez une ville.");return;}
    if(!window.isSecureContext) {setLocationError("La localisation nécessite une connexion HTTPS. Choisissez une ville.");return;}
    const id=++serial.current;
    setLocating(true);setLocationError("");
    navigator.geolocation.getCurrentPosition(p=>{
      if(id!==serial.current) return;
      setLocating(false);
      if(!validCoordinates(p.coords.latitude,p.coords.longitude)) {setLocationError("Position invalide. Choisissez une ville.");return;}
      setPoint({lat:p.coords.latitude,lon:p.coords.longitude,label:"Ma position",source:"gps",accuracy:p.coords.accuracy});
    },e=>{
      if(id!==serial.current) return;
      setLocating(false);
      setLocationError(e.code===1 ? "Localisation refusée. Vous pouvez rechercher une ville." : e.code===3 ? "La recherche de position a expiré. Réessayez ou choisissez une ville." : "Position indisponible. Choisissez une ville.");
    },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
  };
  return <Context.Provider value={{point,choosePoint,radius,setRadius,locate,locating,locationError}}>{children}</Context.Provider>;
}
export const useLocalLocation=()=>useContext(Context);
