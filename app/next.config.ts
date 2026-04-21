import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Tente na raiz diretamente (como o erro sugere)
  allowedDevOrigins: ['192.168.100.43'],

  // 2. Mantenha aqui também por redundância de versão
  devIndicators: {
    allowedDevOrigins: ['192.168.100.43'],
  },
};

export default nextConfig;