import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Règles de points
const POINTS_RULES = {
  utilisation_offre: 20,       // Utiliser une offre
  premiere_offre: 50,          // Bonus première offre
  offre_flash: 30,             // Bonus offre flash
  parrainage_filleul: 50,      // Par filleul parrainé
  avis_laisse: 10,             // Laisser un avis
};

const BADGES_RULES = [
  { id: "first_deal",  condition: (p) => p.nb_offres_utilisees >= 1 },
  { id: "saver",       condition: (p) => p.total_economies >= 50 },
  { id: "fan",         condition: (p) => p.nb_offres_utilisees >= 5 },
  { id: "speed",       condition: (p) => p.nb_offres_utilisees >= 10 },
  { id: "loyal",       condition: (p) => p.nb_offres_utilisees >= 30 },
];

function calcNiveau(points) {
  if (points >= 1500) return 5;
  if (points >= 700) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const { action, data = {} } = await req.json();

    // Récupérer ou créer le profil
    const profils = await base44.entities.ProfilUtilisateur.filter({ user_id: user.id });
    if (profils.length === 0) return Response.json({ error: 'Profil introuvable' }, { status: 404 });

    const profil = profils[0];
    let pts = profil.points || 0;
    let nouveauxBadges = [];
    const badgesActuels = profil.badges || [];

    // Calculer les points selon l'action
    switch (action) {
      case 'utilisation_offre': {
        pts += POINTS_RULES.utilisation_offre;
        if (data.est_urgente) pts += POINTS_RULES.offre_flash;
        if (profil.nb_offres_utilisees === 0) pts += POINTS_RULES.premiere_offre;
        break;
      }
      case 'avis_laisse': {
        pts += POINTS_RULES.avis_laisse;
        break;
      }
      case 'parrainage': {
        pts += POINTS_RULES.parrainage_filleul;
        break;
      }
    }

    // Mettre à jour les stats
    const updates = {
      points: pts,
      niveau: calcNiveau(pts),
    };

    if (action === 'utilisation_offre') {
      updates.nb_offres_utilisees = (profil.nb_offres_utilisees || 0) + 1;
      updates.total_economies = (profil.total_economies || 0) + (data.economie || 0);
    }

    // Vérifier les nouveaux badges
    const profilSimule = { ...profil, ...updates };
    for (const rule of BADGES_RULES) {
      if (!badgesActuels.includes(rule.id) && rule.condition(profilSimule)) {
        nouveauxBadges.push(rule.id);
      }
    }
    if (nouveauxBadges.length > 0) {
      updates.badges = [...badgesActuels, ...nouveauxBadges];
    }

    // Sauvegarder
    await base44.entities.ProfilUtilisateur.update(profil.id, updates);

    return Response.json({
      success: true,
      points: pts,
      points_gagnes: pts - (profil.points || 0),
      niveau: updates.niveau,
      nouveaux_badges: nouveauxBadges,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});