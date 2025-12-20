import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Public API routes (auth routes)
  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If it's a public route or public API route, allow access
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // For other API routes, continue to check authentication
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Protected routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyToken(token);
    const userRole = payload.role;

    // Role-based route protection
    const adminRoutes = ["/admin"];
    const kitchenRoutes = ["/kitchen"];
    const userRoutes = [
      "/user",
      "/products",
      "/cart",
      "/checkout",
      "/payment",
      "/receipt",
    ];

    const isAdminRoute = adminRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );
    const isKitchenRoute = kitchenRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );
    const isUserRoute = userRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isKitchenRoute && userRole !== "KITCHEN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isUserRoute && userRole !== "USER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
