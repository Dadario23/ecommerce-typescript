// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Proteger rutas de admin Y dashboard
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Si no hay token y quiere entrar a rutas protegidas -> redirect al login
  if ((isAdminRoute || isDashboardRoute) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si hay token pero no tiene rol de admin para rutas protegidas -> redirect a home
  if (
    (isAdminRoute || isDashboardRoute) &&
    token &&
    !["admin", "superadmin"].includes(token?.role || "")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Definimos en qué rutas se ejecuta el middleware
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
