import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const role = (user as unknown as Record<string, unknown>)?.role as string | undefined;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Seller routes
  if (pathname.startsWith("/seller") && role !== "SELLER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Buyer routes
  if (pathname.startsWith("/shop") && role !== "BUYER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
