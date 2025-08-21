"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  return (
    <div className="pt-[140px] flex justify-center">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Iniciar sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="ejemplo@mail.com" />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="********" />
          </div>

          {/* Botón login */}
          <Button className="w-full">Ingresar</Button>

          {/* Link olvidar contraseña */}
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-sm text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-xs text-gray-500">O</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          {/* Google login */}
          <Button variant="outline" className="w-full flex items-center gap-2">
            <FcGoogle size={20} /> Iniciar sesión con Google
          </Button>

          {/* Link to register */}
          <p className="text-sm text-center text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
