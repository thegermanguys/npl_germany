"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  MAX_FRANCHISE_STAFF,
  canInviteLeagueAdmin,
  canManageClubStaff,
  canRemoveLeagueAdmin,
  isLeagueSuperAdmin,
  staffSlotOpen,
} from "@/lib/access";
import { LEAGUE_ADMIN_EMAIL } from "@/lib/admin-account";
import { DbNotConfiguredError } from "@/lib/db";
import {
  addFranchiseStaffMembership,
  assignFranchiseOwner,
  clearFranchiseOwner,
  countFranchiseStaff,
  createFranchise,
  createUser,
  deleteFranchise,
  deleteUser,
  franchiseForUser,
  getFranchise,
  getUserByEmail,
  getUserById,
  updateFranchiseIdentity,
  updateUserPassword,
} from "@/lib/queries";
import { getSession } from "@/lib/session";
import { franchiseSlug, validateFranchiseDraft, validateInvite } from "@/lib/validate";
import type { ActionState } from "./auth";

function refreshLeague(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/franchises");
  revalidatePath("/owner");
  revalidatePath("/");
  revalidatePath("/franchises");
}

function dbError(error: unknown, fallback: string): ActionState {
  if (error instanceof DbNotConfiguredError) return { error: "The league database is not connected yet." };
  const message = error instanceof Error ? error.message : "";
  if (/duplicate|unique/i.test(message)) return { error: "That city and name are already used." };
  console.error(error);
  return { error: fallback };
}

async function requireStaffEditor(franchiseId: string): Promise<ActionState | null> {
  const session = await getSession();
  if (!session) return { error: "Sign in required." };
  if (isLeagueSuperAdmin(session)) return null;
  if (!canManageClubStaff(session.role)) return { error: "Only the franchise owner can change staff." };
  const club = await franchiseForUser(session.userId);
  if (!club || club.id !== franchiseId) return { error: "That club is not yours." };
  return null;
}

export async function inviteLeagueAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!canInviteLeagueAdmin(session)) return { error: "Only the league super admin can invite a league admin." };

  const parsed = validateInvite({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };
  if (parsed.value.email === LEAGUE_ADMIN_EMAIL) return { fieldErrors: { email: "That email is already registered." } };

  try {
    const existing = await getUserByEmail(parsed.value.email);
    if (existing) return { fieldErrors: { email: "That email is already registered." } };
    await createUser({
      email: parsed.value.email,
      passwordHash: bcrypt.hashSync(parsed.value.password, 10),
      role: "admin",
      displayName: parsed.value.displayName,
    });
  } catch (error) {
    return dbError(error, "Could not invite that league admin.");
  }

  refreshLeague();
  return { notice: "League admin invited." };
}

export async function removeLeagueAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Missing account." };

  try {
    const target = await getUserById(userId);
    if (!target || !canRemoveLeagueAdmin(session, target)) {
      return { error: "The league super admin cannot be removed." };
    }
    await deleteUser(target.id);
  } catch (error) {
    return dbError(error, "Could not remove that league admin.");
  }

  refreshLeague();
  return {};
}

export async function setFranchiseOwnerAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!isLeagueSuperAdmin(session)) return { error: "Only the league super admin can change a franchise owner." };

  const franchiseId = String(formData.get("franchiseId") ?? "");
  const parsed = validateInvite({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!franchiseId) return { error: "Missing franchise." };
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const franchise = await getFranchise(franchiseId);
    if (!franchise) return { error: "Franchise not found." };
    const existing = await getUserByEmail(parsed.value.email);
    if (existing && existing.role !== "franchise_owner") {
      return { error: "That email cannot be a franchise owner." };
    }
    const passwordHash = bcrypt.hashSync(parsed.value.password, 10);
    const user =
      existing ??
      (await createUser({
        email: parsed.value.email,
        passwordHash,
        role: "franchise_owner",
        displayName: parsed.value.displayName,
      }));
    if (existing) {
      await updateUserPassword(existing.id, passwordHash);
    }
    await assignFranchiseOwner(user.id, franchise.id);
    revalidatePath(`/franchises/${franchise.city.toLowerCase()}`);
  } catch (error) {
    return dbError(error, "Could not set the owner.");
  }

  refreshLeague();
  return { notice: "Owner saved." };
}

