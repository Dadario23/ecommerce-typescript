"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="pt-[140px] flex justify-center">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Crear cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" type="text" placeholder="Juan Pérez" />
          </div>

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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
            />
          </div>

          {/* Checkbox boletín */}
          <div className="flex items-start space-x-2">
            <Checkbox id="newsletter" />
            <Label
              htmlFor="newsletter"
              className="text-sm leading-5 text-gray-600"
            >
              Suscribirse a nuestro boletín de noticias
              <br />
              <span className="text-xs text-gray-500">
                Puede darse de baja en cualquier momento. Para ello, consulte
                nuestra información de contacto en el aviso legal.
              </span>
            </Label>
          </div>

          {/* Botón registro */}
          <Button className="w-full">Registrarse</Button>

          {/* Link to login */}
          <p className="text-sm text-center text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
