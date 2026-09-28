import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { AuctionRoom } from "@/components/AuctionRoom";
import { Nav } from "@/components/Nav";
import { isDatabaseConfigured } from "@/lib/db";
import {
  ensureCurrentAuctionPlayer,
  getAuctionState,
  getProfileById,
  listAuctionPool,
  listFranchises,
} from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Auction" };
export const dynamic = "force-dynamic";

export default async function AdminAuctionPage() {
  const user = await getSession();
  if (!user || !isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const currentId = await ensureCurrentAuctionPlayer();
  const [state, pool, franchises, current] = await Promise.all([
    getAuctionState(),
    listAuctionPool(),
    listFranchises(),
    currentId ? getProfileById(currentId) : Promise.resolve(null),
  ]);

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN · LIVE</div>
          <h1>Auction</h1>
          <p className="lede">
            {pool.length} in the pool. One player at a time.
          </p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <AuctionRoom
            current={current}
            franchises={franchises}
            remaining={pool.length}
            closed={state.closed}
          />
          <p>
            <Link href="/admin/players">Pool</Link>
            {" · "}
            <Link href="/auction">Public view</Link>
          </p>
        </div>
      </section>
    </>
  );
}
