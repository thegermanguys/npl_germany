import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { AdminSetPasswordForm, CreateAccountForm } from "@/components/AdminForms";
import { InviteLeagueAdminForm, RemoveLeagueAdminForm } from "@/components/RoleForms";
import { Nav } from "@/components/Nav";
import { canChangeAccount, canRemoveLeagueAdmin, isLeagueSuperAdmin, roleLabel } from "@/lib/access";
import { isDatabaseConfigured } from "@/lib/db";
import { listFranchises, listUsers } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!isAdmin(user)) forbidden();
  if (!isDatabaseConfigured()) redirect("/admin");

  const [users, franchises] = await Promise.all([listUsers(), listFranchises()]);

  return (
    <>
      <Nav user={user} active="admin" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">ADMIN</div>
          <h1>Users</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap admin-split">
          <div className="form-stack">
            {isLeagueSuperAdmin(user) ? (
              <div className="form-card">
                <h3>Invite league admin</h3>
                <InviteLeagueAdminForm />
              </div>
            ) : null}
            <div className="form-card">
              <h3>Create account</h3>
              <CreateAccountForm franchises={franchises} />
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Franchise</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id}>
                    <td>{row.display_name}</td>
                    <td>{row.email}</td>
                    <td>
                      {roleLabel(row)}
                      {isLeagueSuperAdmin(row) ? <div className="muted">This account stays.</div> : null}
                    </td>
                    <td>{row.franchise_name || "—"}</td>
                    <td>
                      {canRemoveLeagueAdmin(user, row) ? <RemoveLeagueAdminForm userId={row.id} /> : null}
                      {canChangeAccount(user, row) ? <AdminSetPasswordForm userId={row.id} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <Link href="/admin">Back</Link>
          </p>
        </div>
      </section>
    </>
  );
}
