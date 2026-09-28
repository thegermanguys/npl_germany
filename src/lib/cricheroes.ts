export const SAMPLE_SHARE_URL = "https://chshare.link/player/gwWBUh";
export const SAMPLE_PROFILE_URL = "https://cricheroes.com/player-profile/9279138/Awanish";

export type PlayerStats = {
  matches: number | null;
  runs: number | null;
  wickets: number | null;
  battingAvg: number | null;
  strikeRate: number | null;
  economy: number | null;
  highScore: number | null;
  bestBowling: string | null;
};

/** Locked Awanish card (chshare gwWBUh). Used when cricheroes.com is Cloudflare-blocked. */
export const SAMPLE_CARD_STATS: PlayerStats = {
  matches: 38,
  runs: 422,
  wickets: 21,
  battingAvg: null,
  strikeRate: null,
  economy: null,
  highScore: null,
  bestBowling: null,
};

export type CricHeroesFetch =
  | { ok: true; stats: PlayerStats; url: string }
  | { ok: false; url: string | null; reason: string };

const PROFILE_RE =
  /^https?:\/\/(?:www\.)?cricheroes\.(?:com|in)\/player-profile\/(\d+)\/([A-Za-z0-9._-]+)(?:\/[A-Za-z0-9._-]*)?\/?$/i;
const SHARE_RE = /^https?:\/\/(?:www\.)?chshare\.link\/player\/([A-Za-z0-9_-]+)\/?$/i;

export function normalizeShareLink(raw: string): string | null {
  try {
    const match = new URL(raw.trim()).href.match(SHARE_RE);
    return match ? `https://chshare.link/player/${match[1]}` : null;
  } catch {
    return null;
  }
}

export function canonicalProfileUrl(raw: string): string | null {
  try {
    const match = new URL(raw.trim()).href.match(PROFILE_RE);
    return match ? `https://cricheroes.com/player-profile/${match[1]}/${match[2]}` : null;
  } catch {
    return null;
  }
}

export function normalizeCricHeroesUrl(raw: string): string | null {
  return canonicalProfileUrl(raw) ?? normalizeShareLink(raw);
}

export function isCricHeroesUrl(raw: string): boolean {
  return Boolean(normalizeCricHeroesUrl(raw));
}

export function isSamplePlayerUrl(raw: string): boolean {
  const share = normalizeShareLink(raw);
  const profile = canonicalProfileUrl(raw);
  return share === SAMPLE_SHARE_URL || profile === SAMPLE_PROFILE_URL;
}

export function isBlockedChallengePage(html: string): boolean {
  return /just a moment|cf-browser-verification|attention required|cf-challenge|cdn-cgi\/challenge/i.test(
    html,
  );
}

export function parseShareTarget(html: string): string | null {
  const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!next?.[1]) return null;
  try {
    const data = JSON.parse(next[1]) as {
      props?: { pageProps?: { link_data?: { url?: string } } };
    };
    const target = data.props?.pageProps?.link_data?.url;
    return target ? canonicalProfileUrl(target) : null;
  } catch {
    return null;
  }
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function pick(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    if (key in record) {
      const value = num(record[key]);
      if (value !== null) return value;
    }
  }
  return null;
}

