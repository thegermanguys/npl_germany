import type { Metadata } from "next";
import Link from "next/link";
import { forbidden } from "next/navigation";
import { StaffList } from "@/components/ClubDesk";
import { Nav } from "@/components/Nav";
import { canManageClubStaff } from "@/lib/access";
import { isDatabaseConfigured } from "@/lib/db";
import { formatEuro } from "@/lib/auction";
import { franchiseForUser, listFranchiseStaff, listSquad } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Club" };
export const dynamic = "force-dynamic";

export default async function OwnerDeskPage() {
  const user = await getSession();
  if (!user) forbidden();

  if (!isDatabaseConfigured()) {
    return (
      <>
        <Nav user={user} active="owner" />
        <section className="players-section">
          <div className="wrap">
            <div className="empty-note">The league database is not connected yet.</div>
          </div>
        </section>
      </>
    );
  }

  const franchise = await franchiseForUser(user.userId);
  const staff = franchise
    ? (await listFranchiseStaff()).filter((person) => person.franchise_id === franchise.id)
    : [];
  const squad = franchise ? await listSquad(franchise.id) : [];
  const canEditStaff = canManageClubStaff(user.role);

  return (
    <>
      <Nav user={user} active="owner" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{canEditStaff ? "FRANCHISE OWNER" : "FRANCHISE STAFF"}</div>
          <h1>{franchise ? franchise.full_name : "Club"}</h1>
          {franchise ? (
            <p className="lede">
              {franchise.city}
              {franchise.owner_name ? ` · ${franchise.owner_name}` : ""}
            </p>
          ) : (
            <p className="lede">No club is assigned to this account.</p>
          )}
        </div>
      </section>
      {franchise ? (
        <section className="players-section">
          <div className="wrap admin-split">
            <div className="form-card">
              <h3>Squad</h3>
              <p className="muted">
                Purse {formatEuro(franchise.purse_spent)} of {formatEuro(franchise.purse_total)}
              </p>
              {squad.length === 0 ? <div className="empty-note">No players yet.</div> : null}
              {squad.length > 0 ? (
                <div className="staff-list">
                  {squad.map((player) => (
                    <div className="staff-row" key={player.id}>
                      <Link href={`/players/${player.id}`}>{player.full_name}</Link>
                      <span className="muted">{player.playing_role}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="form-card">
              <h3>Staff</h3>
              <StaffList franchiseId={franchise.id} staff={staff} canEdit={canEditStaff} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
