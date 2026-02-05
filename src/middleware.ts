// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // No autenticado
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string | undefined;

  // No autorizado
  if (!role || !["admin", "superadmin"].includes(role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
