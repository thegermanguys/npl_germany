import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  fixtureDateKey,
  fixtureMatchesFilter,
  fixtureStatusLabel,
  formatFixtureTime,
  groupFixturesByDate,
  isFixtureStatus,
  parseDatetimeLocal,
  toDatetimeLocalValue,
} from "./fixtures.ts";
import type { FixtureRow } from "./types.ts";

describe("fixture status", () => {
  it("accepts the four match states", () => {
    assert.equal(isFixtureStatus("scheduled"), true);
    assert.equal(isFixtureStatus("live"), true);
    assert.equal(isFixtureStatus("scorecard"), false);
  });

  it("labels quietly", () => {
    assert.equal(fixtureStatusLabel("scheduled"), "Scheduled");
    assert.equal(fixtureStatusLabel("abandoned"), "Abandoned");
  });
});

describe("Berlin datetime-local", () => {
  it("stores a July 14:00 kickoff as CEST", () => {
    const date = parseDatetimeLocal("2026-07-11T14:00");
    assert.ok(date);
    assert.equal(date.toISOString(), "2026-07-11T12:00:00.000Z");
    assert.equal(toDatetimeLocalValue(date.toISOString()), "2026-07-11T14:00");
    assert.equal(formatFixtureTime(date.toISOString()), "14:00");
  });

  it("stores a January 14:00 kickoff as CET", () => {
    const date = parseDatetimeLocal("2026-01-10T14:00");
    assert.ok(date);
    assert.equal(date.toISOString(), "2026-01-10T13:00:00.000Z");
  });

  it("rejects an empty or partial value", () => {
    assert.equal(parseDatetimeLocal(""), null);
    assert.equal(parseDatetimeLocal("2026-07-11"), null);
  });
});

function sample(partial: Partial<FixtureRow> & Pick<FixtureRow, "id" | "scheduled_at" | "city">): FixtureRow {
  return {
    season: "Season 1",
    franchise_a_id: "a",
    franchise_b_id: "b",
    ground_name: "Ground",
    status: "scheduled",
    result_summary: null,
    winner_franchise_id: null,
    created_at: "",
    updated_at: "",
    a_name: "Frankfurt Gorkhas",
    a_short: "Gorkhas",
    a_city: "Frankfurt",
    a_color: "frankfurt",
    b_name: "Munich Yetis",
    b_short: "Yetis",
    b_city: "Munich",
    b_color: "munich",
    winner_name: null,
    ...partial,
  };
}

describe("groupFixturesByDate", () => {
  it("groups by the Berlin calendar day", () => {
    const rows = [
      sample({ id: "1", scheduled_at: "2026-07-11T12:00:00.000Z", city: "Frankfurt" }),
      sample({ id: "2", scheduled_at: "2026-07-11T16:00:00.000Z", city: "Munich" }),
      sample({ id: "3", scheduled_at: "2026-07-12T12:00:00.000Z", city: "Berlin" }),
    ];
    const groups = groupFixturesByDate(rows);
    assert.equal(groups.length, 2);
    assert.equal(groups[0].dateKey, fixtureDateKey(rows[0].scheduled_at));
    assert.equal(groups[0].fixtures.length, 2);
    assert.equal(groups[1].fixtures[0].id, "3");
  });
});

describe("fixtureMatchesFilter", () => {
  it("filters by franchise or ground city", () => {
    const row = sample({
      id: "1",
      scheduled_at: "2026-07-11T12:00:00.000Z",
      city: "Frankfurt",
      franchise_a_id: "gorkhas",
      franchise_b_id: "yetis",
    });
    assert.equal(fixtureMatchesFilter(row, "All", "All"), true);
    assert.equal(fixtureMatchesFilter(row, "gorkhas", "All"), true);
    assert.equal(fixtureMatchesFilter(row, "rhinos", "All"), false);
    assert.equal(fixtureMatchesFilter(row, "All", "Frankfurt"), true);
    assert.equal(fixtureMatchesFilter(row, "All", "Berlin"), false);
  });
});
