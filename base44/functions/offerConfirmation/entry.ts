import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const offerId = typeof body.offer_id === 'string' ? body.offer_id : '';
    if (!offerId) return Response.json({ error: 'Offre requise' }, { status: 400 });
    if (body.action === 'confirm') {
      if (!['disponible', 'terminee'].includes(body.statut)) return Response.json({ error: 'Statut invalide' }, { status: 400 });
      const offer = await base44.asServiceRole.entities.Offre.get(offerId);
      if (!offer) return Response.json({ error: 'Offre introuvable' }, { status: 404 });
      await base44.asServiceRole.entities.ConfirmationOffre.deleteMany({ offre_id: offerId, user_id: user.id });
      await base44.asServiceRole.entities.ConfirmationOffre.create({ offre_id: offerId, user_id: user.id, statut: body.statut, date_confirmation: new Date().toISOString() });
    }
    const confirmations = await base44.asServiceRole.entities.ConfirmationOffre.filter({ offre_id: offerId }, '-date_confirmation', 500);
    return Response.json({ disponible: confirmations.filter(c => c.statut === 'disponible').length, terminee: confirmations.filter(c => c.statut === 'terminee').length, mon_statut: confirmations.find(c => c.user_id === user.id)?.statut || null });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
}