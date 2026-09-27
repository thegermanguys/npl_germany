import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isValidEmail,
  normalizeEmail,
  validateLogin,
  validateNewAccount,
  validateProfileUpdate,
  validateRegistration,
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
    const result = validateRegistration({ ...valid, city: "Leipzig", playingRole: "Captain" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.city);
      assert.ok(result.errors.playingRole);
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
