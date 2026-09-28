import type { Metadata } from "next";
import Link from "next/link";
import { forbidden } from "next/navigation";
import { uploadLeagueLogo } from "@/app/actions/media";
import { Nav } from "@/components/Nav";
import { PhotoCircle } from "@/components/PhotoCircle";
import { PhotoControl } from "@/components/PhotoControl";
import { PlayerStatsStrip } from "@/components/PlayerStats";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { EligibilityReview } from "@/components/EligibilityReview";
import { LEAGUE_ADMIN_EMAIL } from "@/lib/admin-account";
import { leagueLogoUrl } from "@/lib/branding";
import { ballLabel, isDatabaseConfigured } from "@/lib/db";
import { mediaPath } from "@/lib/media";
import { countPendingEligibility, countUsersByRole, getCurrentSeason, listPlayers } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSession();
  if (!user || !isAdmin(user)) forbidden();

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

  const [season, counts, pending, logoUrl] = await Promise.all([
    getCurrentSeason(),
    countUsersByRole(),
    countPendingEligibility(),
    leagueLogoUrl(),
  ]);
  const players = season ? await listPlayers(season.id) : [];

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap profile-hero">
          <PhotoCircle src={logoUrl} name="NPL Germany" size="lg" fit="contain" />
          <div>
            <div className="eyebrow">LEAGUE ADMIN</div>
            <h1>Season 1</h1>
            <p className="lede">{user.email}</p>
          </div>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <div className="form-card league-logo-card">
            <PhotoControl
              action={uploadLeagueLogo}
              name="logo"
              title="NPL Germany"
              src={logoUrl}
              size="md"
              fit="contain"
              invite="Add logo"
            />
            <p className="muted">{LEAGUE_ADMIN_EMAIL}</p>
          </div>
          <div className="admin-nav">
            <Link href="/admin/users">Users</Link>
            <Link href="/admin/players">Auction pool</Link>
            <Link href="/admin/auction">Auction room</Link>
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
              <div className="k">Pending</div>
              <div className="v">{pending}</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Stats</th>
                  <th>Eligibility</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <div className="name-with-photo">
                        <PhotoCircle
                          src={player.photo_id ? mediaPath(player.photo_id) : null}
                          name={player.full_name}
                          size="sm"
                        />
                        <span>{player.full_name}</span>
                      </div>
                    </td>
                    <td>{player.city}</td>
                    <td>
                      <PlayerStatsStrip player={player} />
                    </td>
                    <td>
                      <EligibilityBadge player={player} />
                      <EligibilityReview player={player} />
                    </td>
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
