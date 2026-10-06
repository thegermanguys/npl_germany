import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { uploadFranchiseLogo } from "@/app/actions/media";
import { FranchiseEditForm } from "@/components/AdminForms";
import { FranchiseRoster } from "@/components/ClubDesk";
import { AddFranchiseForm } from "@/components/RoleForms";
import { Nav } from "@/components/Nav";
import { PhotoControl } from "@/components/PhotoControl";
import { isLeagueSuperAdmin } from "@/lib/access";
import { isDatabaseConfigured } from "@/lib/db";
import { mediaPath } from "@/lib/media";
import { listFranchiseStaff, listFranchises } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Franchises" };
export const dynamic = "force-dynamic";

export default async function AdminFranchisesPage() {
  const user = await getSession();
  if (!isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const [franchises, staff] = await Promise.all([listFranchises(), listFranchiseStaff()]);
  const superAdmin = isLeagueSuperAdmin(user);

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN</div>
          <h1>Franchises</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap franchise-admin">
          {superAdmin ? (
            <div className="form-card span-all">
              <h3>Add franchise</h3>
              <AddFranchiseForm />
            </div>
          ) : null}
          {franchises.map((franchise) => (
            <div className="form-card" key={franchise.id}>
              <PhotoControl
                action={uploadFranchiseLogo}
                name="logo"
                title={franchise.full_name}
                src={franchise.logo_id ? mediaPath(franchise.logo_id) : null}
                size="md"
                hidden={{ franchiseId: franchise.id }}
                invite="Add logo"
              />
              <FranchiseEditForm franchise={franchise} />
              {superAdmin ? (
                <FranchiseRoster
                  franchise={franchise}
                  staff={staff.filter((person) => person.franchise_id === franchise.id)}
                />
              ) : null}
            </div>
          ))}
          <p>
            <Link href="/admin">Back</Link>
          </p>
        </div>
      </section>
    </>
  );
}
