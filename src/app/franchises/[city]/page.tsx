import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { franchiseColorVar, franchiseIconFromSlug } from "@/data/franchises";
import { FranchiseIcon } from "@/components/FranchiseIcon";
import { Nav } from "@/components/Nav";
import { PhotoCircle } from "@/components/PhotoCircle";
import { PurseMeter } from "@/components/PurseMeter";
import { formatEuro } from "@/lib/auction";
import { PLAYING_ROLES } from "@/lib/types";
import { mediaPath } from "@/lib/media";
import { isDatabaseConfigured } from "@/lib/db";
import { getFranchiseByCity, listSquad } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  try {
    const franchise = await getFranchiseByCity(city);
    return { title: franchise?.full_name ?? "Franchise" };
  } catch {
    return { title: "Franchise" };
  }
}

export default async function FranchisePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const user = await getSession();
  if (!isDatabaseConfigured()) notFound();
  const franchise = await getFranchiseByCity(city);
  if (!franchise) notFound();
  const squad = await listSquad(franchise.id);

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap profile-hero">
          {franchise.logo_id ? (
            <img
              className="photo-circle photo-lg photo-contain"
              src={mediaPath(franchise.logo_id)}
              alt=""
            />
          ) : (
            <div className="fr-page-icon" style={{ background: franchiseColorVar(franchise.color_key) }}>
              <FranchiseIcon icon={franchiseIconFromSlug(franchise.slug)} />
            </div>
          )}
          <div>
            <div className="eyebrow">{franchise.city.toUpperCase()}</div>
            <h1>{franchise.name}</h1>
            <p className="lede">&ldquo;{franchise.tagline}&rdquo;</p>
            {franchise.owner_name ? <p className="muted">Owner · {franchise.owner_name}</p> : null}
            <PurseMeter spent={franchise.purse_spent} total={franchise.purse_total} />
          </div>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap">
          <p>{franchise.description}</p>
          {PLAYING_ROLES.map((role) => {
            const group = squad.filter((player) => player.playing_role === role);
            if (group.length === 0) return null;
            return (
              <div className="squad-group" key={role}>
                <h2>{role}s</h2>
                <div className="players-grid">
                  {group.map((player) => (
                    <Link className="player-card" key={player.id} href={`/players/${player.id}`}>
                      <div className="player-card-photo">
                        <PhotoCircle
                          src={player.photo_id ? mediaPath(player.photo_id) : null}
                          name={player.full_name}
                          size="md"
                        />
                      </div>
                      <div className="info">
                        <p className="p-name">{player.full_name}</p>
                        <p className="p-role">{player.city}</p>
                        <span className="p-badge" style={{ background: franchiseColorVar(franchise.color_key) }}>
                          {player.sold_price != null ? formatEuro(player.sold_price) : "Sold"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {squad.length === 0 ? <div className="empty-note">No players bought yet.</div> : null}
          <p>
            <Link href="/auction">Live auction</Link>
            {" · "}
            <Link href="/">All franchises</Link>
          </p>
        </div>
      </section>
    </>
  );
}
