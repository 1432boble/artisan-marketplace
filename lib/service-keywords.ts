// Service search: keywords per service + accent/case-insensitive matching.
// Keys must match services.name_fr exactly. A service without an entry still
// matches on its name. Used by components/ServiceCombobox.tsx.

export const SERVICE_KEYWORDS: Record<string, string[]> = {
  'Architecte': ['plan', 'plans de maison', 'permis de construire', 'conception', 'construction maison', 'bâtiment'],
  "Architecte d'intérieur": ['décoration', 'décorateur', 'design intérieur', 'aménagement intérieur', 'rénovation intérieure'],
  'Carrelage': ['carreleur', 'carreaux', 'faïence', 'pose de carreaux', 'sol', 'dallage'],
  'Charpenterie': ['charpentier', 'charpente', 'toiture', 'toit', 'tôles', 'couverture'],
  'Coffrage': ['coffreur', 'boiseur', 'dalle', 'poteaux', 'poutres'],
  'Démolition': ['démolir', 'casser', 'casse', 'démolisseur'],
  'Domotique': ['maison connectée', 'automatisme', 'portail automatique', 'volet roulant'],
  'Électricité': ['électricien', 'courant', 'câblage', 'prise', 'disjoncteur', 'panne de courant', 'compteur', 'éclairage', 'lumière'],
  'Energie Renouvelable': ['solaire', 'panneau solaire', 'kit solaire', 'onduleur', 'batterie', 'énergie solaire'],
  'Étanchéité': ['toiture', 'toit qui coule', 'infiltration', 'fuite toit', 'terrasse', 'humidité'],
  'Excavation': ['terrassement', 'fouille', 'tractopelle', 'engin', 'creuser', 'remblai'],
  'Ferraillage': ['ferrailleur', 'fer', 'armature', 'fer à béton'],
  'Froid & Climatisation': ['clim', 'climatiseur', 'climatisation', 'split', 'frigoriste', 'frigo', 'réfrigérateur', 'congélateur', 'chambre froide'],
  'Graphisme': ['graphiste', 'infographiste', 'logo', 'flyer', 'affiche', 'carte de visite'],
  'Jardinage': ['jardinier', 'jardin', 'gazon', 'tonte', 'élagage', 'entretien jardin'],
  'Maçonnerie': ['maçon', 'construction', 'mur', 'parpaing', 'brique', 'fondation', 'dalle', 'crépissage', 'enduit'],
  'Mécanique': ['mécanicien', 'garage', 'voiture', 'auto', 'moto', 'vidange', 'panne voiture'],
  'Menuiserie aluminium': ['alu', 'aluminium', 'fenêtre', 'baie vitrée', 'vitre', 'vitrier', 'véranda'],
  'Menuiserie bois': ['menuisier', 'ébéniste', 'meuble', 'porte', 'placard', 'cuisine', 'dressing', 'lit', 'table'],
  'Menuiserie métallique': ['soudeur', 'soudure', 'ferronnier', 'portail', 'grille', 'garde-corps', 'fer forgé', 'porte métallique'],
  'Nettoyage': ['ménage', 'entretien', 'nettoyage fauteuils', 'canapé', 'tapis', 'nettoyage bureau'],
  'Paysagisme': ['paysagiste', 'aménagement extérieur', 'espace vert', 'jardin'],
  'Peinture': ['peintre', 'peindre', 'peinture maison', 'décoration murale', 'enduit'],
  'Photographie': ['photographe', 'photo', 'shooting', 'mariage', 'vidéo'],
  'Piscine': ['pisciniste', 'construction piscine', 'entretien piscine'],
  'Plâtrerie': ['plâtrier', 'staff', 'faux plafond', 'plafond', 'placo', 'BA13'],
  'Plomberie': ['plombier', 'fuite', "fuite d'eau", 'robinet', 'WC', 'toilettes', 'douche', 'lavabo', 'évier', 'chauffe-eau', 'tuyau', 'débouchage', 'sanitaire'],
  'Plombier-gazier': ['gaz', 'bonbonne', 'bouteille de gaz', 'gazinière', 'cuisinière', 'installation gaz'],
  'Sécurité électronique': ['caméra', 'vidéosurveillance', 'alarme', 'interphone', "contrôle d'accès", 'clôture électrique'],
  'Tailleur': ['couturier', 'couturière', 'couture', 'pagne', 'tenue', 'costume', 'retouche'],
};

const MIN_QUERY_LENGTH = 2;
const MIN_LOGGED_QUERY_LENGTH = 3;
const MAX_LOGGED_QUERY_LENGTH = 60;

/** Lowercase, strip accents, unify apostrophes, hyphens → spaces, collapse spaces. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const words = (normalized: string) => normalized.split(/[^a-z0-9]+/).filter(Boolean);

// A typed word matches a keyword word exactly or with a plural s/x.
const wordMatches = (typed: string, word: string) =>
  typed === word || typed === word + 's' || typed === word + 'x';

/** True when `phrase` appears as whole, consecutive words in `typed`. */
function containsPhrase(typed: string[], phrase: string[]): boolean {
  if (phrase.length === 0) return false;
  for (let i = 0; i + phrase.length <= typed.length; i++) {
    if (phrase.every((w, j) => wordMatches(typed[i + j], w))) return true;
  }
  return false;
}

/** True when `typed` is exactly `phrase` (plural s/x allowed per word). */
const equalsPhrase = (typed: string[], phrase: string[]) =>
  typed.length === phrase.length && containsPhrase(typed, phrase);

type Entry = { name: string; terms: { text: string; words: string[] }[] };
const entries = new Map<string, Entry>();

function entryFor(name: string): Entry {
  let entry = entries.get(name);
  if (!entry) {
    const terms = [name, ...(SERVICE_KEYWORDS[name] ?? [])].map((t) => {
      const text = normalize(t);
      return { text, words: words(text) };
    });
    entry = { name: normalize(name), terms };
    entries.set(name, entry);
  }
  return entry;
}

/**
 * Services matching a typed query, best first: query is exactly the name or
 * a keyword > name starts with query > name contains query > keyword match
 * (query inside a keyword, or a keyword as whole words inside the query).
 * Under 2 characters, returns all services.
 */
export function matchServices(query: string, services: string[]): string[] {
  const q = normalize(query);
  if (q.length < MIN_QUERY_LENGTH) return services;
  const typed = words(q);

  const ranked: { name: string; rank: number; index: number }[] = [];
  services.forEach((name, index) => {
    const entry = entryFor(name);
    const rank = entry.terms.some((t) => equalsPhrase(typed, t.words))
      ? 0
      : entry.name.startsWith(q)
      ? 1
      : entry.name.includes(q)
      ? 2
      : entry.terms.some((t) => t.text.includes(q) || containsPhrase(typed, t.words))
      ? 3
      : null;
    if (rank !== null) ranked.push({ name, rank, index });
  });

  return ranked.sort((a, b) => a.rank - b.rank || a.index - b.index).map((r) => r.name);
}

/** Unmatched-search text safe to log: normalized, 3–60 chars, no phone numbers. */
export function toLoggableQuery(text: string): string | null {
  const q = normalize(text);
  if (q.length < MIN_LOGGED_QUERY_LENGTH) return null;
  if ((q.match(/\d/g)?.length ?? 0) >= 6) return null;
  return q.slice(0, MAX_LOGGED_QUERY_LENGTH).trim();
}
