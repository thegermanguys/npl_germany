import { NextResponse, type NextRequest } from "next/server";
import { forbiddenForPath } from "@/lib/access";
import { readSessionToken, SESSION_COOKIE } from "@/lib/token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET?.trim();
  const user = token && secret ? await readSessionToken(token) : null;
  const path = request.nextUrl.pathname;

  if (forbiddenForPath(path, user?.role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/403";
    url.search = "";
    return NextResponse.rewrite(url, { status: 403 });
  }

  if (path.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/owner", "/owner/:path*", "/account", "/account/:path*"],
};
