import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GERMAN_CITIES,
  isGermanCity,
  normalizeGermanCity,
  suggestGermanCities,
} from "./german-cities.ts";

describe("German cities list", () => {
  it("is the full Städte set, not the six franchise cities", () => {
    assert.ok(GERMAN_CITIES.length > 2000);
    assert.equal(isGermanCity("Leipzig"), true);
    assert.equal(isGermanCity("Aach"), true);
    assert.equal(isGermanCity("Other city"), false);
  });

  it("normalizes English and umlaut spellings to official names", () => {
    assert.equal(normalizeGermanCity("munich"), "München");
    assert.equal(normalizeGermanCity("Koeln"), "Köln");
    assert.equal(normalizeGermanCity("Frankfurt"), "Frankfurt am Main");
  });

  it("suggests matches after a few letters", () => {
    const hits = suggestGermanCities("lei");
    assert.ok(hits.includes("Leipzig"));
    assert.ok(hits.length > 0 && hits.length <= 10);
    assert.deepEqual(suggestGermanCities("l"), []);
  });
});