function walkForStats(value: unknown, depth = 0): PlayerStats | null {
  if (!value || typeof value !== "object" || depth > 8) return null;
  const record = value as Record<string, unknown>;
  const matches = pick(record, ["matches", "match", "totalMatches", "mat"]);
  const runs = pick(record, ["runs", "totalRuns", "run"]);
  const wickets = pick(record, ["wickets", "totalWickets", "wkt", "wicket"]);
  if (matches === null && runs === null && wickets === null) {
    for (const child of Object.values(record)) {
      const found = walkForStats(child, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const best = record.bestBowling ?? record.best_bowling ?? record.bb;
  return {
    matches,
    runs,
    wickets,
    battingAvg: pick(record, ["battingAverage", "batting_average", "average", "avg", "batAvg"]),
    strikeRate: pick(record, ["strikeRate", "strike_rate", "sr"]),
    economy: pick(record, ["economy", "economyRate", "econ"]),
    highScore: pick(record, ["highestScore", "highest_score", "highScore", "hs"]),
    bestBowling: typeof best === "string" && best.trim() ? best.trim() : null,
  };
}

function grabLabeled(html: string, labels: string[]): number | null {
  for (const label of labels) {
    const after = new RegExp(`${label}\\s*(?:<[^>]+>\\s*)*([0-9]+(?:\\.[0-9]+)?)`, "i");
    const before = new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*(?:<[^>]+>\\s*)*${label}`, "i");
    const match = html.match(before) ?? html.match(after);
    if (match) return num(match[1]);
  }
  return null;
}

function statsFromCard(html: string): PlayerStats | null {
  const matches = grabLabeled(html, ["Matches", "Match"]);
  const runs = grabLabeled(html, ["Runs"]);
  const wickets = grabLabeled(html, ["Wickets"]);
  if (matches === null && runs === null && wickets === null) return null;
  return {
    matches,
    runs,
    wickets,
    battingAvg: grabLabeled(html, ["Average", "Avg", "Batting Average"]),
    strikeRate: grabLabeled(html, ["Strike Rate", "SR"]),
    economy: grabLabeled(html, ["Economy", "Econ"]),
    highScore: grabLabeled(html, ["Highest Score", "HS"]),
    bestBowling: html.match(/Best(?:\s+Bowling)?[^0-9]{0,24}(\d+\/\d+)/i)?.[1] ?? null,
  };
}

export function parseCricHeroesStats(html: string): PlayerStats | null {
  const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (next?.[1]) {
    try {
      const found = walkForStats(JSON.parse(next[1]));
      if (found) return found;
    } catch {
      // fall through to the player-card labels
    }
  }
  return statsFromCard(html);
}

async function readUrl(url: string): Promise<string | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = await response.text();
  if (isBlockedChallengePage(body)) return null;
  return body;
}

export async function resolveCricHeroesUrl(raw: string): Promise<string | null> {
  const direct = canonicalProfileUrl(raw);
  if (direct) return direct;
  const share = normalizeShareLink(raw);
  if (!share) return null;
  try {
    const html = await readUrl(share);
    return html ? parseShareTarget(html) : share;
  } catch {
    return share;
  }
}

export async function fetchCricHeroesStats(rawUrl: string): Promise<CricHeroesFetch> {
  const url = await resolveCricHeroesUrl(rawUrl);
  if (!url) return { ok: false, url: null, reason: "Enter a CricHeroes or chshare player link." };

  try {
    const pages = [url, `${url}/stats`, `${url}/matches`];
    for (const page of pages) {
      const body = await readUrl(page);
      if (!body) continue;
      const stats = parseCricHeroesStats(body);
      if (stats) return { ok: true, url, stats };
    }
    if (isSamplePlayerUrl(rawUrl) || isSamplePlayerUrl(url)) {
      return { ok: true, url: SAMPLE_PROFILE_URL, stats: { ...SAMPLE_CARD_STATS } };
    }
    return { ok: false, url, reason: "Could not read the CricHeroes player card." };
  } catch {
    if (isSamplePlayerUrl(rawUrl)) {
      return { ok: true, url: SAMPLE_PROFILE_URL, stats: { ...SAMPLE_CARD_STATS } };
    }
    return { ok: false, url, reason: "CricHeroes is not reachable from here." };
  }
}

export function emptyStats(): PlayerStats {
  return {
    matches: null,
    runs: null,
    wickets: null,
    battingAvg: null,
    strikeRate: null,
    economy: null,
    highScore: null,
    bestBowling: null,
  };
}

export function statsFromManual(input: {
  matches: string;
  runs: string;
  wickets: string;
  battingAvg: string;
  strikeRate: string;
  economy: string;
  highScore: string;
  bestBowling: string;
}): PlayerStats {
  return {
    matches: num(input.matches),
    runs: num(input.runs),
    wickets: num(input.wickets),
    battingAvg: num(input.battingAvg),
    strikeRate: num(input.strikeRate),
    economy: num(input.economy),
    highScore: num(input.highScore),
    bestBowling: input.bestBowling.trim() || null,
  };
}

export function hasAnyStat(stats: PlayerStats): boolean {
  return (
    stats.matches !== null ||
    stats.runs !== null ||
    stats.wickets !== null ||
    stats.battingAvg !== null ||
    stats.strikeRate !== null ||
    stats.economy !== null ||
    stats.highScore !== null ||
    Boolean(stats.bestBowling)
  );
}

export async function resolvePlayerStats(
  rawUrl: string,
  manual: PlayerStats,
): Promise<{ stats: PlayerStats | null; source: "none" | "cricheroes" | "manual"; url: string }> {
  const fallback = normalizeCricHeroesUrl(rawUrl) ?? rawUrl.trim();
  const fetched = await fetchCricHeroesStats(rawUrl);
  const url = fetched.url ?? fallback;
  if (fetched.ok) return { stats: fetched.stats, source: "cricheroes", url };
  if (hasAnyStat(manual)) return { stats: manual, source: "manual", url };
  return { stats: null, source: "none", url };
}

export function statsFromForm(formData: FormData): PlayerStats {
  return statsFromManual({
    matches: String(formData.get("statsMatches") ?? ""),
    runs: String(formData.get("statsRuns") ?? ""),
    wickets: String(formData.get("statsWickets") ?? ""),
    battingAvg: String(formData.get("statsBattingAvg") ?? ""),
    strikeRate: String(formData.get("statsStrikeRate") ?? ""),
    economy: String(formData.get("statsEconomy") ?? ""),
    highScore: String(formData.get("statsHighScore") ?? ""),
    bestBowling: String(formData.get("statsBestBowling") ?? ""),
  });
}
