import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { uploadOwnPhoto } from "@/app/actions/media";
import { updateOwnProfile } from "@/app/actions/players";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { Nav } from "@/components/Nav";
import { PhotoCircle } from "@/components/PhotoCircle";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PlayerStatsDetail } from "@/components/PlayerStats";
import { ProfileForm } from "@/components/ProfileForm";
import { mediaPath } from "@/lib/media";
import { getProfileByUserId } from "@/lib/queries";
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
  try {
    profile = await getProfileByUserId(user.userId);
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <Nav user={user} active="account" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">YOUR PROFILE</div>
          <h1>{user.displayName}</h1>
          {profile ? <EligibilityBadge player={profile} /> : null}
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          {profile ? (
            <div className="photo-block">
              <PhotoCircle
                src={profile.photo_id ? mediaPath(profile.photo_id) : null}
                name={profile.full_name}
                size="lg"
              />
              <PhotoUpload action={uploadOwnPhoto} label="Photo" />
            </div>
          ) : null}
          {profile ? <PlayerStatsDetail player={profile} /> : null}
          <div className="form-card">
            {profile ? (
              <ProfileForm player={profile} action={updateOwnProfile} />
            ) : (
              <p>No player profile is attached to this account.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
