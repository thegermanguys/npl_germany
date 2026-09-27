import type { PlayerListItem } from "./types";

export function formatStat(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export function compactStats(player: PlayerListItem): string {
  return `${formatStat(player.stats_matches)} Matches · ${formatStat(player.stats_runs)} Runs · ${formatStat(player.stats_wickets)} Wickets`;
}

export function statsSourceLabel(player: PlayerListItem): string {
  if (player.stats_source === "cricheroes") return "CricHeroes";
  if (player.stats_source === "manual") return "Entered";
  return "";
}
