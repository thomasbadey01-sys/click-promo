import {useEffect} from "react";
import {useMap} from "react-leaflet";

export default function MapViewport({items,point,radius}) {
  const map=useMap();
  const positions=JSON.stringify(items.map(item=>[item.latitude,item.longitude]));
  const lat=point?.lat,lon=point?.lon;
  useEffect(()=>{
    if(lat!=null&&lon!=null){
      const latitudeSpan=radius/111.195;
      const longitudeSpan=Math.min(180,latitudeSpan/Math.max(.01,Math.cos(lat*Math.PI/180)));
      const clamp=value=>Math.max(-85,Math.min(85,value));
      map.fitBounds([[clamp(lat-latitudeSpan),lon-longitudeSpan],[clamp(lat+latitudeSpan),lon+longitudeSpan]],{padding:[24,24],maxZoom:16});
    }else{
      const bounds=JSON.parse(positions);
      if(bounds.length)map.fitBounds(bounds,{padding:[35,35],maxZoom:14});
      else map.setView([46.6,2.4],5);
    }
  },[map,positions,lat,lon,radius]);
  useEffect(()=>{
    const resize=new ResizeObserver(()=>map.invalidateSize());
    resize.observe(map.getContainer());
    return ()=>resize.disconnect();
  },[map]);
  return null;
}