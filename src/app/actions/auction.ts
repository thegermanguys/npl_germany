"use server";

import { revalidatePath } from "next/cache";
import { DbNotConfiguredError } from "@/lib/db";
import { nextPoolPlayerId, parseEuroAmount } from "@/lib/auction";
import {
  approvePlayers,
  closeAuctionPool,
  ensureCurrentAuctionPlayer,
  getAuctionState,
  getFranchise,
  listAuctionPool,
  markCurrentUnsold,
  moveToAuctionPool,
  sellCurrentPlayer,
  setAuctionPlayer,
  setBasePrice,
} from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";
import type { ActionState } from "./auth";

async function requireAdmin(): Promise<ActionState | null> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Admin only." };
  return null;
}

function refreshAuction(): void {
  revalidatePath("/admin/players");
  revalidatePath("/admin/auction");
  revalidatePath("/admin");
  revalidatePath("/auction");
  revalidatePath("/players");
  revalidatePath("/franchises");
}

export async function adminApprovePlayers(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const ids = formData
    .getAll("playerIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  if (ids.length === 0) return { error: "Select at least one player." };

  try {
    await approvePlayers(ids);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not approve those players." };
  }

  refreshAuction();
  return {};
}

export async function adminMoveToPool(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = String(formData.get("profileId") ?? "");
  const price = parseEuroAmount(String(formData.get("basePrice") ?? ""));
  if (!id) return { error: "Missing player." };
  if (price === null) return { error: "Base price must be a whole euro amount." };

  try {
    await setBasePrice(id, price);
    const moved = await moveToAuctionPool(id);
    if (!moved.ok) return { error: moved.error };
    await ensureCurrentAuctionPlayer();
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not add that player to the pool." };
  }

  refreshAuction();
  return {};
}

export async function adminSellPlayer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const playerId = String(formData.get("playerId") ?? "");
  const franchiseId = String(formData.get("franchiseId") ?? "");
  const price = parseEuroAmount(String(formData.get("price") ?? ""));
  if (!playerId || !franchiseId) return { error: "Choose a franchise and a price." };
  if (price === null) return { error: "Sale price must be a whole euro amount." };

  try {
    const sold = await sellCurrentPlayer({ playerId, franchiseId, price });
    if (!sold.ok) return { error: sold.error };
    const franchise = await getFranchise(franchiseId);
    if (franchise) revalidatePath(`/franchises/${franchise.city.toLowerCase()}`);
    revalidatePath(`/players/${playerId}`);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not record the sale." };
  }

  refreshAuction();
  return {};
}

export async function adminMarkUnsold(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const playerId = String(formData.get("playerId") ?? "");
  if (!playerId) return { error: "Missing player." };

  try {
    const marked = await markCurrentUnsold(playerId);
    if (!marked.ok) return { error: marked.error };
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not mark the player unsold." };
  }

  refreshAuction();
  return {};
}

export async function adminNextPlayer(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const state = await getAuctionState();
    if (state.closed) return { error: "The auction is closed." };
    const pool = await listAuctionPool();
    const nextId = nextPoolPlayerId(
      pool.map((player) => player.id),
      state.currentPlayerId,
    );
    await setAuctionPlayer(nextId);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not advance the auction." };
  }

  refreshAuction();
  return {};
}

export async function adminCloseAuction(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await closeAuctionPool();
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { error: "The league database is not connected yet." };
    }
    return { error: "Could not close the auction." };
  }

  refreshAuction();
  return {};
}
