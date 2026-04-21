import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Necessário para versões 15/16 onde o tipo ainda está sendo atualizado
  allowedDevOrigins: ["192.168.100.43"],
};

// Se você precisar manter a compatibilidade com o deploy:
if (process.env.NODE_ENV === "production") {
  // @ts-ignore
  delete nextConfig.allowedDevOrigins;
}

export default nextConfig;