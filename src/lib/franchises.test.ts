import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { franchiseColorVar, franchiseIconFromSlug } from "../data/franchises.ts";

describe("franchise display from the table row", () => {
  it("maps a slug to the designed crest icon", () => {
    assert.equal(franchiseIconFromSlug("frankfurt-gorkhas"), "gorkhas");
    assert.equal(franchiseIconFromSlug("munich-yetis"), "yetis");
    assert.equal(franchiseIconFromSlug("berlin-rhinos"), "rhinos");
    assert.equal(franchiseIconFromSlug("hamburg-sherpas"), "sherpas");
    assert.equal(franchiseIconFromSlug("cologne-khukuris"), "khukuris");
    assert.equal(franchiseIconFromSlug("stuttgart-garudas"), "garudas");
  });

  it("uses the city color token already in CSS", () => {
    assert.equal(franchiseColorVar("frankfurt"), "var(--frankfurt)");
  });
});

describe("franchise seed", () => {
  it("does not overwrite admin tagline or description on setup reruns", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const setup = readFileSync(join(root, "scripts/setup.mjs"), "utf8");
    assert.equal(setup.includes("tagline = EXCLUDED.tagline"), false);
    assert.equal(setup.includes("description = EXCLUDED.description"), false);
  });

  it("seeds the six city franchises", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const setup = readFileSync(join(root, "scripts/setup.mjs"), "utf8");
    for (const name of [
      "Frankfurt Gorkhas",
      "Munich Yetis",
      "Berlin Rhinos",
      "Hamburg Sherpas",
      "Cologne Khukuris",
      "Stuttgart Garudas",
    ]) {
      assert.equal(setup.includes(name), true, name);
    }
  });
});
