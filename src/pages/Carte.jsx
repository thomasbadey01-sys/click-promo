import { useState, useEffect, useRef } from "react";
import { Offre, Commercant } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./Feed";
import { DS, Ic, CPLogo } from "./Home";
import { haversine, formatDist } from "./Feed";

const CAT_COLORS = {
  "Restaurant":"#E53E3E","Boutique":"#7C3AED","Beauté & Coiffure":"#D53F8C",
  "Fitness & Sport":"#00B37E","Services":"#2563EB","Épicerie":"#D97706",
  "Pharmacie":"#0369A1","Autre":DS.ink60
};

// Fonction pour vérifier si commerce est ouvert maintenant
function isOpenNow(commerceId) {
  // TODO: cette fonction suppose qu'on a les horaires du commerce chargés
  // Pour l'instant : si horaires_lun/mar/mer/etc existe, on check
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=dim, 1=lun, ...
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute; // en minutes
  
  // Pour la démo, on considère que tous les commerces sont ouverts 9h-19h
  return currentTime >= 9 * 60 && currentTime < 19 * 60;
}

export default function Carte() {
  const navigate = useNavigate();
  const mapRef = useRef(null); const leafletMap = useRef(null);
  const markersRef = useRef([]); const userMarkerRef = useRef(null);
  const [offres, setOffres] = useState([]); const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true); const [userPos, setUserPos] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false); const [mapReady, setMapReady] = useState(false);
  const [rayon, setRayon] = useState(5); const [catFilter, setCatFilter] = useState("Tout");
  const [openOnly, setOpenOnly] = useState(false); // NEW: filtre "ouvert maintenant"

  useEffect(() => { Offre.list().then(d => { setOffres(d.filter(o => o.est_active && o.latitude && o.longitude)); setLoading(false); }); }, []);

  useEffect(() => {
    if (mapReady) return;
    const css = document.createElement("link"); css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    const s = document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=()=>setMapReady(true); document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center:[48.8566,2.3522], zoom:13, zoomControl:false });
    L.control.zoom({ position:"bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution:"© OSM © CARTO", maxZoom:19 }).addTo(map);
    leafletMap.current = map;
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const L = window.L; const map = leafletMap.current;
    markersRef.current.forEach(m => map.removeLayer(m)); markersRef.current = [];
    
    const filtered = offres.filter(o => {
      if (catFilter!=="Tout" && o.categorie!==catFilter) return false;
      if (userPos) {
        const dist = haversine(userPos.lat,userPos.lng,o.latitude,o.longitude);
        if (dist > rayon) return false;
      }
      if (openOnly && !isOpenNow(o.id)) return false; // NEW: filtre ouvert
      return true;
    });
    
    filtered.forEach(o => {
      const col = CAT_COLORS[o.categorie] || DS.brand;
      const icon = L.divIcon({
        html:`<div style="background:${col};color:#fff;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 4px 12px ${col}55;border:2px solid #fff;font-family:Inter,-apple-system,sans-serif;${o.est_urgente?"outline:2px solid "+col+";outline-offset:2px;":""}">${o.est_urgente?"⚡ ":""}-${o.valeur_reduction}${o.type_reduction==="pourcentage"?"%":"€"}</div><div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${col};margin:0 auto;"></div>`,
        className:"", iconAnchor:[34,34]
      });
      const m = L.marker([o.latitude,o.longitude],{icon}).addTo(map).on("click",()=>{setSelected(o);map.panTo([o.latitude,o.longitude]);});
      markersRef.current.push(m);
    });
    
    if (userPos) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const ui = L.divIcon({ html:`<div style="width:14px;height:14px;background:#3B82F6;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 8px rgba(59,130,246,.15);"></div>`, className:"", iconAnchor:[7,7] });
      userMarkerRef.current = L.marker([userPos.lat,userPos.lng],{icon:ui}).addTo(map);
      map.setView([userPos.lat,userPos.lng],14);
    }
  }, [offres,userPos,mapReady,rayon,catFilter,openOnly]);

  const locate = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(p=>{setUserPos({lat:p.coords.latitude,lng:p.coords.longitude});setGeoLoading(false);},()=>setGeoLoading(false),{enableHighAccuracy:true,timeout:10000});
  };

  const nearby = offres.filter(o=>{
    if(catFilter!=="Tout"&&o.categorie!==catFilter)return false;
    if(openOnly && !isOpenNow(o.id))return false;
    if(userPos)return haversine(userPos.lat,userPos.lng,o.latitude,o.longitude)<=rayon;
    return true;
  }).sort((a,b)=>userPos?haversine(userPos.lat,userPos.lng,a.latitude,a.longitude)-haversine(userPos.lat,userPos.lng,b.latitude,b.longitude):0);

  const cats = ["Tout","Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Pharmacie","Services"];

  return (
    <div style={{background:DS.ink05,minHeight:"100vh",fontFamily:DS.font,maxWidth:430,margin:"0 auto"}}>

      {/* Header */}
      <header style={{background:DS.white,borderBottom:`1px solid ${DS.ink10}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{padding:"52px 16px 12px",display:"flex",alignItems:"center",gap:10}}>
          <CPLogo size={32}/>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:DS.ink,letterSpacing:-0.5}}>Carte</div>
            <div style={{fontSize:11,color:DS.ink40,display:"flex",alignItems:"center",gap:4}}>
              {Ic.pin(userPos?DS.success:DS.ink20,10)}
              {nearby.length} offre{nearby.length!==1?"s":""} {userPos?`dans ${rayon}km`:"disponibles"}
            </div>
          </div>
          <button onClick={locate} disabled={geoLoading} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,background:userPos?`${DS.success}12`:DS.ink05,color:userPos?DS.success:DS.ink60,border:`1px solid ${userPos?`${DS.success}30`:DS.ink10}`,borderRadius:DS.pill,padding:"7px 12px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
            {Ic.pin(userPos?DS.success:DS.ink40,12)}
            {geoLoading?"…":userPos?"Localisé":"Me localiser"}
          </button>
        </div>

        {userPos && (
          <div style={{padding:"0 16px 10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:11,color:DS.ink40}}>Rayon</span>
              <span style={{fontSize:11,fontWeight:700,color:DS.brand}}>{rayon} km</span>
            </div>
            <input type="range" min={1} max={25} value={rayon} onChange={e=>setRayon(parseInt(e.target.value))} style={{width:"100%",accentColor:DS.brand,height:3}}/>
          </div>
        )}

        {/* Toggle "Ouvert maintenant" */}
        <div style={{padding:"8px 16px 10px",display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setOpenOnly(!openOnly)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:6,background:openOnly?DS.brand:DS.ink05,border:`1.5px solid ${openOnly?DS.brand:DS.ink10}`,cursor:"pointer",color:openOnly?DS.white:DS.ink40,transition:"all .18s"}}>
            {openOnly && <span style={{fontSize:12}}>✓</span>}
          </button>
          <span style={{fontSize:13,fontWeight:600,color:DS.ink,flex:1}}>Ouvert maintenant</span>
          <span style={{fontSize:11,color:DS.ink40}}>🕐</span>
        </div>

        <div style={{display:"flex",gap:7,overflowX:"auto",padding:"0 16px 12px",scrollbarWidth:"none"}}>
          {cats.map(c=>{
            const on=catFilter===c; const col=CAT_COLORS[c]||DS.ink;
            return <button key={c} onClick={()=>setCatFilter(c)} style={{flexShrink:0,border:`1.5px solid ${on?col:DS.ink10}`,borderRadius:DS.pill,padding:"6px 12px",background:on?col:DS.white,color:on?DS.white:DS.ink60,fontSize:11,fontWeight:on?700:500,cursor:"pointer",transition:"all .18s",fontFamily:DS.font}}>{c}</button>;
          })}
        </div>
      </header>

      {/* Carte Leaflet */}
      <div ref={mapRef} style={{height:selected?"38vh":"52vh",width:"100%"}}>
        {!mapReady&&<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#EEF2EE",gap:12}}><CPLogo size={36}/><div style={{color:DS.ink40,fontSize:13}}>Chargement…</div></div>}
      </div>

      {/* Offre sélectionnée */}
      {selected && (
        <div style={{padding:"10px 14px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
            <span style={{fontSize:10,fontWeight:700,color:DS.ink40,textTransform:"uppercase",letterSpacing:1}}>Sélectionnée</span>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>{Ic.x(DS.ink40,16)}</button>
          </div>
          <div onClick={()=>navigate(`/OffreDetail?id=${selected.id}`)} style={{background:DS.white,borderRadius:DS.lg,padding:13,display:"flex",gap:12,boxShadow:DS.e2,border:`1.5px solid ${DS.brand}`,cursor:"pointer"}}>
            <img src={selected.image_url} alt={selected.titre} style={{width:64,height:64,borderRadius:DS.md,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:DS.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{selected.titre}</div>
              <div style={{fontSize:12,color:DS.ink40,marginBottom:7,display:"flex",alignItems:"center",gap:4}}>{Ic.store(DS.ink20,11)}{selected.commercant_nom}{userPos&&` · ${formatDist(haversine(userPos.lat,userPos.lng,selected.latitude,selected.longitude))}`}</div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <span style={{background:DS.brand,color:DS.white,borderRadius:DS.xs,padding:"3px 9px",fontSize:12,fontWeight:800}}>-{selected.valeur_reduction}{selected.type_reduction==="pourcentage"?"%":"€"}</span>
                {selected.prix_promo>0&&<span style={{fontSize:13,fontWeight:800,color:DS.brand}}>{selected.prix_promo}€</span>}
              </div>
            </div>
            {Ic.chev(DS.ink20,16)}
          </div>
        </div>
      )}

      {/* Liste */}
      <div style={{padding:"12px 14px 100px"}}>
        <div style={{fontSize:10,fontWeight:700,color:DS.ink20,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>
          {nearby.length} offre{nearby.length!==1?"s":""} {userPos?`à moins de ${rayon} km`:""}
        </div>

        {loading&&[1,2,3].map(i=><div key={i} style={{background:DS.white,borderRadius:DS.md,height:64,marginBottom:8,boxShadow:DS.e1,overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${DS.ink05} 25%,${DS.white} 50%,${DS.ink05} 75%)`,backgroundSize:"400% 100%",animation:"sh 1.4s infinite"}}/></div>)}

        {nearby.slice(0,2).map(o=>(
          <div key={o.id} onClick={()=>navigate(`/OffreDetail?id=${o.id}`)} style={{background:DS.white,borderRadius:DS.md,padding:"10px 12px",marginBottom:8,display:"flex",gap:12,boxShadow:DS.e1,cursor:"pointer",transition:"all .2s"}}>
            <div style={{width:42,height:42,borderRadius:DS.sm,background:`${CAT_COLORS[o.categorie]||DS.brand}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏷️</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13,color:DS.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.titre}</div>
              <div style={{fontSize:11,color:DS.ink40}}>{o.commercant_nom}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:14,color:DS.brand}}>-{o.valeur_reduction}{o.type_reduction==="pourcentage"?"%":"€"}</div>
              <div style={{fontSize:10,color:DS.ink40}}>{userPos?formatDist(haversine(userPos.lat,userPos.lng,o.latitude,o.longitude)):o.ville}</div>
            </div>
          </div>
        ))}
        
        {!loading&&nearby.length>2&&<div style={{textAlign:"center",padding:"12px 0",fontSize:13,color:DS.ink40,fontWeight:600}}>+{nearby.length-2} offre{nearby.length-2>1?"s":""} à proximité</div>}
      </div>

      <NavBar active="carte"/>
      <style>{`@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
