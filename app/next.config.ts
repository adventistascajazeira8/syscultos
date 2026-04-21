import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Suas outras configurações normais (se houver) vão aqui */
};

// Esta lógica abaixo só roda no seu PC (desenvolvimento)
// Ela não será executada na Vercel, evitando o erro de build
if (process.env.NODE_ENV === "development") {
  (nextConfig as any).experimental = {
    ...((nextConfig as any).experimental || {}),
    allowedDevOrigins: ["192.168.100.43"],
  };
}

export default nextConfig;