export async function removeFranchiseOwner(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!isLeagueSuperAdmin(session)) return { error: "Only the league super admin can change a franchise owner." };
  const franchiseId = String(formData.get("franchiseId") ?? "");
  if (!franchiseId) return { error: "Missing franchise." };

  try {
    const franchise = await getFranchise(franchiseId);
    if (!franchise) return { error: "Franchise not found." };
    await clearFranchiseOwner(franchise.id);
    revalidatePath(`/franchises/${franchise.city.toLowerCase()}`);
  } catch (error) {
    return dbError(error, "Could not remove the owner.");
  }

  refreshLeague();
  return {};
}

export async function inviteFranchiseStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const franchiseId = String(formData.get("franchiseId") ?? "");
  if (!franchiseId) return { error: "Missing franchise." };
  const denied = await requireStaffEditor(franchiseId);
  if (denied) return denied;

  const parsed = validateInvite({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const franchise = await getFranchise(franchiseId);
    if (!franchise) return { error: "Franchise not found." };
    const current = await countFranchiseStaff(franchise.id);
    if (!staffSlotOpen(current)) return { error: "A club can have two staff." };
    const existing = await getUserByEmail(parsed.value.email);
    if (existing) return { fieldErrors: { email: "That email is already registered." } };
    const user = await createUser({
      email: parsed.value.email,
      passwordHash: bcrypt.hashSync(parsed.value.password, 10),
      role: "franchise_staff",
      displayName: parsed.value.displayName,
    });
    await addFranchiseStaffMembership(user.id, franchise.id);
    const after = await countFranchiseStaff(franchise.id);
    if (after > MAX_FRANCHISE_STAFF) {
      await deleteUser(user.id);
      return { error: "A club can have two staff." };
    }
  } catch (error) {
    return dbError(error, "Could not invite that staff member.");
  }

  refreshLeague();
  return { notice: "Staff invited." };
}

export async function removeFranchiseStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const franchiseId = String(formData.get("franchiseId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!franchiseId || !userId) return { error: "Missing staff account." };
  const denied = await requireStaffEditor(franchiseId);
  if (denied) return denied;

  try {
    const target = await getUserById(userId);
    if (!target || target.role !== "franchise_staff") return { error: "Staff account not found." };
    const club = await franchiseForUser(target.id);
    if (!club || club.id !== franchiseId) return { error: "That staff account is not on this club." };
    await deleteUser(target.id);
  } catch (error) {
    return dbError(error, "Could not remove that staff member.");
  }

  refreshLeague();
  return {};
}

export async function saveFranchiseIdentity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!isLeagueSuperAdmin(session)) return { error: "Only the league super admin can edit franchise fields." };
  const franchiseId = String(formData.get("franchiseId") ?? "");
  const city = String(formData.get("city") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = franchiseSlug(city, name);
  if (!franchiseId) return { error: "Missing franchise." };
  if (city.length < 2) return { fieldErrors: { city: "Enter a city." } };
  if (name.length < 2 || !slug) return { fieldErrors: { name: "Enter a name." } };

  try {
    const franchise = await getFranchise(franchiseId);
    if (!franchise) return { error: "Franchise not found." };
    await updateFranchiseIdentity(franchise.id, {
      city,
      name,
      fullName: `${city} ${name}`,
      slug,
    });
    revalidatePath(`/franchises/${franchise.city.toLowerCase()}`);
    revalidatePath(`/franchises/${city.toLowerCase()}`);
  } catch (error) {
    return dbError(error, "Could not save the franchise.");
  }

  refreshLeague();
  return { notice: "Franchise saved." };
}

export async function addFranchise(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!isLeagueSuperAdmin(session)) return { error: "Only the league super admin can add a franchise." };
  const parsed = validateFranchiseDraft({
    city: String(formData.get("city") ?? ""),
    name: String(formData.get("name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    await createFranchise(parsed.value);
    revalidatePath(`/franchises/${parsed.value.city.toLowerCase()}`);
  } catch (error) {
    return dbError(error, "Could not add the franchise.");
  }

  refreshLeague();
  return { notice: "Franchise added." };
}

export async function removeFranchise(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!isLeagueSuperAdmin(session)) return { error: "Only the league super admin can remove a franchise." };
  const franchiseId = String(formData.get("franchiseId") ?? "");
  if (!franchiseId) return { error: "Missing franchise." };

  try {
    const franchise = await getFranchise(franchiseId);
    if (!franchise) return { error: "Franchise not found." };
    const removed = await deleteFranchise(franchise.id);
    if (!removed.ok) return { error: removed.error };
    revalidatePath(`/franchises/${franchise.city.toLowerCase()}`);
  } catch (error) {
    return dbError(error, "Could not remove the franchise.");
  }

  refreshLeague();
  return {};
}
