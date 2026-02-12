import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="pt-[140px] p-6">Cargando búsqueda...</div>}
    >
      <SearchClient />
    </Suspense>
  );
}
