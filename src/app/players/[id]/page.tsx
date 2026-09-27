import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminUpdatePlayer } from "@/app/actions/admin";
import { uploadPlayerPhoto } from "@/app/actions/media";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { EligibilityReview } from "@/components/EligibilityReview";
import { Nav } from "@/components/Nav";
import { PhotoCircle } from "@/components/PhotoCircle";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PlayerStatsDetail } from "@/components/PlayerStats";
import { ProfileForm } from "@/components/ProfileForm";
import { DbNotConfiguredError, ballLabel, isDatabaseConfigured } from "@/lib/db";
import { canViewPlayer } from "@/lib/eligibility";
import { mediaPath } from "@/lib/media";
import { getCurrentSeason, getProfileById, listFranchises } from "@/lib/queries";
import { canInspectPlayers, getSession, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!isDatabaseConfigured()) return { title: "Player" };
  try {
    const { id } = await params;
    const player = await getProfileById(id);
    return { title: player?.full_name ?? "Player" };
  } catch {
    return { title: "Player" };
  }
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();
  if (!isDatabaseConfigured()) {
    return (
      <>
        <Nav user={user} active="players" />
        <section className="players-section">
          <div className="wrap">
            <div className="empty-note">The player list is not connected yet.</div>
          </div>
        </section>
      </>
    );
  }

  let player;
  let season;
  let franchises;
  try {
    [player, season, franchises] = await Promise.all([
      getProfileById(id),
      getCurrentSeason(),
      listFranchises(),
    ]);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) notFound();
    throw error;
  }
  if (!player) notFound();
  if (!canViewPlayer(player, user)) notFound();

  const inspect = canInspectPlayers(user) || user?.userId === player.user_id;
  const admin = isAdmin(user);

  return (
    <>
      <Nav user={user} active="players" />
      <section className="page-hero">
        <div className="wrap profile-hero">
          <PhotoCircle
            src={player.photo_id ? mediaPath(player.photo_id) : null}
            name={player.full_name}
            size="lg"
          />
          <div>
            <div className="eyebrow">
              {season?.name ?? "SEASON 1"} · {season ? ballLabel(season.ball_type).toUpperCase() : "DEUCE BALL"}
            </div>
            <h1>{player.full_name}</h1>
            <p className="lede">
              {player.playing_role} · {player.city}
              {player.franchise_name ? ` · ${player.franchise_name}` : ""}
            </p>
            <EligibilityBadge player={player} />
          </div>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap profile-grid">
          <div className="profile-card">
            {user?.userId === player.user_id || admin ? (
              <PhotoUpload
                action={uploadPlayerPhoto}
                label="Photo"
                hidden={{ profileId: player.id }}
              />
            ) : null}
            <dl className="profile-dl">
              <div>
                <dt>Role</dt>
                <dd>{player.playing_role}</dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{player.city}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{player.experience}</dd>
              </div>
              <div>
                <dt>Ball</dt>
                <dd>{season ? ballLabel(season.ball_type) : "Deuce ball"}</dd>
              </div>
              {player.batting_hand ? (
                <div>
                  <dt>Batting</dt>
                  <dd>{player.batting_hand}</dd>
                </div>
              ) : null}
              {player.bowling_style ? (
                <div>
                  <dt>Bowling</dt>
                  <dd>{player.bowling_style}</dd>
                </div>
              ) : null}
              {inspect ? (
                <>
                  <div>
                    <dt>Email</dt>
                    <dd>{player.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{player.phone || "—"}</dd>
                  </div>
                </>
              ) : null}
              <div>
                <dt>Franchise</dt>
                <dd>{player.franchise_name || "Unassigned"}</dd>
              </div>
              <div>
                <dt>Nepali</dt>
                <dd>{player.nepali_citizen ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt>Lives in Germany</dt>
                <dd>{player.germany_legal_resident ? "Legal resident" : "No"}</dd>
              </div>
            </dl>
            <PlayerStatsDetail player={player} />
            {admin ? <EligibilityReview player={player} /> : null}
            <Link href="/players">Back to players</Link>
          </div>
          {admin ? (
            <div className="form-card">
              <h3>Edit record</h3>
              <ProfileForm player={player} action={adminUpdatePlayer} franchises={franchises} assignFranchise />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
