import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Suas outras configurações aqui */
  
  // Usamos uma verificação para adicionar a propriedade apenas em desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedDevOrigins: ['192.168.100.43']
    }
  } as any) 
};

export default nextConfig;