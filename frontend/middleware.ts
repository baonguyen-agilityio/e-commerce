import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Role hierarchy check
const ROLE_LEVELS: Record<string, number> = {
  customer: 0,
  staff: 1,
  admin: 2,
  super_admin: 3,
};

function hasMinRole(userRole: string | undefined, minRole: string): boolean {
  const userLevel = ROLE_LEVELS[userRole || "customer"] ?? 0;
  const requiredLevel = ROLE_LEVELS[minRole] ?? 0;
  return userLevel >= requiredLevel;
}

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  console.log(sessionClaims)

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all other routes - require auth
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Admin routes require STAFF role or higher
  if (isAdminRoute(request)) {
    const userRole = (sessionClaims?.metadata as { role?: string })?.role;
    if (!hasMinRole(userRole, "staff")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};