import Link from "next/link";
import { FRANCHISE_COPY } from "@/data/franchises";
import { FranchiseIcon } from "@/components/FranchiseIcon";
import { Nav } from "@/components/Nav";
import { RegisterForm } from "@/components/RegisterForm";
import { ballLabel } from "@/lib/db";
import { mediaPath } from "@/lib/media";
import { loadPortal } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, season, franchises } = await loadPortal();
  const logos = new Map(franchises.map((row) => [row.slug, row.logo_id]));
  const ball = season ? ballLabel(season.ball_type) : "Deuce ball";

  return (
    <>
      <Nav user={user} />
      <section className="hero" id="top">
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">DEUCE-BALL CRICKET · NEPALI DIASPORA · GERMANY</div>
            <h1>
              NPL <span className="accent">GERMANY</span>
            </h1>
            <div className="sub-h">Nepal Premier League — Germany Chapter</div>
            <p className="lede">
              Six German cities, one Nepali flag on the boundary rope. NPL Germany is the first
              cricket league built only for Nepali citizens living in Germany — every ground
              doubles as a <em>chautari</em>, the gathering place we&apos;ve been missing since we
              left home.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="#join">
                Register to play
              </Link>
              <Link className="btn btn-ghost" href="#franchises">
                Meet the 6 franchises
              </Link>
            </div>
          </div>
          <div className="hero-badge">
            <div className="label">SEASON ONE AT A GLANCE</div>
            <div className="hb-row">
              <span className="k">Ball</span>
              <span className="v">{ball}</span>
            </div>
            <div className="hb-row">
              <span className="k">Franchises</span>
              <span className="v">6</span>
            </div>
            <div className="hb-row">
              <span className="k">Eligibility</span>
              <span className="v">Nepali citizens, Germany</span>
            </div>
            <div className="hb-row">
              <span className="k">Season</span>
              <span className="v">{season?.name ?? "Season 1"}</span>
            </div>
          </div>
        </div>

        <div className="ribbon-wrap">
          <svg className="ribbon" viewBox="0 0 1200 90" preserveAspectRatio="none">
            <polygon
              points="0,90 0,55 90,10 180,50 260,20 340,55 430,15 520,52 600,25 690,58 780,18 870,50 960,22 1050,55 1140,15 1200,45 1200,90"
              fill="#08182F"
            />
          </svg>
          <div className="peak-nav">
            {FRANCHISE_COPY.map((franchise) => (
              <a key={franchise.slug} href={`#f-${franchise.city.toLowerCase()}`}>
                {franchise.city.toUpperCase()}
                <span>{franchise.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="stat-strip">
        <div className="wrap">
          <span>6 FRANCHISES</span>
          <span className="dot">·</span>
          <span>100% NEPALI ROSTERS</span>
          <span className="dot">·</span>
          <span>SEASON ONE — DEUCE BALL</span>
        </div>
      </div>

      <section className="about" id="about">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">WHY NPL GERMANY</div>
            <h2>Built by the diaspora, for the diaspora</h2>
            <p>
              NPL Germany exists because Nepali cricket talent in Germany had nowhere organised to
              play. We&apos;re starting small, starting honest, and building toward something Cricket
              Association of Nepal can eventually stand behind.
            </p>
          </div>
          <div className="pillars">
            <div className="pillar">
              <div className="num">01 · WHO PLAYS</div>
              <h3>Nepali citizens, only</h3>
              <p>
                Every player on every franchise must hold Nepali citizenship and currently reside in
                Germany. No open club cricket — this is diaspora cricket, and the roster rule is the
                whole point.
              </p>
            </div>
            <div className="pillar">
              <div className="num">02 · HOW WE START</div>
              <h3>Deuce ball, real fixtures</h3>
              <p>
                Season One runs on a deuce ball — cheap gear, easy on shins and budgets, and the
                fastest way to get six cities playing proper matches instead of waiting for perfect
                grounds.
              </p>
            </div>
            <div className="pillar">
              <div className="num">03 · THE PORTAL</div>
              <h3>Register, then get seen</h3>
              <p>
                Players sign up themselves. Franchise owners open the full list in auction. An admin
                sits above both.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="franchises" id="franchises">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">SIX CITIES, SIX FRANCHISES</div>
            <h2>The six</h2>
            <p>
              One franchise per city. Names drawn from Nepal&apos;s own symbols — the Gorkha
              soldier, the Himalayan yeti, the one-horned rhino, the sherpa, the khukuri blade, the
              Garuda — planted on German ground.
            </p>
          </div>
          <div className="fr-grid">
            {FRANCHISE_COPY.map((franchise) => {
              const logoId = logos.get(franchise.slug);
              return (
                <div className="fr-card" id={`f-${franchise.city.toLowerCase()}`} key={franchise.slug}>
                  <div className="fr-top" style={{ background: `var(--${franchise.colorVar})` }}>
                    <div className="fr-city">{franchise.city.toUpperCase()}</div>
                    <h3>{franchise.name}</h3>
                    <div className="fr-logo">
                      {logoId ? (
                        <img src={mediaPath(logoId)} alt={`${franchise.city} ${franchise.name} logo`} />
                      ) : (
                        <FranchiseIcon icon={franchise.icon} />
                      )}
                    </div>
                  </div>
                  <div className="fr-body">
                    <div className="tag">&ldquo;{franchise.tagline}&rdquo;</div>
                    <p>{franchise.description}</p>
                    <Link className="fr-link" href="/players">
                      View players →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="format" id="format">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">SEASON ONE</div>
            <h2>Deuce ball only</h2>
            <p>Season 1 stays on deuce ball. That is the whole format for this year.</p>
          </div>
          <div className="tl">
            <div className="tl-item">
              <div className="stage">STAGE 01 · SEASON ONE, 2026</div>
              <h3>Deuce-ball league across six cities</h3>
              <p>
                Short-format weekend fixtures between the six franchises, hosted on grounds already
                available to each city&apos;s Nepali cricket groups. Low-cost gear keeps the door
                open to every player regardless of income.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="join" id="join">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-eyebrow">PLAYER REGISTRATION</div>
            <h2>Put your name in the auction list</h2>
            <p>Name, contact, eligibility, and your CricHeroes profile. Nothing extra.</p>
          </div>
          <div className="join-grid">
            <div>
              <ul className="checklist">
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  </span>
                  Hold Nepali citizenship
                </li>
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  </span>
                  Legal status living in Germany
                </li>
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  </span>
                  Season 1 is deuce ball
                </li>
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  </span>
                  Any playing role — batter, bowler, all-rounder, keeper
                </li>
              </ul>
            </div>
            <div className="form-card">
              <h3>Register to play</h3>
              {user ? (
                <p>You&apos;re signed in as {user.displayName}.</p>
              ) : (
                <RegisterForm compact />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
