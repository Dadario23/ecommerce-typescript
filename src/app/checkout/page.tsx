import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-[120px] text-center">Cargando checkout…</div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
