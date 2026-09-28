import Link from "next/link";
import { LEAGUE_LOGO_SRC } from "@/lib/brand";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <img className="foot-mark" src={LEAGUE_LOGO_SRC} alt="" />
            <div className="word">NPL GERMANY</div>
            <p>
              Nepal Premier League, Germany Chapter. Season 1 is deuce ball, for Nepali citizens
              residing in Germany.
            </p>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h4>League</h4>
              <Link href="/#about">About</Link>
              <Link href="/#franchises">Franchises</Link>
              <Link href="/#format">Format</Link>
            </div>
            <div className="foot-col">
              <h4>Portal</h4>
              <Link href="/register">Register to play</Link>
              <Link href="/players">Players</Link>
              <Link href="/login">Sign in</Link>
            </div>
            <div className="foot-col">
              <h4>Founded by</h4>
              <p>Awanish</p>
              <p>Founder &amp; President, NPL Germany</p>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 NPL Germany. Independent Nepali diaspora cricket league.</span>
          <span className="foot-credit">
            Built by{" "}
            <a href="https://www.thegermanguy.org">The German Guy</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
