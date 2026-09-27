const required = ["DATABASE_URL", "AUTH_SECRET"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  console.error(`Missing Vercel env: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Vercel env present: DATABASE_URL, AUTH_SECRET");
