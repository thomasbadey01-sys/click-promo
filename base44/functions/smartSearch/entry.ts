import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, userProfile } = await req.json();

    // 1. Charger toutes les offres actives
    const offres = await base44.entities.Offre.filter({ est_active: true });
    const now = new Date();
    const offresValides = offres.filter(o => !o.date_fin || new Date(o.date_fin) > now);

    // 2. Résumé des offres pour le LLM (on limite les tokens)
    const offresSummary = offresValides.slice(0, 80).map(o => ({
      id: o.id,
      titre: o.titre,
      commercant: o.commercant_nom,
      categorie: o.categorie,
      ville: o.ville,
      reduction: o.valeur_reduction ? `-${o.valeur_reduction}${o.type_reduction === 'pourcentage' ? '%' : '€'}` : null,
      prix_promo: o.prix_promo,
      est_urgente: o.est_urgente,
    }));

    // 3. Appel LLM pour interpréter la requête et matcher les offres
    const prompt = `Tu es un assistant de l'app Click & Promo qui aide les utilisateurs à trouver des offres promotionnelles.

Requête utilisateur : "${query}"

Profil utilisateur (préférences connues) :
- Ville habituelle : ${userProfile?.ville || 'non renseignée'}
- Catégories favorites : ${userProfile?.categories_favorites?.join(', ') || 'non renseignées'}
- Rayon de recherche : ${userProfile?.rayon_recherche_km || 5} km

Offres disponibles (JSON) :
${JSON.stringify(offresSummary, null, 2)}

Analyse la requête et retourne :
1. Les IDs des offres les plus pertinentes (max 6), triées par pertinence
2. Une réponse courte et friendly en français (1-2 phrases max) expliquant ce que tu as trouvé
3. Les préférences détectées dans la requête (ville, catégorie, budget) pour mettre à jour le profil

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "ids": ["id1", "id2", ...],
  "message": "Voici ce que j'ai trouvé...",
  "detected": {
    "ville": "Lyon ou null",
    "categorie": "Restaurant ou null",
    "budget_max": 20 ou null
  }
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          ids: { type: "array", items: { type: "string" } },
          message: { type: "string" },
          detected: {
            type: "object",
            properties: {
              ville: { type: "string" },
              categorie: { type: "string" },
              budget_max: { type: "number" }
            }
          }
        }
      }
    });

    // 4. Récupérer les offres complètes correspondantes
    const offresMatch = result.ids
      .map(id => offresValides.find(o => o.id === id))
      .filter(Boolean);

    // 5. Mettre à jour le profil utilisateur avec les préférences détectées
    if (result.detected) {
      const profils = await base44.entities.ProfilUtilisateur.filter({ user_id: user.id });
      const detected = result.detected;
      const updates = {};

      if (detected.ville && detected.ville !== 'null') {
        updates.ville = detected.ville;
      }
      if (detected.categorie && detected.categorie !== 'null') {
        const profil = profils[0];
        const cats = profil?.categories_favorites || [];
        if (!cats.includes(detected.categorie)) {
          updates.categories_favorites = [...cats, detected.categorie].slice(-5);
        }
      }

      if (Object.keys(updates).length > 0) {
        if (profils.length > 0) {
          await base44.entities.ProfilUtilisateur.update(profils[0].id, updates);
        } else {
          await base44.entities.ProfilUtilisateur.create({ user_id: user.id, ...updates });
        }
      }
    }

    return Response.json({
      offres: offresMatch,
      message: result.message,
      detected: result.detected,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});