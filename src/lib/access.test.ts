import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LEAGUE_ADMIN_EMAIL } from "./admin-account.ts";
import {
  MAX_FRANCHISE_STAFF,
  canChangeAccount,
  canInviteLeagueAdmin,
  canManageClubStaff,
  canOpenIdentityDocuments,
  canOpenOwnerDesk,
  canRemoveLeagueAdmin,
  canSellPlayers,
  forbiddenForClub,
  forbiddenForPath,
  homeForRole,
  isAllowedAdmin,
  isAllowedOwner,
  isLeagueSuperAdmin,
  roleLabel,
  staffSlotOpen,
} from "./access.ts";

const superAdmin = { userId: "sa", email: LEAGUE_ADMIN_EMAIL, role: "admin" as const };
const leagueAdmin = { userId: "la", email: "desk@npl.de", role: "admin" as const };

describe("roles", () => {
  it("treats only admin as admin, and only franchise_owner as owner", () => {
    assert.equal(isAllowedAdmin("admin"), true);
    assert.equal(isAllowedAdmin("player"), false);
    assert.equal(isAllowedAdmin("franchise_owner"), false);
    assert.equal(isAllowedAdmin("franchise_staff"), false);
    assert.equal(isAllowedAdmin(null), false);
    assert.equal(isAllowedOwner("franchise_owner"), true);
    assert.equal(isAllowedOwner("franchise_staff"), false);
    assert.equal(isAllowedOwner("admin"), false);
    assert.equal(isAllowedOwner("player"), false);
  });

  it("lets franchise staff open the owner desk without managing staff", () => {
    assert.equal(canOpenOwnerDesk("franchise_staff"), true);
    assert.equal(canOpenOwnerDesk("franchise_owner"), true);
    assert.equal(canOpenOwnerDesk("admin"), false);
    assert.equal(canManageClubStaff("franchise_owner"), true);
    assert.equal(canManageClubStaff("franchise_staff"), false);
  });
});

describe("league super admin", () => {
  it("is only the seeded league account", () => {
    assert.equal(isLeagueSuperAdmin(superAdmin), true);
    assert.equal(isLeagueSuperAdmin({ ...superAdmin, email: LEAGUE_ADMIN_EMAIL.toUpperCase() }), true);
    assert.equal(isLeagueSuperAdmin(leagueAdmin), false);
    assert.equal(isLeagueSuperAdmin({ email: LEAGUE_ADMIN_EMAIL, role: "player" }), false);
    assert.equal(isLeagueSuperAdmin(null), false);
  });

  it("lets only that account invite or remove league admins", () => {
    assert.equal(canInviteLeagueAdmin(superAdmin), true);
    assert.equal(canInviteLeagueAdmin(leagueAdmin), false);
    assert.equal(canRemoveLeagueAdmin(superAdmin, leagueAdmin), true);
    assert.equal(canRemoveLeagueAdmin(leagueAdmin, leagueAdmin), false);
    assert.equal(canRemoveLeagueAdmin(superAdmin, superAdmin), false);
    assert.equal(canRemoveLeagueAdmin(superAdmin, { email: "p@npl.de", role: "player" }), false);
  });

  it("does not let a league admin change the super admin", () => {
    assert.equal(canChangeAccount(leagueAdmin, superAdmin), false);
    assert.equal(canChangeAccount(superAdmin, leagueAdmin), true);
    assert.equal(canChangeAccount(superAdmin, superAdmin), true);
    assert.equal(canChangeAccount(leagueAdmin, { email: "p@npl.de", role: "player" }), true);
    assert.equal(roleLabel(superAdmin), "League super admin");
    assert.equal(roleLabel(leagueAdmin), "League admin");
  });
});

describe("franchise staff limits", () => {
  it("stops a club at two staff", () => {
    assert.equal(MAX_FRANCHISE_STAFF, 2);
    assert.equal(staffSlotOpen(0), true);
    assert.equal(staffSlotOpen(1), true);
    assert.equal(staffSlotOpen(2), false);
  });

  it("blocks staff from selling players and from identity documents", () => {
    assert.equal(canSellPlayers("admin"), true);
    assert.equal(canSellPlayers("franchise_owner"), false);
    assert.equal(canSellPlayers("franchise_staff"), false);
    assert.equal(canSellPlayers("player"), false);
    assert.equal(canOpenIdentityDocuments("franchise_staff"), false);
    assert.equal(canOpenIdentityDocuments("franchise_owner"), true);
    assert.equal(canOpenIdentityDocuments("admin"), true);
    assert.equal(canOpenIdentityDocuments("player"), true);
  });

  it("403s a club desk that is not their own", () => {
    assert.equal(
      forbiddenForClub({ role: "franchise_staff", ownFranchiseId: "a", requestedFranchiseId: "b" }),
      true,
    );
    assert.equal(
      forbiddenForClub({ role: "franchise_owner", ownFranchiseId: "a", requestedFranchiseId: "a" }),
      false,
    );
    assert.equal(
      forbiddenForClub({ role: "franchise_staff", ownFranchiseId: null, requestedFranchiseId: "b" }),
      true,
    );
    assert.equal(
      forbiddenForClub({ role: "player", ownFranchiseId: "a", requestedFranchiseId: "a" }),
      true,
    );
  });
});

describe("forbiddenForPath", () => {
  it("403s /admin for anyone who is not an admin", () => {
    assert.equal(forbiddenForPath("/admin", "admin"), false);
    assert.equal(forbiddenForPath("/admin/franchises", "admin"), false);
    assert.equal(forbiddenForPath("/admin", "player"), true);
    assert.equal(forbiddenForPath("/admin/users", "franchise_owner"), true);
    assert.equal(forbiddenForPath("/admin", "franchise_staff"), true);
    assert.equal(forbiddenForPath("/admin", null), true);
  });

  it("403s /owner unless the account is that club's owner or staff", () => {
    assert.equal(forbiddenForPath("/owner", "franchise_owner"), false);
    assert.equal(forbiddenForPath("/owner/squad", "franchise_owner"), false);
    assert.equal(forbiddenForPath("/owner", "franchise_staff"), false);
    assert.equal(forbiddenForPath("/owner/club/other", "franchise_staff"), false);
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

  it("sends owners and staff to the club desk", () => {
    assert.equal(homeForRole("admin"), "/admin");
    assert.equal(homeForRole("franchise_owner"), "/owner");
    assert.equal(homeForRole("franchise_staff"), "/owner");
    assert.equal(homeForRole("player"), "/account");
  });
});
