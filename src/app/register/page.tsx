import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CricketMarks } from "@/components/CricketIcon";
import { CricketPitch } from "@/components/CricketPitch";
import { Nav } from "@/components/Nav";
import { RegisterForm } from "@/components/RegisterForm";
import { homeForRole } from "@/lib/access";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Register" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getSession();
  const home = homeForRole(user?.role);
  if (home) redirect(home);

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap page-hero-row">
          <div>
            <div className="eyebrow">SEASON 1 · DEUCE BALL</div>
            <h1>Register to play</h1>
            <p className="lede">Name, contact, eligibility, and your CricHeroes profile.</p>
            <CricketMarks />
          </div>
          <CricketPitch compact />
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            <RegisterForm />
          </div>
        </div>
      </section>
    </>
  );
}
