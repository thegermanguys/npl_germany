import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateAccountForm } from "@/components/AdminForms";
import { Nav } from "@/components/Nav";
import { isDatabaseConfigured } from "@/lib/db";
import { listFranchises, listUsers } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!isAdmin(user)) redirect("/login");
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
          <div className="form-card">
            <h3>Create account</h3>
            <CreateAccountForm franchises={franchises} />
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Franchise</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id}>
                    <td>{row.display_name}</td>
                    <td>{row.email}</td>
                    <td>{row.role.replace("_", " ")}</td>
                    <td>{row.franchise_name || "—"}</td>
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
