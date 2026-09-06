import {useState} from "react";
import {BellRing} from "lucide-react";
import {base44} from "@/api/base44Client";
import {CATEGORIES} from "@/lib/local-discovery";

export default function AlertPreferences({profile,onSaved}){
  const [categories,setCategories]=useState(profile.categories_favorites||[]),[radius,setRadius]=useState(profile.rayon_recherche_km||5),[busy,setBusy]=useState(false);
  const toggle=c=>setCategories(s=>s.includes(c)?s.filter(x=>x!==c):[...s,c]);
  const save=async()=>{setBusy(true);const updated=await base44.entities.ProfilUtilisateur.update(profile.id,{categories_favorites:categories,rayon_recherche_km:Number(radius),notifications_mobiles_souhaitees:true});onSaved(updated);setBusy(false);};
  return <div className="cp-alert-preferences"><h2><BellRing size={19}/>Préférences des futures alertes mobiles</h2><p>Vos choix seront prêts lorsque l’application native et les notifications push seront configurées.</p><div className="cp-category-list">{CATEGORIES.map(c=><button key={c} className={categories.includes(c)?"selected":""} onClick={()=>toggle(c)}>{c}</button>)}</div><label className="cp-field">Rayon<select value={radius} onChange={e=>setRadius(e.target.value)}>{[1,3,5,10,20].map(r=><option value={r} key={r}>{r} km</option>)}</select></label><button className="cp-button cp-button-primary" onClick={save} disabled={busy}>{busy?"Enregistrement…":"Préparer mes alertes"}</button></div>;
}