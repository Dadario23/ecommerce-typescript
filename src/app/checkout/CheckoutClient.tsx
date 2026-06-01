"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import Spinner from "@/components/ui/Spinner";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Home,
  Truck,
  Calendar,
  CreditCard,
  Tag,
  X,
  ShieldCheck,
  Lock,
  Check,
  ChevronLeft,
  Package,
  Banknote,
  Pencil,
  ListChecks,
  Zap,
  MessageCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep =
  | "init-loading"
  | "delivery"
  | "trans-date"
  | "date"
  | "trans-payment"
  | "payment"
  | "review";

type DeliveryMethod = "domicilio" | "contraentrega";
type PaymentMethod  = "mercadopago" | "cash" | "transfer";
type AddressUIMode  = "default" | "list" | "edit";
type ShippingType   = "flex" | "standard";

interface ShippingZone {
  id: string;
  name: string;
  localities: string[];
  flex: number;
  standard: number;
}

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

interface AddressData {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

type AddressErrors = Partial<Record<keyof AddressData, string>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = [
  "ene","feb","mar","abr","may","jun",
  "jul","ago","sep","oct","nov","dic",
];

function addBusinessDays(date: Date, n: number): Date {
  let count = 0;
  const d = new Date(date);
  while (count < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
  }
  return d;
}

function formatDateLong(date: Date): string {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]}`;
}


function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function parseLocalDate(str: string): Date {
  return new Date(str + "T00:00:00");
}

function normalizeLocality(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function findZone(city: string, zones: ShippingZone[]): ShippingZone | null {
  if (!city.trim()) return null;
  const n = normalizeLocality(city);
  return zones.find((z) => z.localities.some((l) => normalizeLocality(l) === n)) ?? null;
}

function fromSaved(addr: SavedAddress, fallback: AddressData): AddressData {
  return {
    firstName: addr.firstName || fallback.firstName,
    lastName: addr.lastName || fallback.lastName,
    street: addr.street,
    city: addr.city,
    state: addr.state,
    postalCode: addr.zipCode,
    country: addr.country || "Argentina",
    phone: addr.phone || "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InitLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1E3A8A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-8 h-8 text-[#1E3A8A]" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-gray-800 font-semibold text-lg">
          Preparando todo para tu compra
        </p>
        <p className="text-gray-400 text-sm mt-1">Un momento...</p>
      </div>
    </div>
  );
}

function TransLoader({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1E3A8A] animate-spin" />
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

function StepBar({ step }: { step: WizardStep }) {
  const activeIdx: Record<WizardStep, number> = {
    "init-loading": -1,
    delivery: 0,
    "trans-date": 1,
    date: 1,
    "trans-payment": 2,
    payment: 2,
    review: 3,
  };
  const active = activeIdx[step];
  const labels = ["Entrega", "Fecha", "Pago", "Confirmá"];

  return (
    <div className="flex items-start justify-center mb-8">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < active
                  ? "bg-green-500 text-white"
                  : i === active
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < active ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium leading-none ${
                i === active
                  ? "text-[#1E3A8A]"
                  : i < active
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < 3 && (
            <div
              className={`w-10 sm:w-16 h-0.5 mx-1 mb-5 ${
                i < active ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
    >
      <ChevronLeft className="w-4 h-4" /> Volver
    </button>
  );
}

// ─── Address mini-form (reutilizado en edit mode) ─────────────────────────────

interface AddressFormProps {
  address: AddressData;
  errors: AddressErrors;
  onChange: (data: Partial<AddressData>) => void;
  onPlaceSelect: (data: Partial<AddressData>) => void;
}

