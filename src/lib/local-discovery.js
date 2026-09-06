export const CATEGORIES = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Services", "Pharmacie", "Autre"];
export const normalize = (value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function validCoordinates(lat, lon) {
  return typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}
export function haversine(lat1, lon1, lat2, lon2) {
  if (!validCoordinates(lat1, lon1) || !validCoordinates(lat2, lon2)) return null;
  const rad = n => n * Math.PI / 180;
  const a = Math.sin(rad(lat2-lat1)/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(rad(lon2-lon1)/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(Math.min(1,a)), Math.sqrt(Math.max(0,1-a)));
}
export const formatDist = d => d == null ? "Distance non disponible" : d < 1 ? Math.round(d*1000) + " m" : new Intl.NumberFormat("fr-FR", {maximumFractionDigits:1}).format(d) + " km";
export function offerAvailable(o, now = Date.now()) {
  const start = o.date_debut ? Date.parse(o.date_debut) : null;
  const end = o.date_fin ? Date.parse(o.date_fin) : null;
  return o.est_active === true && (start === null || (Number.isFinite(start) && start <= now)) &&
    (end === null || (Number.isFinite(end) && end > now)) &&
    (o.stock_restant == null || o.stock_restant > 0);
}
export function safeHref(value) {
  if (!value || typeof value !== "string") return null;
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; }
}
export function directionsUrl(item) {
  const destination = validCoordinates(item.latitude,item.longitude) ? item.latitude+","+item.longitude : [item.adresse,item.ville].filter(Boolean).join(", ");
  return destination ? "https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(destination) : null;
}
export function filterLocal(items, {search="", category="", point=null, radius=5, flash=false}={}) {
  const q=normalize(search);
  return items.map(o=>({...o,_distance:point ? haversine(point.lat,point.lon,o.latitude,o.longitude) : null}))
    .filter(o=>(!category || o.categorie===category) && (!flash || o.est_urgente===true) &&
      (!q || normalize([o.nom,o.titre,o.commercant_nom,o.adresse,o.code_postal,o.ville,o.categorie].join(" ")).includes(q)) &&
      (!point || (o._distance !== null && o._distance <= radius)))
    .sort((a,b)=>point ? a._distance-b._distance : (a.nom||a.commercant_nom||a.titre||"").localeCompare(b.nom||b.commercant_nom||b.titre||"","fr"));
}
export async function readAll(entity, query={}) {
  const rows=[];
  for(let offset=0; ; offset+=100) {
    const batch=await entity.filter(query,"-created_date",100,offset);
    rows.push(...batch);
    if(batch.length<100) return rows;
    if(rows.length>=10000) throw new Error("Le catalogue est trop volumineux. Une pagination serveur est nécessaire.");
  }
}
export async function searchPlaces(query, signal) {
  const response=await fetch("https://data.geopf.fr/geocodage/search?index=address&limit=5&q="+encodeURIComponent(query),{signal});
  if(!response.ok) throw new Error("La recherche d’adresse est momentanément indisponible.");
  const data=await response.json();
  return (data.features||[]).filter(f=>f.geometry?.type==="Point" && validCoordinates(f.geometry.coordinates[1],f.geometry.coordinates[0]))
    .map(f=>({lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],label:f.properties.label||f.properties.name,city:f.properties.city||"",postcode:f.properties.postcode||""}));
}