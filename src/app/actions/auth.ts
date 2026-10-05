"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { isUsablePasswordHash } from "@/lib/admin-account";
import { resolveSignupStats, statsFromForm, type PlayerStats } from "@/lib/cricheroes";
import { DbNotConfiguredError } from "@/lib/db";
import {
  hashResetToken,
  isMailerConfigured,
  newResetToken,
  RESET_NOTICE,
  resetExpiresAt,
  resetUrl,
  sendResetEmail,
} from "@/lib/password-reset";
import {
  consumeResetToken,
  createPlayerProfile,
  createUser,
  findValidResetToken,
  getCurrentSeason,
  getUserByEmail,
  replacePasswordResetToken,
  updateUserPassword,
} from "@/lib/queries";
import { clearSession, isAuthConfigured, setSession } from "@/lib/session";
import {
  checkboxOn,
  validateLogin,
  validateNewPassword,
  validateRegistration,
  validateResetEmail,
} from "@/lib/validate";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  stats?: PlayerStats;
  notice?: string;
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
    nepaliCitizen: checkboxOn(formData.get("nepaliCitizen")),
    germanyLegalResident: checkboxOn(formData.get("germanyLegalResident")),
    cricheroesUrl: String(formData.get("cricheroesUrl") ?? ""),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors };
  if (!isAuthConfigured()) return { error: "Could not create your account." };

  try {
    const existing = await getUserByEmail(parsed.value.email);
    if (existing) return { fieldErrors: { email: "That email is already registered." } };

    const season = await getCurrentSeason();
    if (!season) return { error: "Season 1 is not set up yet." };

    const resolved = resolveSignupStats(parsed.value.cricheroesUrl, statsFromForm(formData));
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
      nepaliCitizen: true,
      germanyLegalResident: true,
      cricheroesUrl: resolved.url,
      stats: resolved.stats,
      statsSource: resolved.source,
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

  if (!isAuthConfigured()) return { error: "Email or password is wrong." };

  try {
    const user = await getUserByEmail(parsed.value.email);
    if (
      !user ||
      !isUsablePasswordHash(user.password_hash) ||
      !bcrypt.compareSync(parsed.value.password, user.password_hash)
    ) {
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

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateResetEmail(String(formData.get("email") ?? ""));
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  if (!isAuthConfigured()) return { notice: RESET_NOTICE };

  try {
    const user = await getUserByEmail(parsed.email);
    if (user) {
      const token = newResetToken();
      await replacePasswordResetToken({
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: resetExpiresAt(),
      });
      if (isMailerConfigured()) {
        const headerList = await headers();
        const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
        const proto =
          headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
        const origin = process.env.SITE_URL?.trim().replace(/\/$/, "") || (host ? `${proto}://${host}` : "");
        if (origin) await sendResetEmail(user.email, resetUrl(origin, token));
      }
    }
  } catch (error) {
    if (!(error instanceof DbNotConfiguredError)) console.error(error);
  }

  return { notice: RESET_NOTICE };
}

export async function completePasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const parsed = validateNewPassword(
    String(formData.get("password") ?? ""),
    String(formData.get("confirm") ?? ""),
  );
  if (!parsed.ok) return { fieldErrors: parsed.errors };
  if (!token || !isAuthConfigured()) return { error: "That reset link is not valid." };

  try {
    const found = await findValidResetToken(hashResetToken(token));
    if (!found) return { error: "That reset link is not valid." };
    await updateUserPassword(found.userId, bcrypt.hashSync(parsed.password, 10));
    await consumeResetToken(found.id);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    console.error(error);
    return { error: "Could not update the password." };
  }

  redirect("/login?reset=1");
}

export async function logoutUser(): Promise<void> {
  await clearSession();
  redirect("/");
}
