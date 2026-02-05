import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    // ⚠️ IMPORTANTE:
    // Cada dominio externo usado en <Image /> debe declararse aquí
    domains: ["www.perozzi.com.ar", "www.rodo.com.ar", "i.pinimg.com"],
  },
};

export default nextConfig;
