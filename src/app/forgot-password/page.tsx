// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, AlertCircle, Copy } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    // Validación básica
    if (!email) {
      setError("Por favor ingresa tu email");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un email válido");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar el email de recuperación");
      } else {
        setMessage(data.message);
        // Si estamos en modo desarrollo, mostrar el enlace
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resetUrl);
      alert("Enlace copiado al portapapeles!");
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <div className="pt-[140px] flex justify-center px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Mail className="w-6 h-6" />
            Recuperar contraseña
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Mensajes de error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Mensajes de éxito */}
            {message && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* Enlace de desarrollo */}
            {resetUrl && (
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  <p className="font-semibold">🔗 Enlace de desarrollo:</p>
                  <p className="text-xs mt-2 break-all">{resetUrl}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar enlace
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Botón */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>
          </form>

          {/* Volver al login */}
          <p className="text-sm text-center text-gray-600 pt-4">
            ¿Recordaste tu contraseña?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
