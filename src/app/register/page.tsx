import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { RegisterForm } from "@/components/RegisterForm";
import { isDatabaseConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Register" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getSession();
  if (user?.role === "player") redirect("/account");
  if (user?.role === "admin") redirect("/admin");
  if (user?.role === "franchise_owner") redirect("/players");

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">SEASON 1 · DEUCE BALL</div>
          <h1>Register to play</h1>
          <p className="lede">Name, contact, eligibility, and your CricHeroes profile.</p>
        </div>
      </section>
      <section className="players-section">
        <div className="wrap narrow">
          <div className="form-card">
            {isDatabaseConfigured() ? (
              <RegisterForm />
            ) : (
              <p>Registration opens once the league database is connected.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
