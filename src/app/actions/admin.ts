"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { DbNotConfiguredError } from "@/lib/db";
import { resolvePlayerStats, statsFromForm } from "@/lib/cricheroes";
import {
  assignFranchiseOwner,
  createPlayerProfile,
  createUser,
  getCurrentSeason,
  getProfileById,
  getFranchise,
  getUserByEmail,
  getUserById,
  invalidateUserResetTokens,
  setEligibility,
  updateFranchise,
  updatePlayerProfile,
  updateSeason,
  updateUserPassword,
} from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";
import {
  checkboxOn,
  isEligibilityStatus,
  isSeasonStatus,
  validateNewAccount,
  validateNewPassword,
  validateProfileUpdate,
} from "@/lib/validate";
import type { ActionState } from "./auth";

async function requireAdmin(): Promise<ActionState | null> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Admin only." };
  return null;
}

export async function createAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = validateNewAccount({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? ""),
    franchiseId: String(formData.get("franchiseId") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const existing = await getUserByEmail(parsed.value.email);
    if (existing) return { fieldErrors: { email: "That email is already registered." } };
    const user = await createUser({
      email: parsed.value.email,
      passwordHash: bcrypt.hashSync(parsed.value.password, 10),
      role: parsed.value.role,
      displayName: parsed.value.displayName,
    });
    if (parsed.value.role === "franchise_owner") {
      await assignFranchiseOwner(user.id, parsed.value.franchiseId);
    }
    if (parsed.value.role === "player") {
      const season = await getCurrentSeason();
      if (!season) return { error: "Season 1 is not set up yet." };
      await createPlayerProfile({
        userId: user.id,
        seasonId: season.id,
        fullName: parsed.value.displayName,
        phone: "—",
        city: "Other city",
        playingRole: "All-rounder",
        experience: "New to organised cricket",
        nepaliCitizen: false,
        germanyLegalResident: false,
      });
    }
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    console.error(error);
    return { error: "Could not create the account." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return {};
}

export async function adminUpdatePlayer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const profileId = String(formData.get("profileId") ?? "");
  const parsed = validateProfileUpdate({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    playingRole: String(formData.get("playingRole") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    battingHand: String(formData.get("battingHand") ?? ""),
    bowlingStyle: String(formData.get("bowlingStyle") ?? ""),
    nepaliCitizen: checkboxOn(formData.get("nepaliCitizen")),
    germanyLegalResident: checkboxOn(formData.get("germanyLegalResident")),
    cricheroesUrl: String(formData.get("cricheroesUrl") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  const franchiseId = String(formData.get("franchiseId") ?? "").trim();

  try {
    const profile = await getProfileById(profileId);
    if (!profile) return { error: "Player not found." };
    const resolved = await resolvePlayerStats(parsed.value.cricheroesUrl, statsFromForm(formData));
    await updatePlayerProfile(profile.id, {
      fullName: parsed.value.fullName,
      phone: parsed.value.phone,
      city: parsed.value.city,
      playingRole: parsed.value.playingRole,
      experience: parsed.value.experience,
      battingHand: parsed.value.battingHand || null,
      bowlingStyle: parsed.value.bowlingStyle || null,
      franchiseId: franchiseId || null,
      nepaliCitizen: true,
      germanyLegalResident: true,
      cricheroesUrl: resolved.url,
      stats: resolved.stats,
      statsSource: resolved.source,
    });
    revalidatePath("/admin");
    revalidatePath("/players");
    revalidatePath(`/players/${profile.id}`);
    return resolved.stats ? { stats: resolved.stats } : {};
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    console.error(error);
    return { error: "Could not update the player." };
  }
}

export async function adminUpdateFranchise(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = String(formData.get("franchiseId") ?? "");
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const purseTotal = Number(formData.get("purseTotal"));
  if (!id || !tagline || !description) return { error: "Tagline and description are required." };
  if (!Number.isInteger(purseTotal) || purseTotal < 0) return { error: "Purse cap must be a whole euro amount." };

  try {
    const franchise = await getFranchise(id);
    await updateFranchise(id, { tagline, description, purseTotal });
    if (franchise) revalidatePath(`/franchises/${franchise.city.toLowerCase()}`);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not save the franchise." };
  }

  revalidatePath("/");
  revalidatePath("/admin/franchises");
  revalidatePath("/franchises");
  return {};
}

export async function adminUpdateSeason(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = String(formData.get("seasonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const year = Number(formData.get("year"));
  const status = String(formData.get("status") ?? "");
  if (!id || !name || !Number.isInteger(year) || !isSeasonStatus(status)) {
    return { error: "Check the season fields." };
  }

  try {
    await updateSeason(id, { name, year, status });
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not save the season." };
  }

  revalidatePath("/");
  revalidatePath("/admin/season");
  return {};
}

export async function adminSetEligibility(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const profileId = String(formData.get("profileId") ?? "");
  const status = String(formData.get("eligibilityStatus") ?? "");
  if (!profileId || !isEligibilityStatus(status) || status === "pending") {
    return { error: "Choose confirm or reject." };
  }

  try {
    const profile = await getProfileById(profileId);
    if (!profile) return { error: "Player not found." };
    await setEligibility(profile.id, status);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not update eligibility." };
  }

  revalidatePath("/players");
  revalidatePath(`/players/${profileId}`);
  revalidatePath("/admin");
  return {};
}

export async function adminSetPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const userId = String(formData.get("userId") ?? "");
  const parsed = validateNewPassword(
    String(formData.get("password") ?? ""),
    String(formData.get("password") ?? ""),
  );
  if (!userId) return { error: "Missing account." };
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const user = await getUserById(userId);
    if (!user) return { error: "Account not found." };
    await updateUserPassword(user.id, bcrypt.hashSync(parsed.password, 10));
    await invalidateUserResetTokens(user.id);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    console.error(error);
    return { error: "Could not update the password." };
  }

  revalidatePath("/admin/users");
  return { notice: "Password updated." };
}
