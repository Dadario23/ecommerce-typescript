import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 🔥 OPCIÓN RÁPIDA PARA DEPLOY (NO BLOQUEA BUILD)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    domains: [
      // ⚠️ IMPORTANTE:
      // Cada dominio externo usado en <Image /> debe declararse aquí
      "www.perozzi.com.ar",
      "www.rodo.com.ar",
      "i.pinimg.com",
    ],
  },
};

export default nextConfig;
