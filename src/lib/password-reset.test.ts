import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hashResetToken,
  isMailerConfigured,
  RESET_NOTICE,
  resetExpiresAt,
  RESET_TTL_MS,
  resetUrl,
} from "./password-reset.ts";

describe("password reset", () => {
  it("hashes a token without keeping the raw value", () => {
    const hash = hashResetToken("secret-token");
    assert.equal(hash.length, 64);
    assert.equal(hash.includes("secret-token"), false);
    assert.equal(hashResetToken("secret-token"), hash);
    assert.notEqual(hashResetToken("other"), hash);
  });

  it("builds a reset URL and expires in one hour", () => {
    assert.equal(
      resetUrl("https://nplgermany.thegermanguy.org", "abc+1"),
      "https://nplgermany.thegermanguy.org/login/reset?token=abc%2B1",
    );
    const now = Date.parse("2026-09-28T08:00:00.000Z");
    assert.equal(resetExpiresAt(now).getTime(), now + RESET_TTL_MS);
  });

  it("does not treat missing Resend env as a configured mailer", () => {
    assert.equal(isMailerConfigured(), Boolean(process.env.RESEND_API_KEY && process.env.RESET_FROM_EMAIL));
    assert.equal(RESET_NOTICE.includes("If that email is on the league"), true);
  });
});
