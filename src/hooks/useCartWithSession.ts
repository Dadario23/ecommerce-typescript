// hooks/useCartWithSession.ts
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";

export function useCartWithSession() {
  const { data: session, status } = useSession();
  const { items, setItems } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);

  // cargar carrito desde API al iniciar
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);

      if (status === "authenticated") {
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const cartData = await response.json();
            setItems(cartData.items || []);
          }
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      } else if (status === "unauthenticated") {
        setItems([]);
      }

      setIsLoading(false);
    };

    loadCart();
  }, [status, setItems]);

  // sincronizar carrito con API cuando cambien los items
  useEffect(() => {
    if (status === "authenticated" && !isLoading) {
      const syncCart = async () => {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
        } catch (error) {
          console.error("Error syncing cart:", error);
        }
      };

      const timeoutId = setTimeout(syncCart, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [items, status, isLoading]);

  return { isLoading };
}
