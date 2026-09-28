import type { Metadata } from "next";
import { CricketMarks } from "@/components/CricketIcon";
import { CricketPitch } from "@/components/CricketPitch";
import { Nav } from "@/components/Nav";
import { PlayersDirectory } from "@/components/PlayersDirectory";
import { ballLabel } from "@/lib/db";
import { playersForViewer } from "@/lib/eligibility";
import { loadPortal } from "@/lib/portal";
import { canInspectPlayers } from "@/lib/session";

export const metadata: Metadata = { title: "Players" };
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const { user, configured, season, players, franchises } = await loadPortal();
  const inspect = canInspectPlayers(user);
  const visible = playersForViewer(players, user);
  const franchiseCities = franchises.map((franchise) => franchise.city);

  return (
    <>
      <Nav user={user} active="players" />
      <section className="page-hero">
        <div className="wrap page-hero-row">
          <div>
            <div className="eyebrow">
              {season?.name ?? "SEASON 1"} · {season ? ballLabel(season.ball_type).toUpperCase() : "DEUCE BALL"}
            </div>
            <h1>Players</h1>
            <p className="lede">
              {inspect
                ? "Eligible players for auction. Stats and CricHeroes sit on each row."
                : "Eligible players for Season 1."}
            </p>
            <CricketMarks />
          </div>
          <CricketPitch compact />
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          {!configured ? (
            <div className="empty-note">The player list is not connected yet.</div>
          ) : (
            <PlayersDirectory
              players={visible}
              inspect={inspect}
              showEligibility={user?.role === "admin"}
              franchiseCities={franchiseCities}
            />
          )}
        </div>
      </section>
    </>
  );
}
