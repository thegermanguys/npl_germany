import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Owner" };
export const dynamic = "force-dynamic";

/** Placeholder so /owner/* exists for role 403s. Auction tools are Phase 1. */
export default async function OwnerCatchAllPage() {
  const user = await getSession();
  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">FRANCHISE OWNER</div>
          <h1>Owner desk</h1>
          <p className="lede">Auction tools land in the next phase.</p>
        </div>
      </section>
    </>
  );
}
