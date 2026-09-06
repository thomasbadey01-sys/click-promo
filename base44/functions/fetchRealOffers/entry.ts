import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const categories = ["Restaurant", "Boutique", "Beauté & Coiffure", "Fitness & Sport", "Épicerie", "Services", "Pharmacie", "Autre"];

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

async function sourceIsReachable(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0 Click-Promo offer verification" } });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function geocode(address) {
  const response = await fetch("https://data.geopf.fr/geocodage/search?index=address&limit=1&q=" + encodeURIComponent(address));
  if (!response.ok) return null;
  const data = await response.json();
  const feature = data.features?.[0];
  const [longitude, latitude] = feature?.geometry?.coordinates || [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude, ville: feature.properties?.city || "Lyon" };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: "gemini_3_flash",
      add_context_from_internet: true,
      prompt: `Nous sommes le ${now.toISOString().slice(0, 10)}. Recherche sur le web jusqu'à 12 promotions réellement en cours dans des commerces physiques de Lyon et sa métropole. N'inclus une offre que si une page publique de l'enseigne, un catalogue officiel ou une page officielle du centre commercial indique explicitement la promotion et ses dates. Recopie l'URL exacte de cette source et les dates exactes : n'invente jamais une adresse, un prix, un code, une date ou une réduction. Exclure les pages génériques, résultats de recherche, agrégateurs, anciennes promotions et offres sans date de fin explicite. L'adresse doit être celle du magasin lyonnais concerné. Retourne uniquement les faits visibles dans la source.`,
      response_json_schema: {
        type: "object",
        properties: {
          offres: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titre: { type: "string" }, description: { type: "string" }, commercant_nom: { type: "string" },
                categorie: { type: "string" }, type_reduction: { type: "string" }, valeur_reduction: { type: "number" },
                prix_original: { type: "number" }, prix_promo: { type: "number" }, adresse: { type: "string" },
                ville: { type: "string" }, code_promo: { type: "string" }, conditions: { type: "string" },
                est_urgente: { type: "boolean" }, date_debut: { type: "string" }, date_fin: { type: "string" },
                source_url: { type: "string" }, source_nom: { type: "string" }
              },
              required: ["titre", "description", "commercant_nom", "categorie", "adresse", "date_debut", "date_fin", "source_url", "source_nom"]
            }
          }
        },
        required: ["offres"]
      }
    });

    const existing = await base44.asServiceRole.entities.Offre.list("-created_date", 500);
    const knownSources = new Set(existing.map(item => item.source_url).filter(Boolean));
    const inserted = [];
    const rejected = [];

    for (const candidate of result?.offres || []) {
      const sourceUrl = validUrl(candidate.source_url);
      const start = Date.parse(candidate.date_debut);
      const end = Date.parse(candidate.date_fin);
      const isCurrent = Number.isFinite(start) && Number.isFinite(end) && start <= now.getTime() && end > now.getTime();
      if (!sourceUrl || knownSources.has(sourceUrl) || !isCurrent || !candidate.adresse || !categories.includes(candidate.categorie)) {
        rejected.push(candidate.titre || "Offre incomplète");
        continue;
      }
      if (!(await sourceIsReachable(sourceUrl))) {
        rejected.push(candidate.titre);
        continue;
      }
      const location = await geocode(`${candidate.adresse}, ${candidate.ville || "Lyon"}`);
      if (!location) {
        rejected.push(candidate.titre);
        continue;
      }
      const record = await base44.asServiceRole.entities.Offre.create({
        titre: candidate.titre.trim(),
        description: candidate.description.trim(),
        commercant_nom: candidate.commercant_nom.trim(),
        categorie: candidate.categorie,
        type_reduction: candidate.type_reduction === "montant" ? "montant" : "pourcentage",
        valeur_reduction: Number(candidate.valeur_reduction) || 0,
        prix_original: Number(candidate.prix_original) || 0,
        prix_promo: Number(candidate.prix_promo) || 0,
        adresse: candidate.adresse.trim(),
        ville: candidate.ville || location.ville,
        latitude: location.latitude,
        longitude: location.longitude,
        code_promo: candidate.code_promo || "",
        conditions: candidate.conditions || "",
        est_urgente: candidate.est_urgente === true,
        est_active: true,
        date_debut: new Date(start).toISOString(),
        date_fin: new Date(end).toISOString(),
        source_url: sourceUrl,
        source_nom: candidate.source_nom.trim(),
        date_verification: now.toISOString(),
        rayon_km: 15,
        nb_vues: 0,
        nb_clics: 0,
        nb_conversions: 0,
        achat_en_ligne: false
      });
      inserted.push(record.titre);
      knownSources.add(sourceUrl);
    }

    return Response.json({ success: true, inserted: inserted.length, rejected: rejected.length, titres: inserted });
  } catch (error) {
    console.error("[fetchRealOffers]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}