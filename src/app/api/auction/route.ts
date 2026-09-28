import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { loadPublicAuction } from "@/lib/auction-public";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ closed: false, remaining: 0, current: null, recentSold: [] });
  }
  return NextResponse.json(await loadPublicAuction());
}
