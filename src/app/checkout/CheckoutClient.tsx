"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/store/useCartStore";
import Spinner from "@/components/ui/Spinner";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
  CreditCard,
  Package,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface SavedAddress {
  _id?: string;
  title: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const checkoutSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  state: z.string().min(2, "La provincia es obligatoria"),
  postalCode: z.string().min(4, "El código postal es obligatorio"),
  country: z.string().min(2, "El país es obligatorio"),
  paymentMethod: z.enum(["mercadopago", "cash"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
      {children}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressSelector, setShowAddressSelector] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const subtotal = items?.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  ) ?? 0;
  const total = Math.max(0, subtotal - couponDiscount);
  const installment = Math.ceil(total / 12);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "Argentina", paymentMethod: "mercadopago" },
  });

  const selectedPayment = watch("paymentMethod");
  const addressValue = watch("address") ?? "";

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated") {
      setValue("name", session?.user?.name ?? "");
      setValue("email", session?.user?.email ?? "");
      setIsLoading(false);
      fetch("/api/user/addresses")
        .then((r) => r.json())
        .then((data: SavedAddress[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            const def = data.find((a) => a.isDefault) ?? data[0];
            fillFormFromAddress(def);
          }
        })
        .catch(() => {});
    }
    if (status === "loading") return;
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fillFormFromAddress = (addr: SavedAddress) => {
    setValue("address", addr.street);
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("postalCode", addr.zipCode);
    setValue("country", addr.country || "Argentina");
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Cupón inválido");
        setCouponDiscount(0);
        setAppliedCoupon("");
      } else {
        setCouponDiscount(data.discount);
        setAppliedCoupon(data.code);
        setCouponError("");
      }
    } catch {
      setCouponError("Error al verificar el cupón");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon("");
    setCouponError("");
  };

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
      subtotal,
      discount: couponDiscount,
      couponCode: appliedCoupon || undefined,
      total,
      paymentMethod: data.paymentMethod,
      shippingAddress: buildShippingAddress(data),
    };
    try {
      if (data.paymentMethod === "mercadopago") {
        const res = await fetch("/api/payments/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(
            res.status === 409 && Array.isArray(body.details)
              ? body.details.join("\n")
              : "Error al crear preferencia de pago"
          );
          return;
        }
        const { initPoint } = await res.json();
        clearCart();
        window.location.href = initPoint;
        return;
      }
      if (data.paymentMethod === "cash") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(
            res.status === 409 && Array.isArray(body.details)
              ? body.details.join("\n")
              : "Error al crear la orden"
          );
          return;
        }
        const createdOrder = await res.json();
        clearCart();
        router.push(`/order-success?orderId=${createdOrder.orderId}`);
        return;
      }
    } catch {
      setErrorMsg("Hubo un error al procesar tu pedido. Intentá de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="pt-20 md:pt-36 flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Spinner />
        <p className="mt-4 text-gray-500 text-sm">Cargando...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="pt-20 md:pt-36 flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <p className="text-lg font-semibold text-gray-700 mb-4">No tenés productos en el carrito</p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <main className="pt-20 md:pt-36 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Checkout</h1>
        <p className="text-sm text-gray-500 mb-6">Completá tus datos para finalizar la compra</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── FORM ── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-2 space-y-4"
          >
            {/* Direcciones guardadas */}
            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAddressSelector((s) => !s)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1E3A8A]" />
                    Mis direcciones guardadas
                  </span>
                  {showAddressSelector ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showAddressSelector && (
                  <div className="px-5 pb-4 space-y-2 border-t border-gray-50 pt-3">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          className="mt-0.5 accent-[#1E3A8A]"
                          onChange={() => fillFormFromAddress(addr)}
                          defaultChecked={addr.isDefault}
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {addr.title}
                            {addr.isDefault && (
                              <span className="ml-2 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full">
                                Predeterminada
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quién compra — solo lectura */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionTitle>Tus datos</SectionTitle>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{session?.user?.name}</p>
                  <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <SectionTitle>Dirección de envío</SectionTitle>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Dirección
                </Label>
                <AddressAutocomplete
                  id="address"
                  value={addressValue}
                  onChange={(v) => setValue("address", v, { shouldValidate: true })}
                  onPlaceSelect={(c) => {
                    setValue("address", c.street, { shouldValidate: true });
                    setValue("city", c.city, { shouldValidate: true });
                    setValue("state", c.state, { shouldValidate: true });
                    setValue("postalCode", c.postalCode, { shouldValidate: true });
                    setValue("country", c.country || "Argentina");
                  }}
                  placeholder="Calle y número..."
                />
                <FieldError message={errors.address?.message} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1.5 block">Ciudad</Label>
                  <Input id="city" {...register("city")} placeholder="Ciudad" className="rounded-lg" />
                  <FieldError message={errors.city?.message} />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-1.5 block">Provincia</Label>
                  <Input id="state" {...register("state")} placeholder="Provincia" className="rounded-lg" />
                  <FieldError message={errors.state?.message} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700 mb-1.5 block">Cód. Postal</Label>
                  <Input id="postalCode" {...register("postalCode")} placeholder="1234" className="rounded-lg" />
                  <FieldError message={errors.postalCode?.message} />
                </div>
              </div>
            </div>

            {/* Cupón */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionTitle>Cupón de descuento</SectionTitle>

              {appliedCoupon ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <Tag className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700 font-medium flex-1">
                    {appliedCoupon} — −${couponDiscount.toLocaleString("es-AR")}
                  </span>
                  <button type="button" onClick={removeCoupon} className="text-green-500 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="INGRESÁ TU CÓDIGO"
                    className="uppercase tracking-widest font-mono rounded-lg"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={checkingCoupon || !couponCode.trim()}
                    className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:border-blue-300 hover:text-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {checkingCoupon ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionTitle>Método de pago</SectionTitle>

              <RadioGroup
                defaultValue="mercadopago"
                onValueChange={(val) =>
                  setValue("paymentMethod", val as "mercadopago" | "cash")
                }
                className="space-y-3"
              >
                <label
                  className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPayment === "mercadopago"
                      ? "border-[#1E3A8A] bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="mercadopago" id="mercadopago" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedPayment === "mercadopago" ? "bg-[#1E3A8A]" : "bg-gray-100"
                  }`}>
                    <CreditCard className={`w-5 h-5 ${selectedPayment === "mercadopago" ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Mercado Pago</p>
                    <p className="text-xs text-gray-500">Tarjeta, transferencia, cuotas sin interés</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPayment === "cash"
                      ? "border-[#1E3A8A] bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedPayment === "cash" ? "bg-[#1E3A8A]" : "bg-gray-100"
                  }`}>
                    <Package className={`w-5 h-5 ${selectedPayment === "cash" ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Contra entrega</p>
                    <p className="text-xs text-gray-500">Pagás en efectivo cuando recibís el pedido</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm whitespace-pre-line">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Spinner />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedPayment === "mercadopago" ? "Pagar con Mercado Pago" : "Confirmar pedido"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-2">
              <Lock className="w-3.5 h-3.5" />
              Pago seguro con encriptación SSL
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            </div>
          </form>

          {/* ── RESUMEN ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-40">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="font-bold text-gray-900">Resumen del pedido</p>
            </div>

            <ul className="divide-y divide-gray-50 px-5">
              {items.map((item: CartItem) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <Image
                      src={item.image || "/placeholder-category.jpg"}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.quantity} × ${item.price.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 shrink-0">
                    ${(item.price * item.quantity).toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
            </ul>

            <div className="px-5 py-4 space-y-2 border-t border-gray-50">
              {couponDiscount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento ({appliedCoupon})</span>
                    <span>−${couponDiscount.toLocaleString("es-AR")}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-lg">${total.toLocaleString("es-AR")}</span>
              </div>
              <p className="text-xs text-blue-600 font-medium text-right">
                12x ${installment.toLocaleString("es-AR")} sin interés
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
