"use client";

import { useRouter } from "next/navigation";
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
import { useCartWithSession } from "@/hooks/useCartWithSession";

const checkoutSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  postalCode: z.string().min(4, "El código postal es obligatorio"),
  country: z.string().min(2, "El país es obligatorio"),
  paymentMethod: z.string().refine((val) => ["card", "cash"].includes(val), {
    message: "Debes seleccionar un método de pago válido",
  }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, clearCart } = useCartWithSession();
  const router = useRouter();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  if (items.length === 0) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          No tienes productos en el carrito 🛒
        </h2>
        <Button onClick={() => router.push("/")}>Volver a la tienda</Button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    console.log("Datos del checkout:", data, items);

    // Aquí iría integración con API/pasarela de pago
    alert("Pedido confirmado ✅");
    clearCart(); //
    router.push("/"); // podrías crear página de confirmación
  };

  return (
    <div className="pt-[120px] container max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" {...register("city")} />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input id="postalCode" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input id="country" {...register("country")} />
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
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
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
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
        </CardContent>
      </Card>
    </div>
  );
}
