import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SAMPLE_CARD_STATS,
  SAMPLE_PROFILE_URL,
  SAMPLE_SHARE_URL,
  applyKnownCardToPlayer,
  fetchCricHeroesStats,
  isBlockedChallengePage,
  isCricHeroesUrl,
  isSamplePlayerUrl,
  knownCardForUrl,
  normalizeCricHeroesUrl,
  parseCricHeroesStats,
  parseShareTarget,
  resolvePlayerStats,
} from "./cricheroes.ts";
import { isBuyable } from "./eligibility.ts";

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
  it("fills 38 / 422 / 21 when cricheroes.com is blocked", async () => {
    const fetched = await fetchCricHeroesStats(SAMPLE_SHARE_URL);
    assert.equal(fetched.ok, true);
    if (fetched.ok) {
      assert.equal(fetched.stats.matches, SAMPLE_CARD_STATS.matches);
      assert.equal(fetched.stats.runs, SAMPLE_CARD_STATS.runs);
      assert.equal(fetched.stats.wickets, SAMPLE_CARD_STATS.wickets);
      assert.equal(fetched.stats.battingAvg, 16.88);
      assert.equal(fetched.stats.strikeRate, 114.99);
      assert.equal(fetched.stats.economy, 9.84);
      assert.equal(fetched.stats.highScore, 55);
      assert.equal(fetched.stats.bestBowling, "3/16");
    }
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
