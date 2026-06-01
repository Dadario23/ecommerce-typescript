"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export interface ShippingZone {
  id: string;
  name: string;
  localities: string[];
  flex: number;
  standard: number;
}

export type ZoneSource = "profile" | "ip" | "no-address" | "unknown" | "error" | null;

export interface ShippingZoneResult {
  zone: ShippingZone | null;
  source: ZoneSource;
  loading: boolean;
}

const CACHE_KEY = "shipping_zone_cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/** Llamar después de guardar/eliminar una dirección para forzar re-detección */
export function clearShippingZoneCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

interface CacheEntry {
  zone: ShippingZone | null;
  source: ZoneSource;
  email: string | null;
  ts: number;
}

export function useShippingZone(): ShippingZoneResult {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<ShippingZoneResult>({ zone: null, source: null, loading: true });

  useEffect(() => {
    if (status === "loading") return;

    const email = session?.user?.email ?? null;

    // Leer caché
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CacheEntry = JSON.parse(raw);
        const fresh = Date.now() - cached.ts < CACHE_TTL;
        const sameUser = cached.email === email;
        if (fresh && sameUser) {
          setResult({ zone: cached.zone, source: cached.source, loading: false });
          return;
        }
      }
    } catch { /* ignore */ }

    // Detectar zona
    fetch("/api/shipping/my-zone")
      .then((r) => r.json())
      .then(({ zone, source }) => {
        setResult({ zone, source, loading: false });
        try {
          const entry: CacheEntry = { zone, source, email, ts: Date.now() };
          localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
        } catch { /* ignore */ }
      })
      .catch(() => setResult({ zone: null, source: "error", loading: false }));
  }, [status, session?.user?.email]);

  return result;
}
