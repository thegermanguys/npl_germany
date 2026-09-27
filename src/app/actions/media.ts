"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "./auth";
import { DbNotConfiguredError } from "@/lib/db";
import { readImageFile } from "@/lib/media";
import {
  getProfileById,
  getProfileByUserId,
  insertMediaAsset,
  setFranchiseLogo,
  setLeagueLogo,
  setPlayerPhoto,
} from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

function fail(error: unknown, fallback: string): ActionState {
  if (error instanceof DbNotConfiguredError) {
    return { error: "The league database is not connected yet." };
  }
  console.error(error);
  return { error: fallback };
}

export async function uploadPlayerPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Sign in to upload a photo." };

  const profileId = String(formData.get("profileId") ?? "");
  const parsed = await readImageFile(formData.get("photo") as File | null);
  if (!parsed.ok) return { error: parsed.error };

  try {
    const profile = await getProfileById(profileId);
    if (!profile) return { error: "Player not found." };
    const own = session.role === "player" && session.userId === profile.user_id;
    if (!own && !isAdmin(session)) return { error: "You cannot change this photo." };
    const mediaId = await insertMediaAsset({
      kind: "player_photo",
      mimeType: parsed.mime,
      bytes: parsed.bytes,
    });
    await setPlayerPhoto(profile.id, mediaId);
  } catch (error) {
    return fail(error, "Could not save the photo.");
  }

  revalidatePath("/players");
  revalidatePath(`/players/${profileId}`);
  revalidatePath("/account");
  revalidatePath("/admin");
  return {};
}

export async function uploadOwnPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== "player") {
    return { error: "Sign in as a player to upload a photo." };
  }
  try {
    const profile = await getProfileByUserId(session.userId);
    if (!profile) return { error: "No player profile found." };
    formData.set("profileId", profile.id);
  } catch (error) {
    return fail(error, "Could not save the photo.");
  }
  return uploadPlayerPhoto(_prev, formData);
}

export async function uploadFranchiseLogo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Admin only." };

  const franchiseId = String(formData.get("franchiseId") ?? "");
  if (!franchiseId) return { error: "Missing franchise." };
  const parsed = await readImageFile(formData.get("logo") as File | null);
  if (!parsed.ok) return { error: parsed.error };

  try {
    const mediaId = await insertMediaAsset({
      kind: "franchise_logo",
      mimeType: parsed.mime,
      bytes: parsed.bytes,
    });
    await setFranchiseLogo(franchiseId, mediaId);
  } catch (error) {
    return fail(error, "Could not save the logo.");
  }

  revalidatePath("/");
  revalidatePath("/admin/franchises");
  return {};
}

export async function uploadLeagueLogo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Admin only." };

  const parsed = await readImageFile(formData.get("logo") as File | null);
  if (!parsed.ok) return { error: parsed.error };

  try {
    const mediaId = await insertMediaAsset({
      kind: "league_logo",
      mimeType: parsed.mime,
      bytes: parsed.bytes,
    });
    await setLeagueLogo(mediaId);
  } catch (error) {
    return fail(error, "Could not save the logo.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/players");
  return {};
}
