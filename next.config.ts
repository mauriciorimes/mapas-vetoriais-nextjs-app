import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // A raiz do projeto é esta pasta (evita o aviso sobre o package-lock.json da pasta do usuário)
    turbopack: {
        root: path.join(__dirname),
    },
    // Libera o servidor de desenvolvimento para o celular na mesma rede Wi-Fi (ex.: http://192.168.1.4:3000)
    allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
