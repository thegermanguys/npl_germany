import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { FixtureForm } from "@/components/FixtureForm";
import { FixtureStatusBadge } from "@/components/FixtureStatusBadge";
import { Nav } from "@/components/Nav";
import { DEFAULT_FIXTURE_SEASON, formatFixtureWhen } from "@/lib/fixtures";
import { isDatabaseConfigured } from "@/lib/db";
import { listFixtures, listFranchises } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Fixtures" };
export const dynamic = "force-dynamic";

export default async function AdminFixturesPage() {
  const user = await getSession();
  if (!user || !isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const [fixtures, franchises] = await Promise.all([
    listFixtures(DEFAULT_FIXTURE_SEASON),
    listFranchises(),
  ]);

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN</div>
          <h1>Fixtures</h1>
          <p className="lede">Season 1. Teams, ground, date and time.</p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <div className="form-card">
            <h3>Add fixture</h3>
            <FixtureForm key={fixtures.length} franchises={franchises} />
          </div>
          {fixtures.length === 0 ? (
            <div className="empty-note">No fixtures yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Match</th>
                    <th>Ground</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fixtures.map((fixture) => (
                    <tr key={fixture.id}>
                      <td>{formatFixtureWhen(fixture.scheduled_at)}</td>
                      <td>
                        {fixture.a_short} v {fixture.b_short}
                      </td>
                      <td>
                        {fixture.ground_name}, {fixture.city}
                      </td>
                      <td>
                        <FixtureStatusBadge status={fixture.status} />
                      </td>
                      <td>
                        <Link href={`/admin/fixtures/${fixture.id}`}>Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p>
            <Link href="/admin">Back</Link>
            {" · "}
            <Link href="/fixtures">Public list</Link>
          </p>
        </div>
      </section>
    </>
  );
}
