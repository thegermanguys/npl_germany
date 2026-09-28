import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { SeasonForm } from "@/components/AdminForms";
import { Nav } from "@/components/Nav";
import { isDatabaseConfigured } from "@/lib/db";
import { getCurrentSeason } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Season" };
export const dynamic = "force-dynamic";

export default async function AdminSeasonPage() {
  const user = await getSession();
  if (!isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const season = await getCurrentSeason();

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN</div>
          <h1>Season</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            {season ? <SeasonForm season={season} /> : <p>No current season.</p>}
          </div>
          <p>
            <Link href="/admin">Back</Link>
          </p>
        </div>
      </section>
    </>
  );
}
