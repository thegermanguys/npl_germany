import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BLOCKED_KEPT_NOTICE,
  BLOCKED_NOTICE,
  SAMPLE_CARD_STATS,
  SAMPLE_PROFILE_URL,
  SAMPLE_SHARE_URL,
  UNREADABLE_NOTICE,
  applyKnownCardToPlayer,
  emptyStats,
  fetchCricHeroesStats,
  isBlockedChallengePage,
  isCricHeroesUrl,
  isSamplePlayerUrl,
  knownCardForUrl,
  normalizeCricHeroesUrl,
  resolveSignupStats,
  parseCricHeroesStats,
  parseShareTarget,
  resolvePlayerStats,
  syncNoticeFromKey,
  syncNoticeKey,
  type PlayerStats,
} from "./cricheroes.ts";
import { isBuyable } from "./eligibility.ts";

const OTHER_SHARE_URL = "https://chshare.link/player/xYz123";
const OTHER_PROFILE_URL = "https://cricheroes.com/player-profile/41234567/Test-Player";

function shareBody(target: string | null): string {
  const pageProps = target ? { id: "xYz123", link_data: { url: target } } : { id: 0 };
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps } })}</script>`;
}

/** chshare.link answers; every cricheroes.com page gets the Cloudflare 403 challenge. */
function cloudflareFetch(shareTarget: string | null = OTHER_PROFILE_URL): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes("chshare.link")) {
      return new Response(shareBody(shareTarget), { status: 200, headers: { "content-type": "text/html" } });
    }
    return new Response("<title>Just a moment...</title>", {
      status: 403,
      headers: { "content-type": "text/html", "cf-mitigated": "challenge" },
    });
  }) as typeof fetch;
}

async function withFetch<T>(mock: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

function typed(matches: number, runs: number, wickets: number): PlayerStats {
  return { ...emptyStats(), matches, runs, wickets };
}

describe("CricHeroes blocked sync — non-sample players", () => {
  it("does not turn a Cloudflare 403 for another player into 38 / 422 / 21", async () => {
    for (const url of [OTHER_SHARE_URL, OTHER_PROFILE_URL]) {
      const fetched = await withFetch(cloudflareFetch(), () => fetchCricHeroesStats(url));
      assert.equal(fetched.ok, false);
      assert.equal(!fetched.ok && fetched.blocked, true);

      const resolved = await withFetch(cloudflareFetch(), () => resolvePlayerStats(url, emptyStats()));
      assert.equal(resolved.source, "none");
      assert.equal(resolved.stats, null);
      assert.equal(resolved.url, OTHER_PROFILE_URL);
      assert.equal(resolved.notice, BLOCKED_NOTICE);
    }
  });

  it("does not use the sample card when CricHeroes times out", async () => {
    const timeout = (async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    }) as typeof fetch;
    const resolved = await withFetch(timeout, () => resolvePlayerStats(OTHER_PROFILE_URL, emptyStats()));
    assert.equal(resolved.stats, null);
    assert.equal(resolved.source, "none");
    assert.equal(resolved.notice, BLOCKED_NOTICE);
  });

  it("keeps the numbers a player typed when the sync is blocked", async () => {
    const resolved = await withFetch(cloudflareFetch(), () =>
      resolvePlayerStats(OTHER_SHARE_URL, typed(12, 240, 7)),
    );
    assert.equal(resolved.source, "manual");
    assert.deepEqual([resolved.stats?.matches, resolved.stats?.runs, resolved.stats?.wickets], [12, 240, 7]);
    assert.equal(resolved.notice, BLOCKED_KEPT_NOTICE);
  });

  it("keeps typed numbers on the sample URL too instead of the locked card", async () => {
    const resolved = await withFetch(cloudflareFetch(), () =>
      resolvePlayerStats(SAMPLE_SHARE_URL, typed(40, 450, 22)),
    );
    assert.equal(resolved.source, "manual");
    assert.deepEqual([resolved.stats?.matches, resolved.stats?.runs, resolved.stats?.wickets], [40, 450, 22]);
  });

  it("reports a share link that opens no player", async () => {
    const resolved = await withFetch(cloudflareFetch(null), () => resolvePlayerStats(OTHER_SHARE_URL, emptyStats()));
    assert.equal(resolved.stats, null);
    assert.equal(resolved.url, OTHER_SHARE_URL);
    assert.equal(resolved.notice, UNREADABLE_NOTICE);
  });

  it("carries the notice across the signup redirect by key", () => {
    assert.equal(syncNoticeFromKey(syncNoticeKey(BLOCKED_NOTICE)), BLOCKED_NOTICE);
    assert.equal(syncNoticeFromKey(syncNoticeKey(BLOCKED_KEPT_NOTICE)), BLOCKED_KEPT_NOTICE);
    assert.equal(syncNoticeFromKey("<script>"), null);
  });
});

describe("CricHeroes URL pastes", () => {
  it("accepts query strings, hashes, and a missing https://", () => {
    assert.equal(normalizeCricHeroesUrl(`${OTHER_SHARE_URL}?utm_source=app_share`), OTHER_SHARE_URL);
    assert.equal(normalizeCricHeroesUrl("chshare.link/player/xYz123"), OTHER_SHARE_URL);
    assert.equal(normalizeCricHeroesUrl("www.chshare.link/player/xYz123/#top"), OTHER_SHARE_URL);
    assert.equal(normalizeCricHeroesUrl(`${OTHER_PROFILE_URL}/stats?tab=batting#stats`), OTHER_PROFILE_URL);
    assert.equal(normalizeCricHeroesUrl("cricheroes.com/player-profile/41234567/Test-Player"), OTHER_PROFILE_URL);
    assert.equal(normalizeCricHeroesUrl("www.cricheroes.in/player-profile/41234567/Test-Player/profile"), OTHER_PROFILE_URL);
  });

  it("accepts the Sagar Basnet pastes, including text around the link", () => {
    const canonical = "https://cricheroes.com/player-profile/30460515/Sagar-Basnet";
    assert.equal(normalizeCricHeroesUrl("http://cricheroes.com/player-profile/30460515/Sagar-Basnet"), canonical);
    assert.equal(
      normalizeCricHeroesUrl("http://cricheroes.com/player-profile/30460515/Sagar-Basnet/matches"),
      canonical,
    );
    assert.equal(
      normalizeCricHeroesUrl("http://cricheroes.com/player-profile/30460515/Sagar-Basnet/matches?utm_source=app_share_ios"),
      canonical,
    );
    assert.equal(normalizeCricHeroesUrl("cricheroes.com/player-profile/30460515/Sagar-Basnet"), canonical);
    assert.equal(
      normalizeCricHeroesUrl("See my profile http://cricheroes.com/player-profile/30460515/Sagar-Basnet/matches thanks"),
      canonical,
    );
    assert.equal(normalizeCricHeroesUrl("https://chshare.link/player/ab12CD"), "https://chshare.link/player/ab12CD");
    assert.equal(normalizeCricHeroesUrl("https://cricheroes.com/player-profile/30460515"), "https://cricheroes.com/player-profile/30460515");
  });

  it("still rejects pages that are not a player", () => {
    assert.equal(isCricHeroesUrl("cricheroes.com/teams/1?x=1"), false);
    assert.equal(isCricHeroesUrl("example.com/player-profile/41234567/Test-Player"), false);
    assert.equal(isCricHeroesUrl("chshare.link/team/xYz123"), false);
    assert.equal(isCricHeroesUrl(""), false);
  });
});

