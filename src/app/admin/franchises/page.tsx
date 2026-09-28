import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { uploadFranchiseLogo } from "@/app/actions/media";
import { FranchiseEditForm } from "@/components/AdminForms";
import { Nav } from "@/components/Nav";
import { PhotoControl } from "@/components/PhotoControl";
import { isDatabaseConfigured } from "@/lib/db";
import { mediaPath } from "@/lib/media";
import { listFranchises } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Franchises" };
export const dynamic = "force-dynamic";

export default async function AdminFranchisesPage() {
  const user = await getSession();
  if (!isAdmin(user)) redirect("/403");
  if (!isDatabaseConfigured()) redirect("/admin");

  const franchises = await listFranchises();

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
