import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { Nav } from "@/components/Nav";
import { homeForRole } from "@/lib/access";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const user = await getSession();
  const home = homeForRole(user?.role);
  if (home) redirect(home);
  const { reset } = await searchParams;

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
            {reset ? <div className="form-msg ok">Password updated. Sign in.</div> : null}
            <LoginForm />
            <p className="form-follow">
              <Link href="/login/forgot">Forgot password?</Link>
            </p>
            <p className="form-follow">
              Players register here: <Link href="/register">Register to play</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
