import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ballLabel, isDatabaseConfigured } from "@/lib/db";
import { countUsersByRole, getCurrentSeason, listPlayers } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSession();
  if (!isAdmin(user)) redirect("/login");

  if (!isDatabaseConfigured()) {
    return (
      <>
        <Nav user={user} active="admin" />
        <section className="players-section">
          <div className="wrap">
            <div className="empty-note">The league database is not connected yet.</div>
          </div>
        </section>
      </>
    );
  }

  const [season, counts] = await Promise.all([getCurrentSeason(), countUsersByRole()]);
  const players = season ? await listPlayers(season.id) : [];

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">LEAGUE ADMIN</div>
          <h1>Season 1</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <div className="admin-nav">
            <Link href="/admin/users">Users</Link>
            <Link href="/admin/franchises">Franchises</Link>
            <Link href="/admin/season">Season</Link>
            <Link href="/players">Player list</Link>
          </div>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="k">Players</div>
              <div className="v">{counts.player}</div>
            </div>
            <div className="stat-card">
              <div className="k">Owners</div>
              <div className="v">{counts.franchise_owner}</div>
            </div>
            <div className="stat-card">
              <div className="k">Ball</div>
              <div className="v">{season ? ballLabel(season.ball_type) : "Deuce ball"}</div>
            </div>
            <div className="stat-card">
              <div className="k">Status</div>
              <div className="v">{season?.status ?? "—"}</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>{player.full_name}</td>
                    <td>{player.city}</td>
                    <td>{player.playing_role}</td>
                    <td>
                      <Link href={`/players/${player.id}`}>Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {players.length === 0 ? <div className="empty-note">No players yet.</div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
