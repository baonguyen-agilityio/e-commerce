import { UserRole } from "@/types";
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
const isStaffAllowedRoute = createRouteMatcher([
  "/admin/products(.*)",
  "/admin/categories(.*)",
]);
const isUsersRoute = createRouteMatcher(["/admin/users(.*)"]);

// Role hierarchy check
const ROLE_LEVELS: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.STAFF]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  const userLevel = ROLE_LEVELS[userRole || "customer"] ?? 0;
  const requiredLevel = ROLE_LEVELS[minRole] ?? 0;
  return userLevel >= requiredLevel;
}

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

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

  const userRole =
    (sessionClaims?.role as { role?: UserRole } | undefined)?.role ??
    (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ??
    UserRole.CUSTOMER;
  // Admin routes require STAFF role or higher
  if (isAdminRoute(request)) {
    if (!hasMinRole(userRole, UserRole.STAFF)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (userRole === UserRole.STAFF && !isStaffAllowedRoute(request)) {
      return NextResponse.redirect(new URL("/admin/products", request.url));
    }

    if (isUsersRoute(request) && !hasMinRole(userRole, UserRole.ADMIN)) {
      return NextResponse.redirect(new URL("/admin", request.url));
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

