/** Destatis/Wikipedia Städte set: every German city with city rights (~2,050). */
import cities from "../data/german-cities.json" with { type: "json" };

export const GERMAN_CITIES: readonly string[] = cities;

const ALIASES: Record<string, string> = {
  munich: "München",
  cologne: "Köln",
  nuremberg: "Nürnberg",
  hanover: "Hannover",
  brunswick: "Braunschweig",
  constance: "Konstanz",
  frankfurt: "Frankfurt am Main",
  "frankfurt (main)": "Frankfurt am Main",
  "frankfurt main": "Frankfurt am Main",
};

const byFold = new Map<string, string>();
for (const name of GERMAN_CITIES) {
  byFold.set(foldKey(name), name);
}
for (const [alias, name] of Object.entries(ALIASES)) {
  byFold.set(foldKey(alias), name);
}

export function foldKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeGermanCity(raw: string): string | null {
  const folded = foldKey(raw);
  if (!folded) return null;
  return byFold.get(folded) ?? null;
}

export function isGermanCity(raw: string): boolean {
  return Boolean(normalizeGermanCity(raw));
}

export function suggestGermanCities(raw: string, limit = 10): string[] {
  const folded = foldKey(raw);
  if (folded.length < 2) return [];
  const compact = folded.replace(/\s+/g, "");
  const ranked: Array<{ name: string; score: number }> = [];
  for (const name of GERMAN_CITIES) {
    const key = foldKey(name);
    const tight = key.replace(/\s+/g, "");
    let score = 0;
    if (key === folded || tight === compact) score = 3;
    else if (key.startsWith(folded) || tight.startsWith(compact)) score = 2;
    else if (key.includes(folded) || tight.includes(compact)) score = 1;
    if (score) ranked.push({ name, score });
  }
  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "de"));
  return ranked.slice(0, limit).map((row) => row.name);
}
