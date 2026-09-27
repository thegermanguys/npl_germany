import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SAMPLE_PROFILE_URL,
  SAMPLE_SHARE_URL,
  isCricHeroesUrl,
  normalizeCricHeroesUrl,
  parseCricHeroesStats,
  parseShareTarget,
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
