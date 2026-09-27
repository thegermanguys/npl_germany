import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET?.trim();
  const user = token && secret ? await readSessionToken(token) : null;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    if (user?.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (path.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*"],
};