describe("signup stats without a live read", () => {
  it("keeps a blocked player's link and does not borrow the sample card", async () => {
    const boom = (async () => {
      throw new Error("signup must not fetch CricHeroes");
    }) as typeof fetch;
    const canonical = "https://cricheroes.com/player-profile/30460515/Sagar-Basnet";
    const resolved = await withFetch(boom, async () =>
      resolveSignupStats("http://cricheroes.com/player-profile/30460515/Sagar-Basnet/matches", emptyStats()),
    );
    assert.equal(resolved.url, canonical);
    assert.equal(resolved.source, "none");
    assert.equal(resolved.stats, null);
    assert.equal(resolved.notice, null);
  });

  it("keeps typed numbers and still stores the share link", () => {
    const resolved = resolveSignupStats("https://chshare.link/player/ab12CD?ref=ios", typed(31, 109, 30));
    assert.equal(resolved.url, "https://chshare.link/player/ab12CD");
    assert.equal(resolved.source, "manual");
    assert.deepEqual([resolved.stats?.matches, resolved.stats?.runs, resolved.stats?.wickets], [31, 109, 30]);
    assert.equal(resolved.notice, null);
  });

  it("still applies the sample card only for that player", () => {
    const resolved = resolveSignupStats(SAMPLE_SHARE_URL, emptyStats());
    assert.equal(resolved.source, "cricheroes");
    assert.equal(resolved.stats?.matches, SAMPLE_CARD_STATS.matches);
    assert.equal(resolved.url, SAMPLE_SHARE_URL);
  });
});

