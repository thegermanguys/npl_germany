import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { AdminPlayersTable } from "@/components/AdminPlayersTable";
import { Nav } from "@/components/Nav";
import { isDatabaseConfigured } from "@/lib/db";
import { getCurrentSeason, listFranchises, listPlayers } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Players" };
export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const user = await getSession();
  if (!user || !isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const season = await getCurrentSeason();
  const [players, franchises] = await Promise.all([
    season ? listPlayers(season.id) : Promise.resolve([]),
    listFranchises(),
  ]);
  const cities = [...new Set([...franchises.map((row) => row.city), ...players.map((row) => row.city)])];

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN</div>
          <h1>Auction pool</h1>
          <p className="lede">Approve registrations, set a base price, then move them into the live pool.</p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <AdminPlayersTable players={players} cities={cities} />
          <p>
            <Link href="/admin">Back</Link>
            {" · "}
            <Link href="/admin/auction">Auction room</Link>
          </p>
        </div>
      </section>
    </>
  );
}
