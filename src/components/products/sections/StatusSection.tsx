"use client";

import { useState } from "react";

export default function StatusSection({ product }: { product?: { isActive?: boolean } }) {
  const [active, setActive] = useState(product?.isActive ?? true);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Estado</h2>
      <input type="hidden" name="isActive" value={active ? "true" : "false"} />
      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          active ? "bg-[#1E3A8A]" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <p className="mt-2 text-xs text-gray-500">
        {active ? (
          <span className="text-emerald-600 font-medium">Publicado — visible en la tienda</span>
        ) : (
          <span className="text-gray-400">Borrador — no visible en la tienda</span>
        )}
      </p>
    </div>
  );
}
