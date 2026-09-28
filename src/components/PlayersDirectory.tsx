"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { franchiseColorVar } from "@/data/franchises";
import { isBuyable } from "@/lib/eligibility";
import { mediaPath } from "@/lib/media";
import type { PlayerListItem } from "@/lib/types";
import { EligibilityBadge } from "./EligibilityBadge";
import { PhotoCircle } from "./PhotoCircle";
import { PlayerStatsStrip } from "./PlayerStats";

export function PlayersDirectory({
  players,
  inspect,
  showEligibility = false,
  franchiseCities,
}: {
  players: PlayerListItem[];
  inspect: boolean;
  showEligibility?: boolean;
  franchiseCities: string[];
}) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [role, setRole] = useState("All");

  const cities = useMemo(() => ["All", ...franchiseCities], [franchiseCities]);
  const roles = useMemo(
    () => ["All", ...Array.from(new Set(players.map((player) => player.playing_role)))],
    [players],
  );

  const list = players.filter((player) => {
    const hay = `${player.full_name} ${player.city} ${player.playing_role}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (city !== "All" && player.city !== city) return false;
    if (role !== "All" && player.playing_role !== role) return false;
    return true;
  });

  if (players.length === 0) {
    return (
      <div>
        {franchiseCities.length > 0 ? (
          <div className="filter-row">
            {cities.map((name) => (
              <button
                key={name}
                type="button"
                className={`filter-chip${city === name ? " active" : ""}`}
                onClick={() => setCity(name)}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
        <div className="empty-note">No buyable players yet.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="filter-row">
        <input
          className="filter-search"
          type="search"
          placeholder="Search name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {cities.map((name) => (
          <button
            key={name}
            type="button"
            className={`filter-chip${city === name ? " active" : ""}`}
            onClick={() => setCity(name)}
          >
            {name}
          </button>
        ))}
        {roles.map((name) => (
          <button
            key={`role-${name}`}
            type="button"
            className={`filter-chip${role === name ? " active" : ""}`}
            onClick={() => setRole(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-note">No players match those filters.</div>
      ) : inspect ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Role</th>
                <th>Matches / Runs / Wickets</th>
                {showEligibility ? <th>Eligibility</th> : null}
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((player) => (
                <tr key={player.id} className={isBuyable(player) ? undefined : "not-buyable"}>
                  <td>
                    <div className="name-with-photo">
                      <PhotoCircle
                        src={player.photo_id ? mediaPath(player.photo_id) : null}
                        name={player.full_name}
                        size="sm"
                      />
                      <div>
                        <strong>{player.full_name}</strong>
                        {player.franchise_name ? <div className="muted">{player.franchise_name}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td>{player.city}</td>
                  <td>{player.playing_role}</td>
                  <td>
                    <PlayerStatsStrip player={player} />
                  </td>
                  {showEligibility ? (
                    <td>
                      <EligibilityBadge player={player} />
                    </td>
                  ) : null}
                  <td>
                    {player.phone}
                    <div className="muted">{player.email}</div>
                  </td>
                  <td>
                    <Link href={`/players/${player.id}`}>Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="players-grid">
          {list.map((player) => {
            const color = player.franchise_color
              ? franchiseColorVar(player.franchise_color)
              : "var(--navy)";
            return (
              <Link className="player-card" key={player.id} href={`/players/${player.id}`}>
                <div className="player-card-photo">
                  <PhotoCircle
                    src={player.photo_id ? mediaPath(player.photo_id) : null}
                    name={player.full_name}
                    size="md"
                  />
                </div>
                <div className="info">
                  <p className="p-name">{player.full_name}</p>
                  <p className="p-role">
                    {player.playing_role} · {player.city}
                  </p>
                  <PlayerStatsStrip player={player} linked={false} />
                  <span className="p-badge" style={{ background: color }}>
                    {player.franchise_name || "Unassigned"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
