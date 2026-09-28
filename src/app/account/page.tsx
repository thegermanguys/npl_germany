import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { uploadOwnDocument, uploadOwnPhoto } from "@/app/actions/media";
import { updateOwnProfile } from "@/app/actions/players";
import { DocumentSlots } from "@/components/DocumentSlots";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { Nav } from "@/components/Nav";
import { PhotoControl } from "@/components/PhotoControl";
import { PlayerStatsDetail } from "@/components/PlayerStats";
import { ProfileForm } from "@/components/ProfileForm";
import { mediaPath } from "@/lib/media";
import { getPlayerDocuments, getProfileByUserId } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "franchise_owner") redirect("/players");

  if (!isDatabaseConfigured()) {
    return (
      <>
        <Nav user={user} active="account" />
        <section className="players-section">
          <div className="wrap">
            <div className="empty-note">The league database is not connected yet.</div>
          </div>
        </section>
      </>
    );
  }

  let profile = null;
  let documents = null;
  try {
    profile = await getProfileByUserId(user.userId);
    if (profile) documents = await getPlayerDocuments(profile.id);
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <Nav user={user} active="account" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">YOUR PROFILE</div>
          {profile ? <EligibilityBadge player={profile} /> : <h1>{user.displayName}</h1>}
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          {profile ? (
            <PhotoControl
              action={uploadOwnPhoto}
              title={profile.full_name}
              lines={[profile.city, profile.playing_role]}
              src={profile.photo_id ? mediaPath(profile.photo_id) : null}
            />
          ) : null}
          {profile ? <PlayerStatsDetail player={profile} /> : null}
          <div className="form-card">
            {profile ? (
              <ProfileForm player={profile} action={updateOwnProfile} />
            ) : (
              <p>No player profile is attached to this account.</p>
            )}
          </div>
          {documents ? <DocumentSlots documents={documents} action={uploadOwnDocument} /> : null}
        </div>
      </section>
    </>
  );
}
