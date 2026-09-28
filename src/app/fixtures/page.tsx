import type { Metadata } from "next";
import { CricketMarks } from "@/components/CricketIcon";
import { FixturesList } from "@/components/FixturesList";
import { Nav } from "@/components/Nav";
import { DEFAULT_FIXTURE_SEASON } from "@/lib/fixtures";
import { isDatabaseConfigured } from "@/lib/db";
import { listFixtures, listFranchises } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Fixtures" };
export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const user = await getSession();
  const configured = isDatabaseConfigured();
  const [fixtures, franchises] = configured
    ? await Promise.all([listFixtures(DEFAULT_FIXTURE_SEASON), listFranchises()])
    : [[], []];

  return (
    <>
      <Nav user={user} active="fixtures" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{DEFAULT_FIXTURE_SEASON.toUpperCase()} · DEUCE BALL</div>
          <h1>Fixtures</h1>
          <p className="lede">Season 1 matches, grouped by date.</p>
          <CricketMarks />
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          {!configured ? (
            <div className="empty-note">The fixture list is not connected yet.</div>
          ) : (
            <FixturesList fixtures={fixtures} franchises={franchises} />
          )}
        </div>
      </section>
    </>
  );
}
