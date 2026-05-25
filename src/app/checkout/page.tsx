import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 md:pt-32 text-center">Cargando checkout…</div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
