import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
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
          <h1>Sign in</h1>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            <LoginForm />
            <p className="form-follow">
              Players register here: <Link href="/register">Register to play</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
