import type { Metadata } from "next";
import { AuctionBoard } from "@/components/AuctionBoard";
import { Nav } from "@/components/Nav";
import { isDatabaseConfigured } from "@/lib/db";
import { loadPublicAuction } from "@/lib/auction-public";
import type { PublicAuctionPayload } from "@/lib/auction";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Auction" };
export const dynamic = "force-dynamic";

export default async function AuctionPage() {
  const user = await getSession();
  const initial: PublicAuctionPayload = isDatabaseConfigured()
    ? await loadPublicAuction()
    : { closed: false, remaining: 0, current: null, recentSold: [] };

  return (
    <>
      <Nav user={user} active="auction" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">SEASON 1</div>
          <h1>Live auction</h1>
          <p className="lede">The room updates every few seconds.</p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <AuctionBoard initial={initial} />
        </div>
      </section>
    </>
  );
}
