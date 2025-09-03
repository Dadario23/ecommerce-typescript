"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/store/useCartStore"; // ✅ Usamos el store directo
import Spinner from "@/components/ui/Spinner";

// ✅ Interfaz para los items del carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const checkoutSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  state: z.string().min(2, "El estado/provincia es obligatorio"), // ← Agregar esto
  postalCode: z.string().min(4, "El código postal es obligatorio"),
  country: z.string().min(2, "El país es obligatorio"),
  paymentMethod: z.string().refine((val) => ["card", "cash"].includes(val), {
    message: "Debes seleccionar un método de pago válido",
  }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // ✅ Estado para manejar carga y evitar errores
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Verificar autenticación
    if (status === "unauthenticated") {
      console.log("[CheckoutPage] Usuario no autenticado, redirigiendo");
      router.push("/");
      return;
    }

    // ✅ Una vez que sabemos el estado de autenticación y tenemos items
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, router]);

  // ✅ Calcular total de manera segura
  const total =
    items?.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    ) || 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      // ✅ Pre-llenar con datos del usuario si está autenticado
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  // ✅ Actualizar valores del formulario cuando la sesión esté disponible
  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("email", session.user.email || "");
    }
  }, [session, setValue]);

  // ✅ Mostrar loading mientras verificamos autenticación
  if (status === "loading" || isLoading) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center min-h-screen">
        <Spinner />
        <p className="mt-4 text-gray-600">Cargando tu pedido...</p>
      </div>
    );
  }

  // ✅ Verificar si no hay items o items es undefined
  if (!items || items.length === 0) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          No tienes productos en el carrito 🛒
        </h2>
        <Button onClick={() => router.push("/")}>Volver a la tienda</Button>
      </div>
    );
  }

  // Modificar el onSubmit para usar la dirección seleccionada
  const onSubmit = async (data: CheckoutForm) => {
    const orderData = {
      ...data,
      shippingAddress: selectedAddress || {
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" "),
        street: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.postalCode,
        country: data.country,
        phone: "", // Podrías agregar campo de teléfono al formulario
      },
      items,
      total,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Pedido confirmado ✅");
        clearCart();
        router.push("/order-success");
      }
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  return (
    <div className="pt-[160px] container max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
      {/* Formulario */}
      <Card className="md:col-span-2 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Datos de envío</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Tu nombre completo"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Calle, número, departamento"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Tu ciudad"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="Tu estado/provincia"
                />
                {errors.state && (
                  <p className="text-sm text-red-500">
                    {errors.state?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="1234"
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  {...register("country")}
                  placeholder="Tu país"
                  defaultValue="Argentina"
                />
                {errors.country && (
                  <p className="text-sm text-red-500">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Método de pago</Label>
              <RadioGroup defaultValue="card">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="card"
                    id="card"
                    {...register("paymentMethod")}
                  />
                  <Label htmlFor="card">Tarjeta de crédito/débito</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem
                    value="cash"
                    id="cash"
                    {...register("paymentMethod")}
                  />
                  <Label htmlFor="cash">Pago contra entrega</Label>
                </div>
              </RadioGroup>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF]"
            >
              {isSubmitting ? "Procesando..." : "Confirmar pedido"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resumen del pedido */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Resumen del pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item: CartItem) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x ${item.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="font-medium text-sm">
                ${(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>

          {/* Información del usuario */}
          <div className="bg-blue-50 p-3 rounded-md mt-4">
            <h3 className="font-semibold text-blue-800 text-sm mb-1">
              Información de contacto
            </h3>
            <p className="text-xs text-blue-700">
              {session?.user?.name && `Nombre: ${session.user.name}`}
              {session?.user?.email && ` | Email: ${session.user.email}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
