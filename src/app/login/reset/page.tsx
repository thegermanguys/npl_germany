import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { Nav } from "@/components/Nav";
import { homeForRole } from "@/lib/access";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Set password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getSession();
  const home = homeForRole(user?.role);
  if (home) redirect(home);

  const { token } = await searchParams;

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">PORTAL</div>
          <h1>Set password</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <p>That reset link is not valid.</p>
            )}
            <p className="form-follow">
              <Link href="/login">Back to sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
