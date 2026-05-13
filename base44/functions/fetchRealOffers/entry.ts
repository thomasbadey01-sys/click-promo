import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LYON_ZONES = [
  { ville: "Lyon 1er", lat: 45.7676, lon: 4.8344 },
  { ville: "Lyon 2ème", lat: 45.7497, lon: 4.8283 },
  { ville: "Lyon 3ème", lat: 45.7580, lon: 4.8604 },
  { ville: "Lyon 4ème", lat: 45.7744, lon: 4.8283 },
  { ville: "Lyon 5ème", lat: 45.7558, lon: 4.8175 },
  { ville: "Lyon 6ème", lat: 45.7700, lon: 4.8527 },
  { ville: "Lyon 7ème", lat: 45.7400, lon: 4.8430 },
  { ville: "Lyon 8ème", lat: 45.7330, lon: 4.8604 },
  { ville: "Villeurbanne", lat: 45.7700, lon: 4.8800 },
  { ville: "Lyon Part-Dieu", lat: 45.7605, lon: 4.8598 },
  { ville: "Lyon Confluence", lat: 45.7333, lon: 4.8168 },
  { ville: "Lyon", lat: 45.7640, lon: 4.8357 },
];

const CATEGORIES = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Services", "Pharmacie", "Autre"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch { /* automation = pas de user, on continue */ }

    const existingOffres = await base44.asServiceRole.entities.Offre.list();
    const existingTitles = new Set(existingOffres.map(o => o.titre?.toLowerCase().trim()));
    const now = new Date();

    const prompt = `Tu es un expert en promotions et bons plans pour la région de Lyon, France.
Date d'aujourd'hui : ${now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Ta mission : Trouver des offres promotionnelles RÉELLES et ACTUELLES dans les HYPERMARCHÉS, SUPERMARCHÉS et GRANDES ENSEIGNES de Lyon et sa région.

Cible en priorité ces enseignes réelles présentes à Lyon :
- Hypermarchés : Carrefour Part-Dieu, Carrefour Vénissieux, Auchan Décines, Auchan La Part-Dieu, Leclerc Ecully, Leclerc Vénissieux, Géant Casino Écully
- Supermarchés : Intermarché Lyon, Monoprix Lyon Centre, Franprix Lyon, Casino Lyon, Lidl Lyon, Aldi Lyon, Picard Lyon
- Mode & Vêtements : Zara Part-Dieu, H&M Lyon, Uniqlo Lyon, Primark Lyon, Kiabi Vénissieux, Decathlon Vénissieux, Go Sport Lyon
- Électronique : Fnac Part-Dieu, Darty Lyon, Boulanger Lyon
- Maison & Déco : IKEA Lyon, Leroy Merlin Lyon, Casa Lyon, Maisons du Monde Lyon
- Sport : Intersport Lyon, Decathlon Lyon, Go Sport Lyon
- Pharmacie/Parapharmacie : Pharmacie Leclerc, Weleda Lyon, Beauty Success Lyon
- Beauté : Sephora Lyon, Nocibé Lyon, Marionnaud Lyon
- Restauration rapide / brasseries : McDonald's Lyon, KFC Lyon, Paul Bakery Lyon, Flunch Lyon, Hippopotamus Lyon

Pour chaque offre, fournis des informations RÉELLES et PRÉCISES :
- Le nom EXACT de l'enseigne et de son emplacement à Lyon (ex: "Carrefour Part-Dieu")
- L'adresse réelle du magasin
- Une promotion actuelle et crédible (soldes, -X%, lot, carte fidélité, etc.)
- Les coordonnées GPS exactes du magasin
- Un code promo réaliste si applicable

Génère 20 offres variées, en couvrant différents types d'enseignes et différents quartiers de Lyon.
Les réductions doivent être réalistes (5% à 50% selon le secteur).
Inclus des offres FLASH urgentes pour certaines (est_urgente: true).

Format JSON requis :
{
  "offres": [
    {
      "titre": "Titre accrocheur de l'offre",
      "description": "Description détaillée et attrayante (2-3 phrases avec les vrais détails de la promo)",
      "commercant_nom": "Nom exact de l'enseigne + localisation (ex: Carrefour Part-Dieu)",
      "categorie": "Restaurant|Boutique|Beauté & Coiffure|Fitness & Sport|Épicerie|Services|Pharmacie|Autre",
      "type_reduction": "pourcentage|montant",
      "valeur_reduction": 20,
      "prix_original": 35.00,
      "prix_promo": 28.00,
      "adresse": "Adresse complète réelle à Lyon",
      "ville": "Lyon Xème ou ville proche",
      "lat": 45.76,
      "lon": 4.83,
      "code_promo": "CODE123",
      "conditions": "Conditions précises d'utilisation",
      "est_urgente": false,
      "stock": 50,
      "jours_validite": 7
    }
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          offres: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titre: { type: "string" },
                description: { type: "string" },
                commercant_nom: { type: "string" },
                categorie: { type: "string" },
                type_reduction: { type: "string" },
                valeur_reduction: { type: "number" },
                prix_original: { type: "number" },
                prix_promo: { type: "number" },
                adresse: { type: "string" },
                ville: { type: "string" },
                lat: { type: "number" },
                lon: { type: "number" },
                code_promo: { type: "string" },
                conditions: { type: "string" },
                est_urgente: { type: "boolean" },
                stock: { type: "number" },
                jours_validite: { type: "number" }
              }
            }
          }
        }
      }
    });

    const offresIA = result?.offres || [];
    const dateDebut = now.toISOString();
    const inserted = [];
    const skipped = [];

    for (const o of offresIA) {
      const titleKey = o.titre?.toLowerCase().trim();
      if (existingTitles.has(titleKey)) {
        skipped.push(o.titre);
        continue;
      }

      const zone = LYON_ZONES.find(z => o.ville?.includes(z.ville.split(' ')[1])) || LYON_ZONES[11];
      const lat = o.lat && o.lat > 45 && o.lat < 46 ? o.lat : zone.lat + (Math.random() - 0.5) * 0.015;
      const lon = o.lon && o.lon > 4.7 && o.lon < 5.0 ? o.lon : zone.lon + (Math.random() - 0.5) * 0.015;

      const dateFin = new Date(now);
      dateFin.setDate(dateFin.getDate() + (o.jours_validite || 7));

      const categorie = CATEGORIES.includes(o.categorie) ? o.categorie : "Autre";

      const offre = await base44.asServiceRole.entities.Offre.create({
        titre: o.titre,
        description: o.description,
        commercant_nom: o.commercant_nom,
        categorie,
        type_reduction: o.type_reduction === "montant" ? "montant" : "pourcentage",
        valeur_reduction: o.valeur_reduction || 10,
        prix_original: o.prix_original || 0,
        prix_promo: o.prix_promo || 0,
        adresse: o.adresse || "",
        ville: o.ville || "Lyon",
        latitude: lat,
        longitude: lon,
        code_promo: o.code_promo || "",
        conditions: o.conditions || "",
        est_urgente: o.est_urgente || false,
        est_active: true,
        stock_initial: o.stock || 100,
        stock_restant: o.stock || 100,
        rayon_km: 15,
        date_debut: dateDebut,
        date_fin: dateFin.toISOString(),
        nb_vues: 0,
        nb_clics: 0,
        nb_conversions: 0,
        achat_en_ligne: false,
      });
      inserted.push(offre.titre);
      existingTitles.add(titleKey);
    }

    console.log(`[fetchRealOffers] ${inserted.length} offres insérées, ${skipped.length} doublons ignorés`);

    return Response.json({
      success: true,
      inserted: inserted.length,
      skipped: skipped.length,
      titres: inserted,
    });

  } catch (error) {
    console.error('[fetchRealOffers] Erreur:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});