function AddressForm({ address, errors, onChange, onPlaceSelect }: AddressFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="street" className="text-xs font-medium text-gray-600 mb-1 block">
          Dirección
        </Label>
        <AddressAutocomplete
          id="street"
          value={address.street}
          onChange={(v) => onChange({ street: v })}
          onPlaceSelect={(c) =>
            onPlaceSelect({
              street: c.street,
              city: c.city,
              state: c.state,
              postalCode: c.postalCode,
              country: c.country || "Argentina",
            })
          }
          placeholder="Calle y número..."
        />
        {errors.street && (
          <p className="text-xs text-red-500 mt-1">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city" className="text-xs font-medium text-gray-600 mb-1 block">
            Ciudad
          </Label>
          <Input
            id="city"
            value={address.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Ciudad"
            className="rounded-lg"
          />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state" className="text-xs font-medium text-gray-600 mb-1 block">
            Provincia
          </Label>
          <Input
            id="state"
            value={address.state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="Provincia"
            className="rounded-lg"
          />
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="postalCode" className="text-xs font-medium text-gray-600 mb-1 block">
            Cód. Postal
          </Label>
          <Input
            id="postalCode"
            value={address.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            placeholder="1234"
            className="rounded-lg"
          />
          {errors.postalCode && (
            <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone" className="text-xs font-medium text-gray-600 mb-1 block">
            Teléfono
          </Label>
          <Input
            id="phone"
            value={address.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="11 1234-5678"
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<WizardStep>("init-loading");

  // Delivery
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("domicilio");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressData>({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Argentina",
    phone: "",
  });
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [addressUIMode, setAddressUIMode] = useState<AddressUIMode>("default");

  // Shipping zones
  const [zonesData, setZonesData]     = useState<ShippingZone[]>([]);
  const [shippingType, setShippingType] = useState<ShippingType>("flex");

  // Date
  const [deliveryDateOption, setDeliveryDateOption] = useState<string>("any");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Submission
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal =
    items?.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    ) ?? 0;

  const detectedZone  = findZone(address.city, zonesData);
  const shippingCost  = detectedZone
    ? (shippingType === "flex" ? detectedZone.flex : detectedZone.standard)
    : 0;
  const total = Math.max(0, subtotal + shippingCost - couponDiscount);

  const today = new Date();

  // ── Init ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus !== "authenticated") return;

    const parts = (session?.user?.name ?? "").split(" ");
    const baseName = {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ") || "-",
    };

    setAddress((prev) => ({ ...prev, ...baseName }));

    // Cargar zonas de envío
    fetch("/api/shipping/zones")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setZonesData(data); })
      .catch(() => {});

    fetch("/api/user/addresses")
      .then((r) => r.json())
      .then((data: SavedAddress[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const def = data.find((a) => a.isDefault) ?? data[0];
          setSelectedAddressId(def._id ?? null);
          setAddress((prev) => fromSaved(def, { ...prev, ...baseName }));
          setAddressUIMode("default");
        } else {
          // No saved addresses — show edit form directly
          setAddressUIMode("edit");
        }
      })
      .catch(() => {
        setAddressUIMode("edit");
      });

    const timer = setTimeout(() => setStep("delivery"), 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  // Reset payment method when delivery changes
  useEffect(() => {
    setPaymentMethod(deliveryMethod === "contraentrega" ? "cash" : "mercadopago");
  }, [deliveryMethod]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function patchAddress(data: Partial<AddressData>) {
    setAddress((prev) => ({ ...prev, ...data }));
  }

  function handleSelectSaved(addr: SavedAddress) {
    setSelectedAddressId(addr._id ?? null);
    setAddress((prev) => fromSaved(addr, prev));
    setAddressUIMode("default");
  }

  function validateAddress(): boolean {
    const errs: AddressErrors = {};
    if (!address.street?.trim()) errs.street = "La dirección es obligatoria";
    if (!address.city?.trim()) errs.city = "La ciudad es obligatoria";
    if (!address.state?.trim()) errs.state = "La provincia es obligatoria";
    if (!address.postalCode?.trim()) errs.postalCode = "El código postal es obligatorio";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goToDate() {
    if (!validateAddress()) return;
    setAddressUIMode("default");
    setStep("trans-date");
    setTimeout(() => setStep("date"), 1000);
  }

  function goToPayment() {
    setStep("trans-payment");
    setTimeout(() => setStep("payment"), 1000);
  }

  async function applyCoupon() {
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
  }

  function removeCoupon() {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon("");
    setCouponError("");
  }

  function buildPayload() {
    const notesParts: string[] = [];
    if (deliveryDateOption !== "any") notesParts.push(`Preferencia de entrega: ${deliveryDateOption}`);
    if (detectedZone) notesParts.push(`Zona: ${detectedZone.name}`);
    notesParts.push(`Tipo de envío: ${shippingType === "flex" ? "Flex" : "Estándar"}`);

    return {
      items,
      subtotal,
      shipping: shippingCost,
      discount: couponDiscount,
      couponCode: appliedCoupon || undefined,
      total,
      paymentMethod,
      shippingMethod: deliveryMethod,
      notes: notesParts.join(" | "),
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      },
    };
  }

  async function confirmPurchase() {
    setIsProcessing(true);
    setErrorMsg("");
    const payload = buildPayload();

    try {
      if (paymentMethod === "mercadopago") {
        const res = await fetch("/api/payments/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(
            res.status === 409 && Array.isArray(body.details)
              ? body.details.join("\n")
              : "Error al crear preferencia de pago"
          );
          setIsProcessing(false);
          return;
        }
        const { initPoint } = await res.json();
        clearCart();
        window.location.href = initPoint;
        // isProcessing queda en true hasta que el browser navega
      } else {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(
            res.status === 409 && Array.isArray(body.details)
              ? body.details.join("\n")
              : "Error al crear la orden"
          );
          setIsProcessing(false);
          return;
        }
        const created = await res.json();
        clearCart();
        router.push(`/order-success?orderId=${created.orderId}`);
        // isProcessing queda en true hasta que el router navega
      }
    } catch {
      setErrorMsg("Hubo un error al procesar tu pedido. Intentá de nuevo.");
      setIsProcessing(false);
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────────

  if (authStatus === "loading") {
    return (
      <div className="pt-20 md:pt-32 flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (step === "init-loading") {
    return (
      <main className="pt-20 md:pt-32 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4">
          <InitLoader />
        </div>
      </main>
    );
  }

  if (isProcessing) {
    return (
      <main className="pt-20 md:pt-32 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[65vh] gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1E3A8A] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#1E3A8A]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">
                Procesando tu pedido
              </p>
              <p className="text-gray-400 text-sm mt-1">
                No cerrés esta ventana...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="pt-20 md:pt-32 flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          No tenés productos en el carrito
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  if (step === "trans-date") {
    return (
      <main className="pt-20 md:pt-32 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4">
          <TransLoader message="Calculando opciones de entrega..." />
        </div>
      </main>
    );
  }

  if (step === "trans-payment") {
    return (
      <main className="pt-20 md:pt-32 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4">
          <TransLoader message="Cargando métodos de pago..." />
        </div>
      </main>
    );
  }

  const paymentLabel = {
    mercadopago: "Mercado Pago",
    cash: "Efectivo al recibir",
    transfer: "Transferencia bancaria",
  }[paymentMethod];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main className="pt-20 md:pt-32 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4">
        <StepBar step={step} />

        {/* ── STEP 1: Forma de entrega ── */}
        {step === "delivery" && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900">
              Elegí la forma de entrega
            </h1>

            {/* Delivery method options */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod("domicilio")}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
                  deliveryMethod === "domicilio"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    deliveryMethod === "domicilio" ? "bg-[#1E3A8A]" : "bg-gray-100"
                  }`}
                >
                  <Home
                    className={`w-5 h-5 ${
                      deliveryMethod === "domicilio" ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">
                    Envío a domicilio
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recibís en tu casa o donde quieras
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {detectedZone
                      ? `Flex $${detectedZone.flex.toLocaleString("es-AR")} · Estándar $${detectedZone.standard.toLocaleString("es-AR")}`
                      : "Calculamos el costo según tu zona"}
                  </p>
                </div>
                {deliveryMethod === "domicilio" && (
                  <Check className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                )}
              </button>

              {/* Punto de encuentro — próximamente */}
              <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-white opacity-50 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">
                      Retiro en punto de encuentro
                    </p>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      Próximamente
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Retirá en una sucursal o punto cercano
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeliveryMethod("contraentrega")}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
                  deliveryMethod === "contraentrega"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    deliveryMethod === "contraentrega" ? "bg-[#1E3A8A]" : "bg-gray-100"
                  }`}
                >
                  <Package
                    className={`w-5 h-5 ${
                      deliveryMethod === "contraentrega" ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">
                    Contraentrega
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pagás cuando recibís en tu casa
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {detectedZone
                      ? `Flex $${detectedZone.flex.toLocaleString("es-AR")} · Estándar $${detectedZone.standard.toLocaleString("es-AR")}`
                      : "Calculamos el costo según tu zona"}
                  </p>
                </div>
                {deliveryMethod === "contraentrega" && (
                  <Check className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                )}
              </button>
            </div>

            {/* ── Address section ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E3A8A]" />
                <p className="text-sm font-semibold text-gray-700">
                  Dirección de entrega
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* DEFAULT MODE: show selected address */}
                {addressUIMode === "default" && (
                  <>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-[#1E3A8A]/20">
                      <Check className="w-4 h-4 text-[#1E3A8A] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {savedAddresses.find((a) => a._id === selectedAddressId)
                            ?.title ?? "Mi dirección"}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {address.street}, {address.city}
                        </p>
                        <p className="text-xs text-gray-500">
                          {address.state} {address.postalCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAddressUIMode("edit")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:text-blue-800 border border-[#1E3A8A]/30 hover:border-[#1E3A8A] px-3 py-2 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modificar domicilio
                      </button>
                      {savedAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAddressUIMode("list")}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-2 rounded-lg transition-colors"
                        >
                          <ListChecks className="w-3.5 h-3.5" />
                          Elegir otro
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* LIST MODE: show all saved addresses */}
                {addressUIMode === "list" && (
                  <>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => handleSelectSaved(addr)}
                          className={`w-full text-left flex items-start gap-3 p-3 border rounded-xl transition-colors ${
                            selectedAddressId === addr._id
                              ? "border-[#1E3A8A] bg-blue-50"
                              : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                              selectedAddressId === addr._id
                                ? "border-[#1E3A8A] bg-[#1E3A8A]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAddressId === addr._id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
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
                              {addr.street}, {addr.city}, {addr.state}{" "}
                              {addr.zipCode}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddressUIMode("default")}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {/* EDIT MODE: form */}
                {addressUIMode === "edit" && (
                  <>
                    <AddressForm
                      address={address}
                      errors={addressErrors}
                      onChange={patchAddress}
                      onPlaceSelect={patchAddress}
                    />
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAddressUIMode("default")}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Cancelar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Selector de tipo de envío ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1E3A8A]" />
                <p className="text-sm font-semibold text-gray-700">Tipo de envío</p>
              </div>
              <div className="p-5 space-y-3">
                {!address.city.trim() ? (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Completá tu dirección para ver las opciones de envío
                  </p>
                ) : !detectedZone ? (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      Tu zona (<span className="font-semibold">{address.city}</span>) no está cubierta por nuestro servicio de envío propio.
                    </p>
                    <a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491150610043"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar envío por WhatsApp
                    </a>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">
                      Zona detectada: <span className="font-semibold text-gray-700">{detectedZone.name} — {address.city}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setShippingType("flex")}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        shippingType === "flex" ? "border-[#1E3A8A] bg-blue-50" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${shippingType === "flex" ? "bg-[#1E3A8A]" : "bg-gray-100"}`}>
                        <Zap className={`w-5 h-5 ${shippingType === "flex" ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">Envío flex</p>
                        <p className="text-xs text-gray-500">Mismo día / día siguiente</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">${detectedZone.flex.toLocaleString("es-AR")}</p>
                        {shippingType === "flex" && <Check className="w-4 h-4 text-[#1E3A8A] ml-auto mt-1" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingType("standard")}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        shippingType === "standard" ? "border-[#1E3A8A] bg-blue-50" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${shippingType === "standard" ? "bg-[#1E3A8A]" : "bg-gray-100"}`}>
                        <Truck className={`w-5 h-5 ${shippingType === "standard" ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">Envío estándar</p>
                        <p className="text-xs text-gray-500">2-3 días hábiles</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">${detectedZone.standard.toLocaleString("es-AR")}</p>
                        {shippingType === "standard" && <Check className="w-4 h-4 text-[#1E3A8A] ml-auto mt-1" />}
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goToDate}
              disabled={!!address.city.trim() && !detectedZone}
              className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── STEP 2: Cuándo llega tu compra ── */}
        {step === "date" && (
          <div className="space-y-4">
            <BackBtn onClick={() => setStep("delivery")} />
            <h1 className="text-xl font-bold text-gray-900">
              ¿Cuándo llega tu compra?
            </h1>

            {/* ── FLEX ── */}
            {shippingType === "flex" && (() => {
              const isBeforeNoon = new Date().getHours() < 12;
              return (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {isBeforeNoon ? "Llega hoy" : "Llega mañana"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isBeforeNoon
                          ? "Pedidos antes de las 12hs tienen entrega en el día"
                          : "Tu pedido saldrá mañana temprano"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 font-medium">
                    Si no vas a estar en casa podés reprogramarlo desde <span className="underline">Mis compras</span> una vez confirmado el pedido.
                  </p>
                </div>
              );
            })()}

            {/* ── ESTÁNDAR ── */}
            {shippingType === "standard" && (() => {
              const estimatedFrom = addBusinessDays(today, 3);
              const estimatedTo   = addBusinessDays(today, 5);
              return (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Llega entre el {formatDateLong(estimatedFrom)} y el {formatDateLong(estimatedTo)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        3 a 5 días hábiles desde la confirmación
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-blue-700 font-medium">
                      Con el envío estándar, la logística programa la entrega según la ruta del día.
                      No es posible elegir un horario o día exacto.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* ── NACIONAL ── */}
            {shippingType !== "flex" && shippingType !== "standard" && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Envío al interior del país</p>
                    <p className="text-xs text-gray-500 mt-0.5">5 a 10 días hábiles estimados</p>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-purple-700 font-medium">
                    Coordinaremos el envío con el correo. Te avisaremos por email cuando el paquete sea despachado.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={goToPayment}
              className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-colors mt-2"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── STEP 3: Método de pago ── */}
        {step === "payment" && (
          <div className="space-y-4">
            <BackBtn onClick={() => setStep("date")} />
            <h1 className="text-xl font-bold text-gray-900">
              Elegí cómo pagar
            </h1>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              {deliveryMethod === "domicilio" ? (
                /* Domicilio → solo Mercado Pago */
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#1E3A8A] bg-blue-50">
                  <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">
                      Mercado Pago
                    </p>
                    <p className="text-xs text-gray-500">
                      Tarjeta, transferencia, cuotas sin interés
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                </div>
              ) : (
                /* Contraentrega → Efectivo o Transferencia */
                <>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "cash"
                        ? "border-[#1E3A8A] bg-blue-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        paymentMethod === "cash" ? "bg-[#1E3A8A]" : "bg-gray-100"
                      }`}
                    >
                      <Package
                        className={`w-5 h-5 ${
                          paymentMethod === "cash" ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">
                        Efectivo al recibir
                      </p>
                      <p className="text-xs text-gray-500">
                        Pagás en efectivo cuando el envío llega a tu casa
                      </p>
                    </div>
                    {paymentMethod === "cash" && (
                      <Check className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "transfer"
                        ? "border-[#1E3A8A] bg-blue-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        paymentMethod === "transfer" ? "bg-[#1E3A8A]" : "bg-gray-100"
                      }`}
                    >
                      <Banknote
                        className={`w-5 h-5 ${
                          paymentMethod === "transfer" ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">
                        Transferencia bancaria
                      </p>
                      <p className="text-xs text-gray-500">
                        Te enviamos los datos por email al confirmar
                      </p>
                    </div>
                    {paymentMethod === "transfer" && (
                      <Check className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Cupón */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Cupón de descuento
              </p>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <Tag className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700 font-medium flex-1">
                    {appliedCoupon} — −${couponDiscount.toLocaleString("es-AR")}
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-green-500 hover:text-red-500"
                  >
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
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), applyCoupon())
                    }
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
              {couponError && (
                <p className="text-xs text-red-500 mt-2">{couponError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep("review")}
              className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-colors mt-2"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── STEP 4: Revisá y confirmá ── */}
        {step === "review" && (
          <div className="space-y-4">
            <BackBtn onClick={() => setStep("payment")} />
            <h1 className="text-xl font-bold text-gray-900">
              Revisá y confirmá
            </h1>

            {/* Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="font-semibold text-sm text-gray-800">
                  Detalle del pedido
                </p>
              </div>
              <ul className="divide-y divide-gray-50 px-5">
                {items.map((item: CartItem) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={item.image || "/placeholder-category.jpg"}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.quantity} × ${item.price.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      ${(item.price * item.quantity).toLocaleString("es-AR")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery + payment + totals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
                <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Entrega
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {deliveryMethod === "domicilio"
                      ? "Envío a domicilio"
                      : "Contraentrega"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {address.street}, {address.city}, {address.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {shippingType === "flex"
                      ? new Date().getHours() < 12 ? "Llega hoy" : "Llega mañana"
                      : shippingType === "standard"
                      ? `Estimado: ${formatDateLong(addBusinessDays(today, 3))} – ${formatDateLong(addBusinessDays(today, 5))}`
                      : "5-10 días hábiles · coordinamos con el correo"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Pago
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {paymentLabel}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Envío {shippingType === "flex" ? "flex" : "estándar"}
                    {detectedZone && <span className="text-gray-400"> · {detectedZone.name}</span>}
                  </span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">Gratis</span>
                  ) : (
                    <span className="font-medium">${shippingCost.toLocaleString("es-AR")}</span>
                  )}
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento ({appliedCoupon})</span>
                    <span>−${couponDiscount.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${total.toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm whitespace-pre-line">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={confirmPurchase}
              disabled={isProcessing}
              className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Spinner />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>
                  {paymentMethod === "mercadopago"
                    ? "Confirmar y pagar con Mercado Pago"
                    : "Confirmar pedido"}
                </span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-2">
              <Lock className="w-3.5 h-3.5" />
              Pago seguro con encriptación SSL
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
