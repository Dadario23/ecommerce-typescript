// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/SessionProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/providers/CartProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ToastProvider } from "@/hooks/use-toast";
import { getPublicCategories } from "@/lib/getPublicCategories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compumobile",
  description: "Tu tienda de confianza",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, session] = await Promise.all([
    getPublicCategories(),
    getServerSession(authOptions),
  ]);

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider session={session}>
          <ToastProvider>
            <CartProvider>
              <CartDrawer />
              <LayoutWrapper categories={categories}>{children}</LayoutWrapper>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
