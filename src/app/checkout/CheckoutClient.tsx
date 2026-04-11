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
import { useCartStore } from "@/store/useCartStore";
import Spinner from "@/components/ui/Spinner";

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
  state: z.string().min(2, "El estado/provincia es obligatorio"),
  postalCode: z.string().min(4, "El código postal es obligatorio"),
  country: z.string().min(2, "El país es obligatorio"),
  paymentMethod: z.enum(["mercadopago", "cash"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, router]);

  const total =
    items?.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0,
    ) || 0;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      country: "Argentina",
      paymentMethod: "mercadopago",
    },
  });

  const selectedPayment = watch("paymentMethod");

  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("email", session.user.email || "");
    }
  }, [session, setValue]);

  if (status === "loading" || isLoading) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center min-h-screen">
        <Spinner />
        <p className="mt-4 text-gray-600">Cargando tu pedido...</p>
      </div>
    );
  }

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

  const buildShippingAddress = (data: CheckoutForm) => ({
    firstName: data.name.split(" ")[0],
    lastName: data.name.split(" ").slice(1).join(" ") || "-",
    street: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.postalCode,
    country: data.country,
    phone: "",
  });

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    setErrorMsg("");

    const orderPayload = {
      items,
      total,
      paymentMethod: data.paymentMethod,
      shippingAddress: buildShippingAddress(data),
    };

    try {
      // 💳 MERCADO PAGO
      if (data.paymentMethod === "mercadopago") {
        const res = await fetch("/api/payments/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error("Error al crear preferencia de pago");

        const { initPoint } = await res.json();

        // Limpiar carrito y redirigir a Mercado Pago
        clearCart();
        window.location.href = initPoint;
        return;
      }

      // 💵 CONTRA ENTREGA
      if (data.paymentMethod === "cash") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error("Error al crear la orden");

        const createdOrder = await res.json();
        clearCart();
        router.push(`/order-success?orderId=${createdOrder.orderId}`);
        return;
      }
    } catch (error: any) {
      console.error("Error procesando pedido:", error);
      setErrorMsg("Hubo un error al procesar tu pedido. Intentá de nuevo.");
    } finally {
      setIsProcessing(false);
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
                <Label htmlFor="state">Provincia</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="Tu provincia"
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
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
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                {...register("country")}
                placeholder="Tu país"
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* Método de pago */}
            <div>
              <Label className="mb-3 block text-base font-semibold">
                Método de pago
              </Label>
              <RadioGroup
                defaultValue="mercadopago"
                onValueChange={(val) =>
                  setValue("paymentMethod", val as "mercadopago" | "cash")
                }
                className="space-y-3"
              >
                {/* Mercado Pago */}
                <div
                  className={`flex items-center gap-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "mercadopago" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <RadioGroupItem value="mercadopago" id="mercadopago" />
                  <Label
                    htmlFor="mercadopago"
                    className="cursor-pointer flex items-center gap-2 w-full"
                  >
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-medium">Mercado Pago</p>
                      <p className="text-xs text-gray-500">
                        Tarjeta, transferencia, cuotas
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Contra entrega */}
                <div
                  className={`flex items-center gap-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "cash" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <Label
                    htmlFor="cash"
                    className="cursor-pointer flex items-center gap-2 w-full"
                  >
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-medium">Pago contra entrega</p>
                      <p className="text-xs text-gray-500">
                        Pagás cuando recibís el producto
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Error general */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] py-6 text-base"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Procesando...
                </span>
              ) : selectedPayment === "mercadopago" ? (
                "Pagar con Mercado Pago"
              ) : (
                "Confirmar pedido"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resumen del pedido */}
      <Card className="shadow-md h-fit sticky top-[160px]">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Resumen del pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item: CartItem) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium line-clamp-2">
                    {item.name}
                  </p>
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

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-700">
              {session?.user?.name && `👤 ${session.user.name}`}
              {session?.user?.email && ` · ${session.user.email}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
