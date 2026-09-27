import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { PlayersDirectory } from "@/components/PlayersDirectory";
import { ballLabel } from "@/lib/db";
import { loadPortal } from "@/lib/portal";
import { canInspectPlayers } from "@/lib/session";

export const metadata: Metadata = { title: "Players" };
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const { user, configured, season, players } = await loadPortal();
  const inspect = canInspectPlayers(user);

  return (
    <>
      <Nav user={user} active="players" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">
            {season?.name ?? "SEASON 1"} · {season ? ballLabel(season.ball_type).toUpperCase() : "DEUCE BALL"}
          </div>
          <h1>Players</h1>
          <p className="lede">
            {inspect
              ? "Every registered player. Open a profile before you bid."
              : "Registered players for Season 1."}
          </p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          {!configured ? (
            <div className="empty-note">The player list is not connected yet.</div>
          ) : (
            <PlayersDirectory players={players} inspect={inspect} />
          )}
        </div>
      </section>
    </>
  );
}