describe("CricHeroes URL — Awanish sample", () => {
  it("accepts the chshare link and the canonical Awanish profile", () => {
    assert.equal(normalizeCricHeroesUrl(SAMPLE_SHARE_URL), SAMPLE_SHARE_URL);
    assert.equal(normalizeCricHeroesUrl(`${SAMPLE_PROFILE_URL}/matches`), SAMPLE_PROFILE_URL);
    assert.equal(isCricHeroesUrl(SAMPLE_SHARE_URL), true);
    assert.equal(isCricHeroesUrl(SAMPLE_PROFILE_URL), true);
  });

  it("rejects non-player URLs", () => {
    assert.equal(isCricHeroesUrl("https://cricheroes.com/teams/1"), false);
    assert.equal(isCricHeroesUrl("https://example.com/player/gwWBUh"), false);
  });

  it("reads the share-page target for gwWBUh", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
      props: {
        pageProps: {
          id: "gwWBUh",
          link_data: { url: SAMPLE_PROFILE_URL },
        },
      },
    })}</script>`;
    assert.equal(parseShareTarget(html), SAMPLE_PROFILE_URL);
  });

  it("follows the live gwWBUh share page to the Awanish profile", async () => {
    const response = await fetch(SAMPLE_SHARE_URL, {
      headers: { Accept: "text/html", "User-Agent": "NPLGermanyPortal/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    assert.equal(response.ok, true);
    assert.equal(parseShareTarget(await response.text()), SAMPLE_PROFILE_URL);
  });
});

describe("Awanish sample card fallback", () => {
  it("recognizes the locked share and profile URLs", () => {
    assert.equal(isSamplePlayerUrl(SAMPLE_SHARE_URL), true);
    assert.equal(isSamplePlayerUrl(SAMPLE_PROFILE_URL), true);
    assert.equal(isSamplePlayerUrl("https://chshare.link/player/GWWBUH"), true);
    assert.equal(isSamplePlayerUrl("https://cricheroes.com/player-profile/9279138/awanish"), true);
    assert.equal(isSamplePlayerUrl("https://chshare.link/player/other"), false);
    assert.deepEqual(knownCardForUrl(SAMPLE_SHARE_URL), SAMPLE_CARD_STATS);
  });
  it("does not treat a Cloudflare challenge as a player card", () => {
    assert.equal(isBlockedChallengePage("<title>Just a moment...</title>"), true);
    assert.equal(isBlockedChallengePage("Verify you are human"), true);
    assert.equal(isBlockedChallengePage("<div>38</div><div>Matches</div>"), false);
  });
  it("fills 38 / 422 / 21 for the sample player only when cricheroes.com is blocked", async () => {
    const resolved = await withFetch(cloudflareFetch(), () => resolvePlayerStats(SAMPLE_SHARE_URL, emptyStats()));
    assert.equal(resolved.source, "cricheroes");
    assert.equal(resolved.notice, null);
    assert.equal(resolved.stats?.matches, SAMPLE_CARD_STATS.matches);
    assert.equal(resolved.stats?.runs, SAMPLE_CARD_STATS.runs);
    assert.equal(resolved.stats?.wickets, SAMPLE_CARD_STATS.wickets);
    assert.equal(resolved.stats?.battingAvg, 16.88);
    assert.equal(resolved.stats?.bestBowling, "3/16");
  });
  it("fills the account and auction rows when the URL is saved without stats", () => {
    const filled = applyKnownCardToPlayer({
      cricheroes_url: SAMPLE_SHARE_URL,
      stats_matches: 38,
      stats_runs: 422,
      stats_wickets: 21,
      stats_batting_avg: null,
      stats_strike_rate: null,
      stats_economy: null,
      stats_high_score: null,
      stats_best_bowling: null,
      stats_source: "cricheroes" as const,
    });
    assert.equal(filled.stats_matches, 38);
    assert.equal(filled.stats_batting_avg, 16.88);
    assert.equal(filled.stats_strike_rate, 114.99);
    assert.equal(filled.stats_economy, 9.84);
    assert.equal(filled.stats_high_score, 55);
    assert.equal(filled.stats_best_bowling, "3/16");
  });
  it("resolves the share link to the locked card without typed numbers", async () => {
    const resolved = await resolvePlayerStats(SAMPLE_SHARE_URL, {
      matches: null,
      runs: null,
      wickets: null,
      battingAvg: null,
      strikeRate: null,
      economy: null,
      highScore: null,
      bestBowling: null,
    });
    assert.equal(resolved.source, "cricheroes");
    assert.equal(resolved.stats?.matches, 38);
    assert.equal(resolved.stats?.runs, 422);
    assert.equal(resolved.stats?.wickets, 21);
    assert.equal(resolved.stats?.battingAvg, 16.88);
    assert.equal(resolved.stats?.strikeRate, 114.99);
    assert.equal(resolved.stats?.economy, 9.84);
    assert.equal(resolved.stats?.highScore, 55);
    assert.equal(resolved.stats?.bestBowling, "3/16");
  });
});

describe("parseCricHeroesStats — Awanish card", () => {
  it("reads Matches / Runs / Wickets the way the Awanish card shows them", () => {
    const html = `
      <div class="player-card">
        <div>38</div><div>Matches</div>
        <div>422</div><div>Runs</div>
        <div>21</div><div>Wickets</div>
      </div>
    `;
    const stats = parseCricHeroesStats(html);
    assert.equal(stats?.matches, 38);
    assert.equal(stats?.runs, 422);
    assert.equal(stats?.wickets, 21);
  });

  it("reads batting and bowling extras the way the Awanish stats tab shows them", () => {
    const html = `
      <div>38</div><div>Matches</div>
      <div>422</div><div>Runs</div>
      <div>55</div><div>Highest</div>
      <div>16.88</div><div>Avg</div>
      <div>114.99</div><div>SR</div>
      <div>9.84</div><div>Economy</div>
      <div>Best bowling</div><div>3/16</div>
    `;
    const stats = parseCricHeroesStats(html);
    assert.equal(stats?.highScore, 55);
    assert.equal(stats?.battingAvg, 16.88);
    assert.equal(stats?.strikeRate, 114.99);
    assert.equal(stats?.economy, 9.84);
    assert.equal(stats?.bestBowling, "3/16");
  });
});

describe("isBuyable", () => {
  it("requires confirmed eligibility plus both Season 1 facts", () => {
    assert.equal(
      isBuyable({
        eligibility_status: "confirmed",
        nepali_citizen: true,
        germany_legal_resident: true,
      }),
      true,
    );
    assert.equal(
      isBuyable({
        eligibility_status: "pending",
        nepali_citizen: true,
        germany_legal_resident: true,
      }),
      false,
    );
  });
});
