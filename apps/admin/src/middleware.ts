import { NextResponse } from "next/server";
import { edgeAuth } from "./auth.edge";

/**
 * Admin gate.
 *
 *   - If you're not signed in → /login (with `?from=` so you bounce
 *     back to where you tried to go).
 *   - If you are signed in but `isAdmin` is false on the JWT → 403.
 *     This shouldn't normally happen because the Credentials authorize
 *     fn already filters non-admins, but handles the case where someone
 *     was removed from `ADMIN_EMAILS` mid-session.
 *
 * /login itself and /api/auth/* are passthrough.
 */
export default edgeAuth((req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    // If already signed in as admin, bounce off /login.
    if (req.auth?.user?.isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (!req.auth.user?.isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/forbidden";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next|_vercel|.*\\..*).*)"],
};
