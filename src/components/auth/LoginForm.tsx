"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react"; // 👈 Spinner minimalista

// ✅ Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  fromCart?: boolean;
}

export default function LoginForm({ fromCart = false }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // 👈 Nuevo estado

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage("");

    const callbackUrl = fromCart ? "/order" : "/";

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl,
    });

    if (res?.error) {
      setErrorMessage("Credenciales incorrectas ❌");
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const callbackUrl = fromCart ? "/order" : "/";
    signIn("google", { callbackUrl }).catch(() => setIsGoogleLoading(false));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="ejemplo@mail.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Mensaje de error */}
        {errorMessage && (
          <p className="text-sm text-center text-red-500">{errorMessage}</p>
        )}

        {/* Botón login */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Ingresando...
            </div>
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>

      {/* Google Login */}
      <Button
        type="button"
        variant="outline"
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <FcGoogle className="text-xl" />
            Iniciar sesión con Google
          </>
        )}
      </Button>

      {/* Links */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>
          ¿Olvidaste tu contraseña?{" "}
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Restablecer
          </Link>
        </p>
        <p>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
