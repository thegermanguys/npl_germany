import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isValidEmail,
  normalizeEmail,
  validateLogin,
  validateNewAccount,
  validateNewPassword,
  validateProfileUpdate,
  validateRegistration,
  validateResetEmail,
} from "./validate.ts";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    assert.equal(normalizeEmail("  Alex@NPL.de "), "alex@npl.de");
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    assert.equal(isValidEmail("player@nplgermany.de"), true);
  });
  it("rejects empty and bare names", () => {
    assert.equal(isValidEmail(""), false);
    assert.equal(isValidEmail("player"), false);
  });
});

describe("validateRegistration", () => {
  const valid = {
    fullName: "Asha Rai",
    email: "asha@example.com",
    password: "longenough",
    phone: "+49 151 0000000",
    city: "Berlin",
    playingRole: "All-rounder",
    experience: "Deuce-ball league experience",
    nepaliCitizen: true,
    germanyLegalResident: true,
    cricheroesUrl: "https://chshare.link/player/gwWBUh",
  };

  it("accepts a short complete signup", () => {
    const result = validateRegistration(valid);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.email, "asha@example.com");
  });

  it("rejects missing contact and short passwords", () => {
    const result = validateRegistration({ ...valid, phone: "", password: "short" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.phone);
      assert.ok(result.errors.password);
    }
  });

  it("rejects unknown roles and cities", () => {
    const result = validateRegistration({ ...valid, city: "Notacity", playingRole: "Captain" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.city);
      assert.ok(result.errors.playingRole);
    }
  });

  it("accepts any German city from the typeahead list", () => {
    const result = validateRegistration({ ...valid, city: "Leipzig" });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.city, "Leipzig");
  });

  it("accepts a CricHeroes link pasted with the matches tab and extra words", () => {
    const result = validateRegistration({
      ...valid,
      cricheroesUrl: "Profile: http://cricheroes.com/player-profile/30460515/Sagar-Basnet/matches",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.cricheroesUrl, "https://cricheroes.com/player-profile/30460515/Sagar-Basnet");
    }
  });

  it("rejects missing eligibility and a bad CricHeroes URL", () => {
    const result = validateRegistration({
      ...valid,
      nepaliCitizen: false,
      germanyLegalResident: false,
      cricheroesUrl: "https://example.com/me",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.nepaliCitizen);
      assert.ok(result.errors.germanyLegalResident);
      assert.ok(result.errors.cricheroesUrl);
    }
  });
});

describe("validateLogin", () => {
  it("normalizes email", () => {
    const result = validateLogin({ email: "Owner@NPL.de", password: "secret" });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.email, "owner@npl.de");
  });
});

describe("validateResetEmail", () => {
  it("accepts a normal address", () => {
    const result = validateResetEmail("  Asha@Example.com ");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.email, "asha@example.com");
  });
  it("rejects a bare name", () => {
    const result = validateResetEmail("player");
    assert.equal(result.ok, false);
  });
});

describe("validateNewPassword", () => {
  it("requires eight characters and a match", () => {
    const short = validateNewPassword("short", "short");
    assert.equal(short.ok, false);
    const mismatch = validateNewPassword("longenough", "different1");
    assert.equal(mismatch.ok, false);
    const ok = validateNewPassword("longenough", "longenough");
    assert.equal(ok.ok, true);
  });
});

describe("validateProfileUpdate", () => {
  it("allows optional batting and bowling blanks", () => {
    const result = validateProfileUpdate({
      fullName: "Asha Rai",
      phone: "0151",
      city: "Munich",
      playingRole: "Batter",
      experience: "Played club cricket in Nepal",
      battingHand: "",
      bowlingStyle: "",
      nepaliCitizen: true,
      germanyLegalResident: true,
      cricheroesUrl: "https://cricheroes.com/player-profile/9279138/Awanish",
    });
    assert.equal(result.ok, true);
  });
});

describe("validateNewAccount", () => {
  it("requires a franchise for owners", () => {
    const result = validateNewAccount({
      displayName: "Owner One",
      email: "owner@example.com",
      password: "longenough",
      role: "franchise_owner",
      franchiseId: "",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.franchiseId);
  });

  it("blocks creating another admin here", () => {
    const result = validateNewAccount({
      displayName: "Other Admin",
      email: "a@example.com",
      password: "longenough",
      role: "admin",
      franchiseId: "",
    });
    assert.equal(result.ok, false);
  });
});
