import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const payload = await req.json().catch(() => ({}));
  const offre = payload.data;

  if (!offre) {
    return Response.json({ error: 'Pas de données offre' }, { status: 400 });
  }

  // Vérifier si stock critique (< 5 et > 0)
  const stock = offre.stock_restant;
  if (stock === undefined || stock === null || stock >= 5 || stock <= 0) {
    return Response.json({ skipped: true, reason: 'Stock non critique' });
  }

  // Trouver l'email du commerçant (créateur de l'offre)
  const createdBy = offre.created_by;
  if (!createdBy) {
    return Response.json({ skipped: true, reason: 'Pas de créateur' });
  }

  const sujet = `⚠️ Stock critique : "${offre.titre}"`;
  const corps = `
Bonjour,

Votre offre <strong>"${offre.titre}"</strong> n'a plus que <strong>${stock} unité(s)</strong> disponible(s).

➡️ Pensez à augmenter votre stock ou à désactiver l'offre si elle n'est plus disponible.

Connectez-vous à votre tableau de bord : <a href="https://clicketpromo.fr/Dashboard">Gérer mes offres</a>

À bientôt,
L'équipe Click &amp; Promo
  `.trim();

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: createdBy,
    subject: sujet,
    body: corps,
    from_name: 'Click & Promo',
  });

  return Response.json({ success: true, email_sent_to: createdBy, stock_restant: stock });
});