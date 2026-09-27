import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function firstUrl(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return { name, value };
  }
  return null;
}

function urlKind(raw) {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return host.includes("pooler") ? "pooled" : "direct";
  } catch {
    return "unknown";
  }
}

const setupSource =
  firstUrl("DATABASE_URL_UNPOOLED", "DIRECT_URL", "POSTGRES_URL_NON_POOLING") ??
  firstUrl("DATABASE_URL");

if (!setupSource) {
  console.error(
    "Missing DATABASE_URL (pooled). For DDL you can also set DATABASE_URL_UNPOOLED or DIRECT_URL.",
  );
  process.exit(1);
}

const kind = urlKind(setupSource.value);
console.log(`applying schema via ${setupSource.name} (${kind})`);
const sql = neon(setupSource.value);

function splitSql(source) {
  return source
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `${part};`);
}

const franchises = [
  {
    slug: "frankfurt-gorkhas",
    city: "Frankfurt",
    name: "Gorkhas",
    fullName: "Frankfurt Gorkhas",
    tagline: "The frontline never blinks.",
    description:
      "Named for the Gorkha soldier's reputation — fearless under pressure. Frankfurt hosts one of Germany's largest Nepali communities, built around its airport and finance-sector jobs.",
    colorKey: "frankfurt",
    sortOrder: 1,
  },
  {
    slug: "munich-yetis",
    city: "Munich",
    name: "Yetis",
    fullName: "Munich Yetis",
    tagline: "Cold pitch, colder nerve.",
    description:
      "The mythical Himalayan yeti — rarely seen, hard to rattle. Munich's Nepali community has grown fast around its universities and engineering firms.",
    colorKey: "munich",
    sortOrder: 2,
  },
  {
    slug: "berlin-rhinos",
    city: "Berlin",
    name: "Rhinos",
    fullName: "Berlin Rhinos",
    tagline: "Every catch, a rescue.",
    description:
      "The one-horned rhino of Chitwan — Nepal's national animal. Berlin's franchise draws from the capital's students, embassy families and young professionals.",
    colorKey: "berlin",
    sortOrder: 3,
  },
  {
    slug: "hamburg-sherpas",
    city: "Hamburg",
    name: "Sherpas",
    fullName: "Hamburg Sherpas",
    tagline: "We carry the innings home.",
    description: "Named for the sherpas who carry others to the summit. Hamburg's port-city Nepali community anchors this franchise.",
    colorKey: "hamburg",
    sortOrder: 4,
  },
  {
    slug: "cologne-khukuris",
    city: "Cologne",
    name: "Khukuris",
    fullName: "Cologne Khukuris",
    tagline: "One clean swing decides it.",
    description:
      "The khukuri — Nepal's iconic curved blade, a symbol of decisive action. Cologne and the surrounding Rhineland hold a steadily growing Nepali base.",
    colorKey: "cologne",
    sortOrder: 5,
  },
  {
    slug: "stuttgart-garudas",
    city: "Stuttgart",
    name: "Garudas",
    fullName: "Stuttgart Garudas",
    tagline: "Hard to move, harder to stop.",
    description:
      "Garuda, the great mythical bird of Hindu and Nepali tradition. Stuttgart's automotive-sector Nepali workforce gives this franchise its steady, engineering-minded core.",
    colorKey: "stuttgart",
    sortOrder: 6,
  },
];

const schema = readFileSync(join(root, "db/schema.sql"), "utf8");
const statements = splitSql(schema);

for (const statement of statements) {
  await sql.query(statement);
  const preview = statement.replace(/\s+/g, " ").slice(0, 72);
  console.log(`applied: ${preview}`);
}

for (const franchise of franchises) {
  await sql`
    INSERT INTO franchises (slug, city, name, full_name, tagline, description, color_key, sort_order)
    VALUES (
      ${franchise.slug}, ${franchise.city}, ${franchise.name}, ${franchise.fullName},
      ${franchise.tagline}, ${franchise.description}, ${franchise.colorKey}, ${franchise.sortOrder}
    )
    ON CONFLICT (slug) DO UPDATE SET
      city = EXCLUDED.city,
      name = EXCLUDED.name,
      full_name = EXCLUDED.full_name,
      tagline = EXCLUDED.tagline,
      description = EXCLUDED.description,
      color_key = EXCLUDED.color_key,
      sort_order = EXCLUDED.sort_order
  `;
}
console.log("seeded 6 franchises");

await sql`
  INSERT INTO seasons (name, year, ball_type, status, is_current)
  SELECT 'Season 1', 2026, 'deuce', 'registration', true
  WHERE NOT EXISTS (SELECT 1 FROM seasons WHERE is_current)
`;
console.log("ensured Season 1 (deuce ball)");

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  await sql`
    INSERT INTO users (email, password_hash, role, display_name)
    VALUES (${adminEmail}, ${hash}, 'admin', 'League admin')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log(`admin account ready for ${adminEmail}`);
} else {
  console.log("skipped admin seed (set ADMIN_EMAIL and ADMIN_PASSWORD to create one)");
}

console.log("setup complete");
