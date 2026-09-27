import { NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { isAuthConfigured } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = isDatabaseConfigured();
  let schema = false;
  if (database) {
    try {
      const sql = getSql();
      const rows = await sql`SELECT 1 FROM seasons WHERE is_current LIMIT 1`;
      schema = rows.length > 0;
    } catch {
      schema = false;
    }
  }

  return NextResponse.json({
    ok: true,
    database,
    auth: isAuthConfigured(),
    schema,
    seasonBall: "deuce",
  });
}
