import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { isAuthConfigured } from "@/lib/session";

export function GET() {
  return NextResponse.json({
    ok: true,
    database: isDatabaseConfigured(),
    auth: isAuthConfigured(),
    seasonBall: "deuce",
  });
}
