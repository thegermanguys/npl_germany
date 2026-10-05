"use client";

import { useActionState, useEffect, useState } from "react";
import {
  adminCloseAuction,
  adminMarkUnsold,
  adminNextPlayer,
  adminSellPlayer,
} from "@/app/actions/auction";
import { formatEuro, parseEuroAmount, purseWouldExceed } from "@/lib/auction";
import { mediaPath } from "@/lib/media";
import type { FranchiseRow, PlayerListItem } from "@/lib/types";
import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { PhotoCircle } from "./PhotoCircle";
import { PlayerStatsStrip } from "./PlayerStats";
import { PurseMeter } from "./PurseMeter";

export function AuctionRoom({
  current,
  franchises,
  remaining,
  closed,
}: {
  current: PlayerListItem | null;
  franchises: FranchiseRow[];
  remaining: number;
  closed: boolean;
}) {
  const [sellState, sellAction, selling] = useActionState(adminSellPlayer, {});
  const [unsoldState, unsoldAction, skipping] = useActionState(adminMarkUnsold, {});
  const [nextState, nextAction, advancing] = useActionState(adminNextPlayer, {});
  const [closeState, closeAction, closing] = useActionState(adminCloseAuction, {});
  const [franchiseId, setFranchiseId] = useState("");
  const [price, setPrice] = useState(String(current?.base_price ?? 500));

  useEffect(() => {
    setFranchiseId("");
    setPrice(String(current?.base_price ?? 500));
  }, [current?.id, current?.base_price]);

  const selected = franchises.find((franchise) => franchise.id === franchiseId);
  const parsedPrice = parseEuroAmount(price);
  const overCap =
    selected && parsedPrice != null
      ? purseWouldExceed(selected.purse_total, selected.purse_spent, parsedPrice)
      : false;
  const error = sellState.error || unsoldState.error || nextState.error || closeState.error;
  const warning =
    overCap && selected ? `This sale would take ${selected.full_name} over the purse cap.` : null;

  return (
    <div className="auction-room">
      {error ? <div className="form-msg err">{error}</div> : null}
      {warning && !error ? <div className="form-msg err">{warning}</div> : null}
      {closed ? (
        <div className="empty-note">Auction closed. Remaining pool players are unsold.</div>
      ) : current ? (
        <div className="auction-card">
          <PhotoCircle
            src={current.photo_id ? mediaPath(current.photo_id) : null}
            name={current.full_name}
            size="lg"
          />
          <div>
            <div className="eyebrow">ON THE BLOCK</div>
            <h2>{current.full_name}</h2>
            <p className="lede">
              {current.playing_role} · {current.city}
            </p>
            <p className="muted">{current.experience}</p>
            <PlayerStatsStrip player={current} />
            <p className="auction-base">
              Base {current.base_price != null ? formatEuro(current.base_price) : "—"}
            </p>
            <AuctionStatusBadge status={current.auction_status} />
          </div>
        </div>
      ) : (
        <div className="empty-note">No player on the block. Move approved players into the pool.</div>
      )}

      {!closed && current && current.auction_status === "in_auction_pool" ? (
        <form action={sellAction} className="form-card">
          <input type="hidden" name="playerId" value={current.id} />
          <div className="frow">
            <div className="field">
              <label htmlFor="franchiseId">Winning franchise</label>
              <select
                id="franchiseId"
                name="franchiseId"
                required
                value={franchiseId}
                onChange={(event) => setFranchiseId(event.target.value)}
              >
                <option value="">Choose</option>
                {franchises.map((franchise) => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.full_name} ({formatEuro(franchise.purse_spent)} / {formatEuro(franchise.purse_total)})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="price">Sale price (€)</label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step={1}
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
          </div>
          <div className="elig-actions">
            <button type="submit" className="btn btn-navy" disabled={selling || overCap}>
              {selling ? "Saving…" : "Sell"}
            </button>
          </div>
        </form>
      ) : null}

      {!closed ? (
        <div className="elig-actions">
          {current && current.auction_status === "in_auction_pool" ? (
            <form action={unsoldAction}>
              <input type="hidden" name="playerId" value={current.id} />
              <button type="submit" className="btn btn-ghost-ink" disabled={skipping}>
                Skip / mark unsold
              </button>
            </form>
          ) : null}
          <form action={nextAction}>
            <button type="submit" className="btn btn-navy" disabled={advancing || remaining === 0}>
              Next player
            </button>
          </form>
          <form action={closeAction}>
            <button type="submit" className="btn btn-ghost-ink" disabled={closing}>
              Close auction
            </button>
          </form>
        </div>
      ) : null}

      <div className="purse-grid">
        {franchises.map((franchise) => (
          <div className="stat-card" key={franchise.id}>
            <div className="k">{franchise.full_name}</div>
            <PurseMeter spent={franchise.purse_spent} total={franchise.purse_total} />
          </div>
        ))}
      </div>
    </div>
  );
}
