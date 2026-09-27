"use server";

import { revalidatePath } from "next/cache";
import { DbNotConfiguredError } from "@/lib/db";
import { getProfileByUserId, updatePlayerProfile } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { validateProfileUpdate } from "@/lib/validate";
import type { ActionState } from "./auth";

export async function updateOwnProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== "player") {
    return { error: "Sign in as a player to edit this profile." };
  }

  const parsed = validateProfileUpdate({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    playingRole: String(formData.get("playingRole") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    battingHand: String(formData.get("battingHand") ?? ""),
    bowlingStyle: String(formData.get("bowlingStyle") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const profile = await getProfileByUserId(session.userId);
    if (!profile) return { error: "No player profile found." };
    await updatePlayerProfile(profile.id, {
      fullName: parsed.value.fullName,
      phone: parsed.value.phone,
      city: parsed.value.city,
      playingRole: parsed.value.playingRole,
      experience: parsed.value.experience,
      battingHand: parsed.value.battingHand || null,
      bowlingStyle: parsed.value.bowlingStyle || null,
    });
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    console.error(error);
    return { error: "Could not save your profile." };
  }

  revalidatePath("/account");
  revalidatePath("/players");
  return {};
}
