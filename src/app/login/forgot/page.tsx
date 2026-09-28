import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Forgot password" };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const user = await getSession();
  if (user?.role === "admin") redirect("/admin");
  if (user?.role === "franchise_owner") redirect("/players");
  if (user?.role === "player") redirect("/account");

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">PORTAL</div>
          <h1>Forgot password</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            <ForgotPasswordForm />
            <p className="form-follow">No email? Ask the league admin.</p>
            <p className="form-follow">
              <Link href="/login">Back to sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
