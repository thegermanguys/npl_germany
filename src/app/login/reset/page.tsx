import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getSession();
  if (user?.role === "admin") redirect("/admin");
  if (user?.role === "franchise_owner") redirect("/players");
  if (user?.role === "player") redirect("/account");

  const { token } = await searchParams;

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">PORTAL</div>
          <h1>Reset password</h1>
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
