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
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the first admin account.
5. Install and apply the schema:

```bash
npm install
npm run db:setup
npm run dev
```

`db/schema.sql` is the source of truth. `npm run db:setup` applies it, seeds the
six franchises, creates Season 1 as deuce ball, and creates the admin user.

## Roles

| Role | How the account is created | What they see |
| --- | --- | --- |
| Player | Self-register on `/register` or the home form | Own profile |
| Franchise owner | Admin creates the account | Full player list and profiles |
| Admin | `npm run db:setup` using `ADMIN_*` | Users, franchises, season, player records |

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
