import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { LEAGUE_LOGO_SRC, SITE_ORIGIN } from "./brand.ts";

describe("league brand assets", () => {
  it("points at the designed crest", () => {
    assert.equal(LEAGUE_LOGO_SRC, "/images/npl-germany-logo.png");
    assert.equal(SITE_ORIGIN, "https://nplgermany.thegermanguy.org");
  });

  it("ships the crest, favicon, apple-touch, and OG files", () => {
    for (const file of [
      "public/images/npl-germany-logo.png",
      "public/favicon.ico",
      "public/icon.png",
      "public/apple-touch-icon.png",
      "public/og-image.png",
      "src/app/icon.png",
      "src/app/apple-icon.png",
    ]) {
      assert.equal(existsSync(join(process.cwd(), file)), true, file);
    }
  });
});
