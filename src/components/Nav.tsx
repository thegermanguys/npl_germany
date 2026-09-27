import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import { SignOutButton } from "./SignOutButton";

export function Nav({
  user,
  active,
}: {
  user: SessionUser | null;
  active?: "players" | "gallery" | "admin" | "account";
}) {
  const ctaHref = user ? (user.role === "admin" ? "/admin" : user.role === "franchise_owner" ? "/players" : "/account") : "/register";
  const ctaLabel = user ? user.displayName : "Register to play";

  return (
    <nav className="nav">
      <div className="wrap">
        <Link className="brand" href="/">
          <span className="mark">N</span>
          <span className="word">
            NPL <span>GERMANY</span>
          </span>
        </Link>
        <div className="navlinks">
          <Link href="/#about">About</Link>
          <Link href="/#franchises">Franchises</Link>
          <Link href="/#format">Format</Link>
          <Link href="/players" className={active === "players" ? "active" : undefined}>
            Players
          </Link>
          <Link href="/gallery" className={active === "gallery" ? "active" : undefined}>
            Gallery
          </Link>
          {user?.role === "admin" ? (
            <Link href="/admin" className={active === "admin" ? "active" : undefined}>
              Admin
            </Link>
          ) : null}
          {user ? (
            <Link href={user.role === "player" ? "/account" : ctaHref} className={active === "account" ? "active" : undefined}>
              Account
            </Link>
          ) : (
            <Link href="/login">Sign in</Link>
          )}
        </div>
        {user ? (
          <div className="nav-account">
            <Link className="nav-cta" href={ctaHref}>
              {ctaLabel}
            </Link>
            <SignOutButton className="nav-signout" />
          </div>
        ) : (
          <Link className="nav-cta" href="/register">
            Register to play
          </Link>
        )}
      </div>
    </nav>
  );
}
