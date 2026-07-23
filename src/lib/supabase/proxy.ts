import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

// "/" is the public landing page (Admin sign-in is one click away from it,
// not forced immediately) — exact match only, since prefix-matching "/"
// would make every route public.
const PUBLIC_EXACT_PATHS = ["/"];

// /checkin and /review are the unauthenticated, activity-scoped self
// check-in/message-review flows (Section 1.5: Protocol Members never get
// accounts). /api/cron is hit by Vercel Cron, not a browser session; it
// authorizes itself via a bearer secret in the route handler.
// /forgot-password and /reset-password are reached before a normal session exists
// (reset-password specifically: the recovery token lives in the URL fragment,
// which never reaches this server-side check, so the page has to be reachable
// and establish its own session client-side).
const PUBLIC_PREFIX_PATHS = [
  "/login",
  "/checkin",
  "/review",
  "/api/cron",
  "/forgot-password",
  "/reset-password",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    PUBLIC_EXACT_PATHS.includes(request.nextUrl.pathname) ||
    PUBLIC_PREFIX_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
