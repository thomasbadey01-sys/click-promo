import {createClientFromRequest} from "npm:@base44/sdk";
import {isAdmin,canManage,sanitizeOffer,httpUrl,coordinates} from "./policy.mjs";
Deno.serve(async(req)=>{
  if(req.method!=="POST")return Response.json({error:"Méthode non autorisée."},{status:405});
  const client=createClientFromRequest(req);
  const user=await client.auth.me().catch(()=>null);
  if(!user)return Response.json({error:"Connexion requise."},{status:401});
  const db=client.asServiceRole.entities;
  try {
    const body=await req.json();
    if(body.action==="context") {
      const merchants=isAdmin(user)?await db.Commercant.list("-created_date",1000):await db.Commercant.filter({user_id:user.id},"-created_date",100);
      const allowed=merchants.filter(m=>canManage(user,m));
      const offers=(await Promise.all(allowed.map(m=>db.Offre.filter({commercant_id:m.id},"-created_date",1000)))).flat();
      return Response.json({merchants:allowed,offers});
    }
    if(body.action==="approve"||body.action==="reject") {
      if(!isAdmin(user))return Response.json({error:"Accès administrateur requis."},{status:403});
      const request=await db.DemandeCommercant.get(body.id);
      if(!request?.user_id)return Response.json({error:"Cette demande n’est pas associée à un compte."},{status:422});
      if(body.action==="reject") {
        await db.DemandeCommercant.update(request.id,{statut:"refuse"});
        return Response.json({success:true});
      }
      const existing=await db.Commercant.filter({siret:request.siret});
      let merchant=existing[0];
      if(merchant&&merchant.user_id!==request.user_id)return Response.json({error:"Ce SIRET appartient déjà à une autre fiche. Vérifiez le rattachement avant de valider."},{status:409});
      if(!merchant)merchant=await db.Commercant.create({
        nom:request.nom_commerce,siret:request.siret,categorie:request.categorie,description:request.description||"",
        adresse:request.adresse||"",ville:request.ville||"",code_postal:request.code_postal||"",
        telephone:request.telephone||"",email:request.email_contact||"",site_web:request.site_web?httpUrl(request.site_web):"",
        user_id:request.user_id,est_actif:true,est_valide:true,est_verifie:false,plan_abonnement:"gratuit",
        latitude:coordinates(request.latitude,request.longitude)?request.latitude:null,
        longitude:coordinates(request.latitude,request.longitude)?request.longitude:null
      });
      await db.DemandeCommercant.update(request.id,{statut:"approuve"});
      return Response.json({success:true,merchant});
    }
    const existing=body.id?await db.Offre.get(body.id):null;
    const merchantId=existing?.commercant_id||body.merchant_id;
    if(!merchantId)return Response.json({error:"Choisissez le commerce associé à cette offre."},{status:422});
    const merchant=await db.Commercant.get(merchantId);
    if(!canManage(user,merchant))return Response.json({error:"Vous ne pouvez pas gérer ce commerce."},{status:403});
    if(existing&&body.merchant_id&&existing.commercant_id!==body.merchant_id)return Response.json({error:"Une offre ne peut pas être transférée à un autre commerce."},{status:403});
    if(body.action==="delete") {
      if(!existing)return Response.json({error:"Offre introuvable."},{status:404});
      await db.Offre.delete(existing.id);return Response.json({success:true});
    }
    if(body.action==="save") {
      const payload=sanitizeOffer(body.data||{},merchant,existing);
      const offer=existing?await db.Offre.update(existing.id,payload):await db.Offre.create({...payload,nb_vues:0,nb_clics:0,nb_conversions:0});
      return Response.json({offer});
    }
    return Response.json({error:"Action inconnue."},{status:400});
  }catch(error){const status=error?.status===404?404:400;return Response.json({error:error?.message||"L’opération n’a pas abouti."},{status});}
});
