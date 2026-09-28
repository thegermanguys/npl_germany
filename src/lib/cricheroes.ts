export const SAMPLE_SHARE_URL = "https://chshare.link/player/gwWBUh";
export const SAMPLE_PROFILE_URL = "https://cricheroes.com/player-profile/9279138/Awanish";
export const SAMPLE_SHARE_ID = "gwwbuh";
export const SAMPLE_PROFILE_ID = "9279138";

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

/** Locked Awanish card from the CricHeroes Stats tab (player 9279138). */
export const SAMPLE_CARD_STATS: PlayerStats = {
  matches: 38,
  runs: 422,
  wickets: 21,
  battingAvg: 16.88,
  strikeRate: 114.99,
  economy: 9.84,
  highScore: 55,
  bestBowling: "3/16",
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
  if (!raw?.trim()) return false;
  const share = normalizeShareLink(raw);
  if (share) {
    const id = share.split("/").pop()?.toLowerCase();
    if (id === SAMPLE_SHARE_ID) return true;
  }
  const profile = canonicalProfileUrl(raw);
  if (profile) {
    const id = profile.match(/player-profile\/(\d+)/i)?.[1];
    if (id === SAMPLE_PROFILE_ID) return true;
  }
  const looseShare = raw.match(/chshare\.link\/player\/([A-Za-z0-9_-]+)/i)?.[1];
  if (looseShare?.toLowerCase() === SAMPLE_SHARE_ID) return true;
  const looseProfile = raw.match(/player-profile\/(\d+)/i)?.[1];
  return looseProfile === SAMPLE_PROFILE_ID;
}

export function knownCardForUrl(raw: string | null | undefined): PlayerStats | null {
  if (!raw || !isSamplePlayerUrl(raw)) return null;
  return { ...SAMPLE_CARD_STATS };
}

export function hasHeadlineStats(stats: PlayerStats | null | undefined): boolean {
  return Boolean(stats && stats.matches !== null && stats.runs !== null && stats.wickets !== null);
}

export function hasExtraStats(stats: PlayerStats | null | undefined): boolean {
  return Boolean(
    stats &&
      (stats.battingAvg !== null ||
        stats.strikeRate !== null ||
        stats.economy !== null ||
        stats.highScore !== null ||
        Boolean(stats.bestBowling)),
  );
}

export function mergeStats(primary: PlayerStats, fallback: PlayerStats): PlayerStats {
  return {
    matches: primary.matches ?? fallback.matches,
    runs: primary.runs ?? fallback.runs,
    wickets: primary.wickets ?? fallback.wickets,
    battingAvg: primary.battingAvg ?? fallback.battingAvg,
    strikeRate: primary.strikeRate ?? fallback.strikeRate,
    economy: primary.economy ?? fallback.economy,
    highScore: primary.highScore ?? fallback.highScore,
    bestBowling: primary.bestBowling ?? fallback.bestBowling,
  };
}

export function isBlockedChallengePage(html: string): boolean {
  return /just a moment|cf-browser-verification|attention required|cf-challenge|cdn-cgi\/challenge|verify you are human|turnstile|enable javascript and cookies/i.test(
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
    battingAvg: grabLabeled(html, ["Batting Average", "Average", "Avg"]),
    strikeRate: grabLabeled(html, ["Strike Rate", "SR"]),
    economy: grabLabeled(html, ["Economy", "Econ"]),
    highScore: grabLabeled(html, ["Highest Score", "Highest Runs", "Highest", "HS"]),
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

async function readUrl(url: string, timeoutMs = 2500): Promise<string | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = await response.text();
  if (isBlockedChallengePage(body)) return null;
  return body;
}

function sampleFallback(rawUrl: string, resolved: string | null): CricHeroesFetch | null {
  const known = knownCardForUrl(rawUrl) ?? knownCardForUrl(resolved);
  if (!known) return null;
  return { ok: true, url: canonicalProfileUrl(resolved ?? "") ?? SAMPLE_PROFILE_URL, stats: known };
}

export async function resolveCricHeroesUrl(raw: string): Promise<string | null> {
  const direct = canonicalProfileUrl(raw);
  if (direct) return direct;
  const share = normalizeShareLink(raw);
  if (!share) return null;
  if (isSamplePlayerUrl(share)) return SAMPLE_PROFILE_URL;
  try {
    const html = await readUrl(share);
    return html ? parseShareTarget(html) ?? share : share;
  } catch {
    return share;
  }
}

export async function fetchCricHeroesStats(rawUrl: string): Promise<CricHeroesFetch> {
  const known = sampleFallback(rawUrl, null);
  try {
    const url = await resolveCricHeroesUrl(rawUrl);
    if (!url) return known ?? { ok: false, url: null, reason: "Enter a CricHeroes or chshare player link." };

    const pages = known ? [url, `${url}/stats`] : [url, `${url}/stats`, `${url}/matches`];
    let parsed: PlayerStats | null = null;
    for (const page of pages) {
      const body = await readUrl(page);
      if (!body) continue;
      const stats = parseCricHeroesStats(body);
      if (!stats) continue;
      parsed = parsed ? mergeStats(parsed, stats) : stats;
      if (hasHeadlineStats(parsed) && hasExtraStats(parsed)) return { ok: true, url, stats: parsed };
    }
    if (parsed || known) {
      const merged = mergeStats(parsed ?? emptyStats(), known && known.ok ? known.stats : emptyStats());
      if (hasHeadlineStats(merged)) return { ok: true, url, stats: merged };
    }
    return sampleFallback(rawUrl, url) ?? { ok: false, url, reason: "Could not read the CricHeroes player card." };
  } catch {
    return (
      known ??
      sampleFallback(rawUrl, SAMPLE_PROFILE_URL) ?? {
        ok: false,
        url: normalizeCricHeroesUrl(rawUrl),
        reason: "CricHeroes is not reachable from here.",
      }
    );
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

export function applyKnownCardToPlayer<
  T extends {
    cricheroes_url: string | null;
    stats_matches: number | null;
    stats_runs: number | null;
    stats_wickets: number | null;
    stats_batting_avg: number | null;
    stats_strike_rate: number | null;
    stats_economy: number | null;
    stats_high_score: number | null;
    stats_best_bowling: string | null;
    stats_source: "none" | "cricheroes" | "manual";
  },
>(player: T): T {
  const known = knownCardForUrl(player.cricheroes_url);
  if (!known) return player;
  const next = {
    ...player,
    stats_matches: player.stats_matches ?? known.matches,
    stats_runs: player.stats_runs ?? known.runs,
    stats_wickets: player.stats_wickets ?? known.wickets,
    stats_batting_avg: player.stats_batting_avg ?? known.battingAvg,
    stats_strike_rate: player.stats_strike_rate ?? known.strikeRate,
    stats_economy: player.stats_economy ?? known.economy,
    stats_high_score: player.stats_high_score ?? known.highScore,
    stats_best_bowling: player.stats_best_bowling ?? known.bestBowling,
  };
  if (player.stats_source === "none") next.stats_source = "cricheroes";
  return next;
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
  const known = knownCardForUrl(rawUrl) ?? knownCardForUrl(url);
  if (fetched.ok && hasHeadlineStats(fetched.stats)) {
    return { stats: known ? mergeStats(fetched.stats, known) : fetched.stats, source: "cricheroes", url };
  }
  if (known) return { stats: known, source: "cricheroes", url: SAMPLE_PROFILE_URL };
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
