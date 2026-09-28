import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { franchiseColorVar } from "@/data/franchises";
import { FixtureStatusBadge } from "@/components/FixtureStatusBadge";
import { Nav } from "@/components/Nav";
import { formatFixtureWhen } from "@/lib/fixtures";
import { isDatabaseConfigured } from "@/lib/db";
import { getFixture } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!isDatabaseConfigured()) return { title: "Fixture" };
  try {
    const { id } = await params;
    const fixture = await getFixture(id);
    return { title: fixture ? `${fixture.a_short} v ${fixture.b_short}` : "Fixture" };
  } catch {
    return { title: "Fixture" };
  }
}

export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();
  if (!isDatabaseConfigured()) notFound();
  const fixture = await getFixture(id);
  if (!fixture) notFound();
  const admin = isAdmin(user);

  return (
    <>
      <Nav user={user} active="fixtures" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{fixture.season.toUpperCase()}</div>
          <h1>
            {fixture.a_short} <span className="muted-hero">v</span> {fixture.b_short}
          </h1>
          <p className="lede">{formatFixtureWhen(fixture.scheduled_at)}</p>
          <div className="badge-row">
            <FixtureStatusBadge status={fixture.status} />
          </div>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap profile-grid">
          <div className="profile-card">
            <dl className="profile-dl">
              <div>
                <dt>Home</dt>
                <dd style={{ color: franchiseColorVar(fixture.a_color) }}>{fixture.a_name}</dd>
              </div>
              <div>
                <dt>Away</dt>
                <dd style={{ color: franchiseColorVar(fixture.b_color) }}>{fixture.b_name}</dd>
              </div>
              <div>
                <dt>Ground</dt>
                <dd>{fixture.ground_name}</dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{fixture.city}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>{formatFixtureWhen(fixture.scheduled_at)}</dd>
              </div>
              {fixture.result_summary ? (
                <div>
                  <dt>Result</dt>
                  <dd>{fixture.result_summary}</dd>
                </div>
              ) : null}
              {fixture.winner_name ? (
                <div>
                  <dt>Winner</dt>
                  <dd>{fixture.winner_name}</dd>
                </div>
              ) : null}
            </dl>
            <p>
              <Link href="/fixtures">All fixtures</Link>
              {admin ? (
                <>
                  {" · "}
                  <Link href={`/admin/fixtures/${fixture.id}`}>Edit</Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
