import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, notFound, redirect } from "next/navigation";
import { FixtureForm } from "@/components/FixtureForm";
import { Nav } from "@/components/Nav";
import { isDatabaseConfigured } from "@/lib/db";
import { getFixture, listFranchises } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Edit fixture" };
export const dynamic = "force-dynamic";

export default async function AdminEditFixturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user || !isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const { id } = await params;
  const [fixture, franchises] = await Promise.all([getFixture(id), listFranchises()]);
  if (!fixture) notFound();

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN</div>
          <h1>Edit fixture</h1>
          <p className="lede">
            {fixture.a_short} v {fixture.b_short}
          </p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            <FixtureForm franchises={franchises} fixture={fixture} />
          </div>
          <p>
            <Link href="/admin/fixtures">All fixtures</Link>
            {" · "}
            <Link href={`/fixtures/${fixture.id}`}>Public page</Link>
          </p>
        </div>
      </section>
    </>
  );
}
