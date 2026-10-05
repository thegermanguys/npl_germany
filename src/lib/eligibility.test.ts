import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { playersForViewer } from "./eligibility.ts";
import type { PlayerListItem, Role, SessionUser } from "./types.ts";

function player(overrides: Partial<PlayerListItem>): PlayerListItem {
  return {
    id: "p1",
    user_id: "u1",
    season_id: "s1",
    full_name: "Test Player",
    phone: "+49 000 0000",
    city: "Berlin",
    playing_role: "Batter",
    experience: "Deuce-ball league experience",
    batting_hand: null,
    bowling_style: null,
    franchise_id: null,
    nepali_citizen: true,
    germany_legal_resident: true,
    eligibility_status: "confirmed",
    eligibility_reviewed_at: null,
    cricheroes_url: null,
    stats_source: "none",
    stats_matches: null,
    stats_runs: null,
    stats_wickets: null,
    stats_batting_avg: null,
    stats_strike_rate: null,
    stats_economy: null,
    stats_high_score: null,
    stats_best_bowling: null,
    stats_fetched_at: null,
    photo_id: null,
    auction_status: "approved",
    base_price: null,
    sold_to_franchise_id: null,
    sold_price: null,
    auction_order: null,
    created_at: "",
    updated_at: "",
    email: "player@example.com",
    franchise_name: null,
    franchise_color: null,
    ...overrides,
  };
}

function viewer(role: Role): SessionUser {
  return { userId: "viewer", email: "viewer@example.com", role, displayName: "Viewer" };
}

describe("playersForViewer contact fields", () => {
  const roster = [player({}), player({ id: "p2", eligibility_status: "pending" })];

  it("strips phone and email for the public and for players", () => {
    for (const user of [null, viewer("player")]) {
      const visible = playersForViewer(roster, user);
      assert.equal(visible.length, 1);
      assert.equal(visible[0].phone, null);
      assert.equal(visible[0].email, "");
      assert.equal(JSON.stringify(visible).includes("player@example.com"), false);
      assert.equal(JSON.stringify(visible).includes("+49 000 0000"), false);
    }
  });

  it("keeps contact for franchise owners and admins", () => {
    const owner = playersForViewer(roster, viewer("franchise_owner"));
    assert.equal(owner.length, 1);
    assert.equal(owner[0].email, "player@example.com");
    const admin = playersForViewer(roster, viewer("admin"));
    assert.equal(admin.length, 2);
    assert.equal(admin[0].phone, "+49 000 0000");
  });
});
