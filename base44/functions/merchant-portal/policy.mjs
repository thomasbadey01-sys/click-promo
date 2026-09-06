export const CATEGORIES=["Restaurant","Boutique","Beauté & Coiffure","Fitness & Sport","Épicerie","Services","Pharmacie","Autre"];
export const isAdmin=u=>u?.role==="admin";
export const canManage=(u,m)=>Boolean(u&&m&&(isAdmin(u)||(m.user_id===u.id&&m.est_actif===true&&m.est_valide===true)));
export const coordinates=(lat,lon)=>typeof lat==="number"&&typeof lon==="number"&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
export function httpUrl(value) {if(!value)return "";try{const u=new URL(value);if(u.protocol==="https:"||u.protocol==="http:")return u.href;}catch{}throw new Error("L’adresse du lien est invalide.");}
export function sanitizeOffer(data,merchant,existing=null) {
  const text=(k,max=1000)=>String(data[k]??"").trim().slice(0,max);
  const titre=text("titre",160);if(titre.length<3)throw new Error("Le titre doit contenir au moins 3 caractères.");
  const categorie=text("categorie");if(!CATEGORIES.includes(categorie))throw new Error("Catégorie invalide.");
  const numeric=(k,optional=false)=>{if(data[k]===""||data[k]==null){if(optional)return null;return 0;}const n=Number(data[k]);if(!Number.isFinite(n)||n<0)throw new Error("Valeur invalide : "+k);return n;};
  const original=numeric("prix_original",true),promo=numeric("prix_promo",true),discount=numeric("valeur_reduction");
  const type=data.type_reduction==="montant"?"montant":"pourcentage";
  if(type==="pourcentage"&&discount>100)throw new Error("La réduction ne peut pas dépasser 100 %.");
  if(original!=null&&promo!=null&&promo>original)throw new Error("Le prix promotionnel dépasse le prix initial.");
  const debut=data.date_debut?new Date(data.date_debut):null,fin=data.date_fin?new Date(data.date_fin):null;
  if((debut&&!Number.isFinite(debut.getTime()))||(fin&&!Number.isFinite(fin.getTime())))throw new Error("Date invalide.");
  if(debut&&fin&&debut>=fin)throw new Error("La date de fin doit suivre la date de début.");
  if(data.est_active!==false&&fin&&fin.getTime()<=Date.now())throw new Error("Une offre expirée ne peut pas être publiée.");
  let latitude=data.latitude===""||data.latitude==null?null:Number(data.latitude),longitude=data.longitude===""||data.longitude==null?null:Number(data.longitude);
  if(latitude===null&&longitude===null){latitude=merchant.latitude??null;longitude=merchant.longitude??null;}
  if((latitude!==null||longitude!==null)&&!coordinates(latitude,longitude))throw new Error("Coordonnées invalides.");
  const stock=numeric("stock_initial",true),remaining=data.stock_restant==null?(existing?.stock_restant??stock):numeric("stock_restant",true);
  if((stock!==null&&!Number.isInteger(stock))||(remaining!==null&&!Number.isInteger(remaining)))throw new Error("Le stock doit être un entier.");
  const images=(Array.isArray(data.image_urls)?data.image_urls:[]).filter(Boolean).slice(0,8).map(httpUrl);
  if(!images.length&&data.image_url)images.push(httpUrl(data.image_url));
  return {titre,description:text("description",5000),categorie,type_reduction:type,valeur_reduction:discount,prix_original:original,prix_promo:promo,
    date_debut:debut?.toISOString()??null,date_fin:fin?.toISOString()??null,conditions:text("conditions",3000),code_promo:text("code_promo",100),
    est_active:data.est_active!==false,est_urgente:data.est_urgente===true,achat_en_ligne:false,
    latitude,longitude,adresse:text("adresse")||merchant.adresse||"",ville:text("ville",200)||merchant.ville||"",
    commercant_id:merchant.id,commercant_nom:merchant.nom,stock_initial:stock,stock_restant:remaining,
    image_url:images[0]||"",image_urls:images,rayon_km:Math.min(200,Math.max(1,numeric("rayon_km")||5)),
    owner_id:merchant.user_id||existing?.owner_id||""};
}
