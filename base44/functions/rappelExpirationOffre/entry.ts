import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Récupérer toutes les offres actives avec une date de fin dans les prochaines 24h
  const now = new Date();
  const dans24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const offres = await base44.asServiceRole.entities.Offre.list();

  const offresExpirantBientot = offres.filter(o => {
    if (!o.est_active || !o.date_fin) return false;
    const fin = new Date(o.date_fin);
    return fin > now && fin <= dans24h;
  });

  if (offresExpirantBientot.length === 0) {
    return Response.json({ success: true, emails_sent: 0, message: 'Aucune offre expirant dans 24h' });
  }

  let emailsEnvoyes = 0;

  for (const offre of offresExpirantBientot) {
    if (!offre.created_by) continue;

    const finDate = new Date(offre.date_fin);
    const heuresRestantes = Math.round((finDate - now) / (1000 * 60 * 60));

    const sujet = `⏰ Votre offre "${offre.titre}" expire dans ${heuresRestantes}h`;
    const corps = `
Bonjour,

Votre offre <strong>"${offre.titre}"</strong> expire dans environ <strong>${heuresRestantes} heure(s)</strong>.

📊 Statistiques actuelles :
- 👁️ Vues : ${offre.nb_vues || 0}
- 🖱️ Clics : ${offre.nb_clics || 0}
- ✅ Conversions : ${offre.nb_conversions || 0}
${offre.stock_restant !== undefined ? `- 📦 Stock restant : ${offre.stock_restant}` : ''}

Vous pouvez prolonger ou renouveler votre offre depuis votre tableau de bord :
<a href="https://clicketpromo.fr/Dashboard">Gérer mes offres</a>

À bientôt,
L'équipe Click &amp; Promo
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: offre.created_by,
      subject: sujet,
      body: corps,
      from_name: 'Click & Promo',
    });

    emailsEnvoyes++;
  }

  return Response.json({ success: true, emails_sent: emailsEnvoyes, offres_traitees: offresExpirantBientot.length });
});