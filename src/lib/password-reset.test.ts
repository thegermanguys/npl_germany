import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hashResetToken,
  inviteEmailText,
  inviteExpiresAt,
  INVITE_TTL_MS,
  isMailerConfigured,
  RESET_NOTICE,
  resetExpiresAt,
  RESET_TTL_MS,
  resetUrl,
  siteOrigin,
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

  it("keeps an invite link for seven days and says so in the email", () => {
    const now = Date.parse("2026-09-28T08:00:00.000Z");
    assert.equal(inviteExpiresAt(now).getTime(), now + INVITE_TTL_MS);
    assert.equal(INVITE_TTL_MS, 7 * 24 * 60 * 60 * 1000);
    assert.notEqual(INVITE_TTL_MS, RESET_TTL_MS);
    const text = inviteEmailText("https://nplgermany.thegermanguy.org/login/reset?token=abc");
    assert.equal(text.includes("seven days"), true);
    assert.equal(text.includes("one hour"), false);
    assert.equal(text.includes("/login/reset?token=abc"), true);
  });

  it("uses SITE_URL for mail links when it is set", () => {
    const headers = {
      get(name: string) {
        if (name === "host") return "localhost:3000";
        return null;
      },
    };
    assert.equal(siteOrigin(headers, "https://nplgermany.thegermanguy.org/"), "https://nplgermany.thegermanguy.org");
    assert.equal(siteOrigin(headers, "  "), "http://localhost:3000");
  });

  it("does not treat missing Resend env as a configured mailer", () => {
    assert.equal(isMailerConfigured(), Boolean(process.env.RESEND_API_KEY && process.env.RESET_FROM_EMAIL));
    assert.equal(RESET_NOTICE.includes("If that email is on the league"), true);
  });
});
