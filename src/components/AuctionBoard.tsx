"use client";

import { useEffect, useState } from "react";
import { AUCTION_POLL_MS, formatEuro, type AuctionStatus, type PublicAuctionPayload } from "@/lib/auction";
import { mediaPath } from "@/lib/media";
import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { PhotoCircle } from "./PhotoCircle";

export type { PublicAuctionPayload, PublicAuctionPlayer } from "@/lib/auction";

export function AuctionBoard({ initial }: { initial: PublicAuctionPayload }) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch("/api/auction", { cache: "no-store" });
        if (!res.ok) return;
        setData((await res.json()) as PublicAuctionPayload);
      } catch {
        /* keep the last good frame */
      }
    };
    tick();
    const id = window.setInterval(tick, AUCTION_POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  const current = data.current;

  return (
    <div className="auction-board">
      {data.closed ? <div className="empty-note">Auction closed.</div> : null}
      {!data.closed ? (
        <p className="muted">{data.remaining} still in the pool.</p>
      ) : null}
      {current ? (
        <div className="auction-card">
          <PhotoCircle
            src={current.photo_id ? mediaPath(current.photo_id) : null}
            name={current.full_name}
            size="lg"
          />
          <div>
            <div className="eyebrow">
              {current.auction_status === "in_auction_pool" ? "ON THE BLOCK" : auctionEyebrow(current.auction_status)}
            </div>
            <h2>{current.full_name}</h2>
            <p className="lede">
              {current.playing_role} · {current.city}
            </p>
            <p className="muted">{current.experience}</p>
            <p className="auction-base">
              {current.auction_status === "sold" && current.sold_price != null
                ? `${current.franchise_name ?? "Sold"} · ${formatEuro(current.sold_price)}`
                : `Base ${current.base_price != null ? formatEuro(current.base_price) : "—"}`}
            </p>
            <AuctionStatusBadge status={current.auction_status} />
          </div>
        </div>
      ) : (
        <div className="empty-note">{data.closed ? "Season 1 auction is finished." : "Waiting for the next player."}</div>
      )}

      {data.recentSold.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sold</th>
                <th>Franchise</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSold.map((row) => (
                <tr key={row.id}>
                  <td>{row.full_name}</td>
                  <td>{row.franchise_name ?? "—"}</td>
                  <td>{row.sold_price != null ? formatEuro(row.sold_price) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function auctionEyebrow(status: AuctionStatus): string {
  if (status === "sold") return "SOLD";
  if (status === "unsold") return "UNSOLD";
  return "AUCTION";
}
