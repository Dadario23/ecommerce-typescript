"use client";

import { useEffect } from "react";

export default function DebugImageRequests() {
  useEffect(() => {
    const originalImage = window.Image;

    // Interceptar todas las creaciones de imágenes
    window.Image = class extends originalImage {
      constructor() {
        super();

        this.addEventListener("error", (e) => {
          const src = this.getAttribute("src");
          if (src?.includes("placeholder-category")) {
            console.log(
              "🖼️ DEBUG: Image error for:",
              src,
              "from component:",
              new Error().stack?.split("\n")[2]?.trim()
            );
          }
        });
      }
    };

    return () => {
      window.Image = originalImage;
    };
  }, []);

  return null;
}
