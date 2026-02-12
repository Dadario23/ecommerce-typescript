"use client";

import { Suspense } from "react";
import OrderSuccessClient from "./OrderSuccessClient";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="pt-[140px] text-center">Cargando...</div>}
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
