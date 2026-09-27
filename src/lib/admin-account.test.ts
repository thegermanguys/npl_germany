import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isUsablePasswordHash, LEAGUE_ADMIN_EMAIL, UNSET_PASSWORD_HASH } from "./admin-account.ts";

describe("league admin account", () => {
  it("uses the official admin email", () => {
    assert.equal(LEAGUE_ADMIN_EMAIL, "nplgermany.admin@thegermanguy.org");
  });
  it("does not treat an unset placeholder as a password", () => {
    assert.equal(isUsablePasswordHash(UNSET_PASSWORD_HASH), false);
    assert.equal(isUsablePasswordHash(""), false);
    assert.equal(isUsablePasswordHash("$2b$10$abcdefghijklmnopqrstuv"), true);
  });
});
