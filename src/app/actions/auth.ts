"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { DbNotConfiguredError } from "@/lib/db";
import { createPlayerProfile, createUser, getCurrentSeason, getUserByEmail } from "@/lib/queries";
import { clearSession, setSession } from "@/lib/session";
import { validateLogin, validateRegistration } from "@/lib/validate";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function registerPlayer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateRegistration({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    playingRole: String(formData.get("playingRole") ?? ""),
    experience: String(formData.get("experience") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const existing = await getUserByEmail(parsed.value.email);
    if (existing) return { fieldErrors: { email: "That email is already registered." } };

    const season = await getCurrentSeason();
    if (!season) return { error: "Season 1 is not set up yet." };

    const user = await createUser({
      email: parsed.value.email,
      passwordHash: bcrypt.hashSync(parsed.value.password, 10),
      role: "player",
      displayName: parsed.value.fullName,
    });
    await createPlayerProfile({
      userId: user.id,
      seasonId: season.id,
      fullName: parsed.value.fullName,
      phone: parsed.value.phone,
      city: parsed.value.city,
      playingRole: parsed.value.playingRole,
      experience: parsed.value.experience,
    });
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: user.display_name,
    });
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    console.error(error);
    return { error: "Could not create your account." };
  }

  redirect("/account");
}

export async function loginUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateLogin({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  try {
    const user = await getUserByEmail(parsed.value.email);
    if (!user || !bcrypt.compareSync(parsed.value.password, user.password_hash)) {
      return { error: "Email or password is wrong." };
    }
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: user.display_name,
    });
    if (user.role === "admin") redirect("/admin");
    if (user.role === "franchise_owner") redirect("/players");
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    throw error;
  }

  redirect("/account");
}

export async function logoutUser(): Promise<void> {
  await clearSession();
  redirect("/");
}
