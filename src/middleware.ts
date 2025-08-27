import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Si no hay sesión y quiere entrar a /admin -> redirect al login
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si hay sesión pero no es admin/superadmin -> redirect a home
  if (
    pathname.startsWith("/admin") &&
    token?.role !== "admin" &&
    token?.role !== "superadmin"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Definimos en qué rutas se ejecuta el middleware
export const config = {
  matcher: ["/admin/:path*"],
};
