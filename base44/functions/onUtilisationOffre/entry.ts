import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Règles de points
const POINTS_RULES = {
  utilisation_offre: 20,
  premiere_offre: 50,
  offre_flash_bonus: 30,
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
    const payload = await req.json();

    // Automation entity payload
    const utilisation = payload.data;
    if (!utilisation || !utilisation.user_id) {
      return Response.json({ ok: true, msg: "Pas de user_id, ignoré" });
    }

    const userId = utilisation.user_id;

    // Récupérer le profil
    const profils = await base44.asServiceRole.entities.ProfilUtilisateur.filter({ user_id: userId });
    if (profils.length === 0) return Response.json({ ok: false, msg: "Profil introuvable" });

    const profil = profils[0];
    let pts = profil.points || 0;
    const badgesActuels = profil.badges || [];

    // Calculer les points
    pts += POINTS_RULES.utilisation_offre;
    if (profil.nb_offres_utilisees === 0) pts += POINTS_RULES.premiere_offre;

    // Récupérer l'offre pour vérifier si urgente
    let estUrgente = false;
    if (utilisation.offre_id) {
      const offre = await base44.asServiceRole.entities.Offre.get(utilisation.offre_id).catch(() => null);
      if (offre?.est_urgente) {
        pts += POINTS_RULES.offre_flash_bonus;
        estUrgente = true;
      }
    }

    const nbOffresUtilisees = (profil.nb_offres_utilisees || 0) + 1;
    const totalEconomies = (profil.total_economies || 0) + (utilisation.economie_realisee || 0);

    const updates = {
      points: pts,
      niveau: calcNiveau(pts),
      nb_offres_utilisees: nbOffresUtilisees,
      total_economies: totalEconomies,
    };

    // Vérifier les nouveaux badges
    const profilSimule = { ...profil, ...updates };
    const nouveauxBadges = [];
    for (const rule of BADGES_RULES) {
      if (!badgesActuels.includes(rule.id) && rule.condition(profilSimule)) {
        nouveauxBadges.push(rule.id);
      }
    }
    if (nouveauxBadges.length > 0) {
      updates.badges = [...badgesActuels, ...nouveauxBadges];
    }

    await base44.asServiceRole.entities.ProfilUtilisateur.update(profil.id, updates);

    return Response.json({
      ok: true,
      points: pts,
      niveau: updates.niveau,
      nouveaux_badges: nouveauxBadges,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});