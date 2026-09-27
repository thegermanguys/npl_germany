# NPL Germany

Season 1 portal for NPL Germany. The public site keeps the existing franchise
pages and gallery. Players register themselves. Franchise owners inspect the
full player list in auction. An admin sits above both.

Season 1 is **deuce ball** only.

## Stack

- Next.js (App Router)
- Neon Postgres
- Signed session cookies (player, franchise owner, admin)

## Setup

1. Copy `.env.example` to `.env.local`.
2. Put your Neon connection string in `DATABASE_URL`. Do not commit it.
3. Set `AUTH_SECRET` to a long random string.
4. Optional: set `ADMIN_PASSWORD` so setup can hash the league admin password.
   The admin email is always `nplgermany.admin@thegermanguy.org`. If you skip
   this, insert a bcrypt hash on `users.password_hash` in Neon. Do not commit
   a password.
5. Install and apply the schema:

```bash
npm install
npm run db:setup
npm run dev
```

`db/schema.sql` is the source of truth. `npm run db:setup` applies it, seeds the
six franchises, creates Season 1 as deuce ball, and creates the admin user.
Vercel preview/production builds run the same setup via `vercel-build` when
`DATABASE_URL` is present. The build does not require `AUTH_SECRET` (sessions
need it at runtime). The app reads the pooled `DATABASE_URL`. Setup prefers
`DATABASE_URL_UNPOOLED` or `DIRECT_URL` when those are present.

This repo is a Next.js app at the project root (`vercel.json` sets the
framework). In the Vercel project **npl-germany**:

1. Settings → General → Framework Preset → **Next.js**. Leave Output Directory
   empty. Root Directory must stay empty / `.` (not `public`).
2. Settings → Domains → assign **nplgermany.thegermanguy.org** to this
   project’s Production. `npl-germany.vercel.app` should stay on the same
   project (it currently redirects to the custom domain).
3. Redeploy Production after those settings match. A leftover **Other**
   framework or Output Directory of `public` / `.` serves no `index.html` and
   returns Vercel’s platform `4040 NOT_FOUND`.

## Roles

| Role | How the account is created | What they see |
| --- | --- | --- |
| Player | Self-register on `/register` or the home form | Own profile, CricHeroes, stats |
| Franchise owner | Admin creates the account | Eligible (buyable) player list, profiles, stats |
| Admin | Seeded as `nplgermany.admin@thegermanguy.org` | Users, eligibility, franchises, season, logos, player records |

Season 1 eligibility is Nepali + legal status living in Germany. Admin confirms or rejects.
Only confirmed eligible players are buyable in the auction list.

CricHeroes: store a `chshare.link/player/…` or `cricheroes.com/player-profile/…` URL.
Share links are followed to the player page (sample: https://chshare.link/player/gwWBUh →
Awanish, 38 Matches / 422 Runs / 21 Wickets). The auction list and profile use that
three-stat card. There is no CricHeroes API key. If the page cannot be read, enter the
same card stats by hand. The profile link stays on the list.

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
npm run db:setup
```

## What stayed

The existing look (colors, franchises, gallery, player cards) is reused. The
old mailto form, founder-dashboard passcode, and leftover helper copy are gone.
Sample roster rows from `data/players.js` are no longer the source of truth —
registered players live in Neon.

Player photos, franchise logos, and the NPL Germany logo are stored as
`bytea` rows in Neon `media_assets` and served from `/api/media/[id]`.
Cricketing profile photos are circular. The league logo is also the admin
profile photo.
