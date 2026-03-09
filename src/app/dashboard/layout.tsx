"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 sm:w-72">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              Menú
            </SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <header
          className={`sticky top-0 z-40 bg-white transition-all duration-200 ${
            isScrolled ? "shadow-md border-b border-gray-200" : ""
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-600 hover:text-gray-900"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </Button>

              <Link href="/">
                <Button
                  size="sm"
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Tienda</span>
                  <span className="sm:hidden">←</span>
                </Button>
              </Link>

              {/* USER */}
              {status === "authenticated" && session?.user && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <img
                      src={
                        session.user.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          session.user.name || "Usuario",
                        )}&background=6366f1&color=fff`
                      }
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover"
                    />

                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {session.user.name?.split(" ")[0]}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <p className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                        {session?.user?.name}
                      </p>

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
