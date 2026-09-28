"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { adminApprovePlayers, adminMoveToPool } from "@/app/actions/auction";
import { AUCTION_STATUSES, auctionStatusLabel } from "@/lib/auction";
import type { PlayerListItem } from "@/lib/types";
import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { PhotoCircle } from "./PhotoCircle";
import { mediaPath } from "@/lib/media";

export function AdminPlayersTable({
  players,
  cities,
}: {
  players: PlayerListItem[];
  cities: string[];
}) {
  const [status, setStatus] = useState("All");
  const [city, setCity] = useState("All");
  const [approveState, approveAction, approving] = useActionState(adminApprovePlayers, {});
  const [poolState, poolAction, pooling] = useActionState(adminMoveToPool, {});

  const list = useMemo(
    () =>
      players.filter((player) => {
        if (status !== "All" && player.auction_status !== status) return false;
        if (city !== "All" && player.city !== city) return false;
        return true;
      }),
    [players, status, city],
  );

  return (
    <div>
      <div className="filter-row">
        {["All", ...AUCTION_STATUSES].map((name) => (
          <button
            key={name}
            type="button"
            className={`filter-chip${status === name ? " active" : ""}`}
            onClick={() => setStatus(name)}
          >
            {name === "All" ? "All" : auctionStatusLabel(name as (typeof AUCTION_STATUSES)[number])}
          </button>
        ))}
        {["All", ...cities].map((name) => (
          <button
            key={`city-${name}`}
            type="button"
            className={`filter-chip${city === name ? " active" : ""}`}
            onClick={() => setCity(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {approveState.error ? <div className="form-msg err">{approveState.error}</div> : null}
      {poolState.error ? <div className="form-msg err">{poolState.error}</div> : null}
      {list.length === 0 ? (
        <div className="empty-note">No players match those filters.</div>
      ) : (
        <form action={approveAction}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Base price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((player) => (
                  <tr key={player.id}>
                    <td>
                      {player.auction_status === "pending_review" ? (
                        <input type="checkbox" name="playerIds" value={player.id} />
                      ) : null}
                    </td>
                    <td>
                      <div className="name-with-photo">
                        <PhotoCircle
                          src={player.photo_id ? mediaPath(player.photo_id) : null}
                          name={player.full_name}
                          size="sm"
                        />
                        <div>
                          <Link href={`/players/${player.id}`}>{player.full_name}</Link>
                          <div className="muted">
                            {player.playing_role} · {player.experience}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{player.city}</td>
                    <td>
                      <AuctionStatusBadge status={player.auction_status} />
                    </td>
                    <td>
                      {player.auction_status === "approved" || player.auction_status === "in_auction_pool" ? (
                        <label className="inline-price">
                          €
                          <input
                            form={`pool-${player.id}`}
                            type="number"
                            name="basePrice"
                            min={0}
                            step={1}
                            defaultValue={player.base_price ?? 500}
                            required
                          />
                        </label>
                      ) : player.base_price != null ? (
                        `€${player.base_price}`
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {player.auction_status === "approved" || player.auction_status === "in_auction_pool" ? (
                        <button
                          form={`pool-${player.id}`}
                          type="submit"
                          className="btn btn-navy btn-small"
                          disabled={pooling}
                        >
                          To pool
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-actions">
            <button type="submit" className="btn btn-navy btn-small" disabled={approving}>
              {approving ? "Saving…" : "Approve selected"}
            </button>
          </p>
        </form>
      )}
      {list.map((player) =>
        player.auction_status === "approved" || player.auction_status === "in_auction_pool" ? (
          <form id={`pool-${player.id}`} key={`pool-${player.id}`} action={poolAction} hidden>
            <input type="hidden" name="profileId" value={player.id} />
          </form>
        ) : null,
      )}
    </div>
  );
}
