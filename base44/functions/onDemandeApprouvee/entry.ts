import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    // Triggered on update of DemandeCommercant
    if (!data || data.statut !== "approuve") {
      return Response.json({ skipped: true });
    }

    // Check if a Commercant already exists for this demande (idempotency)
    const existing = await base44.asServiceRole.entities.Commercant.filter({
      siret: data.siret,
    });

    if (existing && existing.length > 0) {
      return Response.json({ skipped: true, reason: "already exists" });
    }

    // Create the Commercant from the demande
    const commercant = await base44.asServiceRole.entities.Commercant.create({
      nom: data.nom_commerce,
      siret: data.siret,
      categorie: data.categorie,
      description: data.description || "",
      adresse: data.adresse || "",
      ville: data.ville || "",
      telephone: data.telephone || "",
      email: data.email_contact || "",
      user_id: data.user_id || "",
      est_actif: true,
      est_valide: true,
      est_verifie: false,
      plan_abonnement: "gratuit",
      nb_avis: 0,
    });

    // Send confirmation email if email available
    if (data.email_contact) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: data.email_contact,
        subject: "🎉 Votre demande Click & Promo a été approuvée !",
        body: `Bonjour,\n\nVotre commerce "${data.nom_commerce}" a été validé et votre espace commerçant est maintenant actif sur Click & Promo.\n\nConnectez-vous à votre tableau de bord pour créer vos premières offres et toucher des milliers de clients près de chez vous !\n\nÀ très bientôt,\nL'équipe Click & Promo`,
      });
    }

    return Response.json({ success: true, commercant_id: commercant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});