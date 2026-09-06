import {BadgeCheck,ShieldCheck} from "lucide-react";
import {validCoordinates} from "@/lib/local-discovery";

export function trustScore(item){
  let score=25;
  if(item.source_url)score+=25;
  if(item.date_verification)score+=20;
  if(item.conditions)score+=10;
  if(item.date_fin)score+=10;
  if(validCoordinates(item.latitude,item.longitude))score+=10;
  return Math.min(score,100);
}
export default function TrustBadge({item,large=false}){
  const score=trustScore(item),strong=score>=75,Icon=strong?BadgeCheck:ShieldCheck;
  return <span className={"cp-trust "+(strong?"strong":"")+(large?" large":"")} title="Calculé selon la source, la vérification et les informations disponibles"><Icon size={large?17:14}/>Confiance {score}%</span>;
}