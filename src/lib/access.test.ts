import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { forbiddenForPath, isAllowedAdmin, isAllowedOwner } from "./access.ts";

describe("roles", () => {
  it("treats only admin as admin, and only franchise_owner as owner", () => {
    assert.equal(isAllowedAdmin("admin"), true);
    assert.equal(isAllowedAdmin("player"), false);
    assert.equal(isAllowedAdmin("franchise_owner"), false);
    assert.equal(isAllowedAdmin(null), false);
    assert.equal(isAllowedOwner("franchise_owner"), true);
    assert.equal(isAllowedOwner("admin"), false);
    assert.equal(isAllowedOwner("player"), false);
  });
});

describe("forbiddenForPath", () => {
  it("403s /admin for anyone who is not an admin", () => {
    assert.equal(forbiddenForPath("/admin", "admin"), false);
    assert.equal(forbiddenForPath("/admin/franchises", "admin"), false);
    assert.equal(forbiddenForPath("/admin", "player"), true);
    assert.equal(forbiddenForPath("/admin/users", "franchise_owner"), true);
    assert.equal(forbiddenForPath("/admin", null), true);
  });

  it("403s /owner for anyone who is not a franchise owner", () => {
    assert.equal(forbiddenForPath("/owner", "franchise_owner"), false);
    assert.equal(forbiddenForPath("/owner/squad", "franchise_owner"), false);
    assert.equal(forbiddenForPath("/owner", "admin"), true);
    assert.equal(forbiddenForPath("/owner", "player"), true);
    assert.equal(forbiddenForPath("/owner", null), true);
  });

  it("leaves public routes alone", () => {
    assert.equal(forbiddenForPath("/", null), false);
    assert.equal(forbiddenForPath("/register", "player"), false);
    assert.equal(forbiddenForPath("/login", null), false);
    assert.equal(forbiddenForPath("/players", "player"), false);
  });
});
