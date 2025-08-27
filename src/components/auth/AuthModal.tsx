// components/auth/AuthModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
  fromCart?: boolean;
}

export default function AuthModal({
  open,
  onOpenChange,
  onAuthSuccess,
  fromCart = false,
}: AuthModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Cerrar modal y ejecutar callback cuando el usuario se autentica
  useEffect(() => {
    if (open && status === "authenticated") {
      console.log("[AuthModal] Usuario autenticado, cerrando modal");
      onOpenChange(false);
      if (onAuthSuccess) {
        console.log("[AuthModal] Ejecutando onAuthSuccess callback");
        onAuthSuccess();
      }
    }
  }, [open, status, onOpenChange, onAuthSuccess]);

  // Manejar éxito de registro
  useEffect(() => {
    if (registrationSuccess) {
      console.log("[AuthModal] Registro exitoso, mostrando mensaje");
      // Podrías mostrar un mensaje de éxito aquí o cambiar a la pestaña de login
      setActiveTab("login");

      // Opcional: resetear el estado después de un tiempo
      const timer = setTimeout(() => {
        setRegistrationSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [registrationSuccess]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    // Resetear estados cuando se cierra el modal
    if (!isOpen) {
      setActiveTab("login");
      setRegistrationSuccess(false);
    }
  };

  // Manejar registro exitoso (simulado ya que RegisterForm no tiene callback)
  // Esta función se pasaría al RegisterForm si tuviera la prop onSuccess
  const handleRegistrationSuccess = () => {
    console.log("[AuthModal] Registro completado exitosamente");
    setRegistrationSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {fromCart ? "Inicia sesión para continuar" : "Bienvenido"}
          </DialogTitle>
        </DialogHeader>

        {registrationSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">
            ¡Registro exitoso! Por favor inicia sesión con tus nuevas
            credenciales.
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <LoginForm fromCart={fromCart} />
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <RegisterForm />
            {/* 
              Nota: El RegisterForm actual no tiene prop onSuccess, 
              por lo que no podemos detectar cuándo el registro es exitoso.
              Una alternativa sería modificar RegisterForm o usar otra estrategia.
            */}
          </TabsContent>
        </Tabs>

        {/* Mensaje informativo para registro */}
        {activeTab === "register" && (
          <div className="text-xs text-gray-500 mt-4 text-center">
            Después de registrarte, serás redirigido a la página de login para
            iniciar sesión.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
