import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Récupérer tous les favoris groupés par user
  const favoris = await base44.asServiceRole.entities.FavoriUtilisateur.list();
  const offres = await base44.asServiceRole.entities.Offre.list();
  const profils = await base44.asServiceRole.entities.ProfilUtilisateur.list();

  // Map offre_id -> offre
  const offresMap = {};
  offres.forEach(o => { offresMap[o.id] = o; });

  // Map user_id -> profil
  const profilsMap = {};
  profils.forEach(p => { profilsMap[p.user_id] = p; });

  // Grouper les favoris par user_id
  const favorisByUser = {};
  favoris.forEach(f => {
    if (!favorisByUser[f.user_id]) favorisByUser[f.user_id] = [];
    favorisByUser[f.user_id].push(f);
  });

  // Offres actives uniquement
  const now = new Date();
  const offresActives = offres.filter(o => o.est_active && (!o.date_fin || new Date(o.date_fin) > now));
  const offresFlash = offresActives.filter(o => o.est_urgente).slice(0, 3);

  let emailsEnvoyes = 0;

  for (const [userId, userFavoris] of Object.entries(favorisByUser)) {
    // Trouver l'email depuis created_by des favoris ou profil
    const profil = profilsMap[userId];
    
    // Les offres favorites encore actives
    const offresFavActives = userFavoris
      .map(f => offresMap[f.offre_id])
      .filter(o => o && o.est_active && (!o.date_fin || new Date(o.date_fin) > now))
      .slice(0, 5);

    if (offresFavActives.length === 0 && offresFlash.length === 0) continue;

    // Construire la liste HTML des favoris actifs
    const listeFavoris = offresFavActives.map(o => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <strong>${o.commercant_nom || o.titre}</strong><br>
          <span style="color: #666; font-size: 13px;">${o.titre}</span>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #7C3AED; font-weight: bold;">
          -${o.valeur_reduction}${o.type_reduction === 'pourcentage' ? '%' : '€'}
        </td>
      </tr>
    `).join('');

    const listeFlash = offresFlash.map(o => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          ⚡ <strong>${o.commercant_nom || o.titre}</strong><br>
          <span style="color: #666; font-size: 13px;">${o.ville || ''}</span>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #EF4444; font-weight: bold;">
          -${o.valeur_reduction}${o.type_reduction === 'pourcentage' ? '%' : '€'}
        </td>
      </tr>
    `).join('');

    const prenom = profil?.prenom || 'là';

    const corps = `
<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #7C3AED, #9D5CF7); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🛍️ Vos deals de la semaine</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Click &amp; Promo · Résumé hebdomadaire</p>
  </div>
  
  <div style="background: white; padding: 24px; border: 1px solid #f0f0f0;">
    <p style="font-size: 15px;">Bonjour ${prenom} 👋</p>
    <p style="color: #666; font-size: 14px;">Voici ce qui vous attend cette semaine sur Click &amp; Promo :</p>

    ${offresFavActives.length > 0 ? `
    <h2 style="font-size: 16px; color: #7C3AED; margin-top: 24px;">❤️ Vos favoris encore disponibles</h2>
    <table style="width: 100%; border-collapse: collapse;">
      ${listeFavoris}
    </table>
    ` : ''}

    ${offresFlash.length > 0 ? `
    <h2 style="font-size: 16px; color: #EF4444; margin-top: 24px;">⚡ Flash Deals du moment</h2>
    <table style="width: 100%; border-collapse: collapse;">
      ${listeFlash}
    </table>
    ` : ''}

    <div style="text-align: center; margin-top: 28px;">
      <a href="https://clicketpromo.fr/Feed" 
         style="background: linear-gradient(135deg, #7C3AED, #9D5CF7); color: white; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: bold; font-size: 15px;">
        Voir toutes les offres →
      </a>
    </div>
  </div>

  <div style="background: #f9f9f9; padding: 16px; border-radius: 0 0 16px 16px; text-align: center;">
    <p style="color: #999; font-size: 12px; margin: 0;">Click &amp; Promo · Les meilleures promos locales</p>
  </div>
</div>
    `.trim();

    // On utilise l'email du profil ou le user_id (qui peut être l'email selon la config)
    const emailDest = profil?.email || userId;
    
    // Si userId ressemble à un email, l'utiliser directement
    const emailFinal = emailDest.includes('@') ? emailDest : null;
    if (!emailFinal) continue;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: emailFinal,
      subject: `🛍️ Vos deals de la semaine — ${offresFavActives.length} favori(s) disponible(s)`,
      body: corps,
      from_name: 'Click & Promo',
    });

    emailsEnvoyes++;
  }

  return Response.json({ success: true, emails_sent: emailsEnvoyes, users_traites: Object.keys(favorisByUser).length });
});