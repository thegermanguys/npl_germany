"use server";

import { revalidatePath } from "next/cache";
import { DbNotConfiguredError } from "@/lib/db";
import {
  DEFAULT_FIXTURE_SEASON,
  isFixtureStatus,
  parseDatetimeLocal,
} from "@/lib/fixtures";
import { createFixture, getFranchise, updateFixture } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";
import type { ActionState } from "./auth";

async function requireAdmin(): Promise<ActionState | null> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Admin only." };
  return null;
}

function refreshFixtures(id?: string): void {
  revalidatePath("/fixtures");
  revalidatePath("/admin/fixtures");
  if (id) {
    revalidatePath(`/fixtures/${id}`);
    revalidatePath(`/admin/fixtures/${id}`);
  }
}

async function readFixtureForm(formData: FormData): Promise<
  | { ok: true; value: Parameters<typeof createFixture>[0] }
  | { ok: false; error: string }
> {
  const franchiseAId = String(formData.get("franchiseAId") ?? "").trim();
  const franchiseBId = String(formData.get("franchiseBId") ?? "").trim();
  const groundName = String(formData.get("groundName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const scheduled = parseDatetimeLocal(String(formData.get("scheduledAt") ?? ""));
  const statusRaw = String(formData.get("status") ?? "scheduled");
  const season = String(formData.get("season") ?? DEFAULT_FIXTURE_SEASON).trim() || DEFAULT_FIXTURE_SEASON;

  if (!franchiseAId || !franchiseBId) return { ok: false, error: "Choose both teams." };
  if (franchiseAId === franchiseBId) return { ok: false, error: "Pick two different franchises." };
  if (!groundName) return { ok: false, error: "Ground is required." };
  if (!city) return { ok: false, error: "City is required." };
  if (!scheduled) return { ok: false, error: "Set a date and time." };
  if (!isFixtureStatus(statusRaw)) return { ok: false, error: "Choose a match status." };

  const [teamA, teamB] = await Promise.all([getFranchise(franchiseAId), getFranchise(franchiseBId)]);
  if (!teamA || !teamB) return { ok: false, error: "Choose both teams." };

  return {
    ok: true,
    value: {
      season,
      franchiseAId,
      franchiseBId,
      groundName,
      city,
      scheduledAt: scheduled,
      status: statusRaw,
    },
  };
}

export async function adminCreateFixture(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const parsed = await readFixtureForm(formData);
    if (!parsed.ok) return { error: parsed.error };
    const id = await createFixture(parsed.value);
    refreshFixtures(id);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not save the fixture." };
  }

  return {};
}

export async function adminUpdateFixture(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = String(formData.get("fixtureId") ?? "").trim();
  if (!id) return { error: "Missing fixture." };

  try {
    const parsed = await readFixtureForm(formData);
    if (!parsed.ok) return { error: parsed.error };
    const saved = await updateFixture(id, parsed.value);
    if (!saved) return { error: "Fixture not found." };
    refreshFixtures(id);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not save the fixture." };
  }

  return {};
}
