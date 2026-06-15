import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/verify-otp", "/restaurants", "/about", "/contact"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/verify-otp"];
const CUSTOMER_ROUTES = ["/dashboard/customer", "/orders", "/cart", "/checkout"];
const RESTAURANT_ROUTES = ["/dashboard/restaurant"];
const DELIVERY_ROUTES = ["/dashboard/delivery"];
const ADMIN_ROUTES = ["/dashboard/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!session && !isPublicRoute && !pathname.startsWith("/api/auth")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard/customer", req.url));
  }

  const role = (session?.user as any)?.role;

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/dashboard/restaurant") && role !== "RESTAURANT_OWNER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/dashboard/delivery") && role !== "DELIVERY_PARTNER